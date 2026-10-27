import { supabase } from "../supabase";
import { nextRank } from "./next-rank";
import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
} from "./types";

/** Picks a Paused Project back up, at the bottom of the active In progress ranking. */
export async function resumeProject(
  projectId: string,
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
    return { data: null, error: "You must be signed in to resume a project." };
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

  if (row.status !== "in_progress" || row.paused_at === null) {
    return { data: null, error: "Only a Paused Project can be resumed." };
  }

  const { data: rankRows, error: rankError } = await client
    .from("projects")
    .select("plan_order")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .is("paused_at", null)
    .is("deleted_at", null);

  if (rankError) {
    return { data: null, error: rankError.message };
  }

  const { data: resumed, error } = await client
    .from("projects")
    .update({
      paused_at: null,
      plan_order: nextRank(rankRows),
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
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
