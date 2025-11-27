const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const constants = require('../config/constants');

/**
 * Email Configuration and Sending Utility
 */

// Create transporter with connection pooling
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  pool: true, // Use connection pooling
  maxConnections: constants.EMAIL_MAX_CONNECTIONS,
  maxMessages: constants.EMAIL_MAX_MESSAGES,
  rateDelta: constants.EMAIL_RATE_DELTA,
  rateLimit: constants.EMAIL_RATE_LIMIT,
});

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    logger.info('Email configuration verified');
    return true;
  } catch (error) {
    logger.error('Email configuration error', { error: error.message });
    return false;
  }
};

/**
 * Send payment confirmation email with receipt
 * @param {Object} paymentData - Payment and user details
 */
const sendPaymentConfirmationEmail = async (paymentData) => {
  const { 
    userName, 
    userEmail, 
    amount, 
    webinarTitle,
    receiptUrl,      // Stripe receipt URL
    googleFormUrl,   // Google form URL for verification
    paymentId,       // Your internal payment ID
    transactionId,   // Stripe charge ID
    paidAt           // Payment timestamp
  } = paymentData;

  const formattedDate = paidAt 
    ? new Date(paidAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `🎉 Payment Successful - ${webinarTitle || 'thesilentequity Webinar'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .header {
            background: linear-gradient(135deg, #00ffde 0%, #00d4b8 100%);
            color: #000;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 24px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
            color: #1a1a1a;
          }
          .message {
            margin: 0 0 20px 0;
            color: #4a4a4a;
            font-size: 15px;
          }
          .action-card {
            background: #fff8e1;
            border: 2px solid #ffc107;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .action-card strong {
            display: block;
            color: #f57c00;
            font-size: 15px;
            margin-bottom: 12px;
          }
          .btn-primary {
            display: inline-block;
            background: #00ffde;
            color: #000;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.2s;
            margin: 4px;
          }
          .btn-primary:hover {
            background: #00d4b8;
            transform: translateY(-1px);
          }
          .btn-secondary {
            display: inline-block;
            background: #6c757d;
            color: #fff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.2s;
            margin: 4px;
          }
          .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-1px);
          }
          .receipt-box {
            background: #f0f8ff;
            border: 2px solid #4a90e2;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .receipt-box p {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #424242;
          }
          .info-grid {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6c757d;
            font-size: 14px;
          }
          .info-value {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 14px;
            word-break: break-all;
          }
          .status-badge {
            display: inline-block;
            background: #d4edda;
            color: #155724;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
          }
          .steps {
            background: #e3f2fd;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
          }
          .steps h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: #1565c0;
          }
          .step-item {
            padding: 6px 0;
            font-size: 14px;
            color: #424242;
          }
          .support-box {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .support-box p {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #6c757d;
          }
          .support-link {
            color: #00d4b8;
            text-decoration: none;
            font-weight: 600;
          }
          .footer {
            background: #f8f9fa;
            padding: 16px;
            text-align: center;
            color: #6c757d;
            font-size: 13px;
          }
          .footer p {
            margin: 4px 0;
          }
          .signature {
            margin: 20px 0 0 0;
            font-size: 14px;
          }
          .signature strong {
            display: block;
            color: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 PAYMENT SUCCESSFUL</h1>
          </div>

          <div class="content">
            <div class="action-card">
              <strong>⚠️ ACTION REQUIRED - VERIFICATION STEP</strong>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #424242;">To complete your registration and receive webinar access, please fill out the verification form below. This step is mandatory even after payment.</p>
              <a href="${googleFormUrl || 'https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor'}" class="btn-primary" target="_blank">
                📝 COMPLETE VERIFICATION FORM
              </a>
            </div>

            <p class="greeting">Dear ${userName},</p>
            <p class="message">Your payment has been successfully processed! To finalize your registration for the ${webinarTitle || 'Silent Edge Execution Masterclass'}, please complete the verification form above.</p>

            ${receiptUrl ? `
            <div class="receipt-box">
              <p><strong>📄 Your Payment Receipt</strong></p>
              <p>Click below to view and download your official payment receipt from Stripe:</p>
              <a href="${receiptUrl}" class="btn-secondary" target="_blank">
                📥 VIEW RECEIPT
              </a>
            </div>
            ` : ''}

            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value">$${amount || '4.50'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="status-badge">✓ Confirmed</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Date</span>
                <span class="info-value">${formattedDate}</span>
              </div>
              ${transactionId ? `
              <div class="info-row">
                <span class="info-label">Transaction ID</span>
                <span class="info-value" style="font-size: 12px;">${transactionId}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${userEmail}</span>
              </div>
            </div>

            <div class="steps">
              <h3>📋 Important Next Steps</h3>
              <div class="step-item"><strong>1.</strong> <strong>Complete the verification form above</strong> (MANDATORY - even after payment)</div>
              <div class="step-item"><strong>2.</strong> After verification, you will receive Discord access for the webinar</div>
              <div class="step-item"><strong>3.</strong> All webinar sessions, updates, and class materials will be shared on Discord</div>
            </div>

            <p style="background: #fff3cd; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #856404; border-left: 4px solid #ffc107;">
              <strong>⚠️ Important:</strong> Your registration is not complete until you fill out the verification form. Please complete it as soon as possible to receive your Discord access.
            </p>

            <p style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #2e7d32;">
              <strong>💬 Classes on Discord:</strong> After completing the verification form, you will receive Discord access. All webinar sessions and updates will be conducted on Discord.
            </p>

            <div class="support-box">
              <p><strong>Need Help?</strong></p>
              <p>Contact us at <a href="mailto:unmask@thesilentequity.com" class="support-link">unmask@thesilentequity.com</a></p>
              ${receiptUrl ? `<p style="margin-top: 8px; font-size: 13px;">Keep your receipt for your records.</p>` : ''}
            </div>

            <div class="signature">
              <p>We're excited to have you join us!</p>
              <strong>The Silent Equity Team</strong>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated confirmation email.</p>
            ${paymentId ? `<p style="font-size: 11px; color: #999;">Payment ID: ${paymentId}</p>` : ''}
            <p>© ${new Date().getFullYear()} The Silent Equity. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email with receipt sent successfully', { messageId: info.messageId, to: userEmail });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending error', { 
      error: error.message,
      to: userEmail,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    return { success: false, error: error.message };
  }
};

module.exports = {
  testEmailConfig,
  sendPaymentConfirmationEmail
};
