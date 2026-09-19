import { supabase } from "../supabase";
import type {
  DataResult,
  InsertProjectPhotoInput,
  ProjectsSupabaseClient,
} from "./types";

export async function insertProjectPhotos(
  projectId: string,
  photos: InsertProjectPhotoInput[],
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ count: number }>> {
  if (photos.length === 0) {
    return { data: { count: 0 }, error: null };
  }

  const rows = photos.map((photo) => ({
    project_id: projectId,
    image_url: photo.image_url,
    stage: photo.stage ?? "planning",
    photo_type: photo.photo_type ?? "inspiration",
  }));

  const { error } = await client.from("project_photos").insert(rows);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { count: photos.length }, error: null };
}
