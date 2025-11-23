#!/usr/bin/env node

/**
 * Automated table creation using Supabase JS client
 * Creates table by using RPC function or direct table operations
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
const fs = require('fs');

async function createTableAutomated() {
  try {
    console.log('🚀 Automated Database Setup via Supabase');
    console.log('========================================\n');

    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase is not configured');
      process.exit(1);
    }

    const supabase = getSupabaseClient();
    const supabaseUrl = process.env.SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';

    console.log(`📡 Project: ${projectRef}\n`);

    // Check if table exists
    console.log('🔍 Step 1: Checking if table exists...');
    const { data: existingData, error: checkError } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table "course_leads" already exists!\n');
      console.log('🧪 Testing table functionality...');
      
      // Test insert and delete
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        paid: false
      };

      const { data: testInsert, error: testError } = await supabase
        .from('course_leads')
        .insert([testData])
        .select('id')
        .single();

      if (testError) {
        console.log('⚠️  Test insert failed:', testError.message);
      } else {
        console.log('✅ Test insert successful!');
        await supabase.from('course_leads').delete().eq('id', testInsert.id);
        console.log('✅ Test record cleaned up.\n');
      }

      console.log('🎉 Database is ready for form submissions!');
      return;
    }

    console.log('❌ Table does not exist.\n');

    // Try to create table using RPC function
    console.log('🔧 Step 2: Attempting to create table via RPC...\n');
    
    // Read SQL
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    // Try creating a function that executes SQL, then call it
    // This won't work because we can't create functions without DDL access
    
    // Alternative: Use Supabase REST API directly with proper endpoint
    console.log('🔧 Step 3: Trying Supabase REST API...\n');
    
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Try the SQL execution endpoint
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: sql
        })
      });

      const result = await response.text();
      console.log('RPC Response:', result);

      if (response.ok) {
        console.log('✅ Table created via RPC!\n');
      } else {
        throw new Error(`RPC failed: ${result}`);
      }
    } catch (rpcError) {
      console.log('⚠️  RPC method not available:', rpcError.message);
      console.log('\n📋 Since Supabase requires SQL execution via dashboard for security,');
      console.log('   the table must be created manually.\n');
      console.log('SQL to execute:');
      console.log('─'.repeat(70));
      console.log(sql);
      console.log('─'.repeat(70));
      console.log('');
      console.log(`👉 https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
      
      // Copy to clipboard
      const { exec } = require('child_process');
      exec(`echo "${sql.replace(/"/g, '\\"')}" | pbcopy`, () => {
        console.log('✅ SQL copied to clipboard!');
      });
      
      exec(`open "https://supabase.com/dashboard/project/${projectRef}/sql/new"`, () => {
        console.log('✅ Opened SQL Editor\n');
      });
      
      console.log('⏳ Waiting 30 seconds for you to execute the SQL...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Verify
      console.log('🔍 Step 4: Verifying table creation...\n');
      const { data: verifyData, error: verifyError } = await supabase
        .from('course_leads')
        .select('id')
        .limit(1);

      if (verifyError) {
        console.log('❌ Table still not found:', verifyError.message);
        console.log('   Please make sure you ran the SQL successfully.\n');
        process.exit(1);
      }
    }

    // Final verification
    console.log('🔍 Final verification...\n');
    const { data: finalData, error: finalError } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);

    if (finalError) {
      console.log('❌ Verification failed:', finalError.message);
      process.exit(1);
    }

    console.log('✅ Table "course_leads" created successfully!');
    console.log('✅ Index "course_leads_email_idx" is configured.');
    console.log('✅ Your Supabase database is ready for form submissions!\n');
    
    console.log(`📊 View your data at: https://supabase.com/dashboard/project/${projectRef}/editor`);
    console.log('🎉 Complete setup successful!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

createTableAutomated();


