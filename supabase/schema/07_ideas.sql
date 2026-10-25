-- Ideas share the projects table (docs/adr/0001): an Idea is a row with status 'idea'.
-- The active_projects view uses `select *`, so drop it before altering columns and recreate it after.
begin;

drop view if exists active_projects;

alter table projects
  drop constraint if exists projects_status_check;

alter table projects
  add constraint projects_status_check
  check (status in ('idea', 'planning', 'in_progress', 'completed'));

-- Only an Idea may leave the hobby blank
alter table projects
  add constraint projects_hobby_required_unless_idea
  check (status = 'idea' or hobby_type is not null);

alter table projects
  add column description text;

create view active_projects as
  select * from projects where deleted_at is null;

commit;
