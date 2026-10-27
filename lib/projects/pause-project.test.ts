import { pauseProject } from "./pause-project";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

function updateCall(client: ReturnType<typeof createMockProjectsClient>) {
  const update = client.calls.find((call) => call.kind === "update");
  return update?.kind === "update" ? update : undefined;
}

describe("pauseProject", () => {
  it("pauses an In progress Project at the bottom of the Paused ranking", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "in_progress", paused_at: null }, error: null },
        { data: [{ plan_order: 1 }, { plan_order: 4 }], error: null },
      ],
    });

    const result = await pauseProject("project-1", undefined, client);

    expect(result).toEqual({ data: null, error: null });
    // Only Paused Projects are ranked against
    expect(client.calls[1]).toMatchObject({
      kind: "select",
      filters: expect.arrayContaining([
        { method: "eq", column: "status", value: "in_progress" },
        { method: "not", column: "paused_at", operator: "is", value: null },
      ]),
    });
    expect(updateCall(client)).toEqual({
      table: "projects",
      kind: "update",
      values: { paused_at: expect.any(String), plan_order: 5 },
      filters: [
        { method: "eq", column: "id", value: "project-1" },
        { method: "eq", column: "user_id", value: "user-1" },
        { method: "eq", column: "status", value: "in_progress" },
        { method: "is", column: "paused_at", value: null },
      ],
    });
    expect(client.calls.some((call) => call.kind === "insert")).toBe(false);
  });

  it("saves the note on where she got to as an In progress Note", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "in_progress", paused_at: null }, error: null },
        { data: [], error: null },
      ],
    });

    const result = await pauseProject(
      "project-1",
      "  Up to row 40 of the sleeve  ",
      client,
    );

    expect(result).toEqual({ data: null, error: null });
    expect(updateCall(client)?.values).toMatchObject({ plan_order: 0 });
    expect(client.calls.at(-1)).toEqual({
      table: "project_notes",
      kind: "insert",
      values: {
        project_id: "project-1",
        stage: "in_progress",
        content: "Up to row 40 of the sleeve",
      },
    });
  });

  it("skips a blank note", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "in_progress", paused_at: null }, error: null },
        { data: [], error: null },
      ],
    });

    const result = await pauseProject("project-1", "   ", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls.some((call) => call.kind === "insert")).toBe(false);
  });

  it.each([
    ["an Idea", { status: "idea", paused_at: null }],
    ["a Planning Project", { status: "planning", paused_at: null }],
    ["a Completed Project", { status: "completed", paused_at: null }],
    [
      "an already Paused Project",
      { status: "in_progress", paused_at: "2026-10-01T00:00:00Z" },
    ],
  ])("rejects %s without writing anything", async (_label, row) => {
    const client = createMockProjectsClient({
      queryResult: { data: row, error: null },
    });

    const result = await pauseProject("project-1", "a note", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/only an active in progress/i);
    expect(updateCall(client)).toBeUndefined();
    expect(client.calls.some((call) => call.kind === "insert")).toBe(false);
  });

  it("rejects a Project that doesn't exist or isn't the user's", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: null },
    });

    const result = await pauseProject("missing", undefined, client);

    expect(result).toEqual({ data: null, error: "Project not found." });
  });

  it("reports a Project changed elsewhere without saving the note", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "in_progress", paused_at: null }, error: null },
        { data: [], error: null },
      ],
      // The guards matched no row
      insertResult: { data: null, error: null },
    });

    const result = await pauseProject("project-1", "Row 40", client);

    expect(result.error).toMatch(/changed elsewhere/i);
    expect(client.calls.some((call) => call.kind === "insert")).toBe(false);
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await pauseProject("project-1", undefined, client);

    expect(result.error).toMatch(/signed in/i);
    expect(client.calls).toEqual([]);
  });
});
