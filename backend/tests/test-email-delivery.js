/**
 * Email Delivery Diagnostic Test
 * Tests email sending and provides troubleshooting information
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const constants = require('../config/constants');

console.log('\n📧 EMAIL DELIVERY DIAGNOSTIC TEST\n');
console.log('='.repeat(60));

// Get email configuration
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT || 465;
const emailUser = process.env.EMAIL_USER;
const emailFrom = process.env.EMAIL_FROM || emailUser;
const testEmail = process.env.TEST_EMAIL || emailUser;

console.log('\n📋 Email Configuration:');
console.log(`   SMTP Host: ${emailHost}`);
console.log(`   SMTP Port: ${emailPort}`);
console.log(`   Email User: ${emailUser}`);
console.log(`   From Address: ${emailFrom}`);
console.log(`   Test Email: ${testEmail}`);

if (!emailHost || !emailUser) {
  console.log('\n❌ Email configuration incomplete!');
  process.exit(1);
}

// Create transporter with detailed logging
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: parseInt(emailPort),
  secure: emailPort === '465',
  auth: {
    user: emailUser,
    pass: process.env.EMAIL_PASSWORD
  },
  pool: false, // Disable pooling for test
  debug: false, // Disable verbose debug
  logger: false
});

async function testEmailDelivery() {
  try {
    console.log('\n1️⃣ Testing SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    console.log('\n2️⃣ Sending Test Email...');
    const mailOptions = {
      from: emailFrom,
      to: testEmail,
      subject: '🧪 Email Delivery Test - Silent Equity',
      text: `This is a test email sent at ${new Date().toISOString()}\n\nIf you receive this, email delivery is working correctly.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #00d4b8;">🧪 Email Delivery Test</h2>
          <p>This is a test email sent at <strong>${new Date().toISOString()}</strong></p>
          <p>If you receive this email, your email delivery is working correctly.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            <strong>Test Details:</strong><br>
            SMTP Host: ${emailHost}<br>
            SMTP Port: ${emailPort}<br>
            From: ${emailFrom}<br>
            To: ${testEmail}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Server Response: ${info.response}`);
    
    console.log('\n3️⃣ Delivery Status:');
    console.log('   ✅ Email accepted by SMTP server');
    console.log('   ⏳ Email is being processed by email provider');
    
    console.log('\n📧 Next Steps:');
    console.log(`   1. Check inbox at: ${testEmail}`);
    console.log('   2. Check SPAM/JUNK folder (very important!)');
    console.log('   3. Wait 5-10 minutes (GoDaddy can have delays)');
    console.log('   4. Check email server logs if available');
    
    console.log('\n🔍 Troubleshooting:');
    console.log('   If email not received after 10 minutes:');
    console.log('   - Verify email address is correct');
    console.log('   - Check spam/junk folder');
    console.log('   - Check email provider spam filters');
    console.log('   - Verify SMTP credentials are correct');
    console.log('   - Check if email provider has delivery delays');
    
    // Check if using GoDaddy
    if (emailHost && emailHost.includes('secureserver')) {
      console.log('\n⚠️  GoDaddy Email Notes:');
      console.log('   - GoDaddy emails can take 5-10 minutes to deliver');
      console.log('   - Check spam folder first');
      console.log('   - Verify email account is active');
      console.log('   - Check GoDaddy email logs if available');
    }
    
    return true;
  } catch (error) {
    console.log('\n❌ Email sending failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    
    if (error.response) {
      console.log(`   Server Response: ${error.response}`);
    }
    
    console.log('\n🔧 Common Fixes:');
    console.log('   1. Verify EMAIL_HOST is correct');
    console.log('   2. Verify EMAIL_PORT is correct (465 for SSL, 587 for TLS)');
    console.log('   3. Verify EMAIL_USER and EMAIL_PASSWORD are correct');
    console.log('   4. Check if email provider requires app-specific password');
    console.log('   5. Verify firewall/network allows SMTP connections');
    
    return false;
  }
}

// Run test
testEmailDelivery().then((success) => {
  if (success) {
    console.log('\n✅ Test completed!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Test failed. Please check errors above.\n');
    process.exit(1);
  }
}).catch((error) => {
  console.error('\n❌ Unexpected error:');
  console.error(error);
  process.exit(1);
});


