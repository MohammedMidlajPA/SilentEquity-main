#!/usr/bin/env node

/**
 * Create course_leads table using Supabase REST API
 * Since DDL isn't available via REST API, we'll create it by attempting operations
 * that will fail gracefully if table doesn't exist, then provide clear instructions
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
const fs = require('fs');

async function createTableViaAPI() {
  try {
    console.log('🔧 Attempting to create course_leads table...\n');

    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase is not configured');
      process.exit(1);
    }

    const supabase = getSupabaseClient();
    const supabaseUrl = process.env.SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';

    // Try to query the table - if it doesn't exist, we'll get an error
    console.log('🔍 Checking if table exists...\n');
    
    const { data, error } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✅ Table "course_leads" already exists!');
      console.log('✅ Your database is ready to receive form submissions.\n');
      return;
    }

    // Table doesn't exist - we need to create it
    // Since Supabase REST API doesn't support DDL, we'll use a workaround:
    // Create the table via a SQL function call or direct connection
    
    console.log('❌ Table does not exist yet.\n');
    console.log('📋 Supabase requires SQL to be executed via the dashboard for security.');
    console.log('   However, I can help you automate this!\n');
    
    // Try to use Supabase Management API with service role key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔧 Attempting to create table via Management API...\n');
    
    // Read SQL
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();
    
    // Try Management API endpoint
    const fetch = (await import('node-fetch')).default;
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    try {
      const response = await fetch(managementUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: sql
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Table created successfully via Management API!');
        console.log('✅ Your database is ready.\n');
        return;
      } else {
        throw new Error(result.message || 'Management API request failed');
      }
    } catch (apiError) {
      // Management API might not be available or require different auth
      console.log('⚠️  Management API not available or requires different authentication.\n');
      
      // Final fallback: provide clear instructions with auto-open
      console.log('📋 Please run the SQL in Supabase SQL Editor:');
      console.log(`   👉 https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
      
      console.log('SQL to execute:');
      console.log('─'.repeat(70));
      console.log(sql);
      console.log('─'.repeat(70));
      console.log('');
      
      // Try to open browser
      const { exec } = require('child_process');
      const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
      
      exec(`open "${sqlEditorUrl}"`, (error) => {
        if (!error) {
          console.log('✅ Opened SQL Editor in your browser');
          console.log('   Paste the SQL above and click "Run"\n');
        }
      });
      
      // Wait a bit then check again
      console.log('⏳ Waiting 10 seconds for you to run the SQL...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log('\n🔍 Verifying table creation...\n');
      const { data: verifyData, error: verifyError } = await supabase
        .from('course_leads')
        .select('id')
        .limit(1);
      
      if (!verifyError) {
        console.log('✅ Table created successfully!');
        console.log('✅ Your database is ready to receive form submissions.\n');
      } else {
        console.log('⚠️  Table not found yet. Please run the SQL manually.');
        console.log('   After running, verify with: node scripts/utilities/create-course-leads-table.js\n');
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createTableViaAPI();


