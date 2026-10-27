import { defaultPhotoType } from "./default-photo-type";

describe("defaultPhotoType", () => {
  it("tags photos added in Planning as inspiration", () => {
    expect(defaultPhotoType("planning")).toBe("inspiration");
  });

  it("tags photos added In progress as progress", () => {
    expect(defaultPhotoType("in_progress")).toBe("progress");
  });

  it("tags photos added once Completed as finished", () => {
    expect(defaultPhotoType("completed")).toBe("finished");
  });
});
