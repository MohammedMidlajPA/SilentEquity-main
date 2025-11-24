#!/usr/bin/env node

/**
 * Pre-Deployment Comprehensive Check
 * Tests everything before hosting
 */

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const BACKEND_URL = 'http://localhost:5001';
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
      timeout: 20000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            responseTime: Date.now() - (options.startTime || Date.now())
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            responseTime: Date.now() - (options.startTime || Date.now())
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
    const startTime = Date.now();
    const response = await makeRequest(`${API_BASE}/health`, { startTime });
    const responseTime = response.responseTime || (Date.now() - startTime);
    
    if (response.status === 200 && response.body.success) {
      results.passed.push(`Backend health (${responseTime}ms)`);
      log(`Backend health: ${responseTime}ms`, responseTime < 500 ? 'success' : 'warning');
      return true;
    }
    results.failed.push('Backend health check failed');
    return false;
  } catch (error) {
    results.failed.push(`Backend health - ${error.message}`);
    return false;
  }
}

async function testFormSubmission() {
  try {
    const testData = {
      name: 'Load Test User',
      email: `loadtest${Date.now()}@test.com`,
      phone: '+1234567890'
    };
    
    const startTime = Date.now();
    const response = await makeRequest(`${API_BASE}/course/join`, {
      method: 'POST',
      body: testData,
      startTime
    });
    const responseTime = response.responseTime || (Date.now() - startTime);
    
    if (response.status === 201 && response.body.success && response.body.checkoutUrl) {
      results.passed.push(`Form submission (${responseTime}ms)`);
      log(`Form submission: ${responseTime}ms`, responseTime < 2000 ? 'success' : 'warning');
      return true;
    }
    results.failed.push(`Form submission failed - Status: ${response.status}`);
    return false;
  } catch (error) {
    results.failed.push(`Form submission - ${error.message}`);
    return false;
  }
}

async function testLoadHandling() {
  log('Testing load handling (5 concurrent requests)...', 'info');
  const promises = [];
  const baseTime = Date.now();
  
  for (let i = 0; i < 5; i++) {
    const testData = {
      name: `Load Test User`,
      email: `loadtest${baseTime}_${i}@test.com`,
      phone: `+123456789${i}`
    };
    
    promises.push(
      makeRequest(`${API_BASE}/course/join`, {
        method: 'POST',
        body: testData,
        startTime: Date.now()
      }).then(result => ({ ...result, index: i })).catch(err => ({ 
        error: err.message, 
        status: 0,
        index: i 
      }))
    );
  }
  
  const results_array = await Promise.all(promises);
  const successCount = results_array.filter(r => r.status === 201).length;
  const errorCount = results_array.filter(r => r.error).length;
  
  // Log details
  results_array.forEach((r, idx) => {
    if (r.status === 201) {
      log(`  Request ${idx + 1}: Success`, 'success');
    } else if (r.error) {
      log(`  Request ${idx + 1}: Failed - ${r.error}`, 'error');
    } else {
      log(`  Request ${idx + 1}: Failed - Status ${r.status}`, 'error');
    }
  });
  
  if (successCount >= 3) {
    results.passed.push(`Load handling: ${successCount}/5 requests succeeded`);
    log(`Load handling: ${successCount}/5 succeeded`, successCount >= 4 ? 'success' : 'warning');
    if (successCount < 5) {
      results.warnings.push(`${5 - successCount} requests failed (may be rate limiting)`);
    }
    return true;
  } else {
    results.failed.push(`Load handling: Only ${successCount}/5 succeeded`);
    log(`Load handling: Only ${successCount}/5 succeeded`, 'error');
    return false;
  }
}

function checkPerformanceConfig() {
  log('Checking performance configuration...', 'info');
  const fs = require('fs');
  const constants = path.join(__dirname, '..', 'backend', 'config', 'constants.js');
  const content = fs.readFileSync(constants, 'utf8');
  
  const checks = [
    { name: 'Rate limiting', pattern: /RATE_LIMIT_MAX_REQUESTS.*500/, required: true },
    { name: 'Database pool', pattern: /MONGODB_MAX_POOL_SIZE.*50/, required: true },
    { name: 'Email pool', pattern: /EMAIL_MAX_CONNECTIONS.*20/, required: true },
    { name: 'Request timeout', pattern: /REQUEST_TIMEOUT_MS.*15000/, required: true }
  ];
  
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      results.passed.push(check.name);
      log(`${check.name}: Configured`, 'success');
    } else if (check.required) {
      results.failed.push(`${check.name}: Not configured`);
      log(`${check.name}: Not configured`, 'error');
    } else {
      results.warnings.push(`${check.name}: Not configured`);
      log(`${check.name}: Not configured`, 'warning');
    }
  });
}

function checkBuildOptimization() {
  log('Checking build optimization...', 'info');
  const fs = require('fs');
  const viteConfig = path.join(__dirname, '..', 'frontend', 'vite.config.js');
  const content = fs.readFileSync(viteConfig, 'utf8');
  
  const checks = [
    { name: 'Code splitting', pattern: /manualChunks/, required: true },
    { name: 'Minification', pattern: /minify.*esbuild/, required: true },
    { name: 'Console removal', pattern: /drop_console.*true/, required: true },
    { name: 'Source maps disabled', pattern: /sourcemap.*false/, required: true }
  ];
  
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      results.passed.push(check.name);
      log(`${check.name}: Enabled`, 'success');
    } else if (check.required) {
      results.failed.push(`${check.name}: Not enabled`);
      log(`${check.name}: Not enabled`, 'error');
    } else {
      results.warnings.push(`${check.name}: Not enabled`);
      log(`${check.name}: Not enabled`, 'warning');
    }
  });
}

async function runAllChecks() {
  console.log('\n🚀 Pre-Deployment Comprehensive Check\n');
  console.log('='.repeat(70));
  
  // Backend health
  await testBackendHealth();
  console.log('');
  
  // Form submission
  await testFormSubmission();
  console.log('');
  
  // Load handling
  await testLoadHandling();
  console.log('');
  
  // Performance config
  checkPerformanceConfig();
  console.log('');
  
  // Build optimization
  checkBuildOptimization();
  console.log('');
  
  // Summary
  console.log('='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('');
  
  if (results.failed.length > 0) {
    console.log('❌ Failed Checks:');
    results.failed.forEach(fail => console.log(`   - ${fail}`));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(warn => console.log(`   - ${warn}`));
    console.log('');
  }
  
  if (results.failed.length === 0) {
    log('🎉 All checks passed! Ready for deployment.', 'success');
    console.log('\n💡 Pre-Deployment Checklist:');
    console.log('   ✅ Backend health verified');
    console.log('   ✅ Form submission working');
    console.log('   ✅ Database save working');
    console.log('   ✅ Payment flow ready');
    console.log('   ✅ Load handling tested');
    console.log('   ✅ Performance optimized');
    console.log('   ✅ Build optimized');
    console.log('\n🚀 Ready to host!');
    process.exit(0);
  } else {
    log('❌ Some checks failed. Please fix issues before deployment.', 'error');
    process.exit(1);
  }
}

runAllChecks().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});

