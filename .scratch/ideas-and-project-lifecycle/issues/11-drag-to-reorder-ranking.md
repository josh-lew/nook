# 11: Drag-to-reorder ranking

**What to build:** The maker drags to reorder the Ideas list, Planning, active In progress and Paused, each ranked independently. The order persists. Completed is not manually ranked.

**Blocked by:** 02, 10

**Status:** ready-for-agent

- [ ] `reorderList(orderedIds)` rewrites ranks for one list
- [ ] Drag to reorder on the Ideas tab and on the Planning, active In progress and Paused lists
- [ ] Reordering one list never affects another
- [ ] Data-layer tests cover rank writes
