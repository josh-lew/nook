import type { UploadsSupabaseClient } from "./types";
import {
  sanitizeFilename,
  uploadPatternFile,
  uploadProjectPhoto,
} from "./uploads";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const sampleFile = {
  uri: "file:///tmp/pattern.pdf",
  name: "My Pattern.pdf",
  type: "application/pdf",
};

function createMockUploadsClient(options: {
  user?: { id: string } | null;
  userError?: { message: string } | null;
  uploadError?: { message: string } | null;
  signedUrlError?: { message: string } | null;
  signedUrl?: string | null;
  onUpload?: (bucket: string, path: string, body: Blob, options?: unknown) => void;
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

describe("uploadPatternFile", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () =>
      Promise.resolve({
        ok: true,
        blob: async () => new Blob(["pdf-bytes"], { type: "application/pdf" }),
      }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uploads to pattern-files at user/project/filename and returns a signed URL", async () => {
    let uploaded: { bucket: string; path: string } | undefined;
    const client = createMockUploadsClient({
      onUpload: (bucket, path) => {
        uploaded = { bucket, path };
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
    });
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

  it("returns an error when fetch fails to read the file", async () => {
    global.fetch = jest.fn(async () =>
      Promise.resolve({ ok: false, status: 404 }),
    ) as unknown as typeof fetch;

    const client = createMockUploadsClient({});

    const result = await uploadPatternFile("project-1", sampleFile, client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/failed to read file/i);
  });
});

describe("uploadProjectPhoto", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () =>
      Promise.resolve({
        ok: true,
        blob: async () => new Blob(["img"], { type: "image/jpeg" }),
      }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
      { uri: "file:///tmp/a.jpg", name: "a.jpg", type: "image/jpeg" },
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
