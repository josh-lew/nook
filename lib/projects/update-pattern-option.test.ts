import { updatePatternOption } from "./update-pattern-option";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("updatePatternOption", () => {
  it("saves the edited link, screenshot and comment", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "option-1" }, error: null },
    });

    const result = await updatePatternOption(
      "option-1",
      { url: "example.com/v2", photo_url: null, comment: "  " },
      client,
    );

    expect(result).toEqual({ data: { id: "option-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "pattern_options",
        kind: "update",
        values: { url: "https://example.com/v2", photo_url: null, comment: null },
        filters: [{ method: "eq", column: "id", value: "option-1" }],
      },
    ]);
  });

  it("won't remove both the link and the screenshot", async () => {
    const client = createMockProjectsClient({});

    const result = await updatePatternOption(
      "option-1",
      { url: "", photo_url: null, comment: "Keep" },
      client,
    );

    expect(result).toEqual({
      data: null,
      error: "A Pattern Option needs a link or a screenshot.",
    });
    expect(client.calls).toEqual([]);
  });

  it("reports an option it can't find, e.g. already removed", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: null },
    });

    const result = await updatePatternOption(
      "gone",
      { url: "https://example.com" },
      client,
    );

    expect(result).toEqual({
      data: null,
      error: "The Pattern Option couldn't be updated.",
    });
  });

  it("returns a Supabase error message", async () => {
    const client = createMockProjectsClient({
      updateResult: { data: null, error: { message: "update failed" } },
    });

    const result = await updatePatternOption(
      "option-1",
      { url: "https://example.com" },
      client,
    );

    expect(result).toEqual({ data: null, error: "update failed" });
  });
});
