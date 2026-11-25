alter table public.candidates
  add column source text
  check (source in ('linkedin_applicant', 'linkedin_message', 'direct'));

create trigger candidates_updated_at before update on public.candidates
  for each row execute function public.handle_updated_at();

create trigger companies_updated_at before update on public.companies
  for each row execute function public.handle_updated_at();

create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();

create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();