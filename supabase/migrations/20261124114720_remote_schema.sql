drop extension if exists "pg_net";

drop policy "Admins can delete candidates" on "public"."candidates";

drop policy "Admins can update all candidates" on "public"."candidates";

drop policy "Authenticated users can create candidates" on "public"."candidates";

drop policy "Authenticated users can view candidates" on "public"."candidates";

drop policy "Users can update candidates they created" on "public"."candidates";

drop policy "Admins can delete companies" on "public"."companies";

drop policy "Admins can update all companies" on "public"."companies";

drop policy "Authenticated users can create companies" on "public"."companies";

drop policy "Authenticated users can view companies" on "public"."companies";

drop policy "Users can update companies they created" on "public"."companies";

drop policy "Admins can delete contacts" on "public"."contacts";

drop policy "Authenticated users can insert contacts" on "public"."contacts";

drop policy "Authenticated users can read contacts" on "public"."contacts";

drop policy "Authenticated users can update contacts" on "public"."contacts";

drop policy "Admins can delete job applications" on "public"."job_applications";

drop policy "Authenticated users can insert job applications" on "public"."job_applications";

drop policy "Authenticated users can read job applications" on "public"."job_applications";

drop policy "Authenticated users can update job applications" on "public"."job_applications";

drop policy "Admins can delete jobs" on "public"."jobs";

drop policy "Admins can update all jobs" on "public"."jobs";

drop policy "Authenticated users can create jobs" on "public"."jobs";

drop policy "Authenticated users can view jobs" on "public"."jobs";

drop policy "Users can update jobs they created" on "public"."jobs";

drop policy "Authenticated users can create notes" on "public"."notes";

drop policy "Authenticated users can view notes" on "public"."notes";

drop policy "Users can delete their own notes" on "public"."notes";

drop policy "Users can update their own notes" on "public"."notes";

drop policy "Admins can delete placements" on "public"."placements";

drop policy "Authenticated users can insert placements" on "public"."placements";

drop policy "Authenticated users can read placements" on "public"."placements";

drop policy "Authenticated users can update placements" on "public"."placements";

drop policy "Users can update own profile" on "public"."profiles";

alter table "public"."companies" drop constraint "companies_created_by_fkey";


  create table "public"."invites" (
    "id" uuid not null default gen_random_uuid(),
    "organisation_id" uuid not null,
    "email" text not null,
    "role" text not null default 'Recruiter'::text,
    "token" uuid not null default gen_random_uuid(),
    "accepted" boolean not null default false,
    "invited_by" uuid,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone default (now() + '7 days'::interval)
      );


alter table "public"."invites" enable row level security;


  create table "public"."organisations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "plan" text not null default 'free'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "stripe_price_id" text,
    "billing_period_end" timestamp with time zone
      );


alter table "public"."organisations" enable row level security;

alter table "public"."activities" add column "organisation_id" uuid;

alter table "public"."candidates" add column "assigned_to" uuid;

alter table "public"."candidates" add column "organisation_id" uuid;

alter table "public"."companies" add column "assigned_to" uuid;

alter table "public"."companies" add column "organisation_id" uuid;

alter table "public"."companies" alter column "created_by" set default auth.uid();

alter table "public"."companies" alter column "created_by" set not null;

alter table "public"."contacts" add column "organisation_id" uuid;

alter table "public"."job_applications" add column "organisation_id" uuid;

alter table "public"."jobs" add column "assigned_to" uuid;

alter table "public"."jobs" add column "organisation_id" uuid;

alter table "public"."notes" add column "assigned_to" uuid;

alter table "public"."notes" add column "organisation_id" uuid;

alter table "public"."placements" add column "organisation_id" uuid;

alter table "public"."profiles" add column "onboarding_completed" boolean not null default false;

alter table "public"."profiles" add column "organisation_id" uuid;

alter table "public"."tasks" add column "organisation_id" uuid;

CREATE INDEX activities_organisation_id_idx ON public.activities USING btree (organisation_id);

CREATE INDEX candidates_organisation_id_idx ON public.candidates USING btree (organisation_id);

CREATE UNIQUE INDEX companies_name_org_unique ON public.companies USING btree (lower(TRIM(BOTH FROM name)), organisation_id);

CREATE INDEX companies_organisation_id_idx ON public.companies USING btree (organisation_id);

CREATE INDEX contacts_organisation_id_idx ON public.contacts USING btree (organisation_id);

CREATE INDEX idx_candidates_assigned_to ON public.candidates USING btree (assigned_to);

CREATE INDEX idx_companies_assigned_to ON public.companies USING btree (assigned_to);

CREATE INDEX idx_jobs_assigned_to ON public.jobs USING btree (assigned_to);

CREATE INDEX idx_notes_assigned_to ON public.notes USING btree (assigned_to);

CREATE UNIQUE INDEX invites_organisation_id_email_key ON public.invites USING btree (organisation_id, email);

CREATE INDEX invites_organisation_id_idx ON public.invites USING btree (organisation_id);

CREATE UNIQUE INDEX invites_pkey ON public.invites USING btree (id);

CREATE INDEX invites_token_idx ON public.invites USING btree (token);

CREATE INDEX job_applications_organisation_id_idx ON public.job_applications USING btree (organisation_id);

CREATE INDEX jobs_organisation_id_idx ON public.jobs USING btree (organisation_id);

CREATE INDEX notes_organisation_id_idx ON public.notes USING btree (organisation_id);

CREATE UNIQUE INDEX organisations_pkey ON public.organisations USING btree (id);

CREATE INDEX organisations_stripe_customer_id_idx ON public.organisations USING btree (stripe_customer_id);

CREATE INDEX placements_organisation_id_idx ON public.placements USING btree (organisation_id);

CREATE INDEX profiles_organisation_id_idx ON public.profiles USING btree (organisation_id);

CREATE INDEX tasks_organisation_id_idx ON public.tasks USING btree (organisation_id);

alter table "public"."invites" add constraint "invites_pkey" PRIMARY KEY using index "invites_pkey";

alter table "public"."organisations" add constraint "organisations_pkey" PRIMARY KEY using index "organisations_pkey";

alter table "public"."activities" add constraint "activities_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."activities" validate constraint "activities_organisation_id_fkey";

alter table "public"."candidates" add constraint "candidates_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."candidates" validate constraint "candidates_assigned_to_fkey";

alter table "public"."candidates" add constraint "candidates_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."candidates" validate constraint "candidates_organisation_id_fkey";

alter table "public"."companies" add constraint "companies_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."companies" validate constraint "companies_assigned_to_fkey";

alter table "public"."companies" add constraint "companies_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."companies" validate constraint "companies_organisation_id_fkey";

alter table "public"."contacts" add constraint "contacts_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."contacts" validate constraint "contacts_organisation_id_fkey";

alter table "public"."invites" add constraint "invites_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."invites" validate constraint "invites_invited_by_fkey";

alter table "public"."invites" add constraint "invites_organisation_id_email_key" UNIQUE using index "invites_organisation_id_email_key";

alter table "public"."invites" add constraint "invites_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."invites" validate constraint "invites_organisation_id_fkey";

alter table "public"."invites" add constraint "invites_role_check" CHECK ((role = ANY (ARRAY['Admin'::text, 'Manager'::text, 'Recruiter'::text]))) not valid;

alter table "public"."invites" validate constraint "invites_role_check";

alter table "public"."job_applications" add constraint "job_applications_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."job_applications" validate constraint "job_applications_organisation_id_fkey";

alter table "public"."jobs" add constraint "jobs_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."jobs" validate constraint "jobs_assigned_to_fkey";

alter table "public"."jobs" add constraint "jobs_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."jobs" validate constraint "jobs_organisation_id_fkey";

alter table "public"."notes" add constraint "notes_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."notes" validate constraint "notes_assigned_to_fkey";

alter table "public"."notes" add constraint "notes_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_organisation_id_fkey";

alter table "public"."organisations" add constraint "organisations_plan_check" CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'growth'::text]))) not valid;

alter table "public"."organisations" validate constraint "organisations_plan_check";

alter table "public"."placements" add constraint "placements_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."placements" validate constraint "placements_organisation_id_fkey";

alter table "public"."profiles" add constraint "profiles_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "profiles_organisation_id_fkey";

alter table "public"."tasks" add constraint "tasks_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_organisation_id_fkey";

alter table "public"."companies" add constraint "companies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."companies" validate constraint "companies_created_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select organisation_id from public.profiles where id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  new_org_id uuid;
begin
  -- Create organisation
  insert into public.organisations (name, plan)
  values (
    coalesce(new.raw_user_meta_data->>'org_name', 'My Organisation'),
    'free'
  )
  returning id into new_org_id;

  -- Create profile
  insert into public.profiles (id, full_name, role, organisation_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    'Admin',
    new_org_id
  );

  return new;
end;
$function$
;

grant delete on table "public"."invites" to "anon";

grant insert on table "public"."invites" to "anon";

grant references on table "public"."invites" to "anon";

grant select on table "public"."invites" to "anon";

grant trigger on table "public"."invites" to "anon";

grant truncate on table "public"."invites" to "anon";

grant update on table "public"."invites" to "anon";

grant delete on table "public"."invites" to "authenticated";

grant insert on table "public"."invites" to "authenticated";

grant references on table "public"."invites" to "authenticated";

grant select on table "public"."invites" to "authenticated";

grant trigger on table "public"."invites" to "authenticated";

grant truncate on table "public"."invites" to "authenticated";

grant update on table "public"."invites" to "authenticated";

grant delete on table "public"."invites" to "service_role";

grant insert on table "public"."invites" to "service_role";

grant references on table "public"."invites" to "service_role";

grant select on table "public"."invites" to "service_role";

grant trigger on table "public"."invites" to "service_role";

grant truncate on table "public"."invites" to "service_role";

grant update on table "public"."invites" to "service_role";

grant delete on table "public"."organisations" to "anon";

grant insert on table "public"."organisations" to "anon";

grant references on table "public"."organisations" to "anon";

grant select on table "public"."organisations" to "anon";

grant trigger on table "public"."organisations" to "anon";

grant truncate on table "public"."organisations" to "anon";

grant update on table "public"."organisations" to "anon";

grant delete on table "public"."organisations" to "authenticated";

grant insert on table "public"."organisations" to "authenticated";

grant references on table "public"."organisations" to "authenticated";

grant select on table "public"."organisations" to "authenticated";

grant trigger on table "public"."organisations" to "authenticated";

grant truncate on table "public"."organisations" to "authenticated";

grant update on table "public"."organisations" to "authenticated";

grant delete on table "public"."organisations" to "service_role";

grant insert on table "public"."organisations" to "service_role";

grant references on table "public"."organisations" to "service_role";

grant select on table "public"."organisations" to "service_role";

grant trigger on table "public"."organisations" to "service_role";

grant truncate on table "public"."organisations" to "service_role";

grant update on table "public"."organisations" to "service_role";


  create policy "Org members can insert activities"
  on "public"."activities"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read activities"
  on "public"."activities"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can delete candidates"
  on "public"."candidates"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert candidates"
  on "public"."candidates"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read candidates"
  on "public"."candidates"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update candidates"
  on "public"."candidates"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can delete companies"
  on "public"."companies"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert companies"
  on "public"."companies"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read companies"
  on "public"."companies"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update companies"
  on "public"."companies"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can delete contacts"
  on "public"."contacts"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert contacts"
  on "public"."contacts"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read contacts"
  on "public"."contacts"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update contacts"
  on "public"."contacts"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Anyone can read invite by token"
  on "public"."invites"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Org admins can manage invites"
  on "public"."invites"
  as permissive
  for all
  to authenticated
using (((organisation_id = public.get_user_organisation_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'Admin'::text)));



  create policy "Org members can delete job applications"
  on "public"."job_applications"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert job applications"
  on "public"."job_applications"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read job applications"
  on "public"."job_applications"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update job applications"
  on "public"."job_applications"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can delete jobs"
  on "public"."jobs"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert jobs"
  on "public"."jobs"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read jobs"
  on "public"."jobs"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update jobs"
  on "public"."jobs"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can delete notes"
  on "public"."notes"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert notes"
  on "public"."notes"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read notes"
  on "public"."notes"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update notes"
  on "public"."notes"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Admins can update their organisation"
  on "public"."organisations"
  as permissive
  for update
  to authenticated
using (((id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'Admin'::text)));



  create policy "Anyone can read organisation name for invite"
  on "public"."organisations"
  as permissive
  for select
  to anon
using (true);



  create policy "Authenticated users can insert organisations"
  on "public"."organisations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Users can read their own organisation"
  on "public"."organisations"
  as permissive
  for select
  to authenticated
using ((id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));



  create policy "Org members can delete placements"
  on "public"."placements"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert placements"
  on "public"."placements"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read placements"
  on "public"."placements"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update placements"
  on "public"."placements"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((id = auth.uid()));



  create policy "Users can read profiles in their organisation"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((organisation_id = public.get_user_organisation_id()));



  create policy "Org members can delete tasks"
  on "public"."tasks"
  as permissive
  for delete
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can insert tasks"
  on "public"."tasks"
  as permissive
  for insert
  to authenticated
with check (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can read tasks"
  on "public"."tasks"
  as permissive
  for select
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Org members can update tasks"
  on "public"."tasks"
  as permissive
  for update
  to authenticated
using (((organisation_id IS NOT NULL) AND (organisation_id = public.get_user_organisation_id())));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((id = auth.uid()));


CREATE TRIGGER organisations_updated_at BEFORE UPDATE ON public.organisations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


