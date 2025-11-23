#!/bin/bash

# Quick setup script for course_leads table
# Opens SQL editor with instructions

PROJECT_REF="vqounfxvykhwbzxpodwq"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "🚀 Setting up course_leads table in Supabase"
echo "=============================================="
echo ""
echo "📋 Step 1: Open SQL Editor"
echo "   👉 $SQL_EDITOR_URL"
echo ""
echo "📋 Step 2: Copy and paste this SQL:"
echo ""
echo "────────────────────────────────────────────────────────────"
cat <<'EOF'
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
EOF
echo "────────────────────────────────────────────────────────────"
echo ""
echo "📋 Step 3: Click 'Run' to execute the SQL"
echo ""
echo "📋 Step 4: Verify by running:"
echo "   node scripts/utilities/create-course-leads-table.js"
echo ""

# Try to open browser (macOS)
if command -v open > /dev/null; then
    read -p "Open SQL Editor in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$SQL_EDITOR_URL"
    fi
fi


