#!/usr/bin/env node

/**
 * Interactive Google Sheets Webhook Setup Script
 * Guides users through setting up Google Sheets via Apps Script webhook
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BACKEND_ENV = path.join(__dirname, '..', 'backend', '.env');

// Apps Script code template
const APPS_SCRIPT_CODE = `// Test function - allows you to verify webhook is working via browser
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: "Webhook is active! Use POST requests to send data.",
    status: "ready",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Main function - receives form submission data from backend
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Check if headers exist (if sheet is empty)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Paid']);
    }
    
    // Append the new row
    const row = [
      new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.paid ? 'Yes' : 'No'
    ];
    
    sheet.appendRow(row);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function printSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60) + '\n');
}

function printStep(stepNum, title) {
  console.log(`\n📋 Step ${stepNum}: ${title}`);
  console.log('-'.repeat(60));
}

function printSuccess(message) {
  console.log(`\n✅ ${message}\n`);
}

function printError(message) {
  console.log(`\n❌ ${message}\n`);
}

function printInfo(message) {
  console.log(`\nℹ️  ${message}\n`);
}

function printCode(code) {
  console.log('\n' + '─'.repeat(60));
  console.log('COPY THIS CODE:');
  console.log('─'.repeat(60));
  console.log(code);
  console.log('─'.repeat(60) + '\n');
}

async function testWebhook(webhookUrl) {
  return new Promise((resolve) => {
    try {
      const url = new URL(webhookUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const payload = JSON.stringify({
        name: 'Setup Test',
        email: `test${Date.now()}@setup.com`,
        phone: '+1234567890',
        paid: false
      });

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data);
              resolve(response.success ? true : false);
            } catch (e) {
              resolve(res.statusCode === 200);
            }
          } else {
            resolve(false);
          }
        });
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.write(payload);
      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

function updateEnvFile(webhookUrl, storageBackend) {
  if (!fs.existsSync(BACKEND_ENV)) {
    printError(`Backend .env file not found at: ${BACKEND_ENV}`);
    printInfo('Please create the file first or run this script from the project root.');
    return false;
  }

  let envContent = fs.readFileSync(BACKEND_ENV, 'utf8');
  let updated = false;

  // Update or add webhook URL
  if (envContent.includes('GOOGLE_SHEETS_WEBHOOK_URL=')) {
    envContent = envContent.replace(
      /GOOGLE_SHEETS_WEBHOOK_URL=.*/g,
      `GOOGLE_SHEETS_WEBHOOK_URL=${webhookUrl}`
    );
    updated = true;
  } else {
    envContent += `\n# Google Sheets Webhook (Apps Script)\nGOOGLE_SHEETS_WEBHOOK_URL=${webhookUrl}\n`;
    updated = true;
  }

  // Update or add storage backend
  if (envContent.includes('FORM_STORAGE_BACKEND=')) {
    envContent = envContent.replace(
      /FORM_STORAGE_BACKEND=.*/g,
      `FORM_STORAGE_BACKEND=${storageBackend}`
    );
    updated = true;
  } else {
    envContent += `\n# Storage Backend Selection\nFORM_STORAGE_BACKEND=${storageBackend}\n`;
    updated = true;
  }

  // Backup original file
  fs.writeFileSync(BACKEND_ENV + '.backup', fs.readFileSync(BACKEND_ENV));
  fs.writeFileSync(BACKEND_ENV, envContent);

  return updated;
}

async function main() {
  console.clear();
  printSection('🚀 Google Sheets Webhook Setup');
  console.log('This script will guide you through setting up Google Sheets');
  console.log('integration using Apps Script webhook (no Google Cloud needed!).\n');

  // Step 1: Instructions
  printStep(1, 'Create Google Sheet');
  console.log('1. Go to https://sheets.google.com');
  console.log('2. Click "Blank" to create a new spreadsheet');
  console.log('3. Name it (optional, e.g., "Course Enrollment Leads")');
  console.log('4. Keep this sheet open - you\'ll need it next!');

  await question('\nPress Enter when you have created the Google Sheet...');

  // Step 2: Apps Script Setup
  printStep(2, 'Create Apps Script');
  console.log('1. In your Google Sheet, click Extensions → Apps Script');
  console.log('2. Delete any existing code in the editor');
  console.log('3. Copy and paste the code below:');

  printCode(APPS_SCRIPT_CODE);

  console.log('4. Click Save (💾 icon or Ctrl+S / Cmd+S)');
  console.log('5. Name your project (e.g., "Course Leads Webhook")');

  await question('\nPress Enter when you have pasted and saved the code...');

  // Step 3: Deploy
  printStep(3, 'Deploy as Web App');
  console.log('1. Click Deploy → New deployment');
  console.log('   (If you see "Test deployments", click gear ⚙️ → New deployment)');
  console.log('2. Click "Select type" → Choose "Web app"');
  console.log('3. Configure:');
  console.log('   - Description: "Course Leads Webhook" (optional)');
  console.log('   - Execute as: Me');
  console.log('   - Who has access: Anyone (IMPORTANT!)');
  console.log('4. Click Deploy');
  console.log('5. Authorize the script (click "Authorize access" → Allow)');
  console.log('6. Copy the Web App URL (starts with https://script.google.com/...)');

  const webhookUrl = await question('\nPaste your Web App URL here: ');

  // Validate URL
  try {
    const url = new URL(webhookUrl.trim());
    if (!url.hostname.includes('script.google.com')) {
      printError('URL must be from script.google.com');
      rl.close();
      process.exit(1);
    }
  } catch (error) {
    printError('Invalid URL format');
    rl.close();
    process.exit(1);
  }

  const cleanUrl = webhookUrl.trim();

  // Step 4: Test
  printStep(4, 'Test Webhook');
  console.log('Testing your webhook connection...');

  const testResult = await testWebhook(cleanUrl);
  
  if (testResult) {
    printSuccess('Webhook test successful!');
    console.log('Check your Google Sheet - you should see a test row.');
  } else {
    printError('Webhook test failed!');
    console.log('Common issues:');
    console.log('- Make sure "Who has access" is set to "Anyone"');
    console.log('- Make sure the script is deployed (not just saved)');
    console.log('- Try redeploying the script');
    
    const continueAnyway = await question('\nContinue anyway? (y/n): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      rl.close();
      process.exit(1);
    }
  }

  // Step 5: Storage Backend Selection
  printStep(5, 'Storage Backend Selection');
  console.log('Choose how to store form submissions:');
  console.log('1. google_sheets - Only Google Sheets');
  console.log('2. both - Save to both Supabase and Google Sheets (recommended)');
  console.log('3. auto - Use Supabase first, fallback to Google Sheets');

  const backendChoice = await question('\nEnter choice (1-3, default: 2): ');

  let storageBackend = 'both';
  if (backendChoice === '1') {
    storageBackend = 'google_sheets';
  } else if (backendChoice === '3') {
    storageBackend = 'auto';
  }

  // Step 6: Update .env
  printStep(6, 'Update Configuration');
  console.log(`Updating ${BACKEND_ENV}...`);

  const updated = updateEnvFile(cleanUrl, storageBackend);

  if (updated) {
    printSuccess('Configuration updated successfully!');
    console.log(`\nAdded to ${BACKEND_ENV}:`);
    console.log(`  GOOGLE_SHEETS_WEBHOOK_URL=${cleanUrl}`);
    console.log(`  FORM_STORAGE_BACKEND=${storageBackend}`);
    console.log(`\nBackup saved to: ${BACKEND_ENV}.backup`);
  } else {
    printError('Failed to update configuration file');
    rl.close();
    process.exit(1);
  }

  // Final instructions
  printSection('✅ Setup Complete!');
  console.log('Next steps:');
  console.log('1. Restart your backend server:');
  console.log('   cd backend && npm start');
  console.log('2. Test a form submission');
  console.log('3. Check your Google Sheet for new rows');
  console.log('\nFor troubleshooting, see: docs/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md\n');

  rl.close();
}

// Handle errors
process.on('SIGINT', () => {
  console.log('\n\nSetup cancelled.');
  rl.close();
  process.exit(0);
});

main().catch((error) => {
  printError(`Setup failed: ${error.message}`);
  console.error(error);
  rl.close();
  process.exit(1);
});

