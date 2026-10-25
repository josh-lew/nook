# 10: Pause and resume

**What to build:** The maker can Pause an In progress Project, optionally adding a note on where she got to (saved as a Note), and resume it later. The In progress page shows a Paused section below the active Projects. Completing a Paused Project clears Paused. See `GLOSSARY.md` (Paused).

**Blocked by:** 09

**Status:** ready-for-agent

- [ ] Schema script: `paused_at` column
- [ ] `pauseProject(id, note?)` only works on In progress Projects; writes the note as an In progress Note when given; places the Project at the bottom of the Paused ranking
- [ ] `resumeProject(id)` clears Paused and places it at the bottom of the active ranking
- [ ] Moving a Paused Project to Completed clears Paused
- [ ] Stage list query returns active and Paused groups for In progress; the page renders both sections
- [ ] Pause/Resume actions on the Project screen, with a skippable note sheet on Pause
- [ ] Data-layer tests cover validity, note writing, ranking placement and grouping
