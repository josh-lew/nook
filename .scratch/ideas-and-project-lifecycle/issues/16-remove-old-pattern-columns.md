# 16: Remove the old pattern columns

**What to build:** Contract step for the Pattern model. Now that Pattern Options and Pattern Files are used everywhere, drop `pattern_url` and `pattern_file_url` and remove every remaining reference. Existing data is test data only; no migration needed.

**Blocked by:** 05, 06, 15

**Status:** ready-for-agent

- [ ] Schema script drops both columns and recreates the `active_projects` view
- [ ] No types, queries, mappers, uploads or UI reference the old columns
- [ ] All tests, lint and type checks pass
