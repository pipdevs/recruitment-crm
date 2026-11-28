-- Single timeline: notes, system events and (next) emails in one table, with real links.
--
-- Why: an email thread like "CV – X – FOR DWF" belongs to a company AND a candidate's
-- application; polymorphic entity_type/entity_id holds one record and has no FK, so
-- deleting a record orphans its notes and activities.
--
-- Data: notes move into activities as activity_type 'note'. 7 test rows are dropped:
-- 6 point at records deleted earlier (3 activities, 3 company notes) — a real FK cannot
-- hold them — and 1 note has no organisation_id, so RLS has never shown it to anyone.
-- The legacy 'note_added' type goes with them (its only row is one of the six;
-- activitiesService.createNote has no callers). 9 notes and 11 activities remain.

-- 1. Links and email fields
alter table public.activities
  add column candidate_id       uuid references public.candidates(id)       on delete cascade,
  add column company_id         uuid references public.companies(id)        on delete cascade,
  add column job_id             uuid references public.jobs(id)             on delete cascade,
  add column job_application_id uuid references public.job_applications(id) on delete cascade,
  add column contact_id         uuid references public.contacts(id)         on delete set null,  -- correspondence stays with the company
  add column occurred_at        timestamptz,   -- when it happened (imported mail), not when the row was written
  add column external_id        text,          -- internetMessageId
  add column thread_id          text;          -- conversationId

-- 2. Backfill existing activities from entity_type/entity_id (only where the record still exists)
update public.activities a set candidate_id = a.entity_id
  where a.entity_type = 'candidate' and exists (select 1 from public.candidates x where x.id = a.entity_id);
update public.activities a set company_id = a.entity_id
  where a.entity_type = 'company' and exists (select 1 from public.companies x where x.id = a.entity_id);
update public.activities a set job_id = a.entity_id
  where a.entity_type = 'job' and exists (select 1 from public.jobs x where x.id = a.entity_id);

-- 3. Notes become activities
insert into public.activities (organisation_id, activity_type, message, author, created_at, occurred_at,
                               entity_type, entity_id, candidate_id, company_id, job_id)
select n.organisation_id, 'note', n.content, n.created_by, n.created_at, n.created_at,
       n.entity_type, n.entity_id,
       case when n.entity_type = 'candidate' and exists (select 1 from public.candidates x where x.id = n.entity_id) then n.entity_id end,
       case when n.entity_type = 'company'   and exists (select 1 from public.companies  x where x.id = n.entity_id) then n.entity_id end,
       case when n.entity_type = 'job'       and exists (select 1 from public.jobs       x where x.id = n.entity_id) then n.entity_id end
from public.notes n
where n.organisation_id is not null;

-- 4. Drop rows whose record no longer exists
delete from public.activities
  where candidate_id is null and company_id is null and job_id is null;

-- 5. Settle the new columns
update public.activities set occurred_at = created_at where occurred_at is null;
alter table public.activities
  alter column occurred_at set default now(),
  alter column occurred_at set not null,
  alter column created_at set not null,
  alter column organisation_id set not null,
  add constraint activities_has_link
    check (num_nonnulls(candidate_id, company_id, job_id, job_application_id, contact_id) >= 1),
  add constraint activities_type_check
    check (activity_type in ('note', 'email', 'status_changed', 'stage_moved', 'task_completed', 'task_updated'));

drop index if exists public.idx_activities_entity;
alter table public.activities drop column entity_type, drop column entity_id;

create index activities_candidate_idx       on public.activities (candidate_id)       where candidate_id is not null;
create index activities_company_idx         on public.activities (company_id)         where company_id is not null;
create index activities_job_idx             on public.activities (job_id)             where job_id is not null;
create index activities_job_application_idx on public.activities (job_application_id) where job_application_id is not null;
create index activities_contact_idx         on public.activities (contact_id)         where contact_id is not null;
create index activities_org_occurred_idx    on public.activities (organisation_id, occurred_at desc);
create unique index activities_external_id_key on public.activities (organisation_id, external_id) where external_id is not null;

-- 6. Policies: the log is append-only; only notes can be deleted (notes are never edited in the app)
create policy "Org members can delete notes"
  on public.activities for delete to authenticated
  using (organisation_id = get_user_organisation_id() and activity_type = 'note');

-- 7. notes is replaced
drop table public.notes;