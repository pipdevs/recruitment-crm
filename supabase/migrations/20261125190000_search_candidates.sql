-- Candidate search: every word typed must match the start of a word in the name,
-- the start of the email, part of the email (if it contains @ or .),
-- or part of the phone digits (if it is 4+ digits). Accent-insensitive.
-- SECURITY INVOKER (default), so RLS on candidates still applies.

create extension if not exists unaccent with schema extensions;

create or replace function public.search_candidates(p_term text)
returns setof public.candidates
language sql
stable
set search_path = public, extensions
as $$
  select c.*
  from public.candidates c
  where not exists (
    select 1
    from unnest(regexp_split_to_array(lower(unaccent(trim(p_term))), '\s+')) as tok
    where tok <> ''
      and not (
        lower(unaccent(c.full_name)) ~ ('(^|[^[:alnum:]])' || regexp_replace(tok, '([.^$|?*+()\[\]{}\\])', '\\\1', 'g'))
        or starts_with(lower(coalesce(c.email, '')), tok)
        or (tok ~ '[@.]' and strpos(lower(coalesce(c.email, '')), tok) > 0)
        or (tok ~ '^[0-9+()-]+$'
            and length(regexp_replace(tok, '\D', '', 'g')) >= 4
            and strpos(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), regexp_replace(tok, '\D', '', 'g')) > 0)
      )
  );
$$;