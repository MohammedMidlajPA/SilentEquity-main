# Supabase Account Migration Guide

## Overview
This guide helps you migrate to a new Supabase account/project for form submissions and course enrollment data.

## New Supabase Project Details
- **Project ID**: `vqounfxvykhwbzxpodwq`
- **Project URL**: `https://vqounfxvykhwbzxpodwq.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/vqounfxvykhwbzxpodwq

## Migration Steps

### 1. Update Environment Variables
The Supabase URL has been automatically updated in `backend/.env`. Verify it contains:
```bash
SUPABASE_URL=https://vqounfxvykhwbzxpodwq.supabase.co
```

### 2. Get Service Role Key
You need to add the Service Role Key from your new Supabase project:

**Option A: Use the helper script**
```bash
./scripts/utilities/get-supabase-service-key.sh
```

**Option B: Manual setup**
1. Go to: https://supabase.com/dashboard/project/vqounfxvykhwbzxpodwq
2. Navigate to: **Settings → API**
3. Under **Project API keys**, find the **service_role** key (starts with `eyJ...`)
4. Copy the entire key
5. Add to `backend/.env`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

⚠️ **IMPORTANT**: The Service Role Key has admin privileges. Keep it secret and never commit it to git!

### 3. Create Database Table
You need to create the `course_leads` table in your new Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to: **SQL Editor**
3. Run the SQL from `docs/supabase/COURSE_LEADS_TABLE.sql`:

```sql
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
```

### 4. Verify Configuration
Check that your `backend/.env` file contains:
```bash
SUPABASE_URL=https://vqounfxvykhwbzxpodwq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your actual key)
```

### 5. Restart Backend Server
After updating the environment variables, restart your backend server:
```bash
cd backend
npm start
# or
node server.js
```

### 6. Test Form Submission
1. Submit a test enrollment form through your frontend
2. Check the Supabase dashboard → **Table Editor** → `course_leads` table
3. Verify the data appears correctly

## Troubleshooting

### Error: "Supabase credentials are not configured"
- Check that both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `backend/.env`
- Restart the backend server after updating `.env`

### Error: "relation 'course_leads' does not exist"
- The `course_leads` table hasn't been created in the new Supabase project
- Run the SQL from step 3 above

### Error: "permission denied for table course_leads"
- Verify you're using the **Service Role Key** (not the anon key)
- Check that Row Level Security (RLS) policies allow service role access

### Data Not Appearing
- Check backend logs for Supabase errors
- Verify the table exists in the new project
- Ensure the Service Role Key is correct

## What Changed

### Updated Files
- `backend/config/supabase.js` - Now resets client when credentials change
- `backend/.env` - Updated with new Supabase URL
- `scripts/utilities/get-supabase-service-key.sh` - Updated with new project ID
- `scripts/utilities/update-supabase-account.sh` - New migration script

### Features Using Supabase
- **Course Enrollment Form** (`/api/courses/join`) - Stores form submissions
- **Payment Webhooks** - Updates `paid` status after successful payment
- All form submissions now go to the new Supabase project

## Rollback
If you need to rollback to the previous Supabase account:
1. Check `backend/.env.backup.*` files for the previous configuration
2. Restore the old `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Restart the backend server

