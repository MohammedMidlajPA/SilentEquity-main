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

