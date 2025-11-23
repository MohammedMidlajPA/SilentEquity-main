#!/usr/bin/env node

/**
 * Execute SQL directly using PostgreSQL connection
 * Constructs connection string from Supabase URL and Service Role Key
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

// Try to use pg library if available, otherwise provide instructions
let pg;
try {
  pg = require('pg');
} catch (e) {
  console.log('⚠️  pg library not available. Installing...');
  console.log('   Run: npm install pg --save-dev');
  process.exit(1);
}

async function executeSQL() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
  }

  // Extract project ref and construct connection string
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  const projectRef = match[1];
  
  // Supabase connection string format:
  // postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  // We need the database password, which is different from the service role key
  
  console.log('📋 To execute SQL directly, you need the database password.');
  console.log('   Get it from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database');
  console.log('');
  console.log('   Or run the SQL manually in the SQL Editor:');
  console.log('   👉 https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('');
  
  // Read SQL file
  const fs = require('fs');
  const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8').replace(/^--.*$/gm, '').trim();
  
  console.log('SQL to execute:');
  console.log('─'.repeat(70));
  console.log(sql);
  console.log('─'.repeat(70));
  
  process.exit(0);
}

executeSQL();


