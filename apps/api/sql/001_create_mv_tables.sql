-- Migration: create mv_users and mv_memories
-- Run this in Supabase SQL editor or with psql against your project's DB.

create table if not exists public.mv_users (
  id uuid primary key default gen_random_uuid(),
  privy_did text unique not null,
  email text,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Memory index
-- We don't store conversation content here
-- Content lives on 0G Storage
-- This is just the index so users can find their memories
create table if not exists public.mv_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.mv_users(id) on delete cascade,
  session_id text not null,
  title text,                    -- AI-generated summary title
  root_hash text not null,       -- 0G Storage root hash
  message_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.mv_users enable row level security;
alter table if exists public.mv_memories enable row level security;

-- Notes:
-- 1) If your API uses the SUPABASE_SERVICE_ROLE_KEY it bypasses RLS for server-side inserts.
-- 2) To run locally with the supabase CLI, you can save this file in a migrations folder and run:
--    supabase db push
-- 3) Or execute directly via psql (replace placeholders):
--    psql "postgresql://postgres:YOUR_DB_PASSWORD@db_host:5432/postgres" -f 001_create_mv_tables.sql
