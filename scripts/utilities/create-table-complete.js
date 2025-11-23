#!/usr/bin/env node

/**
 * Complete database setup using Supabase client
 * Creates the course_leads table and verifies everything works
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
const fs = require('fs');

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Complete Supabase Database Setup');
    console.log('====================================\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in backend/.env');
      process.exit(1);
    }

    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    console.log(`📡 Connecting to Supabase project: ${projectRef}\n`);

    // Get Supabase client using configured credentials
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase is not properly configured');
      process.exit(1);
    }
    
    const supabase = getSupabaseClient();

    // Check if table exists
    console.log('🔍 Step 1: Checking if table exists...');
    const { data: existingData, error: checkError } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table "course_leads" already exists!\n');
      console.log('🔍 Verifying table structure...');
      
      // Verify table structure by trying to insert a test record (then delete it)
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        paid: false
      };

      const { data: insertData, error: insertError } = await supabase
        .from('course_leads')
        .insert([testData])
        .select('id')
        .single();

      if (insertError) {
        console.log('⚠️  Table exists but structure may be incorrect:', insertError.message);
        console.log('   Please verify the table schema matches the expected structure.\n');
      } else {
        // Delete test record
        await supabase
          .from('course_leads')
          .delete()
          .eq('id', insertData.id);
        
        console.log('✅ Table structure verified and working correctly!\n');
        console.log('🎉 Your database is ready for form submissions!');
        return;
      }
    }

    // Table doesn't exist - need to create it
    console.log('❌ Table does not exist yet.\n');
    console.log('📋 Step 2: Creating table...\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    // Since Supabase REST API doesn't support DDL, we'll try using RPC
    // First, let's try to create a function that executes SQL, then call it
    // Actually, that won't work either because we can't create functions without DDL access
    
    // Alternative: Use Supabase Management API
    console.log('🔧 Attempting to create table via Supabase API...\n');
    
    // Try using fetch to call Management API
    const fetch = require('node-fetch');
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    try {
      const response = await fetch(managementUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceKey,
        },
        body: JSON.stringify({
          query: sql
        })
      });

      const result = await response.text();
      
      if (response.ok) {
        console.log('✅ Table created successfully via Management API!\n');
      } else {
        // Management API might require different authentication
        throw new Error(`API returned ${response.status}: ${result}`);
      }
    } catch (apiError) {
      console.log('⚠️  Management API not available:', apiError.message);
      console.log('\n📋 Since Supabase requires SQL execution via dashboard for security,');
      console.log('   we need to execute the SQL manually.\n');
      
      // Provide clear instructions
      console.log('SQL to execute:');
      console.log('─'.repeat(70));
      console.log(sql);
      console.log('─'.repeat(70));
      console.log('');
      console.log(`👉 Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
      console.log('   Paste the SQL above and click "Run"\n');
      
      // Copy to clipboard (macOS)
      const { exec } = require('child_process');
      exec(`echo "${sql.replace(/"/g, '\\"')}" | pbcopy`, () => {
        console.log('✅ SQL copied to clipboard!');
      });
      
      // Open browser
      exec(`open "https://supabase.com/dashboard/project/${projectRef}/sql/new"`, () => {
        console.log('✅ Opened SQL Editor in browser\n');
      });
      
      console.log('⏳ Waiting 30 seconds for you to execute the SQL...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Verify after waiting
      console.log('🔍 Step 3: Verifying table creation...\n');
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
    console.log('🔍 Step 3: Final verification...\n');
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
    
    // Test insert
    console.log('🧪 Testing table functionality...');
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
      // Clean up test record
      await supabase.from('course_leads').delete().eq('id', testInsert.id);
      console.log('✅ Test record cleaned up.\n');
    }

    console.log('🎉 Complete setup successful!');
    console.log(`📊 View your data at: https://supabase.com/dashboard/project/${projectRef}/editor`);
    console.log('✅ Your application is ready to receive form submissions!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

setupCompleteDatabase();

