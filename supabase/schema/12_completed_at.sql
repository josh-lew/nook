-- The date a Project entered Completed. Set by changeStage on entering Completed and
-- cleared on leaving it, so a Project completed again gets its new date.
-- The active_projects view uses `select *`, so drop it before altering columns and recreate it after.
begin;

drop view if exists active_projects;

alter table projects
  add column completed_at timestamptz;

create view active_projects as
  select * from projects where deleted_at is null;

commit;
