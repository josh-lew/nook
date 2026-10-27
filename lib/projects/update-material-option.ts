import { supabase } from "../supabase";
import { PROJECT_PHOTOS_BUCKET } from "./buckets";
import { storagePathFromSignedUrl } from "./storage-path";
import type {
  DataResult,
  ProjectsStorageClient,
  ProjectsSupabaseClient,
  UpdateMaterialOptionInput,
} from "./types";

/** Material screenshots upload alongside the Project's photos. */

type MaterialsClient = ProjectsSupabaseClient & ProjectsStorageClient;

/** Edits a Material Option; a replaced or removed screenshot's file is removed too. */
export async function updateMaterialOption(
  materialId: string,
  input: UpdateMaterialOptionInput,
  client: MaterialsClient = supabase as unknown as MaterialsClient,
): Promise<DataResult<{ id: string }>> {
  const values: UpdateMaterialOptionInput = { ...input };
  for (const key of ["url", "photo_url", "comment"] as const) {
    if (input[key] !== undefined) {
      values[key] = input[key]?.trim() || null;
    }
  }

  // Only an edit that sets both can tell they'd end up empty
  if ("url" in values && "photo_url" in values && !values.url && !values.photo_url) {
    return { data: null, error: "A material needs a link or a screenshot." };
  }

  let oldPhotoUrl: string | null = null;
  if (values.photo_url !== undefined) {
    const { data: current } = await client
      .from("project_materials")
      .select("photo_url")
      .eq("id", materialId)
      .single();
    oldPhotoUrl =
      (current as { photo_url: string | null } | null)?.photo_url ?? null;
  }

  const { data, error } = await client
    .from("project_materials")
    .update(values)
    .eq("id", materialId)
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "The material couldn't be updated." };
  }

  const oldPath =
    oldPhotoUrl && oldPhotoUrl !== values.photo_url
      ? storagePathFromSignedUrl(PROJECT_PHOTOS_BUCKET, oldPhotoUrl)
      : null;
  if (oldPath) {
    // The edit is saved; a leftover file is only clutter
    await client.storage.from(PROJECT_PHOTOS_BUCKET).remove([oldPath]);
  }

  return { data: { id: data.id }, error: null };
}
