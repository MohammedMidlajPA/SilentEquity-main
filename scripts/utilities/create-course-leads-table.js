#!/usr/bin/env node

/**
 * Script to create the course_leads table in Supabase
 * Checks if table exists and provides instructions if it doesn't
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');

async function checkAndCreateTable() {
  try {
    console.log('🔧 Checking course_leads table in Supabase...\n');

    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase is not configured. Please check your backend/.env file.');
      console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    const supabase = getSupabaseClient();
    const supabaseUrl = process.env.SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';

    console.log(`📡 Connected to Supabase project: ${projectRef}\n`);

    // Try to query the table to see if it exists
    console.log('🔍 Checking if table exists...\n');

    const { data, error } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation')) {
        console.log('❌ Table "course_leads" does not exist yet.\n');
        console.log('📋 Please run this SQL in your Supabase SQL Editor:');
        console.log(`   👉 https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
        console.log('SQL to execute:');
        console.log('─'.repeat(70));
        
        const sql = `create table if not exists public.course_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  paid boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists course_leads_email_idx on public.course_leads (lower(email));

comment on table public.course_leads is 'Stores enrollment form submissions before Stripe checkout.';`;

        console.log(sql);
        console.log('─'.repeat(70));
        console.log('\n💡 After running the SQL, you can verify by running this script again.');
        process.exit(1);
      } else {
        throw error;
      }
    } else {
      console.log('✅ Table "course_leads" exists!');
      console.log('✅ Index "course_leads_email_idx" is configured.');
      console.log('\n🎉 Your Supabase database is ready to receive form submissions!');
      console.log(`\n📊 View your data at: https://supabase.com/dashboard/project/${projectRef}/editor`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.hint) {
      console.error('   Hint:', error.hint);
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';
    
    console.error('\n📋 Please run the SQL manually in your Supabase SQL Editor:');
    console.error(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
    process.exit(1);
  }
}

checkAndCreateTable();
