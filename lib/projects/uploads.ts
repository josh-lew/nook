import { supabase } from "../supabase";
import type {
  DataResult,
  UploadFile,
  UploadsSupabaseClient,
} from "./types";

const PATTERN_FILES_BUCKET = "pattern-files";
const PROJECT_PHOTOS_BUCKET = "project-photos";
/** Private buckets: signed URL TTL (1 year). */
const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24 * 365;

export function sanitizeFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").trim();
  return cleaned.length > 0 ? cleaned : "file";
}

async function fileToBlob(file: UploadFile): Promise<DataResult<Blob>> {
  try {
    const response = await fetch(file.uri);
    if (!response.ok) {
      return {
        data: null,
        error: `Failed to read file (${response.status}).`,
      };
    }
    const blob = await response.blob();
    return { data: blob, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read file.";
    return { data: null, error: message };
  }
}

async function uploadToBucket(
  bucket: string,
  projectId: string,
  file: UploadFile,
  client: UploadsSupabaseClient,
): Promise<DataResult<{ url: string }>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to upload a file." };
  }

  const path = `${user.id}/${projectId}/${sanitizeFilename(file.name)}`;

  const blobResult = await fileToBlob(file);
  if (blobResult.error || !blobResult.data) {
    return { data: null, error: blobResult.error ?? "Failed to read file." };
  }

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(path, blobResult.data, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  const { data: signed, error: signedError } = await client.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

  if (signedError) {
    return { data: null, error: signedError.message };
  }

  if (!signed?.signedUrl) {
    return { data: null, error: "Upload succeeded but no URL was returned." };
  }

  return { data: { url: signed.signedUrl }, error: null };
}

export async function uploadPatternFile(
  projectId: string,
  file: UploadFile,
  client: UploadsSupabaseClient = supabase as unknown as UploadsSupabaseClient,
): Promise<DataResult<{ url: string }>> {
  return uploadToBucket(PATTERN_FILES_BUCKET, projectId, file, client);
}

export async function uploadProjectPhoto(
  projectId: string,
  file: UploadFile,
  client: UploadsSupabaseClient = supabase as unknown as UploadsSupabaseClient,
): Promise<DataResult<{ url: string }>> {
  return uploadToBucket(PROJECT_PHOTOS_BUCKET, projectId, file, client);
}
