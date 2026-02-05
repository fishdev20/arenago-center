-- Ensure existing rows comply before enforcing NOT NULL
update public.centers
set business_id = coalesce(business_id, ''),
    contact_person = coalesce(contact_person, ''),
    country_code = coalesce(country_code, '')
where business_id is null
   or contact_person is null
   or country_code is null;

alter table public.centers
  alter column business_id set not null,
  alter column contact_person set not null,
  alter column country_code set not null;
