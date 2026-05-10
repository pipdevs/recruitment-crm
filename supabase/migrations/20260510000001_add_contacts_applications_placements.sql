-- ============================================================
-- CONTACTS
-- ============================================================
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  full_name text not null,
  job_title text,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.contacts enable row level security;

create policy "Authenticated users can read contacts"
  on public.contacts for select
  to authenticated using (true);

create policy "Authenticated users can insert contacts"
  on public.contacts for insert
  to authenticated with check (auth.uid() = created_by);

create policy "Authenticated users can update contacts"
  on public.contacts for update
  to authenticated using (true);

create policy "Admins can delete contacts"
  on public.contacts for delete
  to authenticated using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'Admin'
    )
  );

create index contacts_company_id_idx on public.contacts(company_id);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  stage text not null default 'Applied'
    check (stage in ('Applied', 'Screening', 'Interview', 'Offer', 'Placed', 'Rejected')),
  notes text,
  applied_at timestamptz default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (candidate_id, job_id)
);

alter table public.job_applications enable row level security;

create policy "Authenticated users can read job applications"
  on public.job_applications for select
  to authenticated using (true);

create policy "Authenticated users can insert job applications"
  on public.job_applications for insert
  to authenticated with check (auth.uid() = created_by);

create policy "Authenticated users can update job applications"
  on public.job_applications for update
  to authenticated using (true);

create policy "Admins can delete job applications"
  on public.job_applications for delete
  to authenticated using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'Admin'
    )
  );

create index job_applications_candidate_id_idx on public.job_applications(candidate_id);
create index job_applications_job_id_idx on public.job_applications(job_id);

-- ============================================================
-- PLACEMENTS
-- ============================================================
create table public.placements (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid not null references public.job_applications(id) on delete restrict,
  candidate_id uuid not null references public.candidates(id) on delete restrict,
  job_id uuid not null references public.jobs(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  placement_date date not null,
  start_date date,
  salary numeric(12, 2),
  fee_amount numeric(12, 2),
  fee_percentage numeric(5, 2),
  fee_status text not null default 'Pending'
    check (fee_status in ('Pending', 'Invoiced', 'Paid')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.placements enable row level security;

create policy "Authenticated users can read placements"
  on public.placements for select
  to authenticated using (true);

create policy "Authenticated users can insert placements"
  on public.placements for insert
  to authenticated with check (auth.uid() = created_by);

create policy "Authenticated users can update placements"
  on public.placements for update
  to authenticated using (true);

create policy "Admins can delete placements"
  on public.placements for delete
  to authenticated using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'Admin'
    )
  );

create index placements_candidate_id_idx on public.placements(candidate_id);
create index placements_job_id_idx on public.placements(job_id);
create index placements_company_id_idx on public.placements(company_id);
create index placements_fee_status_idx on public.placements(fee_status);

-- ============================================================
-- AUTO-UPDATE updated_at triggers (matching existing convention)
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.handle_updated_at();

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.handle_updated_at();

create trigger placements_updated_at
  before update on public.placements
  for each row execute function public.handle_updated_at();