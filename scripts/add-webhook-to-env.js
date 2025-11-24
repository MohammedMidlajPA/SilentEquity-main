#!/usr/bin/env node

/**
 * Add Google Sheets Webhook URL to backend/.env
 */

const fs = require('fs');
const path = require('path');

const BACKEND_ENV = path.join(__dirname, '..', 'backend', '.env');
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwqhdPE6XwPiXHBB3-LP5zvFca21n86aNh6ExQSnlhirGJBpFRB3Q57kJ0eYTc6La6n/exec';

if (!fs.existsSync(BACKEND_ENV)) {
  console.error(`❌ Backend .env file not found at: ${BACKEND_ENV}`);
  console.log('Please create the file first.');
  process.exit(1);
}

let envContent = fs.readFileSync(BACKEND_ENV, 'utf8');
let updated = false;

// Update or add webhook URL
if (envContent.includes('GOOGLE_SHEETS_WEBHOOK_URL=')) {
  envContent = envContent.replace(
    /GOOGLE_SHEETS_WEBHOOK_URL=.*/g,
    `GOOGLE_SHEETS_WEBHOOK_URL=${WEBHOOK_URL}`
  );
  updated = true;
  console.log('✅ Updated GOOGLE_SHEETS_WEBHOOK_URL');
} else {
  envContent += `\n# Google Sheets Webhook (Apps Script)\nGOOGLE_SHEETS_WEBHOOK_URL=${WEBHOOK_URL}\n`;
  updated = true;
  console.log('✅ Added GOOGLE_SHEETS_WEBHOOK_URL');
}

// Update or add storage backend (default to 'both' if not set)
if (!envContent.includes('FORM_STORAGE_BACKEND=')) {
  envContent += `\n# Storage Backend Selection\nFORM_STORAGE_BACKEND=both\n`;
  console.log('✅ Added FORM_STORAGE_BACKEND=both');
}

// Backup original file
const backupPath = BACKEND_ENV + '.backup.' + Date.now();
fs.writeFileSync(backupPath, fs.readFileSync(BACKEND_ENV));
console.log(`✅ Backup saved to: ${backupPath}`);

// Write updated content
fs.writeFileSync(BACKEND_ENV, envContent);

console.log('\n✅ Configuration updated successfully!');
console.log(`\nWebhook URL: ${WEBHOOK_URL}`);
console.log('\nNext steps:');
console.log('1. Test the webhook: node scripts/test-google-sheets-webhook.js');
console.log('2. Restart your backend server');
console.log('3. Submit a test form to verify it works\n');

