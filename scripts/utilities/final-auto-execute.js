#!/usr/bin/env node

/**
 * Final automated SQL execution
 * Handles authentication and executes SQL automatically
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

async function finalAutoExecute() {
  let browser;
  try {
    console.log('🚀 Final Automated SQL Execution');
    console.log('=================================\n');

    const projectRef = 'vqounfxvykhwbzxpodwq';
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

    // Read SQL
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    console.log('🌐 Launching browser (headless: false)...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    console.log(`📡 Opening: ${sqlEditorUrl}`);
    await page.goto(sqlEditorUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    console.log('⏳ Waiting for page to load (15 seconds for login if needed)...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log('🔍 Looking for SQL editor...');
    
    // Try to find editor - wait longer
    try {
      await page.waitForSelector('textarea, .cm-editor, .monaco-editor', { 
        timeout: 30000,
        visible: true 
      });
    } catch (e) {
      console.log('⚠️  Editor not immediately visible, trying alternative approach...');
    }

    // Get page content to check if we're on login page
    const pageContent = await page.content();
    if (pageContent.includes('Sign in') || pageContent.includes('Login')) {
      console.log('⚠️  Login required - please log in manually in the browser');
      console.log('⏳ Waiting 60 seconds for you to log in...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }

    // Try multiple times to find and interact with editor
    let success = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(`\n🔄 Attempt ${attempt}/5: Finding editor...`);
      
      try {
        // Try to find editor
        const editor = await page.$('textarea, .cm-editor textarea, .monaco-editor textarea');
        if (editor) {
          console.log('✅ Found editor!');
          
          // Focus and clear
          await editor.click({ clickCount: 3 });
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Type SQL
          console.log('📝 Typing SQL...');
          await editor.type(sql, { delay: 5 });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find and click Run button
          console.log('🔍 Looking for Run button...');
          const runButton = await page.$('button[type="submit"], button:has-text("Run"), .run-button');
          if (runButton) {
            await runButton.click();
            console.log('✅ Clicked Run button!');
            success = true;
            break;
          } else {
            // Try keyboard shortcut
            console.log('⌨️  Trying Cmd+Enter...');
            await page.keyboard.down('Meta');
            await page.keyboard.press('Enter');
            await page.keyboard.up('Meta');
            success = true;
            break;
          }
        }
      } catch (e) {
        console.log(`⚠️  Attempt ${attempt} failed: ${e.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (success) {
      console.log('\n✅ SQL execution triggered!');
      console.log('⏳ Waiting 10 seconds for execution...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Verify
      console.log('\n🔍 Verifying table creation...');
      const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
      
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('course_leads')
          .select('id')
          .limit(1);

        if (error) {
          console.log('⚠️  Table not found yet:', error.message);
          console.log('   Please check browser - SQL may still be executing');
        } else {
          console.log('✅ Table "course_leads" exists!');
          console.log('🎉 Database setup complete!');
        }
      }
    } else {
      console.log('\n⚠️  Could not automatically execute SQL');
      console.log('   Browser is open - please execute manually:');
      console.log('   1. Paste SQL (Cmd+V)');
      console.log('   2. Click Run');
    }

    console.log('\n📋 Browser will stay open for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

finalAutoExecute();


