-- Allow a pattern to be saved as a link before (or alongside) an uploaded file
alter table projects
  add column pattern_url text;
