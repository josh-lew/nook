# 02: Quick-capture an Idea and the Ideas tab

**What to build:** The maker taps a floating button on Home, types a title, picks a hobby (and optionally adds photos and a description), and the Idea appears at the bottom of a new Ideas tab, listed in rank order. Ideas never show up on the Projects tab's Stage pages. Ideas share the projects table (ADR-0001).

**Blocked by:** 01

**Status:** resolved

- [x] Schema script: `idea` added to the projects status check; check that non-Idea rows have a hobby (superseded by `08_require_hobby_on_ideas.sql`: every row has a hobby); `description` column added; `active_projects` view recreated
- [x] Data layer: `insertIdea({ title, hobby_type, description? })` places the Idea at the bottom of the Ideas ranking; `getIdeas` returns Ideas in rank order, excluding deleted ones
- [x] Existing Stage list queries exclude Ideas
- [x] Floating bottom-right button on Home opens a quick-capture modal: title and hobby required, photos and description optional; photos upload as inspiration photos
- [x] New Ideas tab lists Ideas (title, first photo if any) in rank order
- [x] Data-layer tests cover insert, bottom ranking and exclusion from Stage lists
- [x] Screen test: quick capture saves an Idea with only a title and hobby and can't save without either

## Comments

- Schema is `supabase/schema/07_ideas.sql`, wrapped in a transaction. Adding `projects_hobby_required_unless_idea` fails if any existing non-Idea row has a null `hobby_type`; fix or delete those test rows before applying.
- `insertIdea` ranks the new Idea at max(`plan_order`) + 1 over the user's non-deleted Ideas (0 when there are none). `getIdeas` sorts by rank in JS (unranked last, oldest first) rather than via `.order()`, so the mock client still doesn't need to record `order`. "First photo" means the earliest-added photo.
- Quick capture is the `capture-idea` modal route. Photos upload as `photo_type: "inspiration"` with `stage: "planning"`, because the photo stage check doesn't allow `idea` until ticket 08, which switches them over.
- If a photo fails after the Idea is saved, the modal keeps the Idea id, so Save retries only the remaining photos and never creates a duplicate Idea.
- The Ideas tab uses SF Symbol / Material `lightbulb` icons (no PNG). Idea cards don't navigate yet; ticket 03 adds the Idea screen.
- Lint still reports only the 7 errors already on `main`.
- Changed after testing: Ideas now require a hobby. Quick capture has a required hobby picker, `insertIdea` rejects a missing hobby, and `08_require_hobby_on_ideas.sql` makes `projects.hobby_type` not null (replacing 07's Idea exception). The glossary, spec and tickets 03, 08 and 12 are updated to match; Promote no longer asks for anything.
