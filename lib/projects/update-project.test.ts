import { createMockProjectsClient } from "./test-utils";
import { updateProject } from "./update-project";

jest.mock("../supabase", () => ({
  supabase: {},
}));

describe("updateProject", () => {
  it("updates the project and returns its id", async () => {
    let updated: unknown;
    let eqArgs: unknown;
    const client = createMockProjectsClient({
      insertResult: { data: { id: "project-1" }, error: null },
      onUpdate: (values, column, value) => {
        updated = values;
        eqArgs = [column, value];
      },
    });

    const result = await updateProject(
      "project-1",
      { pattern_file_url: "https://example.com/p.pdf" },
      client,
    );

    expect(result).toEqual({ data: { id: "project-1" }, error: null });
    expect(updated).toEqual({
      pattern_file_url: "https://example.com/p.pdf",
    });
    expect(eqArgs).toEqual(["id", "project-1"]);
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "not found" } },
    });

    const result = await updateProject(
      "missing",
      { pattern_file_url: "https://example.com/p.pdf" },
      client,
    );

    expect(result).toEqual({ data: null, error: "not found" });
  });
});
