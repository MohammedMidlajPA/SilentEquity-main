#!/usr/bin/env node

/**
 * Test form submission with real data to verify Supabase integration
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5001/api/course/join';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testFormSubmission() {
  console.log('🧪 Testing Form Submission with Real Data\n');
  console.log('API URL:', API_URL);
  console.log('');
  
  const timestamp = Date.now();
  const testData = {
    name: `Real User ${timestamp}`,
    email: `realuser${timestamp}@gmail.com`,
    phone: '+919876543210'
  };
  
  console.log('📝 Test Data:');
  console.log('  Name:', testData.name);
  console.log('  Email:', testData.email);
  console.log('  Phone:', testData.phone);
  console.log('');
  
  try {
    console.log('⏳ Sending request...');
    const response = await makeRequest(API_URL, {
      method: 'POST',
      body: testData
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('');
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Form submission successful!');
      console.log('✅ Checkout URL:', response.data.checkoutUrl);
      console.log('');
      console.log('⚠️  Now check Supabase database to verify data was saved');
      return true;
    } else {
      console.log('❌ Form submission failed');
      console.log('Error:', response.data.message || response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Backend server is not running. Start it with: cd backend && npm start');
    }
    return false;
  }
}

if (require.main === module) {
  testFormSubmission()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testFormSubmission };





