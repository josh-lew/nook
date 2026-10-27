import { choosePatternOption } from "./choose-pattern-option";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const planningProject = { data: { status: "planning" }, error: null };
const optionFound = { data: [{ id: "option-2" }], error: null };
const optionMissing = { data: [], error: null };

describe("choosePatternOption", () => {
  it("selects the option as the Project's Pattern", async () => {
    const client = createMockProjectsClient({
      queryResults: [planningProject, optionFound],
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
      queryResults: [planningProject, optionFound],
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
      queryResults: [planningProject, optionMissing],
    });

    const result = await choosePatternOption("project-1", "other", client);

    expect(result).toEqual({
      data: null,
      error: "That Pattern Option couldn't be chosen.",
    });
    expect(client.calls.some((call) => call.kind === "update")).toBe(false);
  });

  it("returns an error when clearing the earlier choice fails", async () => {
    const client = createMockProjectsClient({
      queryResults: [planningProject, optionFound],
      updateResults: [{ data: null, error: { message: "clear failed" } }],
    });

    const result = await choosePatternOption("project-1", "option-2", client);

    expect(result).toEqual({ data: null, error: "clear failed" });
  });
});
