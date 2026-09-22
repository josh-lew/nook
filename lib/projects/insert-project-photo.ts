import { supabase } from "../supabase";
import type {
  DataResult,
  InsertProjectPhotoArgs,
  ProjectsSupabaseClient,
} from "./types";

export async function insertProjectPhoto(
  projectId: string,
  photo: InsertProjectPhotoArgs,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const { data, error } = await client
    .from("project_photos")
    .insert({
      project_id: projectId,
      image_url: photo.image_url,
      stage: photo.stage,
      photo_type: photo.photo_type,
      is_primary: photo.is_primary ?? false,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "Photo was created but no id was returned." };
  }

  return { data: { id: data.id }, error: null };
}
