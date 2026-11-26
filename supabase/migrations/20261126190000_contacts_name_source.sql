-- Provenance for contacts.full_name.
--
-- The companies-and-contacts import derives a name for every address, but the
-- quality varies: a name lifted from an email signature is reliable, one guessed
-- from the address is not. Recording the source keeps the guesses reviewable and
-- lets the AI query layer tell a real name from a derived one.
--
--   signature  from_name on mail the contact sent us
--   greeting   the salutation in mail we sent them ("Hi Anna,")
--   role       a shared inbox, named after its local part (jobs@ -> "Jobs")
--   address    derived from the address itself (j.schmidt@ -> "J. Schmidt")
--   null       entered by a person in the app

alter table public.contacts add column name_source text;

alter table public.contacts add constraint contacts_name_source_check
  check (name_source is null or name_source in ('signature','greeting','role','address'));

comment on column public.contacts.name_source is
  'Provenance of full_name when set by import: signature | greeting | role | address. Null means entered in the app.';