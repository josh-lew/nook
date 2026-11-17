import { supabase } from "../supabase";
import { insertProjectNote } from "./insert-project-note";
import { loadOwnProject } from "./load-own-project";
import { rankAtBottom } from "./rank-at-bottom";
import type { DataResult, ProjectsSupabaseClient } from "./types";

/**
 * Puts an Active Project down for now. It stays In progress, joins the
 * bottom of the Paused ranking, and an optional note on where the maker got
 * to is saved as an In progress Note.
 */
export async function pauseProject(
  projectId: string,
  note?: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const { data: project, error: projectError } = await loadOwnProject(
    projectId,
    "pause",
    client,
  );

  if (!project) {
    return { data: null, error: projectError };
  }

  if (project.status !== "in_progress" || project.pausedAt !== null) {
    return {
      data: null,
      error: "Only an active In progress Project can be paused.",
    };
  }

  const { data: rank, error: rankError } = await rankAtBottom(
    project.userId,
    "in_progress",
    true,
    client,
  );

  if (rank === null) {
    return { data: null, error: rankError };
  }

  const { data: paused, error } = await client
    .from("projects")
    .update({
      // Any non-null value pauses; a trigger (13_paused_at.sql) replaces it with the database clock
      paused_at: new Date().toISOString(),
      plan_order: rank,
    })
    .eq("id", projectId)
    .eq("user_id", project.userId)
    // Guards against the Project being moved or paused in between the read and the write
    .eq("status", "in_progress")
    .is("paused_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!paused) {
    return {
      data: null,
      error: "This Project changed elsewhere. Reload and try again.",
    };
  }

  if (note !== undefined) {
    // A blank note is skipped
    const { error: noteError } = await insertProjectNote(
      projectId,
      note,
      "in_progress",
      client,
    );

    if (noteError) {
      return {
        data: null,
        error: `Paused, but the note wasn't saved: ${noteError}`,
      };
    }
  }

  return { data: null, error: null };
}
