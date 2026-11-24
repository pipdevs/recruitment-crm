drop policy "Anyone can read organisation name for invite" on "public"."organisations";

drop policy "Authenticated users can insert organisations" on "public"."organisations";

drop policy "Users can view all profiles" on "public"."profiles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select organisation_id from public.profiles where id = auth.uid()
$function$
;


