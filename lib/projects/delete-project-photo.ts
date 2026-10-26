import { supabase } from "../supabase";
import type {
  DataResult,
  ProjectsStorageClient,
  ProjectsSupabaseClient,
} from "./types";

const PROJECT_PHOTOS_BUCKET = "project-photos";

type PhotosClient = ProjectsSupabaseClient & ProjectsStorageClient;

/** Photos store a signed URL: `.../object/sign/<bucket>/<path>?token=...`. */
function storagePathFromSignedUrl(url: string): string | null {
  const marker = `/object/sign/${PROJECT_PHOTOS_BUCKET}/`;
  const start = url.indexOf(marker);
  if (start === -1) {
    return null;
  }

  const encoded = url.slice(start + marker.length).split("?")[0];
  try {
    return decodeURIComponent(encoded) || null;
  } catch {
    return null;
  }
}

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

  const path = storagePathFromSignedUrl(deleted[0].image_url);
  if (path) {
    // The photo is already gone from the Idea; a leftover file is only clutter
    await client.storage.from(PROJECT_PHOTOS_BUCKET).remove([path]);
  }

  return { data: null, error: null };
}
