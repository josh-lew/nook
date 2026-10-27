-- Pattern Options: candidate patterns (a link and/or screenshot, with an optional comment)
-- saved on an Idea or a Project. Choosing one on a Project makes it the Pattern.
-- Expand step: projects.pattern_url and pattern_file_url stay until they are dropped later.
begin;

create table pattern_options (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  url text,
  photo_url text,
  comment text,
  is_selected boolean not null default false,
  created_at timestamptz default now(),
  constraint pattern_options_link_or_photo
    check (url is not null or photo_url is not null)
);

-- A Project has at most one Pattern
create unique index pattern_options_one_selected_per_project
  on pattern_options (project_id)
  where is_selected;

alter table pattern_options enable row level security;

-- Access governed by the parent project's ownership, as for project_materials
create policy "Users can view own pattern options"
  on pattern_options for select
  using (
    exists (
      select 1 from projects
      where projects.id = pattern_options.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own pattern options"
  on pattern_options for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = pattern_options.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own pattern options"
  on pattern_options for update
  using (
    exists (
      select 1 from projects
      where projects.id = pattern_options.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own pattern options"
  on pattern_options for delete
  using (
    exists (
      select 1 from projects
      where projects.id = pattern_options.project_id
      and projects.user_id = auth.uid()
    )
  );

commit;
