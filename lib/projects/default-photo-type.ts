import type { InsertProjectPhotoArgs, Stage } from "./types";

const DEFAULT_PHOTO_TYPE: Record<Stage, InsertProjectPhotoArgs["photo_type"]> = {
  planning: "inspiration",
  in_progress: "progress",
  completed: "finished",
};

/** The photo type a new photo gets from the Stage it was added in; the maker can change it. */
export function defaultPhotoType(stage: Stage): InsertProjectPhotoArgs["photo_type"] {
  return DEFAULT_PHOTO_TYPE[stage];
}
