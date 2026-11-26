-- Phase B: jobs and companies carry what an agency actually works with.

-- ── Jobs ────────────────────────────────────────────────────
-- Every job belongs to a client; status always has a value.
alter table public.jobs
  alter column company_id set not null,
  alter column status set default 'Open',
  alter column status set not null;

-- The client contact the recruiter deals with for this job.
alter table public.jobs
  add column contact_id uuid references public.contacts(id) on delete set null;

-- Type, openings, and pay as numbers instead of free text. pay_period covers
-- contract day and hourly rates with the same two fields as a perm salary.
alter table public.jobs
  add column employment_type text not null default 'Permanent'
    check (employment_type in ('Permanent', 'Contract', 'Fixed Term')),
  add column openings integer not null default 1 check (openings > 0),
  add column salary_min integer check (salary_min >= 0),
  add column salary_max integer check (salary_max >= 0),
  add column salary_currency text check (salary_currency ~ '^[A-Z]{3}$'),  -- any ISO 4217 code
  add column pay_period text not null default 'Year' check (pay_period in ('Year', 'Day', 'Hour')),
  add constraint jobs_salary_range_order check (salary_min is null or salary_max is null or salary_min <= salary_max),
  add constraint jobs_salary_needs_currency check ((salary_min is null and salary_max is null) or salary_currency is not null);

-- No job uses the old free-text field (verified: 0 rows).
alter table public.jobs drop column salary_range;

-- ── Companies ───────────────────────────────────────────────
-- Prospect / Client / Past, the way Bullhorn's client status works.
alter table public.companies
  add column status text not null default 'Prospect'
    check (status in ('Prospect', 'Client', 'Past')),
  add column domain text,
  add column location text,
  add column linkedin_url text,
  -- Standard terms of business; pre-fills the fee on new placements.
  add column fee_percentage numeric(5,2) check (fee_percentage > 0 and fee_percentage <= 100);

-- One company per domain per organisation; the import and email timeline match on it.
create unique index companies_org_domain_uidx
  on public.companies (organisation_id, lower(domain))
  where domain is not null;

-- Notes live in one place. Move the record-level notes text into the Notes tab, then drop it.
insert into public.notes (entity_type, entity_id, content, created_by, organisation_id, created_at)
select
  'company',
  c.id,
  c.notes,
  (select p.id from public.profiles p where p.id = c.created_by),
  c.organisation_id,
  coalesce(c.updated_at, c.created_at, now())
from public.companies c
where coalesce(trim(c.notes), '') <> '';

alter table public.companies drop column notes;

-- ── Contacts ────────────────────────────────────────────────
-- At most one primary contact per company (needed before the companies import).
create unique index contacts_one_primary_per_company
  on public.contacts (company_id)
  where is_primary;