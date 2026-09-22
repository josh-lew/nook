import { setPrimaryPhoto } from "./set-primary-photo";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("setPrimaryPhoto", () => {
  it("clears existing primary then sets the new primary", async () => {
    const updates: {
      values: unknown;
      column: string;
      value: string | boolean;
    }[] = [];
    const client = createMockProjectsClient({
      onUpdate: (values, column, value) => {
        updates.push({ values, column, value });
      },
    });

    const result = await setPrimaryPhoto("project-1", "photo-9", client);

    expect(result).toEqual({ data: null, error: null });
    expect(updates).toEqual([
      { values: { is_primary: false }, column: "project_id", value: "project-1" },
      { values: { is_primary: false }, column: "is_primary", value: true },
      { values: { is_primary: true }, column: "id", value: "photo-9" },
    ]);
  });

  it("returns an error when clearing the previous primary fails", async () => {
    const client = createMockProjectsClient({
      updateResults: [
        { data: null, error: { message: "clear failed" } },
        { data: null, error: null },
      ],
    });

    const result = await setPrimaryPhoto("project-1", "photo-9", client);

    expect(result).toEqual({ data: null, error: "clear failed" });
  });

  it("returns an error when setting the new primary fails", async () => {
    const client = createMockProjectsClient({
      updateResults: [
        { data: null, error: null },
        { data: null, error: { message: "set failed" } },
      ],
    });

    const result = await setPrimaryPhoto("project-1", "photo-9", client);

    expect(result).toEqual({ data: null, error: "set failed" });
  });
});
