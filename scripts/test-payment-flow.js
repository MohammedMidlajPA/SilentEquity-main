#!/usr/bin/env node

/**
 * Comprehensive Payment Flow Test
 * Tests all critical payment functionality before deployment
 */

const http = require('http');
const path = require('path');
const backendPath = path.join(__dirname, '..', '..', 'backend');
const envPath = path.join(backendPath, '.env');
if (require('fs').existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('⚠️  Backend .env file not found, using system environment variables');
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const API_BASE = `${BACKEND_URL}/api`;

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  const icon = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

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
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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

async function testBackendHealth() {
  try {
    log('Testing backend health...', 'info');
    const response = await makeRequest(`${API_BASE}/health`);
    if (response.status === 200 && response.body.success) {
      results.passed.push('Backend health check');
      log('Backend is healthy', 'success');
      return true;
    } else {
      results.failed.push('Backend health check failed');
      log('Backend health check failed', 'error');
      return false;
    }
  } catch (error) {
    results.failed.push(`Backend health check - ${error.message}`);
    log(`Backend not accessible: ${error.message}`, 'error');
    return false;
  }
}

async function testCourseJoinFlow() {
  try {
    log('Testing course enrollment flow...', 'info');
    const testData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '+919876543210'
    };

    const response = await makeRequest(`${API_BASE}/course/join`, {
      method: 'POST',
      body: testData
    });

    if (response.status === 201 && response.body.success && response.body.checkoutUrl) {
      results.passed.push('Course enrollment - Checkout session created');
      log('✓ Course enrollment working - Checkout URL generated', 'success');
      
      // Verify checkout URL is valid Stripe URL
      if (response.body.checkoutUrl.includes('checkout.stripe.com')) {
        results.passed.push('Checkout URL is valid Stripe URL');
        log('✓ Checkout URL is valid', 'success');
      } else {
        results.warnings.push('Checkout URL format unexpected');
        log('⚠ Checkout URL format unexpected', 'warning');
      }

      // Check session ID format
      if (response.body.sessionId && response.body.sessionId.startsWith('cs_')) {
        results.passed.push('Session ID format valid');
        log('✓ Session ID format valid', 'success');
      }

      return { success: true, sessionId: response.body.sessionId, checkoutUrl: response.body.checkoutUrl };
    } else {
      results.failed.push(`Course enrollment failed - Status: ${response.status}`);
      log(`✗ Course enrollment failed - Status: ${response.status}`, 'error');
      if (response.body.message) {
        log(`  Error: ${response.body.message}`, 'error');
      }
      return { success: false, error: response.body.message || 'Unknown error' };
    }
  } catch (error) {
    results.failed.push(`Course enrollment - ${error.message}`);
    log(`✗ Course enrollment error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testCheckoutSessionVerification() {
  try {
    log('Testing checkout session verification...', 'info');
    
    // First create a session
    const enrollResult = await testCourseJoinFlow();
    if (!enrollResult.success || !enrollResult.sessionId) {
      results.warnings.push('Skipping session verification - no session created');
      log('⚠ Skipping session verification', 'warning');
      return;
    }

    const response = await makeRequest(`${API_BASE}/payment/verify-session?sessionId=${enrollResult.sessionId}`);

    if (response.status === 200) {
      results.passed.push('Checkout session verification endpoint working');
      log('✓ Session verification endpoint working', 'success');
    } else if (response.status === 404) {
      // This is expected for unpaid sessions
      results.passed.push('Session verification endpoint working (session not paid yet)');
      log('✓ Session verification working (session pending payment)', 'success');
    } else {
      results.warnings.push(`Session verification returned status ${response.status}`);
      log(`⚠ Session verification status: ${response.status}`, 'warning');
    }
  } catch (error) {
    results.warnings.push(`Session verification - ${error.message}`);
    log(`⚠ Session verification: ${error.message}`, 'warning');
  }
}

function checkEnvironmentVariables() {
  log('Checking environment variables...', 'info');
  
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID',
    'FRONTEND_URL',
    'MONGODB_URI'
  ];

  const optional = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  required.forEach(varName => {
    if (process.env[varName]) {
      results.passed.push(`Required env: ${varName}`);
      log(`✓ ${varName}`, 'success');
    } else {
      results.failed.push(`Missing required env: ${varName}`);
      log(`✗ ${varName} missing`, 'error');
    }
  });

  optional.forEach(varName => {
    if (process.env[varName]) {
      results.passed.push(`Optional env: ${varName}`);
      log(`✓ ${varName}`, 'success');
    } else {
      results.warnings.push(`Optional env not set: ${varName}`);
      log(`⚠ ${varName} not set (optional)`, 'warning');
    }
  });
}

function checkStripeConfiguration() {
  log('Checking Stripe configuration...', 'info');
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    results.failed.push('STRIPE_SECRET_KEY not set');
    return;
  }

  // Check if it's a valid Stripe key format
  if (stripeKey.startsWith('sk_live_') || stripeKey.startsWith('sk_test_')) {
    results.passed.push('Stripe key format valid');
    log('✓ Stripe key format valid', 'success');
    
    if (stripeKey.startsWith('sk_live_')) {
      results.passed.push('Using LIVE Stripe mode');
      log('✓ Using LIVE Stripe mode', 'success');
    } else {
      results.warnings.push('Using TEST Stripe mode');
      log('⚠ Using TEST Stripe mode', 'warning');
    }
  } else {
    results.failed.push('Stripe key format invalid');
    log('✗ Stripe key format invalid', 'error');
  }

  // Check price ID
  const priceId = process.env.STRIPE_PRICE_ID;
  if (priceId && priceId.startsWith('price_')) {
    results.passed.push('Stripe price ID format valid');
    log('✓ Price ID format valid', 'success');
  } else {
    results.failed.push('Stripe price ID format invalid');
    log('✗ Price ID format invalid', 'error');
  }
}

function checkPaymentConfiguration() {
  log('Checking payment configuration...', 'info');
  
  const fs = require('fs');
  const courseController = path.join(__dirname, '..', '..', 'backend', 'controllers', 'courseController.js');
  const content = fs.readFileSync(courseController, 'utf8');

  // Check for promotion codes enabled
  if (content.includes('allow_promotion_codes: true')) {
    results.passed.push('Promotion codes enabled');
    log('✓ Promotion codes enabled', 'success');
  } else {
    results.warnings.push('Promotion codes may not be enabled');
    log('⚠ Promotion codes check', 'warning');
  }

  // Check for invoice creation
  if (content.includes('invoice_creation') && content.includes('enabled: true')) {
    results.passed.push('Invoice creation enabled');
    log('✓ Invoice creation enabled', 'success');
  } else {
    results.warnings.push('Invoice creation may not be enabled');
    log('⚠ Invoice creation check', 'warning');
  }

  // Check for 3D Secure
  if (content.includes('request_three_d_secure') && content.includes('automatic')) {
    results.passed.push('3D Secure configured (automatic)');
    log('✓ 3D Secure configured', 'success');
  } else {
    results.warnings.push('3D Secure configuration check');
    log('⚠ 3D Secure check', 'warning');
  }
}

async function runAllTests() {
  console.log('\n🚀 Payment Flow Comprehensive Test\n');
  console.log('='.repeat(60));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('='.repeat(60));
  console.log('');

  // Environment checks
  checkEnvironmentVariables();
  console.log('');

  // Stripe configuration
  checkStripeConfiguration();
  console.log('');

  // Payment configuration
  checkPaymentConfiguration();
  console.log('');

  // Backend health
  const backendHealthy = await testBackendHealth();
  console.log('');

  if (backendHealthy) {
    // Course enrollment flow
    await testCourseJoinFlow();
    console.log('');

    // Session verification
    await testCheckoutSessionVerification();
    console.log('');
  } else {
    results.warnings.push('Backend not accessible - skipping API tests');
    log('⚠ Backend not accessible - start backend server to run full tests', 'warning');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('');

  if (results.failed.length > 0) {
    console.log('❌ Failed Tests:');
    results.failed.forEach(fail => console.log(`   - ${fail}`));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(warn => console.log(`   - ${warn}`));
    console.log('');
  }

  if (results.failed.length === 0) {
    log('🎉 All critical tests passed! Payment flow is ready.', 'success');
    console.log('\n💡 Payment Flow Status:');
    console.log('   ✅ Backend configured correctly');
    console.log('   ✅ Stripe integration working');
    console.log('   ✅ Checkout sessions created successfully');
    console.log('   ✅ Payment flow ready for production');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please fix issues before deployment.', 'error');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});

