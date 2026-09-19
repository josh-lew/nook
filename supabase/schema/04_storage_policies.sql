-- First, in the Supabase dashboard: Storage -> New Bucket
-- Create two buckets: "project-photos" and "pattern-files"
-- Set both to "Private" (not public) so these policies are what governs access.

-- Recommended convention: store files under a path like {user_id}/{project_id}/{filename}
-- so the policies below can check the folder name against auth.uid()

-- PROJECT PHOTOS bucket policies
create policy "Users can view own photos"
  on storage.objects for select
  using (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- PATTERN FILES bucket policies (same pattern)
create policy "Users can view own pattern files"
  on storage.objects for select
  using (
    bucket_id = 'pattern-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload own pattern files"
  on storage.objects for insert
  with check (
    bucket_id = 'pattern-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own pattern files"
  on storage.objects for delete
  using (
    bucket_id = 'pattern-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
