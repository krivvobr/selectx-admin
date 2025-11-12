-- Supabase schema for Select-X Admin Dashboard
-- Run this in Supabase SQL Editor (Project > SQL) in order.

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'property_type') then
    create type public.property_type as enum ('apartamento','casa','cobertura','comercial');
  end if;
  if not exists (select 1 from pg_type where typname = 'property_purpose') then
    create type public.property_purpose as enum ('venda','locacao');
  end if;
  if not exists (select 1 from pg_type where typname = 'property_status') then
    create type public.property_status as enum ('disponivel','vendido','alugado','inativo');
  end if;
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum ('new','contacted');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin','agent','viewer');
  end if;
end $$;

-- Ensure 'terreno' exists in property_type enum (idempotent)
do $$ begin
  if exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'property_type' and e.enumlabel = 'terreno') then
    -- already exists
    null;
  else
    alter type public.property_type add value 'terreno';
  end if;
end $$;

-- Utility: auto-update updated_at
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Tables
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  type public.property_type not null,
  purpose public.property_purpose not null,
  price numeric(12,2) not null,
  address text,
  neighborhood text,
  city text,
  state text,
  area numeric(10,2),
  bedrooms int,
  bathrooms int,
  suites int,
  parking int,
  furnished boolean default false,
  financing boolean default false,
  floor int,
  status public.property_status default 'disponivel',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure trigger exists (Postgres does not support IF NOT EXISTS for triggers)
drop trigger if exists trg_properties_updated_at on public.properties;
create trigger trg_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  property_id uuid references public.properties(id) on delete set null,
  status public.lead_status default 'new',
  created_at timestamptz default now(),
  notes text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role default 'viewer',
  created_at timestamptz default now()
);

-- Auto-create profile on new auth user
create or replace function public.handle_new_user() returns trigger
security definer set search_path = public
language plpgsql as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'viewer');
  return new;
end; $$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helper: check if current user is admin without triggering RLS recursion
create or replace function public.is_admin() returns boolean
stable
security definer set search_path = public
language sql as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Indexes
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_purpose on public.properties(purpose);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_leads_property_id on public.leads(property_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at);

-- Cities and Neighborhoods
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  created_at timestamptz default now(),
  unique(name, state)
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(city_id, name)
);

create index if not exists idx_cities_name on public.cities(name);
create index if not exists idx_cities_state on public.cities(state);
create index if not exists idx_neighborhoods_city_id on public.neighborhoods(city_id);
create index if not exists idx_neighborhoods_name on public.neighborhoods(name);

-- RLS policies
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;

-- Properties: read for authenticated users
drop policy if exists "read authenticated - properties" on public.properties;
create policy "read authenticated - properties" on public.properties
for select using (auth.role() = 'authenticated');

-- Properties: write for admins only
drop policy if exists "insert admin - properties" on public.properties;
create policy "insert admin - properties" on public.properties
for insert with check (
  public.is_admin()
);
drop policy if exists "update admin - properties" on public.properties;
create policy "update admin - properties" on public.properties
for update using (
  public.is_admin()
) with check (
  public.is_admin()
);
drop policy if exists "delete admin - properties" on public.properties;
create policy "delete admin - properties" on public.properties
for delete using (
  public.is_admin()
);

-- Cities: read for authenticated; write for admins
drop policy if exists "read authenticated - cities" on public.cities;
create policy "read authenticated - cities" on public.cities
for select using (auth.role() = 'authenticated');

drop policy if exists "insert admin - cities" on public.cities;
create policy "insert admin - cities" on public.cities
for insert with check (
  public.is_admin()
);

drop policy if exists "update admin - cities" on public.cities;
create policy "update admin - cities" on public.cities
for update using (
  public.is_admin()
) with check (
  public.is_admin()
);

drop policy if exists "delete admin - cities" on public.cities;
create policy "delete admin - cities" on public.cities
for delete using (
  public.is_admin()
);

-- Neighborhoods: read for authenticated; write for admins
drop policy if exists "read authenticated - neighborhoods" on public.neighborhoods;
create policy "read authenticated - neighborhoods" on public.neighborhoods
for select using (auth.role() = 'authenticated');

drop policy if exists "insert admin - neighborhoods" on public.neighborhoods;
create policy "insert admin - neighborhoods" on public.neighborhoods
for insert with check (
  public.is_admin()
);

drop policy if exists "update admin - neighborhoods" on public.neighborhoods;
create policy "update admin - neighborhoods" on public.neighborhoods
for update using (
  public.is_admin()
) with check (
  public.is_admin()
);

drop policy if exists "delete admin - neighborhoods" on public.neighborhoods;
create policy "delete admin - neighborhoods" on public.neighborhoods
for delete using (
  public.is_admin()
);

-- Leads: readable by authenticated; insert allowed publicly (website form)
drop policy if exists "read authenticated - leads" on public.leads;
create policy "read authenticated - leads" on public.leads
for select using (auth.role() = 'authenticated');

drop policy if exists "insert public - leads" on public.leads;
create policy "insert public - leads" on public.leads
for insert with check (true);

drop policy if exists "update admin - leads" on public.leads;
create policy "update admin - leads" on public.leads
for update using (
  public.is_admin()
) with check (
  public.is_admin()
);

-- Profiles: user can read own profile; admins can read/update all
drop policy if exists "read own or admin - profiles" on public.profiles;
create policy "read own or admin - profiles" on public.profiles
for select using (
  id = auth.uid() or public.is_admin()
);

drop policy if exists "admin update - profiles" on public.profiles;
create policy "admin update - profiles" on public.profiles
for update using (
  public.is_admin()
) with check (
  public.is_admin()
);

-- Optional seed data for testing
insert into public.properties (code, title, type, purpose, price, city, state, area, bedrooms, status)
values
  ('SLX001','Apartamento Moderno - Centro','apartamento','venda',850000,'São Paulo','SP',120,3,'disponivel')
on conflict (code) do nothing;

insert into public.properties (code, title, type, purpose, price, city, state, area, bedrooms, status)
values
  ('SLX002','Casa com Piscina - Jardins','casa','venda',1200000,'São Paulo','SP',250,4,'vendido')
on conflict (code) do nothing;

insert into public.properties (code, title, type, purpose, price, city, state, area, bedrooms, status)
values
  ('SLX003','Cobertura Duplex - Vila Nova','cobertura','locacao',2500,'São Paulo','SP',180,3,'alugado')
on conflict (code) do nothing;

insert into public.leads (name, phone, email, property_id, status)
select 'João Silva','(11) 98765-4321','joao.silva@email.com', p.id, 'new'
from public.properties p where p.code = 'SLX001'
on conflict do nothing;

insert into public.leads (name, phone, email, property_id, status)
select 'Maria Santos','(11) 97654-3210','maria.santos@email.com', p.id, 'contacted'
from public.properties p where p.code = 'SLX002'
on conflict do nothing;

-- Optional seed cities/neighborhoods
insert into public.cities (name, state) values
  ('São Paulo','SP'),
  ('Campinas','SP'),
  ('Rio de Janeiro','RJ')
on conflict (name, state) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name from (
  values ('São Paulo','Centro'),('São Paulo','Jardins'),('Campinas','Cambuí')
) as n(city, name)
join public.cities c on c.name = n.city
on conflict (city_id, name) do nothing;