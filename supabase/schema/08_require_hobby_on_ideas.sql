-- Ideas now need a hobby too, so every projects row has one.
-- Fails (and rolls back) if any row still has no hobby: set one or delete those rows first.
begin;

alter table projects
  drop constraint if exists projects_hobby_required_unless_idea;

alter table projects
  alter column hobby_type set not null;

commit;
