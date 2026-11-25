alter table public.candidates drop constraint candidates_source_check;

alter table public.candidates add constraint candidates_source_check
  check (source in ('LinkedIn Application', 'LinkedIn Outreach', 'Direct', 'Referral', 'Job Board', 'Website', 'Other'));