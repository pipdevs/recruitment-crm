-- One row per CV file. A candidate can have several.
create table public.candidate_documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  byte_size integer not null,
  sha256 text not null,
  content_text text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (candidate_id, sha256)
);

create index candidate_documents_candidate_id_idx on public.candidate_documents (candidate_id);

alter table public.candidate_documents enable row level security;

create policy "Org members can read candidate documents" on public.candidate_documents
  for select to authenticated
  using ((organisation_id IS NOT NULL) AND (organisation_id = get_user_organisation_id()));

create policy "Org members can insert candidate documents" on public.candidate_documents
  for insert to authenticated
  with check ((organisation_id IS NOT NULL) AND (organisation_id = get_user_organisation_id()));

create policy "Org members can delete candidate documents" on public.candidate_documents
  for delete to authenticated
  using ((organisation_id IS NOT NULL) AND (organisation_id = get_user_organisation_id()));

-- Private bucket for CV files: PDF and Word only, 10 MB cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 10485760, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
]);

-- Files live at {organisation_id}/{candidate_id}/{file}; the first folder must be your org.
create policy "Org members can read resumes" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = get_user_organisation_id()::text);

create policy "Org members can upload resumes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = get_user_organisation_id()::text);

create policy "Org members can delete resumes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = get_user_organisation_id()::text);