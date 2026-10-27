-- A Pattern can hold several files (the purchased PDF, a chart, a size guide).
-- Files upload to the existing private "pattern-files" bucket under
-- {user_id}/{project_id}/..., so the storage policies in 04 already cover them.
-- Expand step: projects.pattern_file_url stays until it is dropped in a later script.
begin;

create table pattern_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  file_url text not null,
  name text not null,
  content_type text not null,
  created_at timestamptz default now()
);

alter table pattern_files enable row level security;

-- Access governed by the parent project's ownership, as for project_materials
create policy "Users can view own pattern files"
  on pattern_files for select
  using (
    exists (
      select 1 from projects
      where projects.id = pattern_files.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own pattern files"
  on pattern_files for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = pattern_files.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own pattern files"
  on pattern_files for update
  using (
    exists (
      select 1 from projects
      where projects.id = pattern_files.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own pattern files"
  on pattern_files for delete
  using (
    exists (
      select 1 from projects
      where projects.id = pattern_files.project_id
      and projects.user_id = auth.uid()
    )
  );

commit;
