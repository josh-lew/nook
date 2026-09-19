import { decode } from "base64-arraybuffer";
import {
  cacheDirectory,
  copyAsync,
  EncodingType,
  readAsStringAsync,
} from "expo-file-system/legacy";

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
    let readableUri = file.uri;

    // Android gallery/document URIs (content://) cannot be read directly.
    if (
      file.uri.startsWith("content://") ||
      file.uri.startsWith("ph://") ||
      file.uri.startsWith("assets-library://")
    ) {
      if (!cacheDirectory) {
        return { data: null, error: "File cache is unavailable on this device." };
      }
      const destination = `${cacheDirectory}upload-${Date.now()}-${sanitizeFilename(file.name)}`;
      await copyAsync({ from: file.uri, to: destination });
      readableUri = destination;
    }

    const base64 = await readAsStringAsync(readableUri, {
      encoding: EncodingType.Base64,
    });
    return { data: decode(base64), error: null };
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
