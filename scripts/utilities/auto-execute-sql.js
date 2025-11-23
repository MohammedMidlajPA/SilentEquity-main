#!/usr/bin/env node

/**
 * Automatically execute SQL in Supabase dashboard using browser automation
 * Uses Puppeteer to paste SQL and click Run
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

async function autoExecuteSQL() {
  let browser;
  try {
    console.log('🚀 Automated SQL Execution via Browser');
    console.log('======================================\n');

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

    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Show browser so user can see what's happening
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    console.log(`📡 Navigating to: ${sqlEditorUrl}`);
    await page.goto(sqlEditorUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('⏳ Waiting for SQL editor to load...');
    
    // Wait for the SQL editor (could be a textarea, CodeMirror, or Monaco editor)
    // Try multiple selectors
    const editorSelectors = [
      'textarea',
      '.cm-editor',
      '.monaco-editor textarea',
      '[data-testid="sql-editor"]',
      '.sql-editor',
      'div[contenteditable="true"]'
    ];

    let editorFound = false;
    for (const selector of editorSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`✅ Found editor with selector: ${selector}`);
        editorFound = true;
        
        // Click to focus
        await page.click(selector);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear any existing content
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Paste SQL
        console.log('📝 Pasting SQL...');
        await page.keyboard.type(sql, { delay: 10 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    if (!editorFound) {
      // Fallback: try to find any text input and use clipboard
      console.log('⚠️  Editor not found with standard selectors, trying clipboard method...');
      await page.evaluate((sqlText) => {
        navigator.clipboard.writeText(sqlText);
      }, sql);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to find and focus editor
      await page.keyboard.down('Control');
      await page.keyboard.press('v');
      await page.keyboard.up('Control');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🔍 Looking for Run button...');
    
    // Find and click Run button
    const runButtonSelectors = [
      'button:has-text("Run")',
      'button[type="submit"]',
      '[data-testid="run-button"]',
      '.run-button',
      'button.run-sql',
      'button:contains("Run")'
    ];

    let runClicked = false;
    for (const selector of runButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`✅ Found Run button with selector: ${selector}`);
          await button.click();
          runClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Alternative: Try keyboard shortcut (Cmd+Enter or Ctrl+Enter)
    if (!runClicked) {
      console.log('⌨️  Trying keyboard shortcut (Cmd+Enter)...');
      await page.keyboard.down('Meta'); // Cmd on Mac
      await page.keyboard.press('Enter');
      await page.keyboard.up('Meta');
      runClicked = true;
    }

    console.log('✅ SQL execution triggered!');
    console.log('⏳ Waiting for execution to complete...');
    
    // Wait for success message or result
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check for success indicators
    const successIndicators = [
      'Success',
      'Query executed',
      'completed',
      'successfully'
    ];

    const pageContent = await page.content();
    const hasSuccess = successIndicators.some(indicator => 
      pageContent.toLowerCase().includes(indicator.toLowerCase())
    );

    if (hasSuccess) {
      console.log('✅ SQL executed successfully!');
    } else {
      console.log('⚠️  Execution status unclear - please check browser');
    }

    console.log('\n⏳ Waiting 10 seconds for you to verify in browser...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('\n🔍 Verifying table creation...');
    
    // Verify using Supabase client
    const { getSupabaseClient, isSupabaseConfigured } = require('../../backend/config/supabase');
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('course_leads')
        .select('id')
        .limit(1);

      if (error) {
        console.log('❌ Table not found yet:', error.message);
        console.log('   Please check the browser and ensure SQL executed successfully.');
      } else {
        console.log('✅ Table "course_leads" exists and is accessible!');
        console.log('🎉 Database setup complete!');
      }
    }

    console.log('\n📋 Browser will stay open for 30 seconds for verification...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ Browser closed');
    }
  }
}

autoExecuteSQL();

