-- Secure Supabase starter schema (multi-tenant, RLS-first)
-- Goal: the browser uses ONLY the anon key, and RLS enforces isolation.
--
-- Assumptions:
-- - Each user belongs to exactly one clinic (can be extended to many-to-many).
-- - All app tables include clinic_id and are protected by RLS.
-- - The client reads/writes only through RLS (no service_role on the client).

-- Extensions
create extension if not exists "uuid-ossp";

-- =========================
-- Core tables
-- =========================

create table if not exists public.clinics (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Keep app-specific user data here (do NOT mirror secrets).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  role text not null default 'staff' check (role in ('owner','admin','staff','viewer')),
  created_at timestamptz not null default now()
);

-- Helper: current user's clinic_id
create or replace function public.current_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id
  from public.profiles
  where user_id = auth.uid()
$$;

-- Helper: current user's role
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where user_id = auth.uid()
$$;

-- =========================
-- Example app tables
-- =========================

create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  name text not null,
  phone text,
  email text,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid references public.patients(id) on delete set null,
  patient_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','done','canceled','no_show')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ends_after_starts check (ends_at > starts_at)
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  method text not null default 'pix' check (method in ('pix','credit','debit','cash','other')),
  status text not null default 'pending' check (status in ('pending','paid','refunded','canceled')),
  paid_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- =========================
-- updated_at trigger
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- =========================
-- RLS: deny by default
-- =========================

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;

-- PROFILES: a user can read their own profile. Admin/owner can read clinic profiles.
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "profiles_read_clinic_admin" on public.profiles;
create policy "profiles_read_clinic_admin"
on public.profiles
for select
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin')
);

-- NOTE: profile creation is typically done server-side (edge function) to prevent self-assignment.
-- If you must allow inserts from client, restrict to user_id = auth.uid() AND clinic_id pre-provisioned.

-- PATIENTS: clinic isolation
drop policy if exists "patients_select_clinic" on public.patients;
create policy "patients_select_clinic"
on public.patients
for select
to authenticated
using (clinic_id = public.current_clinic_id());

drop policy if exists "patients_insert_clinic" on public.patients;
create policy "patients_insert_clinic"
on public.patients
for insert
to authenticated
with check (
  clinic_id = public.current_clinic_id()
  and created_by = auth.uid()
  and public.current_role() in ('owner','admin','staff')
);

drop policy if exists "patients_update_clinic" on public.patients;
create policy "patients_update_clinic"
on public.patients
for update
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin','staff')
)
with check (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin','staff')
);

drop policy if exists "patients_delete_clinic" on public.patients;
create policy "patients_delete_clinic"
on public.patients
for delete
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin')
);

-- APPOINTMENTS: clinic isolation + role-based writes
drop policy if exists "appointments_select_clinic" on public.appointments;
create policy "appointments_select_clinic"
on public.appointments
for select
to authenticated
using (clinic_id = public.current_clinic_id());

drop policy if exists "appointments_insert_clinic" on public.appointments;
create policy "appointments_insert_clinic"
on public.appointments
for insert
to authenticated
with check (
  clinic_id = public.current_clinic_id()
  and created_by = auth.uid()
  and public.current_role() in ('owner','admin','staff')
);

drop policy if exists "appointments_update_clinic" on public.appointments;
create policy "appointments_update_clinic"
on public.appointments
for update
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin','staff')
)
with check (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin','staff')
);

drop policy if exists "appointments_delete_clinic" on public.appointments;
create policy "appointments_delete_clinic"
on public.appointments
for delete
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin')
);

-- PAYMENTS: clinic isolation, writes only by staff/admin/owner
drop policy if exists "payments_select_clinic" on public.payments;
create policy "payments_select_clinic"
on public.payments
for select
to authenticated
using (clinic_id = public.current_clinic_id());

drop policy if exists "payments_insert_clinic" on public.payments;
create policy "payments_insert_clinic"
on public.payments
for insert
to authenticated
with check (
  clinic_id = public.current_clinic_id()
  and created_by = auth.uid()
  and public.current_role() in ('owner','admin','staff')
);

drop policy if exists "payments_update_clinic" on public.payments;
create policy "payments_update_clinic"
on public.payments
for update
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin')
)
with check (
  clinic_id = public.current_clinic_id()
  and public.current_role() in ('owner','admin')
);

drop policy if exists "payments_delete_clinic" on public.payments;
create policy "payments_delete_clinic"
on public.payments
for delete
to authenticated
using (
  clinic_id = public.current_clinic_id()
  and public.current_role() = 'owner'
);

-- =========================
-- Storage note (not SQL):
-- =========================
-- For file uploads, create a private bucket and use Storage RLS policies.
-- Avoid "public" buckets for patient/PHI data.

