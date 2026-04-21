-- ============================================================
-- CoreClinic - Fix de autenticacao + RLS (execucao unica)
-- Execute no Supabase Dashboard -> SQL Editor
-- Data: 2026-04-21
-- ============================================================

create extension if not exists "uuid-ossp";

-- 1) Ajuste de estrutura esperada pelo frontend.
alter table if exists public.procedimentos add column if not exists imagem_url text;
alter table if exists public.procedimentos add column if not exists caracteristicas text;
alter table if exists public.procedimentos add column if not exists preparacao text;
alter table if exists public.procedimentos add column if not exists cuidados_pos text;

alter table if exists public.procedimentos add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table if exists public.pacientes add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table if exists public.agendamentos add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table if exists public.pagamentos add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table if exists public.procedimentos alter column owner_id set default auth.uid();
alter table if exists public.pacientes alter column owner_id set default auth.uid();
alter table if exists public.agendamentos alter column owner_id set default auth.uid();
alter table if exists public.pagamentos alter column owner_id set default auth.uid();

create index if not exists idx_procedimentos_owner_id on public.procedimentos (owner_id);
create index if not exists idx_pacientes_owner_id on public.pacientes (owner_id);
create index if not exists idx_agendamentos_owner_id on public.agendamentos (owner_id);
create index if not exists idx_pagamentos_owner_id on public.pagamentos (owner_id);

-- 2) Grants explicitos para evitar erro de permissao com RLS ligado.
grant usage on schema public to anon, authenticated, service_role;
grant select on table public.procedimentos, public.pacientes, public.agendamentos, public.pagamentos to authenticated;
grant insert, update, delete on table public.procedimentos, public.pacientes, public.agendamentos, public.pagamentos to authenticated;
grant select on table public.procedimentos, public.pacientes, public.agendamentos, public.pagamentos to anon;

-- 3) Ativa RLS e recria policies.
alter table public.procedimentos enable row level security;
alter table public.pacientes enable row level security;
alter table public.agendamentos enable row level security;
alter table public.pagamentos enable row level security;

alter table public.procedimentos force row level security;
alter table public.pacientes force row level security;
alter table public.agendamentos force row level security;
alter table public.pagamentos force row level security;

drop policy if exists "procedimentos_select_auth" on public.procedimentos;
drop policy if exists "procedimentos_insert_auth" on public.procedimentos;
drop policy if exists "procedimentos_update_auth" on public.procedimentos;
drop policy if exists "procedimentos_delete_auth" on public.procedimentos;
drop policy if exists "pacientes_select_auth" on public.pacientes;
drop policy if exists "pacientes_insert_auth" on public.pacientes;
drop policy if exists "pacientes_update_auth" on public.pacientes;
drop policy if exists "pacientes_delete_auth" on public.pacientes;
drop policy if exists "agendamentos_select_auth" on public.agendamentos;
drop policy if exists "agendamentos_insert_auth" on public.agendamentos;
drop policy if exists "agendamentos_update_auth" on public.agendamentos;
drop policy if exists "agendamentos_delete_auth" on public.agendamentos;
drop policy if exists "pagamentos_select_auth" on public.pagamentos;
drop policy if exists "pagamentos_insert_auth" on public.pagamentos;
drop policy if exists "pagamentos_update_auth" on public.pagamentos;
drop policy if exists "pagamentos_delete_auth" on public.pagamentos;
drop policy if exists "service_procedimentos" on public.procedimentos;
drop policy if exists "service_pacientes" on public.pacientes;
drop policy if exists "service_agendamentos" on public.agendamentos;
drop policy if exists "service_pagamentos" on public.pagamentos;

create policy "procedimentos_select_auth"
  on public.procedimentos for select to authenticated
  using (owner_id = auth.uid() or owner_id is null);
create policy "procedimentos_insert_auth"
  on public.procedimentos for insert to authenticated
  with check (owner_id = auth.uid());
create policy "procedimentos_update_auth"
  on public.procedimentos for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy "procedimentos_delete_auth"
  on public.procedimentos for delete to authenticated
  using (owner_id = auth.uid());

create policy "pacientes_select_auth"
  on public.pacientes for select to authenticated
  using (owner_id = auth.uid());
create policy "pacientes_insert_auth"
  on public.pacientes for insert to authenticated
  with check (owner_id = auth.uid());
create policy "pacientes_update_auth"
  on public.pacientes for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy "pacientes_delete_auth"
  on public.pacientes for delete to authenticated
  using (owner_id = auth.uid());

create policy "agendamentos_select_auth"
  on public.agendamentos for select to authenticated
  using (owner_id = auth.uid());
create policy "agendamentos_insert_auth"
  on public.agendamentos for insert to authenticated
  with check (owner_id = auth.uid());
create policy "agendamentos_update_auth"
  on public.agendamentos for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy "agendamentos_delete_auth"
  on public.agendamentos for delete to authenticated
  using (owner_id = auth.uid());

create policy "pagamentos_select_auth"
  on public.pagamentos for select to authenticated
  using (owner_id = auth.uid());
create policy "pagamentos_insert_auth"
  on public.pagamentos for insert to authenticated
  with check (owner_id = auth.uid());
create policy "pagamentos_update_auth"
  on public.pagamentos for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy "pagamentos_delete_auth"
  on public.pagamentos for delete to authenticated
  using (owner_id = auth.uid());

create policy "service_procedimentos"
  on public.procedimentos for all to service_role using (true) with check (true);
create policy "service_pacientes"
  on public.pacientes for all to service_role using (true) with check (true);
create policy "service_agendamentos"
  on public.agendamentos for all to service_role using (true) with check (true);
create policy "service_pagamentos"
  on public.pagamentos for all to service_role using (true) with check (true);

-- 4) Diagnostico rapido de autenticacao (nao altera dados).
-- select id, email, email_confirmed_at, created_at
-- from auth.users
-- order by created_at desc
-- limit 20;

-- 5) Se seu usuario existir mas nao autenticar por falta de confirmacao de email:
-- update auth.users
-- set email_confirmed_at = coalesce(email_confirmed_at, now()),
--     confirmed_at = coalesce(confirmed_at, now())
-- where email = 'SEU_EMAIL_AQUI';
