/**
 * Halloween Party 2026 - Google Apps Script API
 *
 * Deploy as Web App:
 *   - Execute as: Me
 *   - Who has access: Anyone
 *
 * Sheet structure (Sheet1):
 *   Column A: timestamp
 *   Column B: nickname
 *   Column C: show  (manually set to "Y" to display publicly, default "N")
 */

var SHEET_NAME = 'Sheet1';
var HEADERS = ['timestamp', 'nickname', 'show'];

// ── Utility ────────────────────────────────────────────────────────────
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers on first use
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function corsResponse(output) {
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>"'&]/g, function(c) {
      var map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return map[c] || c;
    });
}

// ── POST Handler ────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'apply') {
      return handleApply(body);
    }

    return corsResponse({ success: false, message: 'Unknown action' });
  } catch (err) {
    return corsResponse({ success: false, message: 'Invalid request: ' + err.message });
  }
}

function handleApply(body) {
  var nickname = sanitize(body.nickname);

  // Validation
  if (!nickname || nickname.length === 0) {
    return corsResponse({ success: false, message: '닉네임을 입력해주세요.' });
  }
  if (nickname.length > 20) {
    return corsResponse({ success: false, message: '닉네임은 최대 20자까지 입력 가능합니다.' });
  }

  var sheet = getSheet();
  var timestamp = new Date().toISOString();

  // Append row: timestamp | nickname | show=N
  sheet.appendRow([timestamp, nickname, 'N']);

  return corsResponse({ success: true });
}

// ── GET Handler ────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === 'attendees') {
      return handleAttendees();
    }

    return corsResponse({ success: false, message: 'Unknown action' });
  } catch (err) {
    return corsResponse({ success: false, message: 'Error: ' + err.message });
  }
}

function handleAttendees() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    // Only header row or empty
    return corsResponse({ success: true, attendees: [] });
  }

  // Find column indices from header row
  var headers = data[0];
  var nicknameIdx = headers.indexOf('nickname');
  var showIdx = headers.indexOf('show');

  if (nicknameIdx === -1 || showIdx === -1) {
    return corsResponse({ success: false, message: 'Sheet columns not found' });
  }

  var attendees = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var show = String(row[showIdx]).trim().toUpperCase();
    if (show === 'Y') {
      var nickname = String(row[nicknameIdx]).trim();
      if (nickname) {
        attendees.push(nickname);
      }
    }
  }

  return corsResponse({ success: true, attendees: attendees });
}
