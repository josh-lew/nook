import type { Stage, UploadFile } from "../../../lib/projects";

export type ProjectPhotoType = "inspiration" | "progress" | "finished";

export type AdditionalPhotoDraft = {
  id: string;
  file: UploadFile;
  photoType: ProjectPhotoType;
};

export function photoTypeOptionsForStage(
  stage: Stage,
): { value: ProjectPhotoType; label: string }[] {
  if (stage === "in_progress") {
    return [
      { value: "inspiration", label: "Inspiration" },
      { value: "progress", label: "Progress" },
    ];
  }
  if (stage === "completed") {
    return [
      { value: "inspiration", label: "Inspiration" },
      { value: "progress", label: "Progress" },
      { value: "finished", label: "Finished" },
    ];
  }
  return [];
}
