# 01: Extend the test mock client and separate Stage from status

**What to build:** Groundwork so later tickets can be built test-first. The shared fake Supabase client used by data-layer tests supports the call shapes the new features need, and the types distinguish a Project's Stage from the stored row status (which will also allow `idea`). No visible change in the app. See the spec's Testing Decisions and `GLOSSARY.md` (Stage, Idea).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The mock projects client supports `delete`, `in`, `not` and multi-row updates, and lets tests capture what was written for each
- [x] A `Stage` type (`planning | in_progress | completed`) exists separately from the row-status type, which also allows `idea`
- [x] Existing callers use `Stage` wherever they mean a Project's Stage (e.g. note and photo stages)
- [x] All existing tests, lint and type checks pass

## Comments

- `createMockProjectsClient` records every insert, update, delete and select in `client.calls` (values plus `eq`/`is`/`in`/`not` filters), and takes `queryResults` for a different result per select. Its own tests are in `lib/projects/test-utils.test.ts`. Writing a different value per row (e.g. reorder ranks) is one `update().eq()` per row, each recorded separately. `order`, `limit` and `maybeSingle` are not recorded or supported yet; add them test-first in the tickets that need them.
- `ProjectStatus` is the stored row status (`"idea" | Stage`). `getProjectById` keeps `ProjectStatus` because the row may be an Idea; everything else that means a Stage uses `Stage`, and identifiers holding a Stage are named `stage`. The `status` DB column, the `status` route param, `getProjectsByStatus`, `StatusPage` and the on-screen "Status" label are unchanged.
- Lint exception: the repo has no ESLint config, so `npm run lint` installs one, and it then reports 7 React Compiler errors (`react-hooks/refs`, `react-hooks/set-state-in-effect`) that are identical on `main`. Tests and type checks pass. Setting up ESLint and fixing those errors is a separate piece of work.
