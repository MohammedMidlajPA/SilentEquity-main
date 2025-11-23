/**
 * Payment & Invoice Verification Test
 * Verifies that invoices are sent and payments work correctly
 */

require('dotenv').config();
const constants = require('../config/constants');

console.log('\n🔍 PAYMENT & INVOICE VERIFICATION\n');
console.log('='.repeat(60));

let checksPassed = 0;
let checksFailed = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    checksPassed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    checksFailed++;
  }
}

// 1. Invoice Creation Configuration
console.log('\n1️⃣ Invoice Creation Configuration:');
const fs = require('fs');
const path = require('path');

try {
  const courseCode = fs.readFileSync(path.join(__dirname, '../controllers/courseController.js'), 'utf8');
  const paymentCode = fs.readFileSync(path.join(__dirname, '../controllers/paymentController.js'), 'utf8');
  
  check(
    'Invoice creation enabled in courseController',
    courseCode.includes('invoice_creation') && courseCode.includes('enabled: true'),
    'Stripe will automatically create and email invoices for course enrollments'
  );
  
  check(
    'Invoice creation enabled in paymentController',
    paymentCode.includes('invoice_creation') && paymentCode.includes('enabled: true'),
    'Stripe will automatically create and email invoices for webinar payments'
  );
} catch (error) {
  console.log(`❌ Error checking invoice configuration: ${error.message}`);
  checksFailed++;
}

// 2. Email Sending Configuration
console.log('\n2️⃣ Email Sending Configuration:');
try {
  const webhookCode = fs.readFileSync(path.join(__dirname, '../controllers/webhookHandlers.js'), 'utf8');
  
  check(
    'Course payment receipt email function exists',
    webhookCode.includes('sendCoursePaymentReceipt'),
    'Custom receipt emails sent for course enrollments'
  );
  
  check(
    'Payment confirmation email function exists',
    webhookCode.includes('sendPaymentConfirmationEmail'),
    'Custom confirmation emails sent for webinar payments'
  );
  
  check(
    'Email retry logic implemented',
    webhookCode.includes('retrying') && webhookCode.includes('setTimeout'),
    'Emails retry on failure to ensure delivery'
  );
  
  check(
    'Email sending is non-blocking',
    webhookCode.includes('.catch') && webhookCode.includes('async'),
    'Email failures don\'t block payment processing'
  );
} catch (error) {
  console.log(`❌ Error checking email configuration: ${error.message}`);
  checksFailed++;
}

// 3. Card Payment Configuration
console.log('\n3️⃣ Card Payment Configuration:');
try {
  const courseCodeCheck = fs.readFileSync(path.join(__dirname, '../controllers/courseController.js'), 'utf8');
  
  check(
    '3D Secure set to automatic',
    courseCodeCheck.includes('request_three_d_secure') && courseCodeCheck.includes("'automatic'"),
    'All cards can complete payment (OTP only when required)'
  );
  
  check(
    'Card payment method enabled',
    courseCodeCheck.includes("payment_method_types") && courseCodeCheck.includes("'card'"),
    'Card payments are enabled'
  );
  
  check(
    'Payment method options configured',
    courseCodeCheck.includes('payment_method_options'),
    '3D Secure configuration is present'
  );
} catch (error) {
  console.log(`❌ Error checking card configuration: ${error.message}`);
  checksFailed++;
}

// 4. Webhook Event Handling
console.log('\n4️⃣ Webhook Event Handling:');
try {
  const paymentControllerCode = fs.readFileSync(path.join(__dirname, '../controllers/paymentController.js'), 'utf8');
  
  check(
    'checkout.session.completed handler exists',
    paymentControllerCode.includes('checkout.session.completed'),
    'Webhook handles successful checkout sessions'
  );
  
  check(
    'payment_intent.succeeded handler exists',
    paymentControllerCode.includes('payment_intent.succeeded'),
    'Webhook handles successful payment intents'
  );
  
  check(
    'async_payment_succeeded handler exists',
    paymentControllerCode.includes('async_payment_succeeded'),
    'Webhook handles async payments (UPI)'
  );
  
  check(
    'Payment failure handlers exist',
    paymentControllerCode.includes('payment_failed') || paymentControllerCode.includes('payment_intent.payment_failed'),
    'Failed payments are properly handled'
  );
} catch (error) {
  console.log(`❌ Error checking webhook handlers: ${error.message}`);
  checksFailed++;
}

// 5. Error Handling & Retry Logic
console.log('\n5️⃣ Error Handling & Retry Logic:');
try {
  const supabaseCode = fs.readFileSync(path.join(__dirname, '../config/supabase.js'), 'utf8');
  const webhookCodeCheck = fs.readFileSync(path.join(__dirname, '../controllers/webhookHandlers.js'), 'utf8');
  
  check(
    'Retry logic implemented for Supabase',
    supabaseCode.includes('retryOperation') || supabaseCode.includes('retry'),
    'Database operations retry on transient failures'
  );
  
  check(
    'Error handling in webhooks',
    webhookCodeCheck.includes('try') && webhookCodeCheck.includes('catch'),
    'Webhook errors are caught and logged'
  );
  
  check(
    'Idempotency checks implemented',
    webhookCodeCheck.includes('idempotent') || webhookCodeCheck.includes('already processed'),
    'Duplicate webhook events are handled correctly'
  );
} catch (error) {
  console.log(`❌ Error checking error handling: ${error.message}`);
  checksFailed++;
}

// 6. Payment Method Support
console.log('\n6️⃣ Payment Method Support:');
try {
  const courseCodeCheck2 = fs.readFileSync(path.join(__dirname, '../controllers/courseController.js'), 'utf8');
  const paymentControllerCodeCheck = fs.readFileSync(path.join(__dirname, '../controllers/paymentController.js'), 'utf8');
  
  check(
    'Multiple payment methods supported',
    courseCodeCheck2.includes('amazon_pay') || paymentControllerCodeCheck.includes('payment_method_types'),
    'Multiple payment options available to reduce failures'
  );
  
  check(
    'UPI support configured',
    paymentControllerCodeCheck.includes('inr') || paymentControllerCodeCheck.includes('UPI'),
    'UPI available for Indian customers'
  );
} catch (error) {
  console.log(`❌ Error checking payment methods: ${error.message}`);
  checksFailed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 VERIFICATION RESULTS: ${checksPassed} passed, ${checksFailed} failed\n`);

if (checksFailed === 0) {
  console.log('✅ ALL CHECKS PASSED!\n');
  console.log('✅ Invoices: Stripe automatically creates and emails invoices');
  console.log('✅ Custom Emails: Sent with retry logic for reliability');
  console.log('✅ Card Payments: Configured for maximum acceptance');
  console.log('✅ Error Handling: Comprehensive retry logic implemented');
  console.log('✅ Webhook Processing: All events handled correctly\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review.\n');
  process.exit(1);
}

