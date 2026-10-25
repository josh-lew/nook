# Ideas and the Project lifecycle

Status: ready-for-agent

## Problem Statement

The maker crochets, knits and sews, usually with one or two Projects of each on the go and a long tail of things she might make one day. Today the app treats every one of those "might make" thoughts as a Project in Planning, created through a four-step wizard that asks for a hobby, a pattern file, materials and notes up front. That is far too heavy for the moment an idea actually happens (scrolling Instagram or Pinterest), so ideas end up scattered across her camera roll and browser tabs.

Patterns are also modelled wrongly. She searches by pattern and often weighs several candidates before buying one, but a Project can hold only a single pattern link and a single pattern file. Many patterns are free web pages that never become a PDF; others come as a main PDF plus a chart or size guide.

Once a Project exists, it can only be viewed, not added to, even though buying the pattern, choosing yarn, taking progress photos and finishing all happen weeks later. There is no way to put a Project down for a while, no way to say which Ideas or Projects matter most, and nowhere to show off finished work.

## Solution

Split the maker's world into **Ideas** and **Projects** (see `GLOSSARY.md`).

- **Ideas** are captured in seconds from a floating button on Home: only a title is required, with optional inspiration photos, a description, Pattern Options and Material Options. Ideas live in their own tab, are manually ranked, and can be deleted.
- **Promoting** an Idea turns it into a Project in Planning, asking only for the hobby. The Idea's photos and description are kept together as the Project's **Seed**, while its Pattern Options and Material Options stay live for her to choose from, labelled as coming from the Idea.
- **Projects** move through the Stages Planning → In progress → Completed, with Completed → In progress as the only way back. An In progress Project can be **Paused**, optionally with a note on where she got to.
- A Project has at most one **Pattern**: a link and/or several **Pattern Files**. Choosing a Pattern Option makes it the Pattern.
- The Project detail screen becomes a living document where everything can be added and edited, with sections ordered by Stage. Stage changes offer skippable prompts and never require anything.
- Ideas, Planning, active In progress and Paused lists are manually ranked; all lists can be filtered by hobby and sorted.
- Home shows the Nook logo, carousels for In progress, Up next, Ideas and Recently completed, and the quick-capture button.
- The Completed page becomes the **Gallery**: a photo grid of every finished Project.
- The four-step wizard is retired in favour of a short "new Project" form.

## User Stories

### Capturing Ideas

1. As a maker, I want a floating button on Home that lets me save an Idea, so that I can capture something the moment I see it.
2. As a maker, I want to save an Idea with only a title, so that capturing never feels like a chore.
3. As a maker, I want to attach one or more screenshots from my camera roll to an Idea, so that I remember what caught my eye.
4. As a maker, I want to add a short description to an Idea, so that I can note why I liked it or what I'd change.
5. As a maker, I want to optionally set a hobby on an Idea, so that I can filter Ideas by craft when I know it.
6. As a maker, I want to leave the hobby blank on an Idea, so that I'm not forced to decide before I've thought about it.
7. As a maker, I want to add several Pattern Options to an Idea, each as a link and/or a screenshot with an optional comment, so that I can compare candidate patterns.
8. As a maker, I want to add several Material Options to an Idea, each as a link and/or a screenshot with an optional comment, so that I can collect yarn and fabric candidates.
9. As a maker, I want to add more photos, options or a description to an Idea later, so that an Idea can grow as I keep finding things.
10. As a maker, I want Ideas to have their own tab, so that my loose ideas don't clutter my committed Projects.

### Organising Ideas

11. As a maker, I want to drag my Ideas into my own order, so that the ones I'm most excited about sit at the top.
12. As a maker, I want new Ideas to appear at the bottom of my ranking, so that capturing something doesn't disturb my order.
13. As a maker, I want to filter Ideas by hobby, so that I can see only crochet Ideas when I'm in a crochet mood.
14. As a maker, I want Ideas without a hobby to still appear when no filter is applied, so that nothing gets lost.
15. As a maker, I want to sort Ideas by my order, newest, oldest or A–Z, so that I can find things different ways.
16. As a maker, I want to delete an Idea I've gone off, so that I can tidy up when I feel like it.
17. As a maker, I want deleting an Idea to be recoverable behind the scenes (soft delete), so that an accidental delete isn't catastrophic.

### Promoting an Idea

18. As a maker, I want to Promote an Idea into a Project, so that I can commit to making it.
19. As a maker, I want Promoting to ask only for the hobby, so that committing is a single step.
20. As a maker, I want the hobby to be pre-filled if the Idea already had one, so that I don't re-enter it.
21. As a maker, I want Promoting to never ask me to pick a pattern, so that I can commit before I've decided.
22. As a maker, I want a Promoted Idea to land at the bottom of my Planning ranking, so that my existing plan order is respected.
23. As a maker, I want a Promoted Idea to disappear from my Ideas, so that it isn't in two places.
24. As a maker, I want the Idea's photos and original description kept together as the Project's Seed, so that I can look back at where it started.
25. As a maker, I want the Seed tucked away lower on the Project screen, so that it doesn't crowd the current work.
26. As a maker, I want the Idea's Pattern Options and Material Options to carry into the Project's Planning lists, so that I can choose from them.
27. As a maker, I want options that came from the Idea to be labelled as such, so that I know which I found early on.
28. As a maker, I want the Idea's description to become the Project's description, which I can then edit, so that I keep refining it.

### Creating a Project directly

29. As a maker, I want to create a Project without going through an Idea, so that I can log something I've already started or finished.
30. As a maker, I want direct creation to ask only for title, hobby and Stage, so that it's quick.
31. As a maker, I want to add everything else on the Project screen afterwards, so that the Project builds up naturally.

### Patterns

32. As a maker, I want to add Pattern Options to a Project in Planning, so that I can keep comparing candidates after committing.
33. As a maker, I want to choose one Pattern Option as the Pattern, so that the Project knows what I'm following.
34. As a maker, I want to change which Pattern Option is chosen, so that I can change my mind.
35. As a maker, I want to clear the chosen Pattern, so that I can go back to undecided.
36. As a maker, I want a link alone to count as the Pattern, so that free online patterns work without a file.
37. As a maker, I want to attach one or more Pattern Files (PDF or image) to the Pattern, so that I can keep the purchased PDF plus any chart or size guide.
38. As a maker, I want to remove a Pattern File, so that I can replace a wrong upload.
39. As a maker, I want to open a Pattern File or the Pattern's link with one tap from an In progress Project, so that I can follow it while I work.
40. As a maker, I want to add Pattern Files without having chosen a Pattern Option first, so that a pattern I bought elsewhere still fits.

### Materials

41. As a maker, I want to add Material Options to a Project at any Stage, so that I can keep collecting candidates.
42. As a maker, I want to mark Material Options as chosen, so that I know what I'm actually using.
43. As a maker, I want to mark more than one Material Option as chosen, so that a Project can use several yarns or fabrics.

### Living document

44. As a maker, I want to edit a Project's title, hobby and description at any time, so that it stays accurate.
45. As a maker, I want to add photos to a Project at any Stage, so that I capture progress as it happens.
46. As a maker, I want photos tagged by type (inspiration, progress, finished) with sensible defaults for the current Stage, so that they're organised without effort.
47. As a maker, I want to pick the cover photo for a Project, so that it looks right in lists and the Gallery.
48. As a maker, I want to add dated Notes to a Project, tagged with the Stage I was in, so that I keep a journal of the make.
49. As a maker, I want the Project screen to lead with Pattern Options and Material Options during Planning, so that the decisions I need to make are first.
50. As a maker, I want the Project screen to lead with the Pattern, progress photos and Notes while In progress, so that what I need while making is first.
51. As a maker, I want the Project screen to lead with finished photos when Completed, so that it shows off the result.
52. As a maker, I want to delete a Project (soft delete), so that I can remove mistakes.

### Stages

53. As a maker, I want to move a Project from Planning to In progress, so that I can record that I've started.
54. As a maker, I want starting a Project to offer to confirm the Pattern and chosen materials, so that I'm nudged to record them.
55. As a maker, I want to skip that prompt, so that starting is never blocked.
56. As a maker, I want to move a Project from In progress to Completed, so that I can record that it's finished.
57. As a maker, I want completing a Project to offer to add finished photos and pick the cover, so that the Gallery looks good.
58. As a maker, I want to skip that prompt too, so that finishing is never blocked.
59. As a maker, I want to move a Completed Project back to In progress, so that I can fix or extend it.
60. As a maker, I want the app to prevent moving a Project back to Planning or back to an Idea, so that the lifecycle stays meaningful.
61. As a maker, I want the date a Project was completed recorded, so that the Gallery can show my most recent work first.
62. As a maker, I want a Project that's moved back to In progress and completed again to get its new completion date, so that the date is accurate.
63. As a maker, I want a Project that moves into a Stage to land at the bottom of that Stage's ranking, so that my existing order is respected.

### Pausing

64. As a maker, I want to Pause an In progress Project, so that I can put it down without pretending it's finished.
65. As a maker, I want Pausing to offer an optional note on where I got to, saved as a Note, so that I can pick it up months later.
66. As a maker, I want Paused Projects shown in their own section below active ones on the In progress page, so that I can see what I'm actually working on.
67. As a maker, I want to rank Paused Projects separately from active ones, so that each list has its own order.
68. As a maker, I want to resume a Paused Project, so that it returns to my active list.
69. As a maker, I want a resumed Project to land at the bottom of the active ranking, so that my current order is respected.
70. As a maker, I want only In progress Projects to be pausable, so that Paused means one thing.
71. As a maker, I want a Paused Project that I complete to stop being Paused, so that finished work isn't flagged as put down.

### Ranking, filtering and sorting Projects

72. As a maker, I want to drag Planning Projects into my own order, so that I know what's up next.
73. As a maker, I want to drag active In progress Projects into my own order, so that my main makes sit at the top.
74. As a maker, I want Completed Projects ordered by completion date, newest first, by default, so that the Gallery shows recent work.
75. As a maker, I want to filter every Stage page by hobby, so that I can focus on one craft.
76. As a maker, I want to sort every Stage page by my order (or completion date for Completed), newest, oldest or A–Z, so that I can browse different ways.

### Home

77. As a maker, I want the Nook logo at the top of Home, so that the app feels like mine.
78. As a maker, I want an In progress carousel on Home showing active (not Paused) Projects in my order, so that I see what I'm making at a glance.
79. As a maker, I want an Up next carousel showing my top-ranked Planning Projects, so that I know what's next.
80. As a maker, I want an Ideas carousel showing my top-ranked Ideas, so that my favourite ideas stay visible.
81. As a maker, I want a Recently completed carousel, so that I can enjoy what I've finished.
82. As a maker, I want each carousel to have a "See all" link to its full list, so that I can dig in.
83. As a maker, I want tapping a carousel card to open that Idea or Project, so that I can jump straight in.
84. As a maker, I want a settings icon in the Home header that holds the light/dark theme toggle, so that Home isn't cluttered.

### Gallery

85. As a maker, I want the Completed page to be a photo grid of my finished Projects, so that I can show them off.
86. As a maker, I want each Gallery tile to show the cover photo, title and hobby, so that it looks like a portfolio.
87. As a maker, I want a Completed Project with no photo to show its hobby icon, so that it still appears.
88. As a maker, I want tapping a Gallery tile to open the Project, so that I can show the details.

## Implementation Decisions

### Domain rules

- Language follows `GLOSSARY.md`: Idea, Project, Stage, Paused, Promote, Seed, Pattern, Pattern File, Pattern Option, Material Option, Gallery.
- Allowed Stage moves: Planning → In progress, In progress → Completed, Completed → In progress. Every other move, and any move into or out of Idea except Promote, is rejected with a `DataResult` error.
- Promote is only valid from Idea, requires a hobby, and moves to Planning.
- Pause/resume is only valid for In progress. Moving a Paused Project to Completed clears Paused.
- Entering Completed sets the completion date; leaving Completed clears it.
- Entering a list (Promote, Stage change, pause, resume, create) places the item at the bottom of that list's ranking.
- Nothing other than title (and hobby, for Projects) is ever required.

### Schema (next numbered script, plus RLS/storage updates as needed)

Ideas share the `projects` table (ADR-0001). Existing data is test data only, so old columns are dropped rather than migrated.

- `projects.status` check gains `idea`. New rows from quick capture use `idea`.
- New check: `status = 'idea' or hobby_type is not null`.
- `projects` gains:
  - `description text`
  - `seed_description text`: a frozen snapshot of the Idea's description taken at Promote
  - `promoted_at timestamptz`: null for Projects created directly
  - `completed_at timestamptz`
  - `paused_at timestamptz`: non-null means Paused
- `projects.plan_order` becomes the manual rank within the item's list. A list is Ideas, Planning, active In progress or Paused. Completed does not use manual rank.
- `project_photos.stage` check gains `idea`. Photos with stage `idea` are the Seed photos.
- New table `pattern_options`: id, project_id (cascade), url, photo_url, comment, is_selected, created_at, plus a partial unique index allowing at most one selected per project.
- New table `pattern_files`: id, project_id (cascade), file_url, name, content_type, created_at.
- Drop `projects.pattern_url` and `projects.pattern_file_url`.
- The `active_projects` view uses `select *` and must be recreated after the column changes. RLS policies for the new tables mirror `project_materials`.
- The Pattern is derived: the selected Pattern Option's link (if any) plus all Pattern Files. "Has a Pattern" means a selected option or at least one Pattern File.
- "From the Idea" for Pattern and Material Options is derived: created before `promoted_at`.

### Data layer (`lib/projects`, one function per file, injectable client, `DataResult` return)

- Types distinguish `Stage` (`planning | in_progress | completed`) from the row status, which also allows `idea`.
- New or changed functions (indicative names):
  - `insertIdea({ title, description?, hobby_type? })`
  - `getIdeas({ hobby?, sort })`
  - `promoteIdea(id, hobby)`
  - `changeStage(id, to)`
  - `pauseProject(id, note?)` and `resumeProject(id)`
  - `reorderList(orderedIds)`, which rewrites ranks for one list
  - `insertPatternOption` and `choosePatternOption(projectId, optionId | null)`
  - `uploadPatternFile` + `insertPatternFile`, and `deletePatternFile`
  - `updateMaterialOption` (chosen flag)
  - `deleteProject` (soft delete, also used for Ideas)
  - `updateProject` (title, hobby, description)
- `insertProject` takes title, hobby and Stage only.
- `getProjectsByStatus` gains a hobby filter and sort, excludes Ideas, and returns the active and Paused groups for In progress. Completed defaults to completion date, newest first.
- `getProjectById` returns:
  - description
  - Seed (seed photos + `seed_description`), present only when Promoted
  - Pattern Options with a from-Idea flag
  - the derived Pattern
  - Pattern Files
  - Material Options with chosen and from-Idea flags
  - photos, Notes, Paused state and completion date
- List items expose `hasPattern` from the derived Pattern, replacing the old column check.
- The lifecycle rules above are enforced inside these functions. There is no separate lifecycle module.

### UI

- Tabs: Home, Ideas, Projects. The Projects tab keeps its swipeable Stage pages; the Completed page renders as the Gallery grid.
- Home:
  - Nook logo, plus a settings icon opening a small settings screen with the theme toggle.
  - Four carousels in this order: In progress (active only), Up next, Ideas, Recently completed. Each has "See all".
  - Floating bottom-right quick-capture button.
  - The carousel set is a trial; expect changes after user feedback.
- Quick capture: a modal with title (required), photos (optional), description (optional). It saves straight to Ideas.
- Idea screen: editable title, hobby, description, photos, Pattern Options and Material Options, plus Promote and Delete actions.
- Promote sheet: hobby picker only, pre-filled from the Idea, and cannot submit without a hobby.
- Project screen: the same sections at every Stage, ordered by Stage (as in the user stories). The Seed box sits near the bottom. Stage actions: Start, Complete, Pause/Resume, Reopen (Completed → In progress).
- Stage prompts: Start offers Pattern and materials confirmation; Complete offers finished photos and a cover; Pause offers a note. All are skippable sheets.
- Ranking via drag to reorder on the Ideas, Planning, active In progress and Paused lists. Filter (hobby) and sort controls on every list.
- New Project form: title, hobby, Stage. The four-step wizard and its step components are removed.

## Testing Decisions

- Good tests exercise external behaviour through the highest seam: call the public data-layer function with an injected fake client and assert on the returned `DataResult` and the writes sent to the client. They do not test private helpers or the internal query-building order.
- **Primary seam: the `lib/projects` data-layer functions.** Cover:
  - Promote: hobby required; status becomes Planning; `promoted_at` and `seed_description` set; bottom rank.
  - Every allowed and disallowed Stage move, including completion date set and cleared.
  - Pause/resume validity, the pause note written as a Note, and Paused cleared on complete.
  - `choosePatternOption` select, switch and clear.
  - `reorderList` rank writes.
  - List queries: Ideas never in Stage lists, hobby filter, sorts, and the active/Paused grouping.
  - Detail mapping: the derived Pattern, from-Idea flags, Seed present only when Promoted.
- The shared mock client (`createMockProjectsClient`) needs extending for the new call shapes (delete, `in`, `not`, multi-row updates). Prior art: the existing `lib/projects/*.test.ts` files, e.g. the `updateProject` and `setPrimaryPhoto` tests.
- **Secondary seam: screen tests** with `@testing-library/react-native`, mocking `expo-router` and the auth context, used only for:
  - quick capture saving an Idea with only a title
  - the Promote sheet requiring a hobby

  Prior art: the login screen test.
- Carousels, Gallery grid, detail-screen ordering and drag-to-reorder are verified manually in the running app.

## Out of Scope

- iOS/Android share-sheet target ("Share → Nook").
- Public profiles, shareable web links, and community features (showing off to others, buying and selling patterns: the longer-term "modern Ravelry" vision).
- Sharing Gallery images to other apps via the native share sheet.
- Hiding Projects from the Gallery.
- Tags, seasons, deadlines or gift dates.
- A "parked" pile for Ideas (ranking plus delete covers it).
- Migrating existing data (test data only).

## Further Notes

- Suggested build order, each step usable on its own:
  1. Schema and data layer
  2. Ideas tab and quick capture
  3. Editable Project screen
  4. Promote and the Seed
  5. Stage changes, Pause and prompts
  6. Ranking, filters and sorts
  7. Home redesign
  8. Gallery grid
  9. Wizard removal
- The Seed description is a snapshot (`seed_description`) so the Seed shows how the Idea started even after the Project's description is edited. This was inferred from "everything carries over and is boxed as initial ideas" combined with an editable Project description; revisit if it feels redundant in use.
- CLAUDE.md still says Expo SDK 57; AGENTS.md now points at SDK 58 docs. Read the v58 docs before implementing.
