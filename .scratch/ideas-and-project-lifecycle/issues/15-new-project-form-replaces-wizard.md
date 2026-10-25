# 15: Replace the wizard with a New Project form

**What to build:** Creating a Project directly (without an Idea) asks only for title, hobby and Stage, then opens the new Project's screen where everything else is added. The four-step wizard and its step components are removed.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Short form with title, hobby and Stage; title and hobby required
- [ ] On save, the Project lands at the bottom of its Stage's ranking (and gets a completion date if created as Completed) and its screen opens
- [ ] Wizard screen and step components removed; nothing references them
- [ ] `insertProject` takes title, hobby and Stage only; tests updated
