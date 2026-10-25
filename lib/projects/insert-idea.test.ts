import { insertIdea } from "./insert-idea";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

function insertedValues(client: ReturnType<typeof createMockProjectsClient>) {
  const insert = client.calls.find((call) => call.kind === "insert");
  return insert?.kind === "insert" ? insert.values : undefined;
}

describe("insertIdea", () => {
  it("saves an Idea with only a title", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "idea-1" }, error: null },
    });

    const result = await insertIdea({ title: "  Granny square bag " }, client);

    expect(result).toEqual({ data: { id: "idea-1" }, error: null });
    expect(insertedValues(client)).toEqual({
      user_id: "user-1",
      title: "Granny square bag",
      description: null,
      hobby_type: null,
      status: "idea",
      plan_order: 0,
    });
  });

  it("saves the optional description and hobby", async () => {
    const client = createMockProjectsClient({});

    await insertIdea(
      { title: "Cardigan", description: " Saw it on Pinterest ", hobby_type: "knit" },
      client,
    );

    expect(insertedValues(client)).toMatchObject({
      description: "Saw it on Pinterest",
      hobby_type: "knit",
    });
  });

  it("rejects a blank title without writing anything", async () => {
    const client = createMockProjectsClient({});

    const result = await insertIdea({ title: "   " }, client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/title/i);
    expect(client.calls).toEqual([]);
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await insertIdea({ title: "Hat" }, client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns a Supabase error message on insert failure", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "check violation" } },
    });

    const result = await insertIdea({ title: "Hat" }, client);

    expect(result).toEqual({ data: null, error: "check violation" });
  });

  it("places the Idea at the bottom of the Ideas ranking", async () => {
    const client = createMockProjectsClient({
      queryResult: {
        data: [{ plan_order: 2 }, { plan_order: 5 }, { plan_order: null }],
        error: null,
      },
    });

    await insertIdea({ title: "Tote" }, client);

    expect(insertedValues(client)).toMatchObject({ plan_order: 6 });
    const rankQuery = client.calls.find((call) => call.kind === "select");
    expect(rankQuery).toMatchObject({
      table: "projects",
      filters: expect.arrayContaining([
        { method: "eq", column: "user_id", value: "user-1" },
        { method: "eq", column: "status", value: "idea" },
        { method: "is", column: "deleted_at", value: null },
      ]),
    });
  });
});
