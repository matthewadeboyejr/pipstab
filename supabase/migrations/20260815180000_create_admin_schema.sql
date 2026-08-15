-- 1. Add role column to profiles if not exists
alter table public.profiles 
add column if not exists role text default 'trader';

-- Add index on role for fast lookups
create index if not exists idx_profiles_role on public.profiles(role);

-- 2. Create helper function to check admin role
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 3. Create Admin Audit Logs Table
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.admin_audit_logs enable row level security;

create policy "Admins can view audit logs"
  on public.admin_audit_logs for select
  using (public.is_admin() or (auth.jwt() ->> 'role' = 'service_role'));

create policy "Admins can insert audit logs"
  on public.admin_audit_logs for insert
  with check (public.is_admin() or (auth.jwt() ->> 'role' = 'service_role'));

-- 4. Create System Settings & Feature Flags Table
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);

alter table public.system_settings enable row level security;

create policy "Admins can manage system settings"
  on public.system_settings for all
  using (public.is_admin() or (auth.jwt() ->> 'role' = 'service_role'));

create policy "Public can read system settings"
  on public.system_settings for select
  using (true);

-- Seed default feature flags
insert into public.system_settings (key, value, description)
values 
  ('ai_tools_enabled', 'true'::jsonb, 'Toggle AI Fundamentals and Journal Auditor tools'),
  ('deriv_sync_enabled', 'true'::jsonb, 'Toggle automated Deriv WebSocket background sync'),
  ('maintenance_mode', 'false'::jsonb, 'Put the platform into maintenance mode')
on conflict (key) do nothing;

-- 5. Enable Admin Access Policies on existing tables

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Admins can view all trades for analytics & support
create policy "Admins can view all trades"
  on public.trades for select
  using (public.is_admin());

-- Admins can view all trading accounts
create policy "Admins can view all trading accounts"
  on public.trading_accounts for select
  using (public.is_admin());

-- Admins can manage early access waitlist
create policy "Admins can manage early access"
  on public.early_access for all
  using (public.is_admin());
