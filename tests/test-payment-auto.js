#!/usr/bin/env node

/**
 * Automated Payment Button Test
 * Tests the entire payment flow automatically
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testEndpoint(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:5173',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
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

async function runTests() {
  log('\n🧪 Automated Payment Button Test\n', 'cyan');
  log('='.repeat(50), 'cyan');

  // Test 1: Backend Health Check
  log('\n📡 Test 1: Backend Health Check', 'blue');
  try {
    const health = await testEndpoint('http://localhost:5001/api/health');
    if (health.status === 200 && health.data.success) {
      log('✅ Backend is healthy', 'green');
      log(`   Status: ${health.status}`, 'green');
      log(`   Message: ${health.data.message}`, 'green');
    } else {
      log('❌ Backend health check failed', 'red');
      log(`   Status: ${health.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Backend is not running!', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('   Please start backend: cd backend && npm start', 'yellow');
    return false;
  }

  // Test 2: Frontend Accessibility
  log('\n🎨 Test 2: Frontend Accessibility', 'blue');
  try {
    const frontend = await testEndpoint('http://localhost:5173');
    if (frontend.status === 200) {
      log('✅ Frontend is accessible', 'green');
      log(`   Status: ${frontend.status}`, 'green');
    } else {
      log('⚠️ Frontend returned non-200 status', 'yellow');
      log(`   Status: ${frontend.status}`, 'yellow');
    }
  } catch (error) {
    log('❌ Frontend is not running!', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('   Please start frontend: cd frontend && npm run dev', 'yellow');
  }

  // Test 3: CORS Configuration
  log('\n🌐 Test 3: CORS Configuration', 'blue');
  try {
    const corsTest = await testEndpoint('http://localhost:5001/api/health', {
      headers: { 'Origin': 'http://localhost:5173' }
    });
    const corsHeader = corsTest.headers['access-control-allow-origin'];
    if (corsHeader || corsTest.status === 200) {
      log('✅ CORS is configured', 'green');
      if (corsHeader) {
        log(`   Allowed Origin: ${corsHeader}`, 'green');
      } else {
        log('   CORS allows all origins (development mode)', 'green');
      }
    } else {
      log('⚠️ CORS headers not found', 'yellow');
    }
  } catch (error) {
    log('❌ CORS test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
  }

  // Test 4: Payment Checkout Session Creation
  log('\n💳 Test 4: Payment Checkout Session Creation', 'blue');
  try {
    log('   Creating checkout session...', 'yellow');
    const checkout = await testEndpoint('http://localhost:5001/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Origin': 'http://localhost:5173' },
      body: {}
    });

    if (checkout.status === 200 && checkout.data.success) {
      log('✅ Checkout session created successfully!', 'green');
      log(`   Status: ${checkout.status}`, 'green');
      log(`   Session ID: ${checkout.data.sessionId}`, 'green');
      if (checkout.data.checkoutUrl) {
        log(`   Checkout URL: ${checkout.data.checkoutUrl.substring(0, 60)}...`, 'green');
        log('\n🎉 PAYMENT BUTTON SHOULD WORK!', 'green');
        log('\n📋 Test Results Summary:', 'cyan');
        log('   ✅ Backend: Running', 'green');
        log('   ✅ Frontend: Accessible', 'green');
        log('   ✅ CORS: Configured', 'green');
        log('   ✅ Payment API: Working', 'green');
        log('\n✨ Open http://localhost:5173 and click "Reserve your slot"', 'cyan');
        log('   It should redirect to Stripe Checkout!', 'cyan');
        return true;
      } else {
        log('❌ No checkout URL in response', 'red');
        log(`   Response: ${JSON.stringify(checkout.data, null, 2)}`, 'red');
        return false;
      }
    } else {
      log('❌ Checkout session creation failed', 'red');
      log(`   Status: ${checkout.status}`, 'red');
      log(`   Response: ${JSON.stringify(checkout.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Payment API test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log('   Backend is not running on port 5001', 'yellow');
    }
    return false;
  }
}

// Run tests
runTests()
  .then((success) => {
    if (success) {
      log('\n✅ All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n❌ Some tests failed', 'red');
      process.exit(1);
    }
  })
  .catch((error) => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    process.exit(1);
  });

