import { insertProjectMaterials } from "./insert-project-materials";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertProjectMaterials", () => {
  it("returns count 0 without calling supabase when materials is empty", async () => {
    let called = false;
    const client = createMockProjectsClient({
      onInsert: () => {
        called = true;
      },
    });

    const result = await insertProjectMaterials("project-1", [], client);

    expect(result).toEqual({ data: { count: 0 }, error: null });
    expect(called).toBe(false);
  });

  it("inserts one row per material", async () => {
    let inserted: unknown;
    const client = createMockProjectsClient({
      onInsert: (_table, values) => {
        inserted = values;
      },
    });

    const result = await insertProjectMaterials(
      "project-1",
      [
        { name: "Wool", comment: "soft" },
        { url: "https://example.com/yarn" },
      ],
      client,
    );

    expect(result).toEqual({ data: { count: 2 }, error: null });
    expect(inserted).toEqual([
      {
        project_id: "project-1",
        name: "Wool",
        url: null,
        photo_url: null,
        comment: "soft",
      },
      {
        project_id: "project-1",
        name: null,
        url: "https://example.com/yarn",
        photo_url: null,
        comment: null,
      },
    ]);
  });

  it("returns a Supabase error message on insert failure", async () => {
    const client = createMockProjectsClient({
      insertResult: {
        data: null,
        error: { message: "foreign key violation" },
      },
    });

    const result = await insertProjectMaterials(
      "project-1",
      [{ name: "Buttons" }],
      client,
    );

    expect(result).toEqual({ data: null, error: "foreign key violation" });
  });
});
