-- Turn on RLS for every table (off by default = fully open, which we don't want)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_materials enable row level security;
alter table project_notes enable row level security;
alter table project_photos enable row level security;

-- PROFILES: users can read/update only their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Note: insert is handled by the trigger (runs as security definer), no insert policy needed for normal users

-- PROJECTS: users can do anything, but only to their own projects
create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- PROJECT_MATERIALS: access governed by the parent project's ownership
create policy "Users can view own project materials"
  on project_materials for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_materials.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own project materials"
  on project_materials for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_materials.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own project materials"
  on project_materials for update
  using (
    exists (
      select 1 from projects
      where projects.id = project_materials.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own project materials"
  on project_materials for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_materials.project_id
      and projects.user_id = auth.uid()
    )
  );

-- PROJECT_NOTES: same pattern
create policy "Users can view own project notes"
  on project_notes for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own project notes"
  on project_notes for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own project notes"
  on project_notes for update
  using (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own project notes"
  on project_notes for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

-- PROJECT_PHOTOS: same pattern
create policy "Users can view own project photos"
  on project_photos for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_photos.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own project photos"
  on project_photos for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_photos.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own project photos"
  on project_photos for update
  using (
    exists (
      select 1 from projects
      where projects.id = project_photos.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own project photos"
  on project_photos for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_photos.project_id
      and projects.user_id = auth.uid()
    )
  );
