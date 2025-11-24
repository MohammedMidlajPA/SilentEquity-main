# Google Sheets Setup via Apps Script Webhook

**Simple setup - No Google Cloud credentials needed!**

This guide shows you how to set up Google Sheets integration using Google Apps Script webhook. This method is much simpler than using Google Cloud API - you don't need service accounts, API keys, or OAuth setup.

---

## Why Use Apps Script Webhook?

✅ **No Google Cloud setup** - No need to create projects or service accounts  
✅ **No credentials** - No API keys or OAuth tokens  
✅ **Simple deployment** - Just create a script and get a webhook URL  
✅ **Automatic headers** - Headers are created automatically  
✅ **Easy to test** - Test directly in Google Sheets  

---

## Step-by-Step Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it something like "Course Enrollment Leads" (optional)

**Keep this sheet open** - you'll need it in the next steps.

---

### Step 2: Create Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
   - This opens a new tab with the Apps Script editor

2. **Delete** any existing code in the editor

3. **Copy and paste** this code:

```javascript
// Test function - allows you to verify webhook is working via browser
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: "Webhook is active! Use POST requests to send data.",
    status: "ready",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Main function - receives form submission data from backend
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Check if headers exist (if sheet is empty)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Paid']);
    }
    
    // Append the new row
    const row = [
      new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.paid ? 'Yes' : 'No'
    ];
    
    sheet.appendRow(row);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾 icon or Ctrl+S / Cmd+S)
5. Name your project (e.g., "Course Leads Webhook")

---

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
   - If you see "Test deployments", click the gear icon ⚙️ → **New deployment**

2. Click the **Select type** dropdown → Choose **Web app**

3. Configure the deployment:
   - **Description**: "Course Leads Webhook" (optional)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important!)
   - Click **Deploy**

4. **Authorize the script**:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**

5. **Copy the Web App URL**:
   - You'll see a URL like: `https://script.google.com/macros/s/AKfycby.../exec`
   - **Copy this entire URL** - this is your webhook URL!

---

### Step 4: Test the Webhook

Before configuring your backend, test that the webhook works:

**Option A: Use the test script (Recommended)**

```bash
# First, add the webhook URL to backend/.env:
# GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec

# Then run the test script:
node scripts/test-google-sheets-webhook.js
```

**Option B: Test in browser**

1. Open your webhook URL in a browser
2. You should see: `{"message":"Webhook is active! Use POST requests to send data.","status":"ready",...}`
3. This confirms the `doGet` function is working

**Option C: Test with curl**

```bash
curl -X POST "YOUR_WEBHOOK_URL_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "paid": false
  }'
```

4. **Check your Google Sheet** - you should see:
   - Headers: Timestamp, Name, Email, Phone, Paid
   - One test row with your test data

If you see the data, **your webhook is working!** ✅

---

### Step 5: Configure Backend

Add this to your `backend/.env` file:

```env
# Google Sheets Webhook (Apps Script)
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Storage Backend Selection
# Options: supabase, google_sheets, both, auto
FORM_STORAGE_BACKEND=both
```

**Storage Backend Options:**
- `supabase` - Only use Supabase
- `google_sheets` - Only use Google Sheets webhook
- `both` - Save to both Supabase and Google Sheets (recommended)
- `auto` - Use Supabase first, fallback to Google Sheets

---

### Step 6: Restart Backend

Restart your backend server for changes to take effect:

```bash
cd backend
npm start
# or if using nodemon
npm run dev
```

---

## Verification

After setup, test a form submission:

1. Submit the enrollment form on your website
2. Check your Google Sheet - you should see the new row appear
3. Check backend logs for confirmation

---

## Troubleshooting

### Issue: "Webhook URL appears to be invalid"

**Solution**: Make sure the URL starts with `https://script.google.com/macros/s/` and ends with `/exec`

### Issue: "Request timeout" or "Connection refused"

**Solution**: 
- Make sure "Who has access" is set to **Anyone** (not "Only myself")
- Check that the script is deployed (not just saved)
- Try redeploying the script

### Issue: Data not appearing in sheet

**Solution**:
- Check backend logs for errors
- Test the webhook URL directly (Step 4)
- Make sure you're looking at the correct Google Sheet
- Check that the script has permission to edit the sheet

### Issue: "Authorization required"

**Solution**:
- Make sure you authorized the script (Step 3, step 4)
- Try redeploying and authorizing again

### Issue: Duplicate rows appearing

**Solution**:
- The webhook method doesn't check for duplicates automatically
- If you need duplicate checking, use the API method or configure both methods (`FORM_STORAGE_BACKEND=both`)

---

## Sheet Structure

Your Google Sheet will have these columns:

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | ISO timestamp of submission |
| B | Name | Customer name |
| C | Email | Customer email (lowercase) |
| D | Phone | Customer phone (formatted with +) |
| E | Paid | Payment status (Yes/No) |

Headers are automatically created when the first row is added.

---

## Security Notes

⚠️ **Important**: Your webhook URL is publicly accessible. Anyone with the URL can add data to your sheet.

**Best Practices:**
- Don't share your webhook URL publicly
- Keep it in your `.env` file (never commit to git)
- Consider adding authentication to your Apps Script if needed
- Monitor your sheet for unexpected data

---

## Advanced: Adding Authentication (Optional)

If you want to secure your webhook, modify the Apps Script:

```javascript
function doPost(e) {
  // Add your secret token here
  const SECRET_TOKEN = 'your-secret-token-here';
  
  // Check for token in request
  const token = e.parameter.token || JSON.parse(e.postData.contents).token;
  if (token !== SECRET_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Unauthorized'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ... rest of the code
}
```

Then add the token to your backend requests (you'll need to modify `googleSheets.js`).

---

## Migration from API Method

If you're currently using the Google Cloud API method and want to switch to webhook:

1. Set up the webhook (Steps 1-4 above)
2. Add `GOOGLE_SHEETS_WEBHOOK_URL` to your `.env`
3. Remove or comment out the old API credentials:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SHEETS_CREDENTIALS`
   - `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `GOOGLE_SHEETS_PRIVATE_KEY`
4. Restart backend

The webhook method will be used automatically if configured.

---

## Support

If you encounter issues:

1. Check backend logs: `backend/logs/` directory
2. Test webhook directly (Step 4)
3. Verify `.env` file has correct webhook URL
4. Make sure backend server is restarted

---

**That's it!** Your Google Sheets integration is now set up and ready to receive form submissions. 🎉

