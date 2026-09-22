-- Add is_primary flag to project_photos
alter table project_photos
  add column is_primary boolean not null default false;

-- Enforce at most one primary photo per project at the database level
create unique index one_primary_photo_per_project
  on project_photos (project_id)
  where is_primary = true;
