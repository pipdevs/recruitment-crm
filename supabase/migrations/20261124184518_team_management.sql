-- Role changes, removal and leaving move into SECURITY DEFINER RPCs so they can
-- enforce Admin-only, same-organisation and last-Admin rules. The Team page role
-- dropdown never worked: there is no admin UPDATE policy on profiles, so it
-- matched zero rows and .single() threw.
--
-- Client UPDATE on profiles is then narrowed to the two columns a user may change
-- about themselves. That closes the escalation path where the "Users can update
-- own profile" policy (USING id = auth.uid(), WITH CHECK inheriting it) let any
-- user set their own role to Admin or move their profile into another tenant.

create or replace function public.set_member_role(p_member_id uuid, p_role text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_actor_org uuid; v_actor_role text;
  v_target_org uuid; v_target_role text; v_admins int;
begin
  select organisation_id, role into v_actor_org, v_actor_role
    from profiles where id = auth.uid();
  if v_actor_org is null then raise exception 'Not signed in'; end if;
  if v_actor_role <> 'Admin' then raise exception 'Only Admins can change roles'; end if;
  if p_role not in ('Admin','Manager','Recruiter') then
    raise exception 'Unknown role: %', p_role;
  end if;

  select organisation_id, role into v_target_org, v_target_role
    from profiles where id = p_member_id;
  if v_target_org is null or v_target_org <> v_actor_org then
    raise exception 'That person is not in your organisation';
  end if;

  if v_target_role = 'Admin' and p_role <> 'Admin' then
    select count(*) into v_admins
      from profiles where organisation_id = v_actor_org and role = 'Admin';
    if v_admins <= 1 then
      raise exception 'Your organisation must keep at least one Admin';
    end if;
  end if;

  update profiles set role = p_role where id = p_member_id;
end; $$;

create or replace function public.remove_member(p_member_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_actor_org uuid; v_actor_role text; v_target_org uuid;
begin
  select organisation_id, role into v_actor_org, v_actor_role
    from profiles where id = auth.uid();
  if v_actor_org is null then raise exception 'Not signed in'; end if;
  if v_actor_role <> 'Admin' then raise exception 'Only Admins can remove members'; end if;
  if p_member_id = auth.uid() then
    raise exception 'Use Leave organisation to remove your own account';
  end if;

  select organisation_id into v_target_org from profiles where id = p_member_id;
  if v_target_org is null or v_target_org <> v_actor_org then
    raise exception 'That person is not in your organisation';
  end if;

  -- profiles.id cascades from auth.users; all 14 FKs into profiles are
  -- ON DELETE SET NULL, so their records survive and become unassigned.
  delete from auth.users where id = p_member_id;
end; $$;

create or replace function public.leave_organisation()
returns void language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_role text; v_admins int;
begin
  select organisation_id, role into v_org, v_role from profiles where id = auth.uid();
  if v_org is null then raise exception 'Not signed in'; end if;
  if v_role = 'Admin' then
    select count(*) into v_admins
      from profiles where organisation_id = v_org and role = 'Admin';
    if v_admins <= 1 then
      raise exception 'You are the only Admin. Promote another member before leaving.';
    end if;
  end if;
  delete from auth.users where id = auth.uid();
end; $$;

revoke update on public.profiles from anon, authenticated;
grant update (full_name, onboarding_completed) on public.profiles to authenticated;

revoke execute on function public.set_member_role(uuid,text) from anon;
revoke execute on function public.remove_member(uuid) from anon;
revoke execute on function public.leave_organisation() from anon;

-- Advisor tidy-up, same area of the schema
revoke execute on function public.handle_new_user() from anon, authenticated;
alter function public.handle_updated_at() set search_path = public;