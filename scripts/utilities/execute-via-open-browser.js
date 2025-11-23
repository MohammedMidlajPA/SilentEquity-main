#!/usr/bin/env node

/**
 * Execute SQL using the already-open browser
 * Uses AppleScript to control the browser window
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function executeViaOpenBrowser() {
  try {
    console.log('🚀 Executing SQL via Open Browser');
    console.log('=================================\n');

    const projectRef = 'vqounfxvykhwbzxpodwq';
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

    // Read SQL
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    // Copy to clipboard
    exec(`echo "${sql.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" | pbcopy`, (error) => {
      if (error) {
        console.error('Failed to copy to clipboard:', error);
      } else {
        console.log('✅ SQL copied to clipboard');
      }
    });

    // Open SQL Editor
    exec(`open "${sqlEditorUrl}"`, (error) => {
      if (error) {
        console.error('Failed to open browser:', error);
      } else {
        console.log('✅ Opened SQL Editor');
      }
    });

    console.log('\n⏳ Waiting 5 seconds for page to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Use AppleScript to automate (requires accessibility permissions)
    const appleScript = `
      tell application "Google Chrome"
        activate
        delay 2
        tell application "System Events"
          keystroke "v" using command down
          delay 2
          keystroke return using command down
        end tell
      end tell
    `;

    exec(`osascript -e '${appleScript}'`, (error) => {
      if (error) {
        console.log('⚠️  AppleScript automation failed (may need permissions)');
        console.log('   SQL is in clipboard - please paste (Cmd+V) and press Cmd+Enter');
      } else {
        console.log('✅ Automation executed');
      }
    });

    console.log('\n⏳ Waiting 20 seconds for SQL execution...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Verify
    console.log('\n🔍 Verifying table creation...');
    require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });
    const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase
          .from('course_leads')
          .select('id')
          .limit(1);

        if (!error) {
          console.log('✅ Table "course_leads" exists!');
          console.log('🎉 Database setup complete!');
          return;
        }
        
        console.log(`⏳ Attempt ${i + 1}/3: Waiting...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      console.log('⚠️  Table not found - please check browser');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

executeViaOpenBrowser();


