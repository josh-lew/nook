import { choosePatternOption } from "./choose-pattern-option";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const planningProject = { data: { status: "planning" }, error: null };
// The Project's options: option-1 is the current Pattern
const projectOptions = {
  data: [
    { id: "option-1", is_selected: true },
    { id: "option-2", is_selected: false },
  ],
  error: null,
};

describe("choosePatternOption", () => {
  it("selects the option as the Project's Pattern", async () => {
    const client = createMockProjectsClient({
      queryResults: [planningProject, projectOptions],
    });

    const result = await choosePatternOption("project-1", "option-2", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls.filter((call) => call.kind === "update")).toEqual([
      {
        table: "pattern_options",
        kind: "update",
        values: { is_selected: false },
        filters: [
          { method: "eq", column: "project_id", value: "project-1" },
          { method: "eq", column: "is_selected", value: true },
        ],
      },
      {
        table: "pattern_options",
        kind: "update",
        values: { is_selected: true },
        filters: [
          { method: "eq", column: "id", value: "option-2" },
          { method: "eq", column: "project_id", value: "project-1" },
        ],
      },
    ]);
  });

  it("clears the Pattern when given no option", async () => {
    const client = createMockProjectsClient({ queryResult: planningProject });

    const result = await choosePatternOption("project-1", null, client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls.filter((call) => call.kind === "update")).toEqual([
      {
        table: "pattern_options",
        kind: "update",
        values: { is_selected: false },
        filters: [
          { method: "eq", column: "project_id", value: "project-1" },
          { method: "eq", column: "is_selected", value: true },
        ],
      },
    ]);
  });

  it("switches the Pattern, leaving only the new option selected", async () => {
    // Stand-in for the table: option-1 is the current Pattern
    const selected = new Set(["option-1"]);
    const client = createMockProjectsClient({
      queryResults: [planningProject, projectOptions],
      onUpdate: (values, column, value) => {
        const { is_selected } = values as { is_selected: boolean };
        if (column === "is_selected") {
          selected.clear();
        } else if (column === "id" && is_selected) {
          selected.add(value as string);
        }
      },
    });

    const result = await choosePatternOption("project-1", "option-2", client);

    expect(result).toEqual({ data: null, error: null });
    expect([...selected]).toEqual(["option-2"]);
  });

  it("refuses to give an Idea a Pattern", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: { status: "idea" }, error: null },
    });

    const result = await choosePatternOption("idea-1", "option-2", client);

    expect(result).toEqual({
      data: null,
      error: "Only a Project can have a Pattern.",
    });
    expect(client.calls.some((call) => call.kind === "update")).toBe(false);
  });

  it("keeps the current Pattern when the option isn't one of the Project's", async () => {
    const client = createMockProjectsClient({
      queryResults: [planningProject, { data: [{ id: "option-1", is_selected: true }], error: null }],
    });

    const result = await choosePatternOption("project-1", "other", client);

    expect(result).toEqual({
      data: null,
      error: "That Pattern Option couldn't be chosen.",
    });
    expect(client.calls.some((call) => call.kind === "update")).toBe(false);
  });

  it("reports a Project it can't find, e.g. hidden by RLS", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: null },
    });

    const result = await choosePatternOption("missing", "option-2", client);

    expect(result).toEqual({ data: null, error: "Project not found." });
    expect(client.calls.some((call) => call.kind === "update")).toBe(false);
  });

  it("puts the earlier Pattern back when selecting the new one fails", async () => {
    const client = createMockProjectsClient({
      queryResults: [planningProject, projectOptions],
      updateResults: [
        { data: null, error: null },
        { data: null, error: { message: "select failed" } },
        { data: null, error: null },
      ],
    });

    const result = await choosePatternOption("project-1", "option-2", client);

    expect(result).toEqual({ data: null, error: "select failed" });
    expect(client.calls.at(-1)).toEqual({
      table: "pattern_options",
      kind: "update",
      values: { is_selected: true },
      filters: [
        { method: "eq", column: "id", value: "option-1" },
        { method: "eq", column: "project_id", value: "project-1" },
      ],
    });
  });

  it("returns an error when clearing the earlier choice fails", async () => {
    const client = createMockProjectsClient({
      queryResults: [planningProject, projectOptions],
      updateResults: [{ data: null, error: { message: "clear failed" } }],
    });

    const result = await choosePatternOption("project-1", "option-2", client);

    expect(result).toEqual({ data: null, error: "clear failed" });
  });
});
