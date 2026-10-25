# 09: Stage changes with start and complete prompts

**What to build:** The maker moves Projects between Stages from the Project screen (and the existing Stage pages). Only Planning → In progress, In progress → Completed and Completed → In progress are allowed. Starting offers a skippable prompt to confirm the Pattern and chosen materials; completing offers a skippable prompt to add finished photos and pick the cover. The completion date is recorded. This replaces the current status-moving logic.

**Blocked by:** 04, 05, 07

**Status:** ready-for-agent

- [ ] Schema script: `completed_at` column
- [ ] `changeStage(id, to)` allows only the three moves and returns an error otherwise (including any move involving Idea)
- [ ] Entering Completed sets `completed_at`; leaving it clears it; the Project lands at the bottom of the new Stage's ranking
- [ ] Start prompt shows Pattern Options and Material Options to confirm; Complete prompt offers finished photos and cover; both skippable and never block the move
- [ ] Existing Stage-page move actions use `changeStage`
- [ ] Data-layer tests cover every allowed and disallowed move and the completion date
