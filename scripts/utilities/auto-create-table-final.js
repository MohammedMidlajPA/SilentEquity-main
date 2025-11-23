#!/usr/bin/env node

/**
 * Final automated table creation
 * Uses browser automation to execute SQL automatically
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

async function autoCreateTable() {
  let browser;
  try {
    console.log('🚀 Automated Table Creation');
    console.log('===========================\n');

    const projectRef = 'vqounfxvykhwbzxpodwq';
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

    // Read SQL
    const sqlFile = path.join(__dirname, '../../docs/supabase/COURSE_LEADS_TABLE.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    sql = sql.replace(/^--.*$/gm, '').trim();

    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    
    console.log(`📡 Opening: ${sqlEditorUrl}`);
    await page.goto(sqlEditorUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    console.log('⏳ Waiting for page to fully load (20 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Check if we need to login
    const pageUrl = page.url();
    if (pageUrl.includes('login') || pageUrl.includes('signin')) {
      console.log('⚠️  Login required - waiting 60 seconds for manual login...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      // Reload after login
      await page.goto(sqlEditorUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('🔍 Finding SQL editor...');
    
    // Wait for and find the editor
    await page.waitForSelector('textarea, .cm-editor, [contenteditable="true"]', { 
      timeout: 30000,
      visible: true 
    });

    // Try multiple editor selectors
    const editorSelectors = [
      'textarea',
      '.cm-editor textarea',
      '.monaco-editor textarea',
      '[contenteditable="true"]'
    ];

    let editorFound = false;
    for (const selector of editorSelectors) {
      try {
        const editor = await page.$(selector);
        if (editor) {
          console.log(`✅ Found editor: ${selector}`);
          
          // Click to focus
          await editor.click({ clickCount: 3 });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Clear existing content
          await page.keyboard.down('Meta');
          await page.keyboard.press('a');
          await page.keyboard.up('Meta');
          await page.keyboard.press('Backspace');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Type SQL
          console.log('📝 Typing SQL (this may take a moment)...');
          await editor.type(sql, { delay: 3 });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          editorFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!editorFound) {
      // Fallback: use clipboard
      console.log('📋 Using clipboard method...');
      await page.evaluate((sqlText) => {
        navigator.clipboard.writeText(sqlText);
      }, sql);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Focus page and paste
      await page.keyboard.down('Meta');
      await page.keyboard.press('v');
      await page.keyboard.up('Meta');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🔍 Finding Run button...');
    
    // Find Run button
    const runSelectors = [
      'button[type="submit"]',
      'button:has-text("Run")',
      'button.run-button',
      '[data-testid="run-button"]'
    ];

    let runClicked = false;
    for (const selector of runSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          const isVisible = await button.isIntersectingViewport();
          if (isVisible) {
            console.log(`✅ Found Run button: ${selector}`);
            await button.click();
            runClicked = true;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Fallback: keyboard shortcut
    if (!runClicked) {
      console.log('⌨️  Using keyboard shortcut (Cmd+Enter)...');
      await page.keyboard.down('Meta');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Meta');
      runClicked = true;
    }

    if (runClicked) {
      console.log('✅ SQL execution triggered!');
      console.log('⏳ Waiting 15 seconds for execution...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Verify
      console.log('\n🔍 Verifying table creation...');
      const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
      
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        
        // Try multiple times with delays
        for (let i = 0; i < 5; i++) {
          const { data, error } = await supabase
            .from('course_leads')
            .select('id')
            .limit(1);

          if (!error) {
            console.log('✅ Table "course_leads" exists and is accessible!');
            console.log('🎉 Database setup complete!');
            await browser.close();
            return;
          }
          
          console.log(`⏳ Attempt ${i + 1}/5: Waiting for table...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        console.log('⚠️  Table not found yet - may need more time to propagate');
      }
    }

    console.log('\n📋 Browser will stay open for 30 seconds for verification...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.substring(0, 500));
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ Browser closed');
    }
  }
}

autoCreateTable();


