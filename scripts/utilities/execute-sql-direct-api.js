#!/usr/bin/env node

/**
 * Direct SQL execution using Supabase Management API
 * Uses service role key to execute SQL directly
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const fs = require('fs');

async function executeSQLDirect() {
  try {
    console.log('🚀 Direct SQL Execution via Supabase API');
    console.log('=========================================\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const projectRef = 'vqounfxvykhwbzxpodwq';

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Credentials not found');
      process.exit(1);
    }

    // Read SQL
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    console.log('📋 Executing SQL...\n');
    console.log(sql.substring(0, 100) + '...\n');

    // Try Supabase Management API
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    console.log('🔧 Attempting Management API...');
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
    console.log('Status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('\n✅ SQL executed successfully!');
      return true;
    }

    // Try alternative: Use Supabase REST API with exec_sql function
    console.log('\n🔧 Trying REST API exec_sql...');
    const restUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
    
    const restResponse = await fetch(restUrl, {
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

    const restResult = await restResponse.text();
    console.log('REST Status:', restResponse.status);
    console.log('REST Response:', restResult);

    if (restResponse.ok) {
      console.log('\n✅ SQL executed via REST API!');
      return true;
    }

    // Try creating table via Supabase JS client by attempting operations
    console.log('\n🔧 Trying Supabase JS client approach...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey);

    // Try to create table by using a workaround - create a function that executes SQL
    // First, let's try to execute via a custom RPC if it exists
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    });

    if (!rpcError) {
      console.log('✅ SQL executed via RPC!');
      return true;
    }

    throw new Error('All methods failed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  }
}

// Execute and verify
executeSQLDirect().then(async (success) => {
  if (success) {
    console.log('\n⏳ Waiting 5 seconds for table to be created...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🔍 Verifying table creation...');
    const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('course_leads')
        .select('id')
        .limit(1);

      if (error) {
        console.log('⚠️  Table not found:', error.message);
        console.log('   This may take a few moments to propagate...');
      } else {
        console.log('✅ Table verified and accessible!');
        console.log('🎉 Database setup complete!');
      }
    }
  } else {
    console.log('\n⚠️  Could not execute SQL automatically');
    console.log('   Supabase requires SQL execution via dashboard');
    process.exit(1);
  }
});


