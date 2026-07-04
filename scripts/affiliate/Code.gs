/**
 * TOGKF India - Affiliation System
 * Handles: Sheet logging, HTML Report Generation, and Email to Sensei
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Submissions');

    // 1. Log to Google Sheets (Atomic 25-Column Format)
    sheet.appendRow([
      new Date(),                  // A: Timestamp
      data.affiliation_type,       // B: Affiliation Type
      data.prefix,                 // C: Prefix
      data.firstName,              // D: First Name
      data.lastName,               // E: Last Name
      data.email,                  // F: Email
      data.mobile,                 // G: Mobile
      data.rank || "N/A",          // H: Rank
      data.dateGraded || "N/A",    // I: Date Graded
      data.awardedBy || "N/A",     // J: Awarded By
      data.yearsPracticing || 0,   // K: Years Practicing
      data.instructorType || "N/A",// L: Instructor Type
      data.orgName || "N/A",       // M: Org Name
      data.dateEstablished || "N/A",// N: Date Established
      data.numDojos || 0,          // O: Num Dojos
      data.numBlackBelts || 0,     // P: Num Black Belts
      data.numStudents || 0,       // Q: Num Students
      data.history || "N/A",       // R: Dojo History
      data.address1,               // S: Address 1
      data.address2 || "",         // T: Address 2
      data.city,                   // U: City
      data.state,                  // V: State
      data.pincode,                // W: Pincode
      data.whyJoin,                // X: Why Join
      data.socialLinks             // Y: Social Links
    ]);

    // 2. Generate HTML report from template
    const htmlTemplate = HtmlService.createTemplateFromFile('pdf_template');
    
    // Membership type mapping
    const membershipTypeMap = {
      'Individual Member': 'Individual Membership',
      'Dojo': 'Dojo Membership',
      'Organization': 'Organization Membership'
    };
    const membershipType = membershipTypeMap[data.affiliation_type] || data.affiliation_type;

    // Date formatter helper
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === 'N/A') return 'N/A';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    // Parse social links string "Platform: URL | Platform: URL" into an array
    let socialLinksArray = [];
    if (data.socialLinks && typeof data.socialLinks === 'string') {
      socialLinksArray = data.socialLinks.split(' | ').map(link => {
        const parts = link.split(': ');
        return { 
          platform: parts[0], 
          url: parts.slice(1).join(': ') 
        };
      }).filter(l => l.url.trim().length > 0);
    }
    
    htmlTemplate.d = data;
    htmlTemplate.membershipType = membershipType;
    htmlTemplate.socialLinksArray = socialLinksArray;
    htmlTemplate.formatDate = formatDate;
    const htmlContent = htmlTemplate.evaluate().getContent();
    const htmlBlob = Utilities.newBlob(htmlContent, 'text/html', 'TOGKF_Affiliation_' + data.lastName + '.html');

    // 3. Email to Sensei
    const senseiEmails = "srimadhavak@gmail.com, mvijaykr@hotmail.com"; 
    const fullName = data.prefix + ' ' + data.firstName + ' ' + data.lastName;
    
    GmailApp.sendEmail(senseiEmails, 'New ' + data.affiliation_type + ' Application: ' + fullName, 
      "Hello Sensie,\n\nA new affiliation request has been submitted via the website. Please find the application details attached.\n\nOpen the .html file in any browser to view the formatted report.", {
      attachments: [htmlBlob],
      name: "TOGKF India Admin"
    });

    // 4. Acknowledgement Email to Applicant
    const applicantEmail = data.email;
    if (applicantEmail) {
      const applicantSubject = 'TOGKF India Affiliation Application Received';
      const applicantBody = 'Hello ' + data.firstName + ',\n\n' +
        'Thank you for submitting your application for ' + membershipType + ' with TOGKF India.\n\n' +
        'We have received your details and our team will review your application shortly.\n\n' +
        'For your records, we have attached a copy of your application details (as an HTML file) to this email.\n\n' +
        'Warm regards,\n' +
        'TOGKF India Admin';
      
      GmailApp.sendEmail(applicantEmail, applicantSubject, applicantBody, {
        attachments: [htmlBlob],
        name: "TOGKF India Admin"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}