insert into public.sports (name, slug)
values
  ('Badminton', 'badminton'),
  ('Tennis', 'tennis'),
  ('Table Tennis', 'table-tennis'),
  ('Soccer', 'soccer'),
  ('Basketball', 'basketball'),
  ('Volleyball', 'volleyball'),
  ('Padel', 'padel'),
  ('Squash', 'squash'),
  ('Pickleball', 'pickleball')
on conflict (lower(name)) do nothing;

insert into public.sports (name, slug)
values
  ('Table Tennis', 'ping-pong')
on conflict (lower(name)) do nothing;
