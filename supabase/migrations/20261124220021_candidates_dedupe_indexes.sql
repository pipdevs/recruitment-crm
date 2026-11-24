create unique index candidates_org_email_uidx
  on public.candidates (organisation_id, lower(email))
  where email is not null;

create unique index candidates_org_linkedin_uidx
  on public.candidates (organisation_id, substring(lower(linkedin_url) from 'linkedin\.com/in/([^/?#]+)'))
  where linkedin_url is not null;