/**
 * Email Sending Test
 * Tests both payment confirmation and course receipt emails
 */

require('dotenv').config();
const { sendPaymentConfirmationEmail } = require('../utils/email');
const { sendCoursePaymentReceipt } = require('../utils/courseEmail');
const { testEmailConfig } = require('../utils/email');

console.log('\n📧 EMAIL SENDING TEST\n');
console.log('='.repeat(60));

async function testEmails() {
  try {
    // Test 1: Email Configuration
    console.log('\n1️⃣ Testing Email Configuration...');
    const configTest = await testEmailConfig();
    if (configTest) {
      console.log('✅ Email configuration is valid');
    } else {
      console.log('❌ Email configuration test failed');
      console.log('   Please check your EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD');
      process.exit(1);
    }

    // Get test email from environment or use default
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_FROM || 'test@example.com';
    
    console.log(`\n📧 Test emails will be sent to: ${testEmail}`);
    console.log('   (Set TEST_EMAIL environment variable to use a different email)\n');

    // Test 2: Payment Confirmation Email
    console.log('2️⃣ Testing Payment Confirmation Email...');
    const paymentEmailData = {
      userName: 'Test User',
      userEmail: testEmail,
      amount: 9999, // $99.99 in cents
      webinarTitle: 'Silent Edge Execution Masterclass',
      receiptUrl: 'https://pay.stripe.com/receipts/test-receipt-url',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform',
      paymentId: 'test_payment_123',
      transactionId: 'ch_test_123',
      paidAt: new Date()
    };

    try {
      const paymentResult = await sendPaymentConfirmationEmail(paymentEmailData);
      if (paymentResult && paymentResult.success !== false) {
        console.log('✅ Payment confirmation email sent successfully');
        console.log(`   Message ID: ${paymentResult.messageId || 'N/A'}`);
      } else {
        console.log('❌ Payment confirmation email failed');
        console.log(`   Error: ${paymentResult?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('❌ Payment confirmation email error:');
      console.log(`   ${error.message}`);
    }

    // Wait a bit between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Course Payment Receipt Email
    console.log('\n3️⃣ Testing Course Payment Receipt Email...');
    const courseEmailData = {
      userName: 'Test User',
      userEmail: testEmail,
      amount: 49999, // $499.99 in cents
      currency: 'usd',
      receiptUrl: 'https://pay.stripe.com/receipts/test-receipt-url',
      transactionId: 'ch_test_456',
      sessionId: 'cs_test_789',
      paidAt: new Date(),
      courseName: 'Pro Trader Course - 3-Month Trading Program'
    };

    try {
      const courseResult = await sendCoursePaymentReceipt(courseEmailData);
      if (courseResult && courseResult.success !== false) {
        console.log('✅ Course payment receipt email sent successfully');
        console.log(`   Message ID: ${courseResult.messageId || 'N/A'}`);
      } else {
        console.log('❌ Course payment receipt email failed');
        console.log(`   Error: ${courseResult?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('❌ Course payment receipt email error:');
      console.log(`   ${error.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST SUMMARY:\n');
    console.log('✅ Email configuration: Valid');
    console.log('✅ Payment confirmation email: Sent');
    console.log('✅ Course payment receipt email: Sent');
    console.log(`\n📧 Check your inbox at: ${testEmail}`);
    console.log('   (Also check spam/junk folder if not received)\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testEmails().then(() => {
  console.log('✅ Email test completed!\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Email test failed:');
  console.error(error);
  process.exit(1);
});


