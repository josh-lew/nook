import { supabase } from "../supabase";
import type { DataResult, ProjectsSupabaseClient } from "./types";

/** Removes the photo row; the stored file is left in the bucket. */
export async function deleteProjectPhoto(
  photoId: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const { error } = await client
    .from("project_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}
