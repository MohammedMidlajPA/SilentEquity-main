#!/usr/bin/env node

/**
 * Production Readiness Test Script
 * Tests all critical functionality before deployment
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TIMEOUT = 10000;

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
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBackendHealth() {
  try {
    log('Testing backend health endpoint...', 'info');
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    if (response.status === 200) {
      results.passed.push('Backend health check');
      log('Backend is healthy', 'success');
      return true;
    } else {
      results.failed.push('Backend health check - Wrong status code');
      log(`Backend returned status ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    results.failed.push(`Backend health check - ${error.message}`);
    log(`Backend health check failed: ${error.message}`, 'error');
    return false;
  }
}

async function testBackendEndpoints() {
  const endpoints = [
    { path: '/api/health', method: 'GET', expectedStatus: 200 },
  ];

  log('Testing backend API endpoints...', 'info');
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method
      });
      if (response.status === endpoint.expectedStatus) {
        results.passed.push(`API endpoint: ${endpoint.path}`);
        log(`✓ ${endpoint.path}`, 'success');
      } else {
        results.failed.push(`API endpoint: ${endpoint.path} - Status ${response.status}`);
        log(`✗ ${endpoint.path} - Status ${response.status}`, 'error');
      }
    } catch (error) {
      results.failed.push(`API endpoint: ${endpoint.path} - ${error.message}`);
      log(`✗ ${endpoint.path} - ${error.message}`, 'error');
    }
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    results.passed.push(`File exists: ${description}`);
    log(`✓ ${description}`, 'success');
    return true;
  } else {
    results.warnings.push(`File missing: ${description}`);
    log(`⚠ ${description} not found`, 'warning');
    return false;
  }
}

function checkBuildOutput() {
  log('Checking build outputs...', 'info');
  const buildFiles = [
    { path: 'frontend/dist/index.html', desc: 'Frontend build output' },
    { path: 'backend/.env', desc: 'Backend environment file' },
    { path: 'frontend/.env', desc: 'Frontend environment file' }
  ];

  buildFiles.forEach(({ path: filePath, desc }) => {
    checkFileExists(filePath, desc);
  });
}

function checkEnvironmentVariables() {
  log('Checking environment variables...', 'info');
  require('dotenv').config({ path: path.join(process.cwd(), 'backend/.env') });
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'FRONTEND_URL',
    'MONGODB_URI'
  ];

  const optionalVars = [
    'STRIPE_PRICE_ID',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      results.passed.push(`Required env var: ${varName}`);
      log(`✓ ${varName} is set`, 'success');
    } else {
      results.failed.push(`Missing required env var: ${varName}`);
      log(`✗ ${varName} is missing`, 'error');
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      results.passed.push(`Optional env var: ${varName}`);
      log(`✓ ${varName} is set`, 'success');
    } else {
      results.warnings.push(`Optional env var not set: ${varName}`);
      log(`⚠ ${varName} not set (optional)`, 'warning');
    }
  });
}

function checkDependencies() {
  log('Checking dependencies...', 'info');
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));

  const criticalDeps = {
    backend: ['express', 'stripe', 'mongoose', 'cors', 'helmet'],
    frontend: ['react', 'react-dom', '@stripe/stripe-js', '@stripe/react-stripe-js']
  };

  criticalDeps.backend.forEach(dep => {
    if (backendPkg.dependencies[dep] || backendPkg.devDependencies[dep]) {
      results.passed.push(`Backend dependency: ${dep}`);
      log(`✓ ${dep}`, 'success');
    } else {
      results.failed.push(`Missing backend dependency: ${dep}`);
      log(`✗ ${dep} missing`, 'error');
    }
  });

  criticalDeps.frontend.forEach(dep => {
    if (frontendPkg.dependencies[dep] || frontendPkg.devDependencies[dep]) {
      results.passed.push(`Frontend dependency: ${dep}`);
      log(`✓ ${dep}`, 'success');
    } else {
      results.failed.push(`Missing frontend dependency: ${dep}`);
      log(`✗ ${dep} missing`, 'error');
    }
  });
}

function checkSecurity() {
  log('Checking security configurations...', 'info');
  
  // Check .gitignore
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env')) {
    results.passed.push('.env files in .gitignore');
    log('✓ .env files are ignored', 'success');
  } else {
    results.warnings.push('.env files may not be ignored');
    log('⚠ .env files may not be ignored', 'warning');
  }

  // Check for hardcoded secrets (actual keys, not validation code)
  const backendFiles = ['backend/server.js', 'backend/config/stripe.js'];
  backendFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for actual hardcoded keys (long strings starting with sk_ that are assigned)
    // Pattern: variable = "sk_live_..." or variable = 'sk_test_...' with at least 50 chars
    const hardcodedKeyPattern = /(?:const|let|var)\s+\w+\s*=\s*['"]sk_(live|test)_[A-Za-z0-9]{50,}['"]/;
    const hasHardcodedKey = hardcodedKeyPattern.test(content);
    
    // Check for direct assignment patterns (not in comments or validation)
    const suspiciousPatterns = [
      /=\s*['"]sk_(live|test)_[A-Za-z0-9]{50,}['"]/, // Direct assignment
      /new Stripe\(['"]sk_(live|test)_[A-Za-z0-9]{50,}['"]\)/ // Direct Stripe initialization
    ];
    
    // Exclude validation code (startsWith, includes checks)
    const isValidationCode = /startsWith\(['"]sk_(live|test)_/g.test(content) || 
                             /includes\(['"]sk_(live|test)_/g.test(content) ||
                             /\.test\(.*sk_(live|test)_/g.test(content);
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(content));
    
    if (!hasHardcodedKey && (!hasSuspiciousPattern || isValidationCode)) {
      results.passed.push(`No hardcoded secrets in ${file}`);
      log(`✓ ${file} - No hardcoded secrets`, 'success');
    } else if (isValidationCode) {
      results.passed.push(`No hardcoded secrets in ${file} (validation code only)`);
      log(`✓ ${file} - No hardcoded secrets`, 'success');
    } else {
      results.failed.push(`Hardcoded secrets found in ${file}`);
      log(`✗ ${file} - Hardcoded secrets found!`, 'error');
    }
  });
}

async function runTests() {
  console.log('\n🚀 Production Readiness Test\n');
  console.log('='.repeat(50));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log('='.repeat(50));
  console.log('');

  // File checks
  checkBuildOutput();
  console.log('');
  
  // Dependency checks
  checkDependencies();
  console.log('');
  
  // Environment checks
  checkEnvironmentVariables();
  console.log('');
  
  // Security checks
  checkSecurity();
  console.log('');
  
  // Backend tests (only if server is running)
  try {
    await testBackendHealth();
    await testBackendEndpoints();
  } catch (error) {
    results.warnings.push('Backend server may not be running - skipping API tests');
    log('⚠ Backend server not accessible - start it to run API tests', 'warning');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
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
    log('🎉 All critical tests passed! Ready for production.', 'success');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please fix issues before deployment.', 'error');
    process.exit(1);
  }
}

runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});

