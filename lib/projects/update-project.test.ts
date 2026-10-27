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

  it("saves an edited title, hobby and description, trimmed", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "idea-1" }, error: null },
    });

    const result = await updateProject(
      "idea-1",
      {
        title: "  Granny square tote ",
        hobby_type: "knit",
        description: "  Chunkier yarn  ",
      },
      client,
    );

    expect(result).toEqual({ data: { id: "idea-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "projects",
        kind: "update",
        values: {
          title: "Granny square tote",
          hobby_type: "knit",
          description: "Chunkier yarn",
        },
        filters: [{ method: "eq", column: "id", value: "idea-1" }],
      },
    ]);
  });

  it("updates a Project's description on its own", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "project-1" }, error: null },
    });

    const result = await updateProject(
      "project-1",
      { description: " Swapped to a 4mm hook " },
      client,
    );

    expect(result).toEqual({ data: { id: "project-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "projects",
        kind: "update",
        values: { description: "Swapped to a 4mm hook" },
        filters: [{ method: "eq", column: "id", value: "project-1" }],
      },
    ]);
  });

  it("clears a blank description", async () => {
    const client = createMockProjectsClient({});

    await updateProject("idea-1", { description: "   " }, client);

    expect(client.calls[0]).toMatchObject({ values: { description: null } });
  });

  it("refuses to blank the title", async () => {
    const client = createMockProjectsClient({});

    const result = await updateProject("idea-1", { title: "   " }, client);

    expect(result).toEqual({ data: null, error: "A title can't be blank." });
    expect(client.calls).toEqual([]);
  });

  it("refuses to clear the hobby", async () => {
    const client = createMockProjectsClient({});

    const result = await updateProject(
      "idea-1",
      { hobby_type: null as never },
      client,
    );

    expect(result).toEqual({ data: null, error: "A hobby can't be cleared." });
    expect(client.calls).toEqual([]);
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
