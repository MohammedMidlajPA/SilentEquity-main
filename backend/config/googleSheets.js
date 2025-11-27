const { google } = require('googleapis');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { logger } = require('../utils/logger');

let sheetsClient = null;
let currentCredentials = null;

/**
 * Checks if Google Sheets webhook is configured
 * @returns {boolean} True if webhook URL is configured
 */
function isGoogleSheetsWebhookConfigured() {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL);
}

/**
 * Checks if Google Sheets API is configured with required environment variables
 * @returns {boolean} True if Google Sheets API credentials and spreadsheet ID are configured
 */
function isGoogleSheetsApiConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    (
      process.env.GOOGLE_SHEETS_CREDENTIALS || 
      (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY)
    )
  );
}

/**
 * Checks if Google Sheets is configured (either via webhook or API)
 * @returns {boolean} True if Google Sheets is configured via any method
 */
function isGoogleSheetsConfigured() {
  return isGoogleSheetsWebhookConfigured() || isGoogleSheetsApiConfigured();
}

/**
 * Gets or creates the Google Sheets client instance
 * Uses singleton pattern to reuse the same client across requests
 * @returns {Object} Google Sheets client instance
 * @throws {Error} If Google Sheets API credentials are not configured
 */
function getGoogleSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  if (!isGoogleSheetsApiConfigured()) {
    throw new Error('Google Sheets API credentials are not configured');
  }

  try {
    let credentials;
    
    // Try to parse credentials from JSON string (if provided as env var)
    if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
      credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    } else {
      // Use individual env vars
      credentials = {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
    }

    // Create JWT auth client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Create Sheets API client
    sheetsClient = google.sheets({ version: 'v4', auth });
    currentCredentials = credentials.client_email;

    logger.info('Google Sheets client initialized', { 
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.substring(0, 20) + '...' 
    });
    
    return sheetsClient;
  } catch (error) {
    logger.error('Failed to initialize Google Sheets client', { error: error.message });
    throw error;
  }
}

/**
 * Saves lead data to Google Sheets via webhook (Apps Script)
 * @param {Object} lead - Lead data to save
 * @returns {Promise<string|null>} Row number if successful, null otherwise
 */
async function saveLeadToSheetsViaWebhook(lead) {
  if (!isGoogleSheetsWebhookConfigured()) {
    return null;
  }

  try {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    // Format phone number
    let formattedPhone = lead.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = '+1' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Prepare payload
    const payload = {
      name: lead.name.trim(),
      email: lead.email.toLowerCase().trim(),
      phone: formattedPhone,
      paid: lead.paid || false,
    };

    // Parse URL
    const url = new URL(webhookUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    // Make POST request
    const postData = JSON.stringify(payload);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 5000, // 5 second timeout - faster response, prevents lag
    };

    const result = await new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          // Handle redirects (302) - Google Apps Script often redirects
          if (res.statusCode === 302 || res.statusCode === 301) {
            const location = res.headers.location;
            logger.info('Webhook redirect received', { statusCode: res.statusCode, location });
            // For Apps Script, redirects often mean success - data was processed
            // Return a success indicator even though we can't get the row number
            resolve('redirect_success');
            return;
          }
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data);
              if (response.success) {
                resolve(response.row || null);
              } else {
                reject(new Error(response.error || 'Webhook returned error'));
              }
            } catch (e) {
              // If response is not JSON, still consider it success if status is 200
              if (res.statusCode === 200) {
                resolve(null);
              } else {
                reject(new Error(`Invalid response: ${data.substring(0, 200)}`));
              }
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });

    logger.info('Lead saved to Google Sheets via webhook', {
      rowNumber: result,
      email: lead.email,
    });

    return result ? result.toString() : null;
  } catch (error) {
    logger.error('Failed to save lead to Google Sheets via webhook', {
      error: error.message,
      email: lead.email,
    });
    return null;
  }
}

/**
 * Saves lead data to Google Sheets (tries webhook first, then API)
 * @param {Object} lead - Lead data to save
 * @returns {Promise<string|null>} Row number if successful, null otherwise
 */
async function saveLeadToSheets(lead) {
  if (!isGoogleSheetsConfigured()) {
    logger.warn('Google Sheets not configured, skipping save');
    return null;
  }

  // Try webhook first (simpler, no credentials needed)
  if (isGoogleSheetsWebhookConfigured()) {
    const webhookResult = await saveLeadToSheetsViaWebhook(lead);
    if (webhookResult) {
      return webhookResult;
    }
    // If webhook fails and API is also configured, fallback to API
    if (isGoogleSheetsApiConfigured()) {
      logger.warn('Webhook save failed, falling back to API method');
    } else {
      return null;
    }
  }

  // Use API method (if configured)
  if (isGoogleSheetsApiConfigured()) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';

    // Format phone number
    let formattedPhone = lead.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = '+1' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Prepare row data: [Timestamp, Name, Email, Phone, Paid Status]
    const rowData = [
      new Date().toISOString(), // Timestamp
      lead.name.trim(), // Name
      lead.email.toLowerCase().trim(), // Email
      formattedPhone, // Phone
      lead.paid ? 'Yes' : 'No', // Paid Status
    ];

    // Append row to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`, // Columns A-E
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    const updatedRange = response.data.updates?.updatedRange;
    const rowNumber = updatedRange ? updatedRange.match(/!A(\d+)/)?.[1] : null;

      logger.info('Lead saved to Google Sheets via API', {
      rowNumber,
      email: lead.email,
      sheetName,
    });

    return rowNumber || null;
  } catch (error) {
      logger.error('Failed to save lead to Google Sheets via API', {
      error: error.message,
      email: lead.email,
    });
    return null;
  }
  }

  return null;
}

/**
 * Checks if email already exists in Google Sheets
 * Note: Webhook method doesn't support checking existing leads, returns null
 * @param {string} email - Email to check
 * @returns {Promise<string|null>} Row number if found, null otherwise
 */
async function findExistingLeadInSheets(email) {
  if (!isGoogleSheetsConfigured()) {
    return null;
  }

  // Webhook method doesn't support reading/searching, only writing
  // This is a limitation of the Apps Script webhook approach
  if (isGoogleSheetsWebhookConfigured() && !isGoogleSheetsApiConfigured()) {
    logger.debug('Duplicate check not available via webhook method');
    return null;
  }

  // Use API method for duplicate checking
  if (isGoogleSheetsApiConfigured()) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';

    // Read all data from sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:E`,
    });

    const rows = response.data.values || [];
    
    // Skip header row if exists
    const dataRows = rows.length > 0 && rows[0][0]?.toLowerCase().includes('timestamp') 
      ? rows.slice(1) 
      : rows;

    // Find row with matching email (column C, index 2)
    const emailLower = email.toLowerCase().trim();
    for (let i = 0; i < dataRows.length; i++) {
      if (dataRows[i][2]?.toLowerCase().trim() === emailLower) {
        const rowNumber = rows.length > 0 && rows[0][0]?.toLowerCase().includes('timestamp') 
          ? i + 2 
          : i + 1;
        logger.info('Existing lead found in Google Sheets', { 
          email, 
          rowNumber 
        });
        return rowNumber.toString();
      }
    }

    return null;
  } catch (error) {
    logger.warn('Failed to check Google Sheets for existing lead', {
      error: error.message,
      email,
    });
    return null;
  }
  }

  return null;
}

/**
 * Initializes Google Sheets with header row if sheet is empty
 * Note: Webhook method auto-creates headers, so this only applies to API method
 * @returns {Promise<void>}
 */
async function initializeGoogleSheets() {
  if (!isGoogleSheetsConfigured()) {
    return;
  }

  // Webhook method auto-creates headers in the Apps Script
  if (isGoogleSheetsWebhookConfigured() && !isGoogleSheetsApiConfigured()) {
    logger.debug('Headers auto-created by webhook, skipping initialization');
    return;
  }

  // Use API method for header initialization
  if (isGoogleSheetsApiConfigured()) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';

    // Check if sheet has data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:E1`,
    });

    const hasHeaders = response.data.values && response.data.values.length > 0;

    if (!hasHeaders) {
      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:E1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['Timestamp', 'Name', 'Email', 'Phone', 'Paid']],
        },
      });

      logger.info('Google Sheets initialized with headers', { sheetName });
    }
  } catch (error) {
    logger.warn('Failed to initialize Google Sheets headers', {
      error: error.message,
    });
    // Don't throw - sheet might already have headers
    }
  }
}

module.exports = {
  isGoogleSheetsConfigured,
  isGoogleSheetsWebhookConfigured,
  isGoogleSheetsApiConfigured,
  getGoogleSheetsClient,
  saveLeadToSheets,
  saveLeadToSheetsViaWebhook,
  findExistingLeadInSheets,
  initializeGoogleSheets,
};

