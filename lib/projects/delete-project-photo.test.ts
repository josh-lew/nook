import { deleteProjectPhoto } from "./delete-project-photo";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("deleteProjectPhoto", () => {
  it("removes the photo row", async () => {
    const client = createMockProjectsClient({});

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls).toEqual([
      {
        table: "project_photos",
        kind: "delete",
        filters: [{ method: "eq", column: "id", value: "photo-1" }],
      },
    ]);
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: null, error: { message: "denied" } },
    });

    const result = await deleteProjectPhoto("photo-1", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
