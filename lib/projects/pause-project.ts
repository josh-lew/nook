import { supabase } from "../supabase";
import { insertProjectNote } from "./insert-project-note";
import { nextRank } from "./next-rank";
import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
} from "./types";

/**
 * Puts an In progress Project down for now. It stays In progress, joins the
 * bottom of the Paused ranking, and an optional note on where the maker got
 * to is saved as an In progress Note.
 */
export async function pauseProject(
  projectId: string,
  note?: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to pause a project." };
  }

  const { data: project, error: projectError } = await client
    .from("projects")
    .select("status, paused_at")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (projectError) {
    return { data: null, error: projectError.message };
  }

  const row = project as {
    status: ProjectStatus;
    paused_at: string | null;
  } | null;

  if (!row) {
    return { data: null, error: "Project not found." };
  }

  if (row.status !== "in_progress" || row.paused_at !== null) {
    return {
      data: null,
      error: "Only an active In progress Project can be paused.",
    };
  }

  const { data: rankRows, error: rankError } = await client
    .from("projects")
    .select("plan_order")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .not("paused_at", "is", null)
    .is("deleted_at", null);

  if (rankError) {
    return { data: null, error: rankError.message };
  }

  const { data: paused, error } = await client
    .from("projects")
    .update({
      // Any non-null value pauses; a trigger (13_paused_at.sql) replaces it with the database clock
      paused_at: new Date().toISOString(),
      plan_order: nextRank(rankRows),
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
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
