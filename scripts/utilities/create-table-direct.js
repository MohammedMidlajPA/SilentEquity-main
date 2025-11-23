#!/usr/bin/env node

/**
 * Create course_leads table directly using PostgreSQL connection
 * Uses Supabase connection pooling or direct database connection
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const { Pool } = require('pg');
const fs = require('fs');

async function createTable() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
      process.exit(1);
    }

    // Extract project ref
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!match) {
      console.error('❌ Invalid Supabase URL format');
      process.exit(1);
    }

    const projectRef = match[1];
    console.log('🔧 Creating course_leads table in Supabase project:', projectRef);
    console.log('');

    // Try using Supabase connection pooling endpoint
    // Supabase provides a connection pooler at: db.{project_ref}.supabase.co:6543
    // But we need the database password, not the service role key
    
    // Alternative: Use Supabase REST API to execute via a function
    // Or use the direct connection if we can get the password
    
    // For now, let's try using the Supabase JS client with RPC
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    });

    // Read SQL file
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Remove comments
    sql = sql.replace(/^--.*$/gm, '').trim();
    
    // Split into individual statements
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    console.log('📡 Attempting to execute SQL via Supabase API...\n');

    // Try to execute each statement using Supabase's query builder
    // Since we can't execute raw SQL directly, we'll try to create the table
    // by using Supabase's table creation API if available
    
    // Actually, Supabase doesn't expose DDL via REST API for security
    // We need to use the Management API or direct PostgreSQL connection
    
    // Let's try using the Management API with proper authentication
    const fetch = require('node-fetch');
    
    // Try Management API endpoint
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    console.log('Attempting Management API...');
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
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ Table created successfully!');
    } else {
      throw new Error(`API Error: ${result}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Fallback: Provide instructions
    const supabaseUrl = process.env.SUPABASE_URL;
    const match = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/);
    const projectRef = match ? match[1] : 'unknown';
    
    console.error('\n📋 Since direct SQL execution requires database password,');
    console.error('   please run the SQL manually in Supabase SQL Editor:');
    console.error(`   👉 https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
    
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8').replace(/^--.*$/gm, '').trim();
    console.log('SQL to execute:');
    console.log('─'.repeat(70));
    console.log(sql);
    console.log('─'.repeat(70));
    
    process.exit(1);
  }
}

createTable();


