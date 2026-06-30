-- ============================================================
-- CreatorFlow — Schema inicial
-- Cole este SQL no Supabase: SQL Editor → New query → Run
-- ============================================================

-- Profiles (dados extras do usuário além do auth)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  username   text unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- Preenche o profile automaticamente ao criar conta
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    lower(new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Campanhas
create table if not exists public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  color       text default '#8b5cf6',
  icon        text default 'folder',
  archived    boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Cards (tarefas dentro de campanhas)
create table if not exists public.cards (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  campaign_id          uuid references public.campaigns(id) on delete set null,
  title                text not null,
  description          text,
  content_type         text not null default 'video',
  stage                text not null default 'script',
  priority             text not null default 'medium',
  approval_status      text not null default 'pending',
  due_date             timestamptz,
  actual_delivery_date timestamptz,
  checklist            jsonb default '[]',
  guidebook            jsonb default '[]',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Row Level Security — cada usuário vê só os próprios dados
alter table public.profiles  enable row level security;
alter table public.campaigns enable row level security;
alter table public.cards     enable row level security;

-- Policies profiles
create policy "Usuário vê próprio perfil"   on public.profiles for select using (auth.uid() = id);
create policy "Usuário edita próprio perfil" on public.profiles for update using (auth.uid() = id);

-- Policies campaigns
create policy "Usuário vê próprias campanhas"   on public.campaigns for select using (auth.uid() = user_id);
create policy "Usuário cria campanhas"          on public.campaigns for insert with check (auth.uid() = user_id);
create policy "Usuário edita próprias campanhas" on public.campaigns for update using (auth.uid() = user_id);
create policy "Usuário deleta próprias campanhas" on public.campaigns for delete using (auth.uid() = user_id);

-- Policies cards
create policy "Usuário vê próprios cards"    on public.cards for select using (auth.uid() = user_id);
create policy "Usuário cria cards"           on public.cards for insert with check (auth.uid() = user_id);
create policy "Usuário edita próprios cards" on public.cards for update using (auth.uid() = user_id);
create policy "Usuário deleta próprios cards" on public.cards for delete using (auth.uid() = user_id);

-- ============================================================
-- MIGRAÇÕES (execute no Supabase se o banco já existia)
-- ============================================================

-- 1. Adicionar coluna username em profiles
alter table public.profiles add column if not exists username text unique;

-- 2. Tornar campaign_id nullable em cards (era NOT NULL ON DELETE CASCADE)
alter table public.cards alter column campaign_id drop not null;
alter table public.cards drop constraint if exists cards_campaign_id_fkey;
alter table public.cards add constraint cards_campaign_id_fkey
  foreign key (campaign_id) references public.campaigns(id) on delete set null;

-- 3. Adicionar data real de entrega em cards
alter table public.cards add column if not exists actual_delivery_date timestamptz;

-- 4. Tabela de clientes
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  notes      text default '',
  created_at timestamptz default now()
);

alter table public.clients enable row level security;
create policy "Usuário vê próprios clientes"    on public.clients for select using (auth.uid() = user_id);
create policy "Usuário cria clientes"           on public.clients for insert with check (auth.uid() = user_id);
create policy "Usuário edita próprios clientes" on public.clients for update using (auth.uid() = user_id);
create policy "Usuário deleta próprios clientes" on public.clients for delete using (auth.uid() = user_id);

-- 5. Coluna client_id em cards (FK para clients, set null ao deletar)
alter table public.cards add column if not exists client_id uuid references public.clients(id) on delete set null;

-- ============================================================
-- RPCs auxiliares (login por username, verificação de disponibilidade)
-- ============================================================

-- Retorna o e-mail associado a um username (usado no login)
create or replace function public.get_email_by_username(p_username text)
returns text language plpgsql security definer
set search_path = public, auth as $$
declare
  v_email text;
begin
  select au.email into v_email
  from auth.users au
  join public.profiles p on p.id = au.id
  where lower(p.username) = lower(p_username)
  limit 1;
  return v_email;
end;
$$;

-- Verifica se um username está disponível
create or replace function public.check_username_available(p_username text)
returns boolean language plpgsql security definer
set search_path = public as $$
begin
  return not exists (
    select 1 from public.profiles
    where lower(username) = lower(p_username)
  );
end;
$$;

-- Libera as RPCs para usuários não autenticados (necessário para login/signup)
grant execute on function public.get_email_by_username(text)    to anon, authenticated;
grant execute on function public.check_username_available(text) to anon, authenticated;
