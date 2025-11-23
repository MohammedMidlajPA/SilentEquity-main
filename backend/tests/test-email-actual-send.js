/**
 * Actual Email Sending Test
 * Tests real email sending, not just configuration
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const constants = require('../config/constants');

console.log('\n📧 ACTUAL EMAIL SENDING TEST\n');
console.log('='.repeat(60));

// Check environment variables
console.log('\n1️⃣ Checking Email Configuration...');
console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || 'Not set (default: 465)'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set (hidden)' : '❌ Missing'}`);
console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);

if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('\n❌ Email configuration incomplete!');
  console.log('   Please check your .env file for EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  pool: true,
  maxConnections: constants.EMAIL_MAX_CONNECTIONS,
  debug: true, // Enable debug output
  logger: true // Enable logging
});

// Test email configuration
async function testEmailSending() {
  try {
    console.log('\n2️⃣ Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Get test email
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    console.log(`\n3️⃣ Sending Test Email...`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${testEmail}`);

    const mailOptions = {
      from: fromEmail,
      to: testEmail,
      subject: '🧪 Test Email - Silent Equity Payment System',
      text: 'This is a test email to verify email sending functionality.',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00ffde 0%, #00d4b8 100%); color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            .success { color: #28a745; font-weight: bold; }
            .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Email Test</h1>
            </div>
            <div class="content">
              <p class="success">✅ Email sending is working!</p>
              <p>This is a test email from the Silent Equity payment system.</p>
              <div class="info">
                <p><strong>Test Details:</strong></p>
                <ul>
                  <li>SMTP Host: ${process.env.EMAIL_HOST}</li>
                  <li>SMTP Port: ${process.env.EMAIL_PORT || 465}</li>
                  <li>From: ${fromEmail}</li>
                  <li>To: ${testEmail}</li>
                  <li>Timestamp: ${new Date().toISOString()}</li>
                </ul>
              </div>
              <p>If you received this email, your email configuration is working correctly.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('\n   Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`\n📧 Check your inbox at: ${testEmail}`);
    console.log('   (Also check spam/junk folder)');
    console.log('\n   If email is not received:');
    console.log('   1. Check spam/junk folder');
    console.log('   2. Verify email address is correct');
    console.log('   3. Check email server logs');
    console.log('   4. Verify SMTP credentials are correct');
    
    return true;
  } catch (error) {
    console.log('\n❌ Email sending failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log(`   Command: ${error.command || 'N/A'}`);
    
    if (error.response) {
      console.log(`   Server Response: ${error.response}`);
    }
    
    console.log('\n   Common issues:');
    console.log('   1. Incorrect SMTP credentials');
    console.log('   2. SMTP server not accessible');
    console.log('   3. Port blocked by firewall');
    console.log('   4. Email server requires different authentication');
    console.log('   5. Rate limiting by email provider');
    
    return false;
  }
}

// Run test
testEmailSending().then((success) => {
  if (success) {
    console.log('\n✅ Test completed successfully!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Test failed. Please check the errors above.\n');
    process.exit(1);
  }
}).catch((error) => {
  console.error('\n❌ Unexpected error:');
  console.error(error);
  process.exit(1);
});


