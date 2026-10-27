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
  description: "Stripy, for winter",
  promoted_at: null,
  seed_description: null,
  completed_at: null,
  project_photos: [
    {
      id: "ph1",
      image_url: "https://example.com/old.jpg",
      stage: "planning",
      photo_type: "inspiration",
      is_primary: true,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "ph2",
      image_url: "https://example.com/new.jpg",
      stage: "in_progress",
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
  pattern_options: [
    {
      id: "po2",
      url: "https://example.com/later-pattern",
      photo_url: null,
      comment: "Free on the blog",
      is_selected: true,
      created_at: "2026-01-02T00:00:00Z",
    },
    {
      id: "po1",
      url: null,
      photo_url: "https://example.com/screenshot.jpg",
      comment: null,
      is_selected: false,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
  pattern_files: [
    {
      id: "f2",
      file_url: "https://example.com/chart.png",
      name: "Chart.png",
      content_type: "image/png",
      created_at: "2026-01-02T00:00:00Z",
    },
    {
      id: "f1",
      file_url: "https://example.com/pattern.pdf",
      name: "Pattern.pdf",
      content_type: "application/pdf",
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
      description: "Stripy, for winter",
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

  const patternFiles = [
    {
      id: "f1",
      fileUrl: "https://example.com/pattern.pdf",
      name: "Pattern.pdf",
      contentType: "application/pdf",
    },
    {
      id: "f2",
      fileUrl: "https://example.com/chart.png",
      name: "Chart.png",
      contentType: "image/png",
    },
  ];

  const noneChosen = sampleRow.pattern_options!.map((option) => ({
    ...option,
    is_selected: false,
  }));

  it("lists Pattern Options oldest-first and derives the Pattern from the chosen one plus the files", () => {
    const detail = mapProjectDetailRow(sampleRow);

    expect(detail.patternOptions).toEqual([
      {
        id: "po1",
        url: null,
        photoUrl: "https://example.com/screenshot.jpg",
        comment: null,
        isSelected: false,
        fromIdea: false,
      },
      {
        id: "po2",
        url: "https://example.com/later-pattern",
        photoUrl: null,
        comment: "Free on the blog",
        isSelected: true,
        fromIdea: false,
      },
    ]);
    expect(detail.pattern).toEqual({
      optionId: "po2",
      url: "https://example.com/later-pattern",
      files: patternFiles,
    });
  });

  it("derives the Pattern from its Pattern Files, oldest first, with no option chosen", () => {
    const detail = mapProjectDetailRow({
      ...sampleRow,
      pattern_options: noneChosen,
    });

    expect(detail.pattern).toEqual({
      optionId: null,
      url: null,
      files: patternFiles,
    });
  });

  it("has no Pattern with no option chosen and no Pattern Files", () => {
    const detail = mapProjectDetailRow({
      ...sampleRow,
      pattern_options: noneChosen,
      pattern_files: [],
    });

    expect(detail.pattern).toBeNull();
  });

  describe("a Promoted Project", () => {
    const promoted: ProjectDetailRow = {
      ...sampleRow,
      status: "planning",
      description: "Stripy, in the club colours",
      // Promoted between the earlier and later option of each kind
      promoted_at: "2026-01-01T12:00:00Z",
      seed_description: "Stripy, for winter",
      project_photos: [
        {
          id: "seed-ph",
          image_url: "https://example.com/pinterest.jpg",
          stage: "idea",
          photo_type: "inspiration",
          is_primary: false,
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "ph2",
          image_url: "https://example.com/new.jpg",
          stage: "planning",
          photo_type: "inspiration",
          is_primary: false,
          created_at: "2026-01-03T00:00:00Z",
        },
      ],
    };

    it("keeps the Idea's photos and original description together as the Seed", () => {
      const detail = mapProjectDetailRow(promoted);

      expect(detail.seed).toEqual({
        description: "Stripy, for winter",
        photos: [
          {
            id: "seed-ph",
            imageUrl: "https://example.com/pinterest.jpg",
            photoType: "inspiration",
            isPrimary: false,
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
      });
      expect(detail.description).toBe("Stripy, in the club colours");
    });

    it("shows the Seed photos only in the Seed, but can still use one as the cover", () => {
      const detail = mapProjectDetailRow({
        ...promoted,
        project_photos: promoted.project_photos!.map((photo) => ({
          ...photo,
          is_primary: photo.id === "seed-ph",
        })),
      });

      expect(detail.photos.map((photo) => photo.id)).toEqual(["ph2"]);
      expect(detail.primaryPhotoUrl).toBe("https://example.com/pinterest.jpg");
    });

    it("flags the options created before Promotion as from the Idea", () => {
      const detail = mapProjectDetailRow(promoted);

      expect(
        detail.patternOptions.map(({ id, fromIdea }) => ({ id, fromIdea })),
      ).toEqual([
        { id: "po1", fromIdea: true },
        { id: "po2", fromIdea: false },
      ]);
      expect(
        detail.materials.map(({ id, fromIdea }) => ({ id, fromIdea })),
      ).toEqual([
        { id: "m1", fromIdea: true },
        { id: "m2", fromIdea: false },
      ]);
    });
  });

  it("has no Seed and nothing from an Idea when created directly", () => {
    const detail = mapProjectDetailRow(sampleRow);

    expect(detail.seed).toBeNull();
    expect(detail.patternOptions.every((option) => !option.fromIdea)).toBe(true);
    expect(detail.materials.every((material) => !material.fromIdea)).toBe(true);
  });

  it("has no Seed while still an Idea, and shows the Idea's photos as its own", () => {
    const detail = mapProjectDetailRow({
      ...sampleRow,
      status: "idea",
      project_photos: [
        {
          id: "idea-ph",
          image_url: "https://example.com/pinterest.jpg",
          stage: "idea",
          photo_type: "inspiration",
          is_primary: false,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    });

    expect(detail.seed).toBeNull();
    expect(detail.photos.map((photo) => photo.id)).toEqual(["idea-ph"]);
  });

  it("exposes the completion date, or null when not Completed", () => {
    expect(mapProjectDetailRow(sampleRow).completedAt).toBeNull();
    expect(
      mapProjectDetailRow({
        ...sampleRow,
        status: "completed",
        completed_at: "2026-10-27T09:30:00Z",
      }).completedAt,
    ).toBe("2026-10-27T09:30:00Z");
  });

  it("falls back to latest photo when none is primary", () => {
    const detail = mapProjectDetailRow({
      ...sampleRow,
      project_photos: [
        {
          id: "ph1",
          image_url: "https://example.com/old.jpg",
          stage: "planning",
          photo_type: "inspiration",
          is_primary: false,
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "ph2",
          image_url: "https://example.com/new.jpg",
          stage: "in_progress",
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
      description: null,
      project_photos: [],
      project_materials: null,
      pattern_options: null,
      pattern_files: null,
      project_notes: null,
    });

    expect(detail.primaryPhotoUrl).toBeNull();
    expect(detail.description).toBeNull();
    expect(detail.pattern).toBeNull();
    expect(detail.photos).toEqual([]);
    expect(detail.materials).toEqual([]);
    expect(detail.patternOptions).toEqual([]);
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
