# 02: Quick-capture an Idea and the Ideas tab

**What to build:** The maker taps a floating button on Home, types a title (and optionally adds photos and a description), and the Idea appears at the bottom of a new Ideas tab, listed in rank order. Ideas never show up on the Projects tab's Stage pages. Ideas share the projects table (ADR-0001).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Schema script: `idea` added to the projects status check; check that non-Idea rows have a hobby; `description` column added; `active_projects` view recreated
- [ ] Data layer: `insertIdea({ title, description?, hobby_type? })` places the Idea at the bottom of the Ideas ranking; `getIdeas` returns Ideas in rank order, excluding deleted ones
- [ ] Existing Stage list queries exclude Ideas
- [ ] Floating bottom-right button on Home opens a quick-capture modal: title required, photos and description optional; photos upload as inspiration photos
- [ ] New Ideas tab lists Ideas (title, first photo if any) in rank order
- [ ] Data-layer tests cover insert, bottom ranking and exclusion from Stage lists
- [ ] Screen test: quick capture saves an Idea with only a title and can't save without one
