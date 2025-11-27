#!/usr/bin/env node

/**
 * Restart Backend and Test Fixes
 */

const { exec } = require('child_process');
const http = require('http');

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
      timeout: 5000
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

async function testBlocking() {
  console.log('\n🧪 Testing Test Data Blocking\n');
  
  const testData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    phone: '+1234567890'
  };

  try {
    const response = await makeRequest('http://localhost:5001/api/course/join', {
      method: 'POST',
      body: testData
    });

    if (response.status === 400 && response.body.message?.includes('Invalid')) {
      console.log('✅ Test data BLOCKED correctly');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.body.message}`);
      return true;
    } else {
      console.log('❌ Test data NOT blocked');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function testRealData() {
  console.log('\n✅ Testing Real Data Acceptance\n');
  
  const realData = {
    name: 'John Smith',
    email: `johnsmith${Date.now()}@gmail.com`,
    phone: '+1234567890'
  };

  try {
    const response = await makeRequest('http://localhost:5001/api/course/join', {
      method: 'POST',
      body: realData
    });

    if (response.status === 201 && response.body.success) {
      console.log('✅ Real data ACCEPTED correctly');
      return true;
    } else {
      console.log('❌ Real data REJECTED');
      console.log(`   Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

console.log('\n⚠️  IMPORTANT: Please restart your backend server for changes to take effect!');
console.log('   Run: cd backend && npm start\n');

setTimeout(async () => {
  const blocked = await testBlocking();
  const accepted = await testRealData();
  
  console.log('\n' + '='.repeat(60));
  if (blocked && accepted) {
    console.log('✅ All tests passed! Fixes are working correctly.');
  } else {
    console.log('⚠️  Backend may need to be restarted for changes to take effect.');
  }
  console.log('');
}, 2000);





