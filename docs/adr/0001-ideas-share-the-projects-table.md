# Ideas share the projects table

Ideas and Projects are distinct in the domain (see `GLOSSARY.md`), but we store an Idea as a row in `projects` with an `idea` status rather than in a separate `ideas` table. Promoting an Idea is then a status change: its photos, Pattern Options and Material Options are already attached to the row, so nothing is copied and the Seed is the content that predates Promotion. The cost is that every Project query must exclude Ideas (and vice versa), and "Stage" in the domain no longer maps one-to-one onto the `status` column, which also holds the non-Stage value `idea`.

## Considered options

- **Separate `ideas` table**: cleaner separation, but Promotion becomes a multi-table copy (photos, options, storage paths under `{user_id}/{project_id}/`), and child tables would need to reference either parent.
