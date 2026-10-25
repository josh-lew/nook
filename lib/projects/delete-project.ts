import { supabase } from "../supabase";
import type { DataResult, ProjectsSupabaseClient } from "./types";

/** Soft delete, for Ideas and Projects alike: the row stays, hidden by `deleted_at`. */
export async function deleteProject(
  projectId: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const { error } = await client
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}
