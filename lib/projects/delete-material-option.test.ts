import { deleteMaterialOption } from "./delete-material-option";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const signedUrl =
  "https://abc.supabase.co/storage/v1/object/sign/project-photos/user-1/project-1/1700000000000-Merino%20dk.jpg?token=xyz";

describe("deleteMaterialOption", () => {
  it("removes the Material Option and its screenshot in storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "material-1", photo_url: signedUrl }],
        error: null,
      },
    });

    const result = await deleteMaterialOption("material-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls).toEqual([
      {
        table: "project_materials",
        kind: "delete",
        filters: [{ method: "eq", column: "id", value: "material-1" }],
      },
      {
        bucket: "project-photos",
        kind: "remove",
        paths: ["user-1/project-1/1700000000000-Merino dk.jpg"],
      },
    ]);
  });

  it("skips storage when the Material Option has only a link", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "material-1", photo_url: null }],
        error: null,
      },
    });

    const result = await deleteMaterialOption("material-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls.map((call) => call.kind)).toEqual(["delete"]);
  });

  it("reports an error when no row was deleted, e.g. blocked by RLS", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: [], error: null },
    });

    const result = await deleteMaterialOption("material-1", client);

    expect(result).toEqual({
      data: null,
      error: "The material couldn't be removed.",
    });
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: null, error: { message: "denied" } },
    });

    const result = await deleteMaterialOption("material-1", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
