-- 20261126_drop_candidates_resume_url.sql
do $$
declare n integer;
begin
  select count(*) into n from candidates where resume_url is not null;
  if n > 0 then
    raise exception 'Aborting: % candidates still have a resume_url', n;
  end if;
end $$;

alter table candidates drop column resume_url;