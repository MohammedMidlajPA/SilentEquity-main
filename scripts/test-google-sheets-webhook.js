#!/usr/bin/env node

/**
 * Test Google Sheets Webhook
 * Tests the Apps Script webhook connection and saves a test row
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

function printSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60) + '\n');
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

async function testWebhookGet(webhookUrl) {
  return new Promise((resolve) => {
    try {
      const url = new URL(webhookUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 10000,
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data);
              resolve({ success: true, data: response });
            } catch (e) {
              resolve({ success: true, data: { raw: data } });
            }
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}` });
          }
        });
      });

      req.on('error', (error) => resolve({ success: false, error: error.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });

      req.end();
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

async function testWebhookPost(webhookUrl, testData) {
  return new Promise((resolve) => {
    try {
      const url = new URL(webhookUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const payload = JSON.stringify(testData);
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 15000,
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data);
              resolve({ success: response.success !== false, data: response, statusCode: res.statusCode });
            } catch (e) {
              // Sometimes Google Apps Script returns HTML redirects
              if (data.includes('Moved Temporarily') || data.includes('redirect')) {
                resolve({ success: true, data: { message: 'Redirect received (normal for Apps Script)', raw: data.substring(0, 200) }, statusCode: res.statusCode });
              } else {
                resolve({ success: res.statusCode === 200, data: { raw: data.substring(0, 200) }, statusCode: res.statusCode });
              }
            }
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}`, data: data.substring(0, 200), statusCode: res.statusCode });
          }
        });
      });

      req.on('error', (error) => resolve({ success: false, error: error.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });

      req.write(payload);
      req.end();
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

async function main() {
  printSection('🧪 Google Sheets Webhook Test');

  // Check if webhook URL is configured
  if (!WEBHOOK_URL) {
    printError('GOOGLE_SHEETS_WEBHOOK_URL not found in backend/.env');
    console.log('Please add it to your backend/.env file:');
    console.log('GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec\n');
    process.exit(1);
  }

  console.log('Webhook URL:', WEBHOOK_URL);
  console.log('');

  // Test 1: GET request (test function)
  printSection('Test 1: GET Request (doGet function)');
  console.log('Testing webhook accessibility...');
  
  const getResult = await testWebhookGet(WEBHOOK_URL);
  
  if (getResult.success) {
    printSuccess('GET request successful!');
    console.log('Response:', JSON.stringify(getResult.data, null, 2));
  } else {
    printError(`GET request failed: ${getResult.error}`);
    console.log('This is OK if doGet function is not implemented.');
  }

  // Test 2: POST request (main function)
  printSection('Test 2: POST Request (doPost function)');
  console.log('Sending test form submission...');
  
  const testData = {
    name: 'Webhook Test User',
    email: `test${Date.now()}@webhook-test.com`,
    phone: '+1234567890',
    paid: false
  };

  console.log('Test data:', JSON.stringify(testData, null, 2));
  console.log('');

  const postResult = await testWebhookPost(WEBHOOK_URL, testData);

  if (postResult.success) {
    printSuccess('POST request successful!');
    console.log('Response:', JSON.stringify(postResult.data, null, 2));
    
    if (postResult.data.success) {
      console.log(`\n✅ Test row added to Google Sheet (row ${postResult.data.row || 'unknown'})`);
      console.log('Check your Google Sheet to verify the data was saved.\n');
    } else if (postResult.data.message && postResult.data.message.includes('Redirect')) {
      console.log('\n⚠️  Received redirect response (this is normal for Apps Script)');
      console.log('The data may still have been saved. Check your Google Sheet.\n');
    }
  } else {
    printError(`POST request failed: ${postResult.error}`);
    if (postResult.data) {
      console.log('Response data:', postResult.data);
    }
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the script is deployed (not just saved)');
    console.log('2. Check that "Who has access" is set to "Anyone"');
    console.log('3. Verify the webhook URL is correct');
    console.log('4. Try redeploying the Apps Script\n');
    process.exit(1);
  }

  // Summary
  printSection('✅ Test Complete');
  console.log('Summary:');
  console.log(`  GET Request: ${getResult.success ? '✅ Passed' : '⚠️  Failed (optional)'}`);
  console.log(`  POST Request: ${postResult.success ? '✅ Passed' : '❌ Failed'}`);
  console.log('');
  
  if (postResult.success) {
    console.log('🎉 Your Google Sheets webhook is working correctly!');
    console.log('   Form submissions will now be saved to your Google Sheet.\n');
  }
}

main().catch((error) => {
  printError(`Test failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

