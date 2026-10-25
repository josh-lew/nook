# 08: Promote an Idea, with its Seed

**What to build:** From the Idea screen the maker Promotes the Idea. Promoting is a single confirmation; the Idea's hobby carries over. The Idea disappears from the Ideas tab and becomes a Planning Project at the bottom of the Planning ranking. Its inspiration photos and original description are shown together in a Seed box low on the Project screen; its Pattern Options and Material Options stay live and are labelled as from the Idea. The Project's description starts as the Idea's and remains editable. See `GLOSSARY.md` (Promote, Seed) and ADR-0001.

**Blocked by:** 05, 07

**Status:** ready-for-agent

- [ ] Schema script: `seed_description` and `promoted_at` columns; `idea` added to the photo stage check
- [ ] Ideas' photos are stored with stage `idea` (update quick capture and the Idea screen accordingly)
- [ ] `promoteIdea(id)` rejects non-Ideas, sets status to Planning, `promoted_at`, `seed_description`, and bottom rank
- [ ] Project detail returns the Seed only for Promoted Projects, and a from-Idea flag on options (created before `promoted_at`)
- [ ] Project screen shows the Seed box and "from idea" labels
- [ ] Data-layer tests cover all promote rules and the detail mapping
