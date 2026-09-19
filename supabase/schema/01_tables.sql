-- Enable UUID generation (Supabase usually has this on by default, safe to run anyway)
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  hobbies text[],
  created_at timestamptz default now()
);

-- PROJECTS
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  hobby_type text check (hobby_type in ('crochet', 'knit', 'sewing')),
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'completed')),
  pattern_file_url text,
  plan_order int,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- PROJECT MATERIALS
create table project_materials (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text,
  url text,
  photo_url text,
  comment text,
  is_selected boolean default false,
  created_at timestamptz default now()
);

-- PROJECT NOTES
create table project_notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  stage text not null check (stage in ('planning', 'in_progress', 'completed')),
  content text not null,
  created_at timestamptz default now()
);

-- PROJECT PHOTOS
create table project_photos (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  stage text not null check (stage in ('planning', 'in_progress', 'completed')),
  image_url text not null,
  photo_type text check (photo_type in ('inspiration', 'material', 'progress', 'finished')),
  created_at timestamptz default now()
);

-- Helpful view for "active" (non-deleted) projects, so you don't repeat the filter everywhere
create view active_projects as
  select * from projects where deleted_at is null;
