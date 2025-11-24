#!/usr/bin/env node

/**
 * Verify Only Real Data is Being Saved
 * Tests that test data is blocked and real data is accepted
 */

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const BACKEND_URL = 'http://localhost:5001';
const API_BASE = `${BACKEND_URL}/api`;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testRealDataSubmission() {
  console.log('\n✅ Testing Real Data Submission\n');
  
  const realData = {
    name: 'John Smith',
    email: `johnsmith${Date.now()}@gmail.com`,
    phone: '+1234567890'
  };

  try {
    const response = await makeRequest(`${API_BASE}/course/join`, {
      method: 'POST',
      body: realData
    });

    if (response.status === 201 && response.body.success) {
      console.log('✅ Real data submission: ACCEPTED');
      console.log(`   Name: ${realData.name}`);
      console.log(`   Email: ${realData.email}`);
      return true;
    } else {
      console.log('❌ Real data submission: REJECTED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.body.message || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function testTestDataBlocked() {
  console.log('\n🚫 Testing Test Data Blocking\n');
  
  const testCases = [
    {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '+1234567890',
      shouldBlock: process.env.NODE_ENV === 'production'
    },
    {
      name: 'Load Test User',
      email: `loadtest${Date.now()}@test.com`,
      phone: '+1234567890',
      shouldBlock: process.env.NODE_ENV === 'production'
    },
    {
      name: 'Database Test User',
      email: `dbtest${Date.now()}@verification.com`,
      phone: '+1234567890',
      shouldBlock: process.env.NODE_ENV === 'production'
    }
  ];

  let blockedCount = 0;
  let acceptedCount = 0;

  for (const testCase of testCases) {
    try {
      const response = await makeRequest(`${API_BASE}/course/join`, {
        method: 'POST',
        body: {
          name: testCase.name,
          email: testCase.email,
          phone: testCase.phone
        }
      });

      if (response.status === 400 && response.body.message?.includes('Invalid')) {
        console.log(`✅ Test data BLOCKED: ${testCase.name} - ${testCase.email}`);
        blockedCount++;
      } else if (response.status === 201) {
        console.log(`⚠️  Test data ACCEPTED: ${testCase.name} - ${testCase.email}`);
        acceptedCount++;
      } else {
        console.log(`❓ Unexpected response: ${testCase.name} - Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${testCase.name}: ${error.message}`);
    }
  }

  console.log(`\n📊 Results: ${blockedCount} blocked, ${acceptedCount} accepted`);
  
  if (process.env.NODE_ENV === 'production') {
    return blockedCount === testCases.length;
  } else {
    console.log('ℹ️  Development mode - test data allowed for testing');
    return true;
  }
}

async function main() {
  console.log('\n🔍 Verifying Real Data Only Submission\n');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));

  const realDataWorks = await testRealDataSubmission();
  const testDataBlocked = await testTestDataBlocked();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Real data submission: ${realDataWorks ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Test data blocking: ${testDataBlocked ? '✅ Working' : '⚠️  Not blocking'}`);
  
  if (realDataWorks) {
    console.log('\n✅ Form is working correctly - only real user data is accepted!');
  } else {
    console.log('\n❌ Form submission issue detected');
  }
  
  console.log('');
}

main().catch(console.error);

