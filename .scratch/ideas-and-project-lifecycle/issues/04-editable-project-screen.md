# 04: Editable Project screen

**What to build:** The Project screen becomes a living document. The maker can edit title, hobby and description, add photos (type defaults to the current Stage), pick the cover photo, add dated Notes tagged with the current Stage, and delete the Project. The same sections show at every Stage, ordered by Stage as described in the spec (Planning leads with options, In progress with Pattern/progress/Notes, Completed with finished photos).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Title, hobby and description are editable; hobby can't be cleared on a Project
- [ ] Photos can be added with a type defaulting from the Stage, and the cover photo can be changed
- [ ] Notes can be added and show their Stage and date
- [ ] Delete soft-deletes the Project
- [ ] Section order changes with the Stage
- [ ] Data-layer tests cover description updates and soft delete
