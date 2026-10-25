# 01: Extend the test mock client and separate Stage from status

**What to build:** Groundwork so later tickets can be built test-first. The shared fake Supabase client used by data-layer tests supports the call shapes the new features need, and the types distinguish a Project's Stage from the stored row status (which will also allow `idea`). No visible change in the app. See the spec's Testing Decisions and `GLOSSARY.md` (Stage, Idea).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The mock projects client supports `delete`, `in`, `not` and multi-row updates, and lets tests capture what was written for each
- [ ] A `Stage` type (`planning | in_progress | completed`) exists separately from the row-status type, which also allows `idea`
- [ ] Existing callers use `Stage` wherever they mean a Project's Stage (e.g. note and photo stages)
- [ ] All existing tests, lint and type checks pass
