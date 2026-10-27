-- The date a Project entered Completed, so the Gallery can show the most recent work first.
-- A trigger keeps it on the database clock (as with promoted_at in 11_promote_ideas.sql):
-- entering Completed stamps it, by a Stage change or by being created as Completed,
-- and leaving Completed clears it, so a Project completed again gets its new date.
-- The active_projects view uses `select *`, so drop it before altering columns and recreate it after.
begin;

drop view if exists active_projects;

alter table projects
  add column completed_at timestamptz;

-- Existing data is test data; give Completed rows a date so the Gallery can order them
update projects
  set completed_at = created_at
  where status = 'completed';

create or replace function stamp_completed_at()
returns trigger as $$
begin
  if new.status = 'completed' then
    if tg_op = 'INSERT' or old.status <> 'completed' then
      new.completed_at := now();
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger projects_stamp_completed_at
  before insert or update of status on projects
  for each row execute function stamp_completed_at();

create view active_projects as
  select * from projects where deleted_at is null;

commit;
