import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";

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

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  gif: "image/gif",
};

const UNRELIABLE_MIME = new Set([
  "",
  "text/plain",
  "application/octet-stream",
  "application/octetstream",
]);

export function sanitizeFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").trim();
  return cleaned.length > 0 ? cleaned : "file";
}

export function resolveContentType(file: UploadFile): string {
  const reported = (file.type ?? "").trim().toLowerCase();
  if (reported && !UNRELIABLE_MIME.has(reported)) {
    return reported;
  }

  const extension = sanitizeFilename(file.name).split(".").pop()?.toLowerCase();
  if (extension && EXTENSION_MIME[extension]) {
    return EXTENSION_MIME[extension];
  }

  return reported || "application/octet-stream";
}

/**
 * Read a picker URI into base64 immediately via the Expo File API.
 * Call at pick time so Android document URIs stay usable through Save.
 */
export async function stabilizeUploadFile(
  file: UploadFile,
): Promise<DataResult<UploadFile>> {
  if (file.base64) {
    return { data: file, error: null };
  }

  try {
    const expoFile = new File(file.uri);
    const base64 = await expoFile.base64();

    return {
      data: {
        ...file,
        uri: expoFile.uri || file.uri,
        base64,
      },
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare file.";
    return { data: null, error: message };
  }
}

async function readFileAsArrayBuffer(
  file: UploadFile,
): Promise<DataResult<ArrayBuffer>> {
  if (file.base64) {
    try {
      return { data: decode(file.base64), error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to decode file.";
      return { data: null, error: message };
    }
  }

  try {
    const expoFile = new File(file.uri);
    const bytes = await expoFile.bytes();
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    return { data: buffer, error: null };
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
  const contentType = resolveContentType(file);

  const bodyResult = await readFileAsArrayBuffer(file);
  if (bodyResult.error || !bodyResult.data) {
    return { data: null, error: bodyResult.error ?? "Failed to read file." };
  }

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(path, bodyResult.data, {
      contentType,
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
