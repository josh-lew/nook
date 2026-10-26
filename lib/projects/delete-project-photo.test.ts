import { deleteProjectPhoto } from "./delete-project-photo";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const signedUrl =
  "https://abc.supabase.co/storage/v1/object/sign/project-photos/user-1/idea-1/1700000000000-My%20tote.jpg?token=xyz";

describe("deleteProjectPhoto", () => {
  it("removes the photo row and its file in storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "photo-1", image_url: signedUrl }],
        error: null,
      },
    });

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls).toEqual([
      {
        table: "project_photos",
        kind: "delete",
        filters: [{ method: "eq", column: "id", value: "photo-1" }],
      },
      {
        bucket: "project-photos",
        kind: "remove",
        paths: ["user-1/idea-1/1700000000000-My tote.jpg"],
      },
    ]);
  });

  it("reports an error when no row was deleted, e.g. blocked by RLS", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: [], error: null },
    });

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({
      data: null,
      error: "The photo couldn't be removed.",
    });
    expect(client.calls.map((call) => call.kind)).toEqual(["delete"]);
  });

  it("still succeeds when the file can't be removed from storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "photo-1", image_url: signedUrl }],
        error: null,
      },
      removeResult: { data: null, error: { message: "storage down" } },
    });

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({ data: null, error: null });
  });

  it("skips storage when the url isn't a signed project photo url", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "photo-1", image_url: "https://example.com/a.jpg" }],
        error: null,
      },
    });

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls.map((call) => call.kind)).toEqual(["delete"]);
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: null, error: { message: "denied" } },
    });

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
