import { insertPatternFile } from "./insert-pattern-file";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("insertPatternFile", () => {
  it("adds a Pattern File to the Project", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "file-1" }, error: null },
    });

    const result = await insertPatternFile(
      "project-1",
      {
        file_url: "https://example.com/pattern.pdf",
        name: "Pattern.pdf",
        content_type: "application/pdf",
      },
      client,
    );

    expect(result).toEqual({ data: { id: "file-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "pattern_files",
        kind: "insert",
        values: {
          project_id: "project-1",
          file_url: "https://example.com/pattern.pdf",
          name: "Pattern.pdf",
          content_type: "application/pdf",
        },
      },
    ]);
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "denied" } },
    });

    const result = await insertPatternFile(
      "project-1",
      {
        file_url: "https://example.com/chart.png",
        name: "Chart.png",
        content_type: "image/png",
      },
      client,
    );

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
