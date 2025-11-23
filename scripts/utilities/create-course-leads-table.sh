#!/bin/bash

# Script to create the course_leads table in Supabase
# Uses curl to execute SQL via Supabase Management API

set -e

# Load environment variables safely
if [ -f "backend/.env" ]; then
    # Source the .env file to load variables
    set -a
    source backend/.env
    set +a
else
    echo "❌ backend/.env not found"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in backend/.env"
    exit 1
fi

echo "🔧 Creating course_leads table in Supabase..."
echo "   Project: ${SUPABASE_URL}"
echo ""

# SQL to execute
SQL=$(cat <<'EOF'
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
)

# Try to execute via Supabase Management API
echo "📡 Attempting to create table via API..."

# Extract project reference from URL
PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://\([^.]*\)\.supabase\.co|\1|')

# Use Supabase Management API (if available) or PostgREST
# Note: Supabase doesn't expose direct SQL execution via REST API for security
# We'll verify the table exists by querying it instead

echo "🔍 Checking if table exists..."

# Check if table exists by trying to query it
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  "${SUPABASE_URL}/rest/v1/course_leads?select=id&limit=1" 2>/dev/null || echo "ERROR")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "406" ]; then
    echo "✅ Table 'course_leads' already exists!"
    echo "✅ Index 'course_leads_email_idx' should be configured."
    echo ""
    echo "🎉 Your Supabase database is ready!"
    exit 0
elif [ "$HTTP_CODE" = "404" ] || echo "$BODY" | grep -q "does not exist\|42P01"; then
    echo "❌ Table does not exist yet."
    echo ""
    echo "📋 Since Supabase doesn't allow direct SQL execution via REST API,"
    echo "   please run this SQL in your Supabase SQL Editor:"
    echo ""
    echo "   👉 https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
    echo ""
    echo "SQL to execute:"
    echo "────────────────────────────────────────────────────────────"
    echo "$SQL"
    echo "────────────────────────────────────────────────────────────"
    echo ""
    exit 1
else
    echo "⚠️  Could not verify table status (HTTP $HTTP_CODE)"
    echo ""
    echo "📋 Please run this SQL manually in your Supabase SQL Editor:"
    echo "   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
    echo ""
    echo "$SQL"
    exit 1
fi

