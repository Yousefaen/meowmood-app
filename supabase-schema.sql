-- MeowMood Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Pet profiles
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  breed text,
  age_years numeric,
  photo_url text,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Health data (synced from Oura)
create table if not exists health_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  timestamp timestamptz not null,
  heart_rate numeric,
  body_temperature numeric,
  activity_score numeric,
  steps integer,
  sleep_stage text,
  source text default 'oura',
  created_at timestamptz default now()
);

-- Location pings (mock data for demo)
create table if not exists location_pings (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  latitude numeric not null,
  longitude numeric not null,
  timestamp timestamptz default now()
);

-- Feeding logs (manual entry)
create table if not exists feeding_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  fed_at timestamptz default now(),
  food_type text,
  notes text
);

-- OAuth tokens for Oura ring (used by Vercel API routes)
create table if not exists oura_tokens (
  id text primary key default 'default',
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz default now()
);

-- Enable RLS but allow service role full access (API routes use service role key)
alter table oura_tokens enable row level security;
