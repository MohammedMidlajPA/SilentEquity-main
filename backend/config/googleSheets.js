const { google } = require('googleapis');
const { logger } = require('../utils/logger');

let sheetsClient = null;
let currentCredentials = null;

/**
 * Checks if Google Sheets is configured with required environment variables
 * @returns {boolean} True if Google Sheets credentials and spreadsheet ID are configured
 */
function isGoogleSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    (
      process.env.GOOGLE_SHEETS_CREDENTIALS || 
      (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY)
    )
  );
}

/**
 * Gets or creates the Google Sheets client instance
 * Uses singleton pattern to reuse the same client across requests
 * @returns {Object} Google Sheets client instance
 * @throws {Error} If Google Sheets credentials are not configured
 */
function getGoogleSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets credentials are not configured');
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
 * Saves lead data to Google Sheets
 * @param {Object} lead - Lead data to save
 * @returns {Promise<string|null>} Row number if successful, null otherwise
 */
async function saveLeadToSheets(lead) {
  if (!isGoogleSheetsConfigured()) {
    logger.warn('Google Sheets not configured, skipping save');
    return null;
  }

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

    logger.info('Lead saved to Google Sheets', {
      rowNumber,
      email: lead.email,
      sheetName,
    });

    return rowNumber || null;
  } catch (error) {
    logger.error('Failed to save lead to Google Sheets', {
      error: error.message,
      email: lead.email,
    });
    return null;
  }
}

/**
 * Checks if email already exists in Google Sheets
 * @param {string} email - Email to check
 * @returns {Promise<string|null>} Row number if found, null otherwise
 */
async function findExistingLeadInSheets(email) {
  if (!isGoogleSheetsConfigured()) {
    return null;
  }

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

/**
 * Initializes Google Sheets with header row if sheet is empty
 * @returns {Promise<void>}
 */
async function initializeGoogleSheets() {
  if (!isGoogleSheetsConfigured()) {
    return;
  }

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

module.exports = {
  isGoogleSheetsConfigured,
  getGoogleSheetsClient,
  saveLeadToSheets,
  findExistingLeadInSheets,
  initializeGoogleSheets,
};

