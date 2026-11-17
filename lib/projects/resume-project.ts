import { supabase } from "../supabase";
import { loadOwnProject } from "./load-own-project";
import { rankAtBottom } from "./rank-at-bottom";
import type { DataResult, ProjectsSupabaseClient } from "./types";

/** Picks a Paused Project back up, at the bottom of the Active ranking. */
export async function resumeProject(
  projectId: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const { data: project, error: projectError } = await loadOwnProject(
    projectId,
    "resume",
    client,
  );

  if (!project) {
    return { data: null, error: projectError };
  }

  if (project.status !== "in_progress" || project.pausedAt === null) {
    return { data: null, error: "Only a Paused Project can be resumed." };
  }

  const { data: rank, error: rankError } = await rankAtBottom(
    project.userId,
    "in_progress",
    false,
    client,
  );

  if (rank === null) {
    return { data: null, error: rankError };
  }

  const { data: resumed, error } = await client
    .from("projects")
    .update({
      paused_at: null,
      plan_order: rank,
    })
    .eq("id", projectId)
    .eq("user_id", project.userId)
    // Guards against the Project being moved or resumed in between the read and the write
    .eq("status", "in_progress")
    .not("paused_at", "is", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!resumed) {
    return {
      data: null,
      error: "This Project changed elsewhere. Reload and try again.",
    };
  }

  return { data: null, error: null };
}
