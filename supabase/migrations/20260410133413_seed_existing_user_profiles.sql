-- Seed profiles for any existing users that don't have one yet
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(u.raw_user_meta_data->>'last_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
