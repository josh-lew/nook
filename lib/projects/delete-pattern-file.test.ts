import { deletePatternFile } from "./delete-pattern-file";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const signedUrl =
  "https://abc.supabase.co/storage/v1/object/sign/pattern-files/user-1/project-1/abc123-Size%20guide.pdf?token=xyz";

describe("deletePatternFile", () => {
  it("removes the Pattern File row and its file in storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "file-1", file_url: signedUrl }],
        error: null,
      },
    });

    const result = await deletePatternFile("file-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls).toEqual([
      {
        table: "pattern_files",
        kind: "delete",
        filters: [{ method: "eq", column: "id", value: "file-1" }],
      },
      {
        bucket: "pattern-files",
        kind: "remove",
        paths: ["user-1/project-1/abc123-Size guide.pdf"],
      },
    ]);
  });

  it("reports an error when no row was deleted, e.g. blocked by RLS", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: [], error: null },
    });

    const result = await deletePatternFile("file-1", client);

    expect(result).toEqual({
      data: null,
      error: "The Pattern File couldn't be removed.",
    });
    expect(client.calls.map((call) => call.kind)).toEqual(["delete"]);
  });

  it("still succeeds when the file can't be removed from storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "file-1", file_url: signedUrl }],
        error: null,
      },
      removeResult: { data: null, error: { message: "storage down" } },
    });

    const result = await deletePatternFile("file-1", client);

    expect(result).toEqual({ data: null, error: null });
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: null, error: { message: "denied" } },
    });

    const result = await deletePatternFile("file-1", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
