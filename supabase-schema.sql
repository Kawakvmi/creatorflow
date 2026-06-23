-- ============================================================
-- CreatorFlow — Schema inicial
-- Cole este SQL no Supabase: SQL Editor → New query → Run
-- ============================================================

-- Profiles (dados extras do usuário além do auth)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Preenche o profile automaticamente ao criar conta
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
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
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  title           text not null,
  description     text,
  content_type    text not null default 'video',
  stage           text not null default 'script',
  priority        text not null default 'medium',
  approval_status text not null default 'pending',
  due_date        timestamptz,
  checklist       jsonb default '[]',
  guidebook       jsonb default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
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
