-- =========================================================
-- Supabase | Fix "Database error saving new user" (signup)
-- Safe to re-run / Idempotent
-- =========================================================

-- 0) Extensões utilitárias
create extension if not exists pgcrypto with schema public;

-- 1) Tabela PROFILES (cria se não existir)
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='profiles'
  ) then
    create table public.profiles (
      id uuid primary key
        references auth.users(id) on delete cascade,
      email text,
      full_name text,
      avatar_url text,
      phone text,

      -- metadados crus do auth
      raw_user_meta_data jsonb not null default '{}'::jsonb,

      -- domínio do app
      plan_id text not null default 'FREE',
      is_admin boolean not null default false,

      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists profiles_email_idx on public.profiles (email);
  end if;
end$$;

-- 2) Trigger de updated_at
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at := now();
  return new;
end
$fn$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname='trg_profiles_updated_at'
  ) then
    create trigger trg_profiles_updated_at
      before update on public.profiles
      for each row execute function public.set_profiles_updated_at();
  end if;
end$$;

-- 3) Função pós-signup (UPSERT resiliente; lê raw_user_meta_data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_email   text;
  v_name    text;
  v_is_admin boolean;
  v_plan_id text;
  v_avatar  text;
  v_phone   text;
begin
  -- Campos de auth.users
  v_email   := new.email;
  v_name    := coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name');
  v_avatar  := new.raw_user_meta_data->>'avatar_url';
  v_phone   := new.raw_user_meta_data->>'phone';

  -- Normalização/metas
  v_is_admin := coalesce((new.raw_user_meta_data->>'isAdmin')::boolean, false);
  v_plan_id  := upper(coalesce(nullif(new.raw_user_meta_data->>'plan_id',''), 'FREE'));

  insert into public.profiles (id, email, full_name, avatar_url, phone, raw_user_meta_data, is_admin, plan_id)
  values (new.id, v_email, v_name, v_avatar, v_phone, coalesce(new.raw_user_meta_data, '{}'::jsonb), v_is_admin, v_plan_id)
  on conflict (id) do update
    set email              = excluded.email,
        full_name          = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url         = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        phone              = coalesce(excluded.phone, public.profiles.phone),
        raw_user_meta_data = coalesce(excluded.raw_user_meta_data, public.profiles.raw_user_meta_data),
        is_admin           = coalesce(excluded.is_admin, public.profiles.is_admin),
        plan_id            = coalesce(excluded.plan_id, public.profiles.plan_id),
        updated_at         = now();
  return new;
end
$fn$;

-- 4) Trigger em auth.users (apenas se não existir)
do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'on_auth_user_created'
      and n.nspname = 'auth'
      and c.relname = 'users'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end$$;

-- 5) Grants mínimos + RLS
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

-- Drop seguro de políticas antigas conflitantes
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles select own') then
    drop policy "Profiles select own" on public.profiles;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles update own') then
    drop policy "Profiles update own" on public.profiles;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles insert via function') then
    drop policy "Profiles insert via function" on public.profiles;
  end if;
end$$;

-- SELECT próprio
create policy "Profiles select own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- UPDATE próprio
create policy "Profiles update own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- 6) Salvaguardas de schema
alter table public.profiles alter column email drop not null;

-- 7) Seed retroativo (cria profiles faltantes sem quebrar se já existem)
insert into public.profiles (id, email, full_name, raw_user_meta_data)
select u.id, u.email,
       coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name'),
       coalesce(u.raw_user_meta_data, '{}'::jsonb)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict do nothing;