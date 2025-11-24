#!/usr/bin/env node

/**
 * Test Form Submission to Google Sheets
 * Simulates a form submission and checks if it reaches Google Sheets
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { 
  isGoogleSheetsConfigured, 
  isGoogleSheetsWebhookConfigured,
  saveLeadToSheets 
} = require(path.join(__dirname, '..', 'backend', 'config', 'googleSheets'));

async function testFormSubmission() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing Form Submission to Google Sheets');
  console.log('='.repeat(60) + '\n');

  // Check configuration
  console.log('Configuration Check:');
  console.log('  Google Sheets configured:', isGoogleSheetsConfigured() ? '✅' : '❌');
  console.log('  Webhook configured:', isGoogleSheetsWebhookConfigured() ? '✅' : '❌');
  console.log('  Webhook URL:', process.env.GOOGLE_SHEETS_WEBHOOK_URL ? process.env.GOOGLE_SHEETS_WEBHOOK_URL.substring(0, 50) + '...' : 'NOT SET');
  console.log('  Storage Backend:', process.env.FORM_STORAGE_BACKEND || 'not set');
  console.log('');

  if (!isGoogleSheetsConfigured()) {
    console.error('❌ Google Sheets is not configured!');
    console.log('Make sure GOOGLE_SHEETS_WEBHOOK_URL is set in backend/.env\n');
    process.exit(1);
  }

  // Test data
  const testLead = {
    name: 'Test Form Submission',
    email: `testform${Date.now()}@test.com`,
    phone: '+1234567890',
    paid: false
  };

  console.log('Test Data:');
  console.log(JSON.stringify(testLead, null, 2));
  console.log('');

  try {
    console.log('Sending form submission to Google Sheets...');
    const result = await saveLeadToSheets(testLead);

    if (result) {
      console.log('\n✅ SUCCESS! Form submission saved to Google Sheets');
      console.log('   Row ID:', result);
      console.log('\n📋 Next steps:');
      console.log('   1. Check your Google Sheet - you should see the new row');
      console.log('   2. If you see it, your webhook is working!');
      console.log('   3. Restart your backend server if it\'s running');
      console.log('   4. Try submitting a real form from your website\n');
    } else {
      console.log('\n⚠️  Form submission returned null');
      console.log('   This might mean:');
      console.log('   - Webhook is not responding correctly');
      console.log('   - Check your Google Sheet to see if data was saved anyway');
      console.log('   - Check backend logs for errors\n');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure your Apps Script is deployed');
    console.error('2. Check that "Who has access" is set to "Anyone"');
    console.error('3. Verify the webhook URL is correct');
    console.error('4. Try redeploying your Apps Script');
    console.error('5. Check backend logs for more details\n');
    process.exit(1);
  }
}

testFormSubmission().catch(console.error);

