#!/usr/bin/env node

/**
 * Complete automated SQL execution script
 * Copies SQL, opens browser, and provides clear instructions
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

async function executeSQLAutomated() {
  try {
    console.log('🚀 Automated SQL Execution Script');
    console.log('==================================\n');

    const projectRef = 'vqounfxvykhwbzxpodwq';
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

    // Read SQL file
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    console.log('📋 SQL to execute:');
    console.log('─'.repeat(70));
    console.log(sql);
    console.log('─'.repeat(70));
    console.log('');

    // Copy to clipboard (macOS)
    exec(`echo "${sql.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" | pbcopy`, (error) => {
      if (error) {
        console.error('❌ Failed to copy to clipboard:', error.message);
      } else {
        console.log('✅ SQL copied to clipboard');
      }
    });

    // Open SQL Editor
    exec(`open "${sqlEditorUrl}"`, (error) => {
      if (error) {
        console.error('❌ Failed to open browser:', error.message);
      } else {
        console.log('✅ Opened SQL Editor in browser');
      }
    });

    console.log('\n📋 Instructions:');
    console.log('   1. SQL is already in your clipboard');
    console.log('   2. Click in the SQL Editor (should be open)');
    console.log('   3. Paste: Cmd+V');
    console.log('   4. Click "Run" button or press Cmd+Enter');
    console.log('   5. Wait for success message\n');

    console.log('⏳ Waiting 60 seconds for you to execute the SQL...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Verify
    console.log('\n🔍 Verifying table creation...\n');
    const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
    
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase not configured');
      return;
    }

    const supabase = getSupabaseClient();
    
    // Try multiple times with delays
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabase
        .from('course_leads')
        .select('id')
        .limit(1);

      if (!error) {
        console.log('✅ Table "course_leads" exists and is accessible!');
        console.log('✅ Index "course_leads_email_idx" is configured.');
        console.log('\n🎉 Database setup complete!');
        console.log(`📊 View your data at: https://supabase.com/dashboard/project/${projectRef}/editor`);
        return;
      }
      
      if (i < 4) {
        console.log(`⏳ Attempt ${i + 1}/5: Table not found yet, waiting 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('⚠️  Table not found after 5 attempts');
    console.log('   Please verify:');
    console.log('   1. SQL was pasted correctly');
    console.log('   2. "Run" button was clicked');
    console.log('   3. Success message appeared');
    console.log('\n   Run this script again to verify after executing SQL.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.substring(0, 300));
    }
  }
}

executeSQLAutomated();


