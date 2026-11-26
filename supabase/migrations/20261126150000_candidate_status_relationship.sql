-- Candidate status is the relationship with the agency, not a pipeline
-- position. Progress on a job lives on job_applications.stage.
alter table public.candidates drop constraint candidates_status_check;

update public.candidates
set status = case status
  when 'Hired' then 'Placed'
  when 'Rejected' then 'Not Interested'
  else 'Active'
end
where status in ('Screening', 'Interview', 'Offer', 'Hired', 'Rejected');

alter table public.candidates
  alter column status set not null,
  add constraint candidates_status_check
    check (status in ('New', 'Contacted', 'Active', 'Placed', 'Not Interested', 'Do Not Contact'));