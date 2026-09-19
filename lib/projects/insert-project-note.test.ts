import { insertProjectNote } from "./insert-project-note";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertProjectNote", () => {
  it("skips insert when content is blank", async () => {
    let called = false;
    const client = createMockProjectsClient({
      onInsert: () => {
        called = true;
      },
    });

    const result = await insertProjectNote("project-1", "   ", client);

    expect(result).toEqual({ data: { skipped: true }, error: null });
    expect(called).toBe(false);
  });

  it("inserts a planning note and returns its id", async () => {
    let inserted: unknown;
    const client = createMockProjectsClient({
      insertResult: { data: { id: "note-1" }, error: null },
      onInsert: (_table, values) => {
        inserted = values;
      },
    });

    const result = await insertProjectNote(
      "project-1",
      "  Cast on 40 stitches  ",
      client,
    );

    expect(result).toEqual({ data: { id: "note-1" }, error: null });
    expect(inserted).toEqual({
      project_id: "project-1",
      stage: "planning",
      content: "Cast on 40 stitches",
    });
  });

  it("returns a Supabase error message on insert failure", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "not allowed" } },
    });

    const result = await insertProjectNote("project-1", "Hello", client);

    expect(result).toEqual({ data: null, error: "not allowed" });
  });
});
