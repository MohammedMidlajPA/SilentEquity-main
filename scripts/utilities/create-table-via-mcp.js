#!/usr/bin/env node

/**
 * Create course_leads table using Supabase MCP server
 * Uses the MCP endpoint to execute SQL directly
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const fs = require('fs');

async function createTableViaMCP() {
  try {
    console.log('🚀 Creating Database via Supabase MCP');
    console.log('=====================================\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const projectRef = 'vqounfxvykhwbzxpodwq';

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
      process.exit(1);
    }

    console.log(`📡 Project: ${projectRef}`);
    console.log(`📡 URL: ${supabaseUrl}\n`);

    // Read SQL file
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    console.log('📋 SQL to execute:');
    console.log('─'.repeat(70));
    console.log(sql);
    console.log('─'.repeat(70));
    console.log('');

    // Try Supabase MCP endpoint
    const mcpUrl = `https://mcp.supabase.com/mcp?project_ref=${projectRef}`;
    console.log(`🔧 Attempting MCP endpoint: ${mcpUrl}\n`);

    // Use built-in fetch (Node 18+)
    const fetch = globalThis.fetch;

    try {
      // Try MCP endpoint with SQL execution
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
        },
        body: JSON.stringify({
          method: 'execute_sql',
          params: {
            query: sql
          }
        })
      });

      const result = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', result);

      if (response.ok) {
        console.log('\n✅ Table created successfully via MCP!');
        return;
      } else {
        throw new Error(`MCP API returned ${response.status}: ${result}`);
      }
    } catch (mcpError) {
      console.log('⚠️  MCP endpoint error:', mcpError.message);
      console.log('\n🔧 Trying alternative: Supabase Management API...\n');

      // Try Management API
      const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
      
      const mgmtResponse = await fetch(managementUrl, {
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

      const mgmtResult = await mgmtResponse.text();
      console.log('Management API status:', mgmtResponse.status);
      console.log('Management API response:', mgmtResult);

      if (mgmtResponse.ok) {
        console.log('\n✅ Table created successfully via Management API!');
        return;
      } else {
        throw new Error(`Management API returned ${mgmtResponse.status}: ${mgmtResult}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Fallback: Use Supabase JS client to verify/create via RPC if possible
    console.log('\n🔧 Trying Supabase JS client approach...\n');
    
    try {
      const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
      
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      const supabase = getSupabaseClient();
      
      // Check if table exists
      const { data, error: checkError } = await supabase
        .from('course_leads')
        .select('id')
        .limit(1);

      if (!checkError) {
        console.log('✅ Table already exists!');
        return;
      }

      // Table doesn't exist - provide instructions
      console.log('❌ Table does not exist and cannot be created programmatically.');
      console.log('   Supabase requires SQL execution via dashboard for security.\n');
      console.log('📋 Please run the SQL in Supabase SQL Editor:');
      console.log(`   👉 https://supabase.com/dashboard/project/vqounfxvykhwbzxpodwq/sql/new\n`);
      
      process.exit(1);
    } catch (clientError) {
      console.error('Client error:', clientError.message);
      process.exit(1);
    }
  }
}

createTableViaMCP();

