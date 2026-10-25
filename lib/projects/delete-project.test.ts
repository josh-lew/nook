import { deleteProject } from "./delete-project";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("deleteProject", () => {
  it("soft-deletes by stamping deleted_at rather than removing the row", async () => {
    const client = createMockProjectsClient({});
    const now = new Date("2026-10-25T12:00:00.000Z");

    const result = await deleteProject("idea-1", client, () => now);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls).toEqual([
      {
        table: "projects",
        kind: "update",
        values: { deleted_at: "2026-10-25T12:00:00.000Z" },
        filters: [{ method: "eq", column: "id", value: "idea-1" }],
      },
    ]);
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      updateResult: { data: null, error: { message: "denied" } },
    });

    const result = await deleteProject("idea-1", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
