const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const constants = require('../config/constants');

/**
 * Email Configuration for Course Enrollment
 */

// Create transporter with connection pooling
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
  maxMessages: constants.EMAIL_MAX_MESSAGES,
  rateDelta: constants.EMAIL_RATE_DELTA,
  rateLimit: constants.EMAIL_RATE_LIMIT,
});

/**
 * Send course enrollment payment receipt email
 * @param {Object} paymentData - Payment and course details
 */
const sendCoursePaymentReceipt = async (paymentData) => {
  const { 
    userName, 
    userEmail, 
    amount, 
    currency = 'usd',
    receiptUrl,
    transactionId,
    sessionId,
    paidAt,
    courseName = 'Pro Trader Course'
  } = paymentData;

  // Format amount based on currency
  const formattedAmount = currency === 'usd' 
    ? `$${(amount / 100).toFixed(2)}`
    : currency === 'inr'
    ? `₹${(amount / 100).toFixed(2)}`
    : `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;

  const formattedDate = paidAt 
    ? new Date(paidAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `🎉 Payment Successful - ${courseName} Enrollment`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
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
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 32px 24px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #1a1a1a;
          }
          .message {
            margin: 0 0 24px 0;
            color: #4a4a4a;
            font-size: 16px;
            line-height: 1.6;
          }
          .receipt-box {
            background: #f0f8ff;
            border: 2px solid #4a90e2;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
          }
          .receipt-box h2 {
            margin: 0 0 12px 0;
            font-size: 20px;
            color: #1565c0;
          }
          .receipt-box p {
            margin: 0 0 16px 0;
            font-size: 15px;
            color: #424242;
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
          .info-grid {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6c757d;
            font-size: 14px;
            font-weight: 500;
          }
          .info-value {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 14px;
            text-align: right;
            word-break: break-all;
          }
          .status-badge {
            display: inline-block;
            background: #d4edda;
            color: #155724;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }
          .course-info {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
          }
          .course-info h3 {
            margin: 0 0 12px 0;
            font-size: 18px;
            color: #2e7d32;
          }
          .course-info p {
            margin: 8px 0;
            font-size: 15px;
            color: #424242;
            line-height: 1.6;
          }
          .support-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }
          .support-box p {
            margin: 8px 0;
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
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 13px;
          }
          .footer p {
            margin: 4px 0;
          }
          .signature {
            margin: 24px 0 0 0;
            font-size: 15px;
          }
          .signature strong {
            display: block;
            color: #1a1a1a;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Successful!</h1>
          </div>

          <div class="content">
            <p class="greeting">Dear ${userName},</p>
            <p class="message">
              Thank you for enrolling in the <strong>${courseName}</strong>! Your payment has been successfully processed.
            </p>

            ${receiptUrl ? `
            <div class="receipt-box">
              <h2>📄 Payment Receipt</h2>
              <p>Your official payment receipt is available for download:</p>
              <a href="${receiptUrl}" class="btn-primary" target="_blank">
                📥 Download Receipt
              </a>
            </div>
            ` : ''}

            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Course Name</span>
                <span class="info-value">${courseName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value">${formattedAmount}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status</span>
                <span class="info-value"><span class="status-badge">✓ Confirmed</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Date</span>
                <span class="info-value">${formattedDate}</span>
              </div>
              ${transactionId ? `
              <div class="info-row">
                <span class="info-label">Transaction ID</span>
                <span class="info-value" style="font-size: 12px; font-family: monospace;">${transactionId}</span>
              </div>
              ` : ''}
              ${sessionId ? `
              <div class="info-row">
                <span class="info-label">Session ID</span>
                <span class="info-value" style="font-size: 12px; font-family: monospace;">${sessionId}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${userEmail}</span>
              </div>
            </div>

            <div class="course-info">
              <h3>📚 What's Next?</h3>
              <p><strong>You're all set!</strong> Your enrollment is confirmed and you'll receive course access details shortly.</p>
              <p>Our team will be in touch with you via email with:</p>
              <ul style="margin: 12px 0; padding-left: 20px; color: #424242;">
                <li>Course access instructions</li>
                <li>Discord community invite link</li>
                <li>Course schedule and materials</li>
                <li>Mentorship and support details</li>
              </ul>
            </div>

            <div class="support-box">
              <p><strong>Need Help?</strong></p>
              <p>If you have any questions about your enrollment, please contact us at:</p>
              <p><a href="mailto:unmask@thesilentequity.com" class="support-link">unmask@thesilentequity.com</a></p>
              ${receiptUrl ? `<p style="margin-top: 12px; font-size: 13px;">Keep this receipt for your records.</p>` : ''}
            </div>

            <div class="signature">
              <p>We're excited to have you join us on this journey!</p>
              <strong>The Silent Equity Team</strong>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated payment confirmation email.</p>
            <p>© ${new Date().getFullYear()} Silent Equity. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Course payment receipt email sent successfully', { 
      messageId: info.messageId, 
      to: userEmail,
      sessionId: sessionId 
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Course payment receipt email sending error', { 
      error: error.message,
      to: userEmail,
      sessionId: sessionId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendCoursePaymentReceipt
};




