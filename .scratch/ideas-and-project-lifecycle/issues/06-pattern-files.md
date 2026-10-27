# 06: Pattern Files

**What to build:** The maker can attach several Pattern Files (PDFs or images, e.g. the purchased pattern plus a chart or size guide) to a Project's Pattern, and remove them. She doesn't need to have chosen a Pattern Option first. On an In progress Project, a single tap opens the Pattern. Cards and the Project screen read Pattern Files from the new table. Expand step; old columns are removed in ticket 16.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Schema script: `pattern_files` table (file_url, name, content_type) with RLS; uploads reuse the existing pattern-files bucket and path rules
- [ ] Pattern Files can be added (several) and removed on the Project screen
- [ ] The derived Pattern and "has a Pattern" include Pattern Files
- [ ] In progress Projects show a one-tap "open Pattern" (a single file or link opens directly; several show a picker)
- [ ] Data-layer tests cover insert, delete and the derived Pattern with files

## Comments

- Built in parallel with 05, so the schema script is `10_pattern_files.sql` (05 has 09). `derivePattern(url, files)` in `lib/projects/derive-pattern.ts` takes the Pattern's link; both call sites pass `null` until 05 feeds in the chosen Pattern Option's link. `hasPattern` on list items needs the same.
- The old wizard (`add-project.tsx`) now writes a `pattern_files` row instead of `pattern_file_url`, so its uploads still show up.
