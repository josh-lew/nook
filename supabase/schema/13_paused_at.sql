-- Paused: an In progress Project the maker has put down for now (see GLOSSARY.md).
-- Paused is not a Stage, so it is a nullable date beside status rather than a status value.
-- A trigger stamps it on the database clock (as with completed_at in 12_completed_at.sql):
-- the app sends any non-null value to pause and null to resume.
-- Only In progress Projects can be Paused; changeStage clears it on every move.
-- The active_projects view uses `select *`, so drop it before altering columns and recreate it after.
begin;

drop view if exists active_projects;

alter table projects
  add column paused_at timestamptz;

alter table projects
  add constraint projects_paused_only_in_progress
  check (paused_at is null or status = 'in_progress');

create or replace function stamp_paused_at()
returns trigger as $$
begin
  if new.paused_at is not null and old.paused_at is null then
    new.paused_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger projects_stamp_paused_at
  before update of paused_at on projects
  for each row execute function stamp_paused_at();

create view active_projects as
  select * from projects where deleted_at is null;

commit;
