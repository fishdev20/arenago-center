alter table public.centers
  add column if not exists contact_person_phone text;

update public.centers
set contact_person_phone = coalesce(contact_person_phone, '')
where contact_person_phone is null;

alter table public.centers
  alter column contact_person_phone set not null;
