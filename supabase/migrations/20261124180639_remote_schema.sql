drop policy "Authenticated users can create activities" on "public"."activities";

drop policy "Authenticated users can view activities" on "public"."activities";

drop policy "Anyone can read invite by token" on "public"."invites";

drop policy "Admins can update all tasks" on "public"."tasks";

drop policy "Authenticated users can create tasks" on "public"."tasks";

drop policy "Users can delete tasks they created" on "public"."tasks";

drop policy "Users can update tasks they created or are assigned to" on "public"."tasks";

drop policy "Users can view assigned tasks" on "public"."tasks";

alter table "public"."contacts" alter column "company_id" set not null;

CREATE UNIQUE INDEX contacts_org_email_uidx ON public.contacts USING btree (organisation_id, lower(email)) WHERE (email IS NOT NULL);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_invite(invite_token uuid)
 RETURNS TABLE(id uuid, organisation_id uuid, email text, role text, expires_at timestamp with time zone, organisation_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select i.id, i.organisation_id, i.email, i.role, i.expires_at, o.name
  from invites i join organisations o on o.id = i.organisation_id
  where i.token = invite_token and not i.accepted
$function$
;


