/**
 * TOGKF India - Events System
 * Fetches events from a Google Sheet and returns them as categorized JSON.
 */

function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; // Always use the first sheet
    if (!sheet) {
      throw new Error("No sheets found in the spreadsheet.");
    }

    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove headers
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today for comparison

    const events = data.map(row => {
      const event = {};
      headers.forEach((header, index) => {
        if (header) { // Handle column gaps
          let key = header.toString().toLowerCase().trim().replace(/ /g, '_');
          let val = row[index];
          
          // If the value is a CellImage object (dragged and dropped into the cell)
          if (val && typeof val === 'object' && val.toString() === 'CellImage') {
            try {
              val = val.getContentUrl();
            } catch (e) {
              val = ''; // Fallback if getContentUrl fails
            }
          }
          // If the user pastes a Google Drive link for the image, convert it to a direct link
          else if (key.includes('image') && typeof val === 'string' && val.includes('drive.google.com/file/d/')) {
            const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
              val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
          }
          
          event[key] = val;
        }
      });
      return event;
    }).filter(e => {
      // Filter out empty rows and require the VERIFIED column
      const isVerified = e.verified && String(e.verified).trim().toUpperCase() === 'VERIFIED';
      return e.title && isVerified;
    });

    const categorized = {
      ongoing: [],
      upcoming: [],
      past: []
    };

    events.forEach(event => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date || event.start_date); // Default end to start if missing
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (now >= start && now <= end) {
        categorized.ongoing.push(event);
      } else if (now < start) {
        categorized.upcoming.push(event);
      } else {
        categorized.past.push(event);
      }
    });

    // Sort: Ongoing (Start date asc), Upcoming (Start date asc), Past (End date desc)
    categorized.ongoing.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    categorized.upcoming.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    categorized.past.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

    return ContentService.createTextOutput(JSON.stringify(categorized))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 'error': err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
