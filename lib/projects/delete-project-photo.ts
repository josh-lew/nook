import { supabase } from "../supabase";
import { PROJECT_PHOTOS_BUCKET } from "./buckets";
import { storagePathFromSignedUrl } from "./storage-path-from-signed-url";
import type {
  DataResult,
  ProjectsStorageClient,
  ProjectsSupabaseClient,
} from "./types";

type PhotosClient = ProjectsSupabaseClient & ProjectsStorageClient;

/** Removes the photo row, then its file in the bucket. */
export async function deleteProjectPhoto(
  photoId: string,
  client: PhotosClient = supabase as unknown as PhotosClient,
): Promise<DataResult<null>> {
  const { data, error } = await client
    .from("project_photos")
    .delete()
    .eq("id", photoId)
    .select("id, image_url");

  if (error) {
    return { data: null, error: error.message };
  }

  // RLS hides rows it blocks, so a refused delete returns no error, just no rows
  const deleted = (data ?? []) as { id: string; image_url: string }[];
  if (deleted.length === 0) {
    return { data: null, error: "The photo couldn't be removed." };
  }

  const path = storagePathFromSignedUrl(
    deleted[0].image_url,
    PROJECT_PHOTOS_BUCKET,
  );
  if (path) {
    // The photo is already gone from the Idea; a leftover file is only clutter
    await client.storage.from(PROJECT_PHOTOS_BUCKET).remove([path]);
  }

  return { data: null, error: null };
}
