# 05: Pattern Options and choosing the Pattern

**What to build:** The maker can add Pattern Options (a link and/or screenshot with an optional comment) to an Idea or a Project. On a Project, she can choose one as the Pattern, switch to another, or clear it. Project cards and the Project screen show whether a Project has a Pattern based on the new model. See `GLOSSARY.md` (Pattern, Pattern Option). This is the expand step; the old pattern columns are left in place until ticket 16.

**Blocked by:** 03, 04

**Status:** ready-for-agent

- [ ] Schema script: `pattern_options` table (url, photo_url, comment, is_selected) with at most one selected per project, and RLS mirroring materials
- [ ] Pattern Options can be added, edited and removed on the Idea screen and the Project screen
- [ ] On a Project, `choosePatternOption(projectId, optionId | null)` selects, switches or clears the Pattern
- [ ] The Project detail returns the derived Pattern (selected option's link plus any Pattern Files once ticket 06 lands); "has a Pattern" on cards uses it
- [ ] Tapping a Pattern Option's link opens it
- [ ] Data-layer tests cover select, switch, clear, and the derived Pattern
