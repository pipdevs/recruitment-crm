-- Signup now consumes an invite token when one is supplied in user metadata.
-- Previously every signup created an organisation, including invited users,
-- whose profile was then moved to the inviting org client-side — orphaning the
-- org it had just made. The invite was also never marked accepted, because the
-- "Org admins can manage invites" policy blocked the new non-admin user's
-- UPDATE, leaving invite links reusable indefinitely.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token   uuid;
  v_org_id  uuid;
  v_role    text;
  v_email   text;
  v_expires timestamptz;
begin
  v_token := nullif(new.raw_user_meta_data->>'invite_token', '')::uuid;

  if v_token is null then
    -- Founder signup: new organisation, first user is its Admin.
    insert into public.organisations (name, plan)
    values (coalesce(new.raw_user_meta_data->>'org_name', 'My Organisation'), 'free')
    returning id into v_org_id;
    v_role := 'Admin';
  else
    -- Invited signup: org and role come from the invite, never from the client.
    select i.organisation_id, i.role, i.email, i.expires_at
      into v_org_id, v_role, v_email, v_expires
      from public.invites i
     where i.token = v_token
       and not i.accepted;

    if v_org_id is null then
      raise exception 'This invite is invalid or has already been used';
    end if;

    if v_expires is not null and v_expires <= now() then
      raise exception 'This invite has expired';
    end if;

    if lower(v_email) <> lower(new.email) then
      raise exception 'This invite was issued to a different email address';
    end if;

    update public.invites set accepted = true where token = v_token;
  end if;

  insert into public.profiles (id, full_name, role, organisation_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    v_role,
    v_org_id
  );

  return new;
end;
$$;