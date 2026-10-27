import { insertPatternOption } from "./insert-pattern-option";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertPatternOption", () => {
  it("saves a link with a comment on the Idea or Project", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "option-1" }, error: null },
    });

    const result = await insertPatternOption(
      "project-1",
      { url: "  https://example.com/hat  ", comment: " Free! " },
      client,
    );

    expect(result).toEqual({ data: { id: "option-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "pattern_options",
        kind: "insert",
        values: {
          project_id: "project-1",
          url: "https://example.com/hat",
          photo_url: null,
          comment: "Free!",
        },
      },
    ]);
  });

  it("saves a screenshot alone", async () => {
    const client = createMockProjectsClient({});

    const result = await insertPatternOption(
      "project-1",
      { photo_url: "https://example.com/shot.jpg" },
      client,
    );

    expect(result.error).toBeNull();
    expect(client.calls[0]).toMatchObject({
      values: { url: null, photo_url: "https://example.com/shot.jpg" },
    });
  });

  it("adds https to a link typed without one, so it opens", async () => {
    const client = createMockProjectsClient({});

    await insertPatternOption("project-1", { url: "ravelry.com/p/1" }, client);

    expect(client.calls[0]).toMatchObject({
      values: { url: "https://ravelry.com/p/1" },
    });
  });

  it("needs a link or a screenshot", async () => {
    const client = createMockProjectsClient({});

    const result = await insertPatternOption(
      "project-1",
      { url: "   ", comment: "Nice" },
      client,
    );

    expect(result).toEqual({
      data: null,
      error: "A Pattern Option needs a link or a screenshot.",
    });
    expect(client.calls).toEqual([]);
  });

  it("returns a Supabase error message", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "insert failed" } },
    });

    const result = await insertPatternOption(
      "project-1",
      { url: "https://example.com" },
      client,
    );

    expect(result).toEqual({ data: null, error: "insert failed" });
  });
});
