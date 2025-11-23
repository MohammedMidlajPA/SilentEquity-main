-- Run this through Supabase MCP or the SQL editor in your project
create table if not exists public.course_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  paid boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists course_leads_email_idx on public.course_leads (lower(email));

comment on table public.course_leads is 'Stores enrollment form submissions before Stripe checkout.';

-- If discord_link column exists, remove it:
-- ALTER TABLE public.course_leads DROP COLUMN IF EXISTS discord_link;

 