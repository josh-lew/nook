import { getIdeas, type IdeaListRow } from "./get-ideas";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const rows: IdeaListRow[] = [
  {
    id: "unranked",
    title: "Unranked",
    created_at: "2026-01-01T00:00:00Z",
    plan_order: null,
    project_photos: [],
  },
  {
    id: "second",
    title: "Second",
    created_at: "2026-01-02T00:00:00Z",
    plan_order: 4,
    project_photos: [
      {
        id: "ph2",
        image_url: "https://example.com/later.jpg",
        created_at: "2026-01-05T00:00:00Z",
      },
      {
        id: "ph1",
        image_url: "https://example.com/first.jpg",
        created_at: "2026-01-03T00:00:00Z",
      },
    ],
  },
  {
    id: "first",
    title: "First",
    created_at: "2026-01-03T00:00:00Z",
    plan_order: 1,
    project_photos: null,
  },
];

describe("getIdeas", () => {
  it("returns Ideas in rank order with their first photo", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: rows, error: null },
    });

    const result = await getIdeas(client);

    expect(result).toEqual({
      data: [
        {
          id: "first",
          title: "First",
          photoUrl: null,
          createdAt: "2026-01-03T00:00:00Z",
        },
        {
          id: "second",
          title: "Second",
          photoUrl: "https://example.com/first.jpg",
          createdAt: "2026-01-02T00:00:00Z",
        },
        {
          id: "unranked",
          title: "Unranked",
          photoUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      error: null,
    });
  });

  it("only asks for the user's Ideas that are not deleted", async () => {
    const client = createMockProjectsClient({});

    await getIdeas(client);

    expect(client.calls).toEqual([
      expect.objectContaining({
        table: "projects",
        kind: "select",
        filters: expect.arrayContaining([
          { method: "eq", column: "user_id", value: "user-1" },
          { method: "eq", column: "status", value: "idea" },
          { method: "is", column: "deleted_at", value: null },
        ]),
      }),
    ]);
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await getIdeas(client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns a Supabase error message", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: { message: "permission denied" } },
    });

    const result = await getIdeas(client);

    expect(result).toEqual({ data: null, error: "permission denied" });
  });
});
