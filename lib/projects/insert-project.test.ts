import { insertProject } from "./insert-project";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertProject", () => {
  it("inserts a project and returns its id", async () => {
    let inserted: unknown;
    const client = createMockProjectsClient({
      insertResult: { data: { id: "project-1" }, error: null },
      onInsert: (_table, values) => {
        inserted = values;
      },
    });

    const result = await insertProject(
      {
        title: "Scarf",
        hobby_type: "knit",
        pattern_file_url: "https://example.com/pattern.pdf",
      },
      client,
    );

    expect(result).toEqual({ data: { id: "project-1" }, error: null });
    expect(inserted).toEqual({
      user_id: "user-1",
      title: "Scarf",
      hobby_type: "knit",
      status: "planning",
      pattern_file_url: "https://example.com/pattern.pdf",
    });
  });

  it("defaults status to planning", async () => {
    let inserted: { status?: string } | undefined;
    const client = createMockProjectsClient({
      onInsert: (_table, values) => {
        inserted = values as { status?: string };
      },
    });

    await insertProject({ title: "Hat", hobby_type: "crochet" }, client);

    expect(inserted?.status).toBe("planning");
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await insertProject(
      { title: "Hat", hobby_type: "sewing" },
      client,
    );

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns an error when getUser fails", async () => {
    const client = createMockProjectsClient({
      user: null,
      userError: { message: "auth failed" },
    });

    const result = await insertProject(
      { title: "Hat", hobby_type: "sewing" },
      client,
    );

    expect(result).toEqual({ data: null, error: "auth failed" });
  });

  it("returns a Supabase error message on insert failure", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "duplicate key" } },
    });

    const result = await insertProject(
      { title: "Hat", hobby_type: "crochet" },
      client,
    );

    expect(result).toEqual({ data: null, error: "duplicate key" });
  });
});
