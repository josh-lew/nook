import {
  getProjectById,
  mapProjectDetailRow,
  type ProjectDetailRow,
} from "./get-project-by-id";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const sampleRow: ProjectDetailRow = {
  id: "p1",
  title: "Scarf",
  hobby_type: "knit",
  status: "in_progress",
  pattern_file_url: "https://example.com/pattern.pdf",
  project_photos: [
    {
      id: "ph1",
      image_url: "https://example.com/old.jpg",
      photo_type: "inspiration",
      is_primary: true,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "ph2",
      image_url: "https://example.com/new.jpg",
      photo_type: "progress",
      is_primary: false,
      created_at: "2026-01-03T00:00:00Z",
    },
  ],
  project_materials: [
    {
      id: "m2",
      name: "Later yarn",
      url: "https://example.com/yarn",
      photo_url: null,
      comment: "Soft",
      is_selected: true,
      created_at: "2026-01-02T00:00:00Z",
    },
    {
      id: "m1",
      name: "Earlier yarn",
      url: null,
      photo_url: "https://example.com/mat.jpg",
      comment: null,
      is_selected: false,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
  project_notes: [
    {
      id: "n2",
      stage: "in_progress",
      content: "Halfway done",
      created_at: "2026-01-02T00:00:00Z",
    },
    {
      id: "n1",
      stage: "planning",
      content: "Cast on 40",
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
};

describe("mapProjectDetailRow", () => {
  it("maps primary photo, sorts photos newest-first, materials and notes oldest-first", () => {
    const detail = mapProjectDetailRow(sampleRow);

    expect(detail).toMatchObject({
      id: "p1",
      title: "Scarf",
      hobbyType: "knit",
      status: "in_progress",
      patternFileUrl: "https://example.com/pattern.pdf",
      primaryPhotoUrl: "https://example.com/old.jpg",
    });
    expect(detail.photos.map((photo) => photo.id)).toEqual(["ph2", "ph1"]);
    expect(detail.materials.map((material) => material.id)).toEqual([
      "m1",
      "m2",
    ]);
    expect(detail.notes.map((note) => note.id)).toEqual(["n1", "n2"]);
    expect(detail.materials[1]).toMatchObject({
      name: "Later yarn",
      url: "https://example.com/yarn",
      comment: "Soft",
      isSelected: true,
    });
  });

  it("falls back to latest photo when none is primary", () => {
    const detail = mapProjectDetailRow({
      ...sampleRow,
      project_photos: [
        {
          id: "ph1",
          image_url: "https://example.com/old.jpg",
          photo_type: "inspiration",
          is_primary: false,
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "ph2",
          image_url: "https://example.com/new.jpg",
          photo_type: "progress",
          is_primary: false,
          created_at: "2026-01-03T00:00:00Z",
        },
      ],
    });

    expect(detail.primaryPhotoUrl).toBe("https://example.com/new.jpg");
  });

  it("handles empty relations", () => {
    const detail = mapProjectDetailRow({
      ...sampleRow,
      pattern_file_url: null,
      project_photos: [],
      project_materials: null,
      project_notes: null,
    });

    expect(detail.primaryPhotoUrl).toBeNull();
    expect(detail.patternFileUrl).toBeNull();
    expect(detail.photos).toEqual([]);
    expect(detail.materials).toEqual([]);
    expect(detail.notes).toEqual([]);
  });
});

describe("getProjectById", () => {
  it("returns the mapped project for the current user", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: sampleRow, error: null },
    });

    const result = await getProjectById("p1", client);

    expect(result.error).toBeNull();
    expect(result.data?.id).toBe("p1");
    expect(result.data?.primaryPhotoUrl).toBe("https://example.com/old.jpg");
    expect(result.data?.notes).toHaveLength(2);
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await getProjectById("p1", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns a Supabase error message when the project is missing", async () => {
    const client = createMockProjectsClient({
      queryResult: {
        data: null,
        error: { message: "JSON object requested, multiple (or no) rows returned" },
      },
    });

    const result = await getProjectById("missing", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/rows returned/i);
  });
});
