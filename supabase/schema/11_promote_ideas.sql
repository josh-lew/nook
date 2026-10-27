-- Promoting an Idea makes it a Project in Planning (docs/adr/0001).
-- promoted_at is null for Projects created directly; options created before it are "from the Idea".
-- seed_description freezes the Idea's description, so the Seed survives later edits to the Project's.
-- Photos with stage 'idea' are an Idea's photos, and become the Seed's once Promoted.
-- The active_projects view uses `select *`, so drop it before altering columns and recreate it after.
begin;

drop view if exists active_projects;

alter table projects
  add column promoted_at timestamptz,
  add column seed_description text;

alter table project_photos
  drop constraint if exists project_photos_stage_check;

alter table project_photos
  add constraint project_photos_stage_check
  check (stage in ('idea', 'planning', 'in_progress', 'completed'));

-- Stamp promoted_at with the database clock, the same clock that sets options' created_at,
-- so "created before promoted_at" doesn't depend on the device's clock.
create or replace function stamp_promoted_at()
returns trigger as $$
begin
  if old.status = 'idea' and new.status <> 'idea' then
    new.promoted_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger projects_stamp_promoted_at
  before update of status on projects
  for each row execute function stamp_promoted_at();

create view active_projects as
  select * from projects where deleted_at is null;

commit;
