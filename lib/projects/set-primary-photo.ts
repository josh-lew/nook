import { supabase } from "../supabase";
import type { DataResult, ProjectsSupabaseClient } from "./types";

export async function setPrimaryPhoto(
  projectId: string,
  photoId: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const { error: clearError } = await client
    .from("project_photos")
    .update({ is_primary: false })
    .eq("project_id", projectId)
    .eq("is_primary", true);

  if (clearError) {
    return { data: null, error: clearError.message };
  }

  const { error: setError } = await client
    .from("project_photos")
    .update({ is_primary: true })
    .eq("id", photoId);

  if (setError) {
    return { data: null, error: setError.message };
  }

  return { data: null, error: null };
}
