import { insertProjectPhotos } from "./insert-project-photos";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertProjectPhotos", () => {
  it("returns count 0 without inserting when photos is empty", async () => {
    let called = false;
    const client = createMockProjectsClient({
      onInsert: () => {
        called = true;
      },
    });

    const result = await insertProjectPhotos("project-1", [], client);

    expect(result).toEqual({ data: { count: 0 }, error: null });
    expect(called).toBe(false);
  });

  it("inserts inspiration photo rows", async () => {
    let inserted: unknown;
    const client = createMockProjectsClient({
      onInsert: (_table, values) => {
        inserted = values;
      },
    });

    const result = await insertProjectPhotos(
      "project-1",
      [{ image_url: "https://example.com/a.jpg" }],
      client,
    );

    expect(result).toEqual({ data: { count: 1 }, error: null });
    expect(inserted).toEqual([
      {
        project_id: "project-1",
        image_url: "https://example.com/a.jpg",
        stage: "planning",
        photo_type: "inspiration",
      },
    ]);
  });
});
