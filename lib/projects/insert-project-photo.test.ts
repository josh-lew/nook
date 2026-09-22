import { insertProjectPhoto } from "./insert-project-photo";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertProjectPhoto", () => {
  it("inserts required fields and defaults is_primary to false", async () => {
    let inserted: unknown;
    const client = createMockProjectsClient({
      insertResult: { data: { id: "photo-1" }, error: null },
      onInsert: (_table, values) => {
        inserted = values;
      },
    });

    const result = await insertProjectPhoto(
      "project-1",
      {
        image_url: "https://example.com/a.jpg",
        stage: "planning",
        photo_type: "inspiration",
      },
      client,
    );

    expect(result).toEqual({ data: { id: "photo-1" }, error: null });
    expect(inserted).toEqual({
      project_id: "project-1",
      image_url: "https://example.com/a.jpg",
      stage: "planning",
      photo_type: "inspiration",
      is_primary: false,
    });
  });

  it("passes is_primary when provided", async () => {
    let inserted: unknown;
    const client = createMockProjectsClient({
      insertResult: { data: { id: "photo-2" }, error: null },
      onInsert: (_table, values) => {
        inserted = values;
      },
    });

    await insertProjectPhoto(
      "project-1",
      {
        image_url: "https://example.com/b.jpg",
        stage: "in_progress",
        photo_type: "progress",
        is_primary: true,
      },
      client,
    );

    expect(inserted).toMatchObject({ is_primary: true, photo_type: "progress" });
  });

  it("propagates insert errors", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "duplicate primary" } },
    });

    const result = await insertProjectPhoto(
      "project-1",
      {
        image_url: "https://example.com/c.jpg",
        stage: "completed",
        photo_type: "finished",
        is_primary: true,
      },
      client,
    );

    expect(result).toEqual({ data: null, error: "duplicate primary" });
  });
});
