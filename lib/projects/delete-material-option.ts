import { supabase } from "../supabase";
import { storagePathFromSignedUrl } from "./storage-path";
import type {
  DataResult,
  ProjectsStorageClient,
  ProjectsSupabaseClient,
} from "./types";

/** Material screenshots upload alongside the Project's photos. */
const PROJECT_PHOTOS_BUCKET = "project-photos";

type MaterialsClient = ProjectsSupabaseClient & ProjectsStorageClient;

/** Removes the Material Option row, then its screenshot in the bucket. */
export async function deleteMaterialOption(
  materialId: string,
  client: MaterialsClient = supabase as unknown as MaterialsClient,
): Promise<DataResult<null>> {
  const { data, error } = await client
    .from("project_materials")
    .delete()
    .eq("id", materialId)
    .select("id, photo_url");

  if (error) {
    return { data: null, error: error.message };
  }

  // RLS hides rows it blocks, so a refused delete returns no error, just no rows
  const deleted = (data ?? []) as { id: string; photo_url: string | null }[];
  if (deleted.length === 0) {
    return { data: null, error: "The material couldn't be removed." };
  }

  const photoUrl = deleted[0].photo_url;
  const path = photoUrl
    ? storagePathFromSignedUrl(PROJECT_PHOTOS_BUCKET, photoUrl)
    : null;
  if (path) {
    // The option is already gone; a leftover file is only clutter
    await client.storage.from(PROJECT_PHOTOS_BUCKET).remove([path]);
  }

  return { data: null, error: null };
}
