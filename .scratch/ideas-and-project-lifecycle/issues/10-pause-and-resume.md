# 10: Pause and resume

**What to build:** The maker can Pause an In progress Project, optionally adding a note on where she got to (saved as a Note), and resume it later. The In progress page shows a Paused section below the active Projects. Completing a Paused Project clears Paused. See `GLOSSARY.md` (Paused).

**Blocked by:** 09

**Status:** ready-for-agent

- [x] Schema script: `paused_at` column
- [x] `pauseProject(id, note?)` only works on In progress Projects; writes the note as an In progress Note when given; places the Project at the bottom of the Paused ranking
- [x] `resumeProject(id)` clears Paused and places it at the bottom of the active ranking
- [x] Moving a Paused Project to Completed clears Paused
- [x] Stage list query returns active and Paused groups for In progress; the page renders both sections
- [x] Pause/Resume actions on the Project screen, with a skippable note sheet on Pause
- [x] Data-layer tests cover validity, note writing, ranking placement and grouping

**Note from 09:** `changeStage` ranks a Project entering In progress (Start or Reopen) against every In progress row. Once Paused exists, rank it against active (not Paused) In progress Projects only.
