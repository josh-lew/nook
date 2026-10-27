import { deletePatternOption } from "./delete-pattern-option";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const signedUrl =
  "https://abc.supabase.co/storage/v1/object/sign/project-photos/user-1/project-1/1700000000000-hat.jpg?token=xyz";

describe("deletePatternOption", () => {
  it("removes the option and its screenshot in storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "option-1", photo_url: signedUrl }],
        error: null,
      },
    });

    const result = await deletePatternOption("option-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls).toEqual([
      {
        table: "pattern_options",
        kind: "delete",
        filters: [{ method: "eq", column: "id", value: "option-1" }],
      },
      {
        bucket: "project-photos",
        kind: "remove",
        paths: ["user-1/project-1/1700000000000-hat.jpg"],
      },
    ]);
  });

  it("removes a link-only option without touching storage", async () => {
    const client = createMockProjectsClient({
      deleteResult: {
        data: [{ id: "option-1", photo_url: null }],
        error: null,
      },
    });

    const result = await deletePatternOption("option-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(client.calls.map((call) => call.kind)).toEqual(["delete"]);
  });

  it("reports an error when no row was deleted, e.g. blocked by RLS", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: [], error: null },
    });

    const result = await deletePatternOption("option-1", client);

    expect(result).toEqual({
      data: null,
      error: "The Pattern Option couldn't be removed.",
    });
  });

  it("returns a Supabase error message", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: null, error: { message: "delete failed" } },
    });

    const result = await deletePatternOption("option-1", client);

    expect(result).toEqual({ data: null, error: "delete failed" });
  });
});
