/**
 * TOGKF India - Blogs System
 *
 * JSON API (doGet): returns verified posts for the site generator.
 * publishBlog(): assigned to the "Publish to Website" drawing button in the sheet.
 *
 * Setup: see scripts/blogs/README.md
 */

function doGet() {
  try {
    const posts = getVerifiedPosts();
    return ContentService.createTextOutput(JSON.stringify({ posts: posts }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Assign this function to the sheet drawing button:
 * Insert → Drawing → "Publish to Website" → Assign script → publishBlog
 */
function publishBlog() {
  triggerGithubDeploy();
  SpreadsheetApp.getUi().alert(
    'Publishing started. Your article(s) should appear on togkf.in within 1–2 minutes.'
  );
}

function triggerGithubDeploy() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('GITHUB_TOKEN');
  const repo = props.getProperty('GITHUB_REPO') || 'sk5268/togkf';

  if (!token) {
    throw new Error('GITHUB_TOKEN not set in Script Properties.');
  }

  const url = 'https://api.github.com/repos/' + repo + '/dispatches';
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    payload: JSON.stringify({ event_type: 'publish-blog' }),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('GitHub dispatch failed (' + code + '): ' + response.getContentText());
  }
}

function getBlogSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');

  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  // Fallback when run from the bound sheet (e.g. publishBlog button).
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    return active;
  }

  throw new Error(
    'SPREADSHEET_ID not set in Script Properties. ' +
    'Add your sheet ID (from the sheet URL) and redeploy the web app.'
  );
}

function getVerifiedPosts() {
  const ss = getBlogSpreadsheet();
  const sheet = ss.getSheets()[0];
  if (!sheet) {
    throw new Error('No sheets found in the spreadsheet.');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const posts = data.map(function (row) {
    const post = {};
    headers.forEach(function (header, index) {
      if (header) {
        let key = header.toString().toLowerCase().trim().replace(/ /g, '_');
        let val = row[index];

        if (val && typeof val === 'object' && val.toString() === 'CellImage') {
          try {
            val = val.getContentUrl();
          } catch (err) {
            val = '';
          }
        } else if (key.includes('image') && typeof val === 'string' && val.includes('drive.google.com/file/d/')) {
          const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            val = 'https://drive.google.com/uc?export=view&id=' + match[1];
          }
        }

        post[key] = val;
      }
    });
    return post;
  }).filter(function (p) {
    const isVerified = p.verified && String(p.verified).trim().toUpperCase() === 'VERIFIED';
    return p.title && p.url_title && isVerified;
  });

  posts.sort(function (a, b) {
    return new Date(b.date_published) - new Date(a.date_published);
  });

  return posts;
}
