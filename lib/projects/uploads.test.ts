import type { UploadsSupabaseClient } from "./types";
import {
  resolveContentType,
  sanitizeFilename,
  uploadPatternFile,
  uploadProjectPhoto,
} from "./uploads";

jest.mock("../supabase", () => ({
  supabase: {},
}));

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { Base64: "base64" },
  copyAsync: jest.fn(async () => undefined),
  readAsStringAsync: jest.fn(async () =>
    // "hi" in base64
    Buffer.from("hi").toString("base64"),
  ),
}));

const sampleFile = {
  uri: "file:///tmp/pattern.pdf",
  name: "My Pattern.pdf",
  type: "application/pdf",
  base64: Buffer.from("pdf-bytes").toString("base64"),
};

function createMockUploadsClient(options: {
  user?: { id: string } | null;
  userError?: { message: string } | null;
  uploadError?: { message: string } | null;
  signedUrlError?: { message: string } | null;
  signedUrl?: string | null;
  onUpload?: (
    bucket: string,
    path: string,
    body: ArrayBuffer | Blob,
    options?: unknown,
  ) => void;
}): UploadsSupabaseClient {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: options.user === undefined ? { id: "user-1" } : options.user,
        },
        error: options.userError ?? null,
      }),
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path, body, uploadOptions) => {
          options.onUpload?.(bucket, path, body, uploadOptions);
          if (options.uploadError) {
            return { data: null, error: options.uploadError };
          }
          return { data: { path }, error: null };
        },
        createSignedUrl: async () => {
          if (options.signedUrlError) {
            return { data: null, error: options.signedUrlError };
          }
          if (options.signedUrl === null) {
            return { data: null, error: null };
          }
          return {
            data: {
              signedUrl:
                options.signedUrl ?? "https://example.com/signed/pattern.pdf",
            },
            error: null,
          };
        },
      }),
    },
  };
}

describe("sanitizeFilename", () => {
  it("strips path segments and unsafe characters", () => {
    expect(sanitizeFilename("../../evil/name?.pdf")).toBe("name_.pdf");
    expect(sanitizeFilename("plain-file.png")).toBe("plain-file.png");
  });
});

describe("resolveContentType", () => {
  it("keeps a reliable reported mime type", () => {
    expect(
      resolveContentType({
        uri: "file:///a.pdf",
        name: "a.pdf",
        type: "application/pdf",
      }),
    ).toBe("application/pdf");
  });

  it("infers mime type from extension when Android reports text/plain", () => {
    expect(
      resolveContentType({
        uri: "content://media/1",
        name: "pattern.pdf",
        type: "text/plain",
      }),
    ).toBe("application/pdf");
  });

  it("infers jpeg from extension", () => {
    expect(
      resolveContentType({
        uri: "content://media/2",
        name: "photo.JPG",
        type: "application/octet-stream",
      }),
    ).toBe("image/jpeg");
  });
});

describe("uploadPatternFile", () => {
  it("uploads to pattern-files at user/project/filename and returns a signed URL", async () => {
    let uploaded:
      | { bucket: string; path: string; contentType?: string }
      | undefined;
    const client = createMockUploadsClient({
      onUpload: (bucket, path, _body, options) => {
        uploaded = {
          bucket,
          path,
          contentType: (options as { contentType?: string } | undefined)
            ?.contentType,
        };
      },
    });

    const result = await uploadPatternFile("project-1", sampleFile, client);

    expect(result).toEqual({
      data: { url: "https://example.com/signed/pattern.pdf" },
      error: null,
    });
    expect(uploaded).toEqual({
      bucket: "pattern-files",
      path: "user-1/project-1/My Pattern.pdf",
      contentType: "application/pdf",
    });
  });

  it("normalizes text/plain PDF uploads to application/pdf", async () => {
    let contentType: string | undefined;
    const client = createMockUploadsClient({
      onUpload: (_bucket, _path, _body, options) => {
        contentType = (options as { contentType?: string } | undefined)
          ?.contentType;
      },
    });

    await uploadPatternFile(
      "project-1",
      {
        uri: "content://downloads/1",
        name: "guide.pdf",
        type: "text/plain",
        base64: Buffer.from("pdf").toString("base64"),
      },
      client,
    );

    expect(contentType).toBe("application/pdf");
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockUploadsClient({ user: null });

    const result = await uploadPatternFile("project-1", sampleFile, client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns a Supabase upload error message", async () => {
    const client = createMockUploadsClient({
      uploadError: { message: "bucket not found" },
    });

    const result = await uploadPatternFile("project-1", sampleFile, client);

    expect(result).toEqual({ data: null, error: "bucket not found" });
  });
});

describe("uploadProjectPhoto", () => {
  it("uploads to project-photos and returns a signed URL", async () => {
    let uploaded: { bucket: string; path: string } | undefined;
    const client = createMockUploadsClient({
      signedUrl: "https://example.com/signed/photo.jpg",
      onUpload: (bucket, path) => {
        uploaded = { bucket, path };
      },
    });

    const result = await uploadProjectPhoto(
      "project-2",
      {
        uri: "content://media/image/1",
        name: "a.jpg",
        type: "image/jpeg",
        base64: Buffer.from("img").toString("base64"),
      },
      client,
    );

    expect(result).toEqual({
      data: { url: "https://example.com/signed/photo.jpg" },
      error: null,
    });
    expect(uploaded).toEqual({
      bucket: "project-photos",
      path: "user-1/project-2/a.jpg",
    });
  });
});
