# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets as an alternative (or additional) storage backend for form submissions.

---

## 📋 Overview

You can now choose between two storage options for form submissions:
1. **Supabase** (existing)
2. **Google Sheets** (new)
3. **Both** (save to both simultaneously)
4. **Auto** (use Supabase if available, fallback to Google Sheets)

---

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - **Name**: `silent-equity-form-service`
   - **Description**: `Service account for form submissions`
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select **JSON** format
5. Click "Create" - this downloads a JSON file

### Step 4: Share Google Sheet with Service Account

1. Create a new Google Sheet or use an existing one
2. Click "Share" button
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it **Editor** permissions
5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 5: Configure Environment Variables

Add these to your `.env` file:

#### Option A: Using JSON Credentials (Recommended)
```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
GOOGLE_SHEETS_SHEET_NAME=Sheet1
FORM_STORAGE_BACKEND=auto
```

#### Option B: Using Individual Variables
```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SHEET_NAME=Sheet1
FORM_STORAGE_BACKEND=auto
```

---

## ⚙️ Configuration Options

### FORM_STORAGE_BACKEND

Control which storage backend(s) to use:

- **`supabase`**: Only use Supabase (default if only Supabase configured)
- **`google_sheets`**: Only use Google Sheets
- **`both`**: Save to both Supabase and Google Sheets
- **`auto`**: Use Supabase if available, fallback to Google Sheets (recommended)

**Example**:
```env
FORM_STORAGE_BACKEND=both  # Save to both Supabase and Google Sheets
```

---

## 📊 Google Sheet Structure

The integration automatically creates headers if the sheet is empty:

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | ISO timestamp of submission |
| B | Name | Customer name |
| C | Email | Customer email (lowercase) |
| D | Phone | Customer phone (formatted) |
| E | Paid | Payment status (Yes/No) |

---

## ✅ Testing

### Test Google Sheets Integration

```bash
cd backend
node -e "
const { isGoogleSheetsConfigured, saveLeadToSheets } = require('./config/googleSheets');
if (isGoogleSheetsConfigured()) {
  console.log('✅ Google Sheets configured');
  saveLeadToSheets({
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    paid: false
  }).then(rowId => {
    console.log('✅ Test lead saved to row:', rowId);
  }).catch(err => {
    console.error('❌ Error:', err.message);
  });
} else {
  console.log('❌ Google Sheets not configured');
}
"
```

---

## 🔍 Troubleshooting

### Issue: "Google Sheets credentials are not configured"
**Solution**: Make sure `GOOGLE_SHEETS_SPREADSHEET_ID` and credentials are set in `.env`

### Issue: "Permission denied"
**Solution**: Share the Google Sheet with the service account email (Editor permissions)

### Issue: "Sheet not found"
**Solution**: Check that `GOOGLE_SHEETS_SHEET_NAME` matches the sheet tab name (default: "Sheet1")

### Issue: "Invalid credentials"
**Solution**: 
- Verify the JSON credentials are valid
- If using individual variables, ensure `GOOGLE_SHEETS_PRIVATE_KEY` includes `\n` characters properly

---

## 📝 Notes

- **Duplicate Detection**: The system checks for existing emails in Google Sheets before inserting
- **Auto Headers**: Headers are automatically created if the sheet is empty
- **Error Handling**: If Google Sheets save fails, the form submission still proceeds (data stored in Stripe metadata)
- **Phone Formatting**: Phone numbers are automatically formatted with country code

---

## 🎯 Recommended Setup

For maximum reliability, use **both** storage backends:

```env
FORM_STORAGE_BACKEND=both
```

This ensures:
- ✅ Data saved to Supabase (for database queries)
- ✅ Data saved to Google Sheets (for easy viewing/export)
- ✅ Redundancy if one backend fails

---

## ✅ Status

Once configured, form submissions will automatically save to Google Sheets based on your `FORM_STORAGE_BACKEND` setting!

