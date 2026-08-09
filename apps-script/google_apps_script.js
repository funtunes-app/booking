// =============================================================================
// FunTunes Google Apps Script — Backend API v2
// =============================================================================
// CHANGES IN v2:
// 1. Serial number is incremental per month tab (not fixed at 24)
// 2. Each kid gets a separate row (e.g. 3 kids = 3 rows)
// 3. "Amount EOD Total" column shows running total for the day
// 4. Date format: DD/MM/YYYY
// 5. Time format: 12hr with am/pm
// =============================================================================

const SPREADSHEET_ID = "17TBKunijIqq1JFuonQg8ygoCzrI6Ncfg81tvP3uduJM";

const HEADERS = [
  "Sl.no", "Date", "Customer name", "Amount", "MOP",
  "Socks", "MOP - Socks", "No of kids", "Hours",
  "Timing", "Phone number", "DOB", "Amount  EOD Total", "Entry Type", "Timestamp"
];

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getMonthTabName(dateStr) {
  var d = new Date(dateStr);
  var months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return "Funzone - " + months[d.getMonth()] + " " + d.getFullYear();
}

function getOrCreateSheet(tabName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#f0f0f0");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Get next serial number for a specific date (resets to 1 each day)
function getNextSlNo(sheet, formattedDate) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1;
  var dates = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  var count = 0;
  for (var i = 0; i < dates.length; i++) {
    if (normalizeDate(dates[i][0]) === normalizeDate(formattedDate)) {
      count++;
    }
  }
  return count + 1;
}

// Format date as DD/MM/YYYY
function formatDate(dateStr) {
  var d = new Date(dateStr);
  var dd = ("0" + d.getDate()).slice(-2);
  var mm = ("0" + (d.getMonth() + 1)).slice(-2);
  var yyyy = d.getFullYear();
  return dd + "/" + mm + "/" + yyyy;
}

// Convert 24hr time "14:30" to 12hr "02:30 PM"
function formatTime12(time24) {
  if (!time24 || time24.indexOf(":") === -1) return time24 || "";
  var parts = time24.split(":");
  var h = parseInt(parts[0]);
  var m = parts[1];
  var ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return ("0" + h).slice(-2) + ":" + m + " " + ampm;
}

// Format timing string to 12hr
function formatTiming(timeIn, timeOut) {
  if (!timeIn) return "";
  var tIn = formatTime12(timeIn);
  var tOut = formatTime12(timeOut);
  if (tOut) return tIn + " to " + tOut;
  return tIn;
}

// Recalculate all EOD totals for a given date — running cumulative on every row
function recalcEodForDate(sheet, targetDate) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  var data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var targetNorm = normalizeDate(targetDate);
  var runningTotal = 0;
  for (var i = 0; i < data.length; i++) {
    var rowDateNorm = normalizeDate(data[i][1]);
    if (rowDateNorm === targetNorm) {
      var amt = parseFloat(data[i][3]);
      if (!isNaN(amt)) runningTotal += amt;
      sheet.getRange(i + 2, 13).setValue(runningTotal);
    }
  }
}

function rowToObject(headers, row, rowIndex, tabName) {
  var obj = { _rowIndex: rowIndex, _tab: tabName };
  for (var i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i] !== undefined ? row[i] : "";
  }
  return obj;
}

// ── CORS + Routing ──────────────────────────────────────────────────────────

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  var params = e.parameter || {};
  var action = params.action || "";
  var result;
  try {
    switch (action) {
      case "read":
        result = handleRead(params);
        break;
      case "add":
        var body = JSON.parse(e.postData.contents);
        result = handleAdd(body);
        break;
      case "update":
        var body2 = JSON.parse(e.postData.contents);
        result = handleUpdate(body2);
        break;
      case "delete":
        var body3 = JSON.parse(e.postData.contents);
        result = handleDelete(body3);
        break;
      case "tabs":
        result = handleListTabs();
        break;
      case "birthdays":
        result = handleBirthdays(params);
        break;
      case "updateBirthdayCall":
        var body4 = JSON.parse(e.postData.contents);
        result = handleUpdateBirthdayCall(body4);
        break;
      default:
        result = { success: false, error: "Unknown action: " + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── READ ────────────────────────────────────────────────────────────────────

// Normalize any date value to DD/MM/YYYY string for comparison
function normalizeDate(val) {
  if (!val) return "";
  // If it's a Date object (Google Sheets stores dates as Date)
  if (val instanceof Date || (typeof val === "object" && val.getMonth)) {
    var dd = ("0" + val.getDate()).slice(-2);
    var mm = ("0" + (val.getMonth() + 1)).slice(-2);
    return dd + "/" + mm + "/" + val.getFullYear();
  }
  var s = String(val).trim();
  // Already DD/MM/YYYY
  if (s.match(/^\d{2}\/\d{2}\/\d{4}$/)) return s;
  // DD.MM.YYYY → DD/MM/YYYY
  if (s.match(/^\d{2}\.\d{2}\.\d{4}$/)) return s.replace(/\./g, "/");
  // YYYY-MM-DD → DD/MM/YYYY
  if (s.match(/^\d{4}-\d{2}-\d{2}/)) {
    var parts = s.slice(0, 10).split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }
  return s;
}

function handleRead(params) {
  var month = params.month;
  var date = params.date;
  var tabName;

  if (month && month.indexOf("Funzone") === 0) {
    tabName = month;
  } else if (month) {
    var parts = month.split("-");
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    tabName = "Funzone - " + months[parseInt(parts[1]) - 1] + " " + parts[0];
  } else if (date) {
    tabName = getMonthTabName(date);
  } else {
    return { success: false, error: "Provide month or date parameter" };
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    return { success: true, data: [], tab: tabName, message: "Tab not found" };
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: true, data: [], tab: tabName };
  }

  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  var entries = [];
  var targetNormalized = date ? normalizeDate(formatDate(date)) : null;

  for (var i = 0; i < rows.length; i++) {
    var obj = rowToObject(headers, rows[i], i + 2, tabName);
    if (targetNormalized) {
      var entryDateNorm = normalizeDate(rows[i][1]);
      if (entryDateNorm !== targetNormalized) continue;
    }
    entries.push(obj);
  }

  return { success: true, data: entries, tab: tabName, count: entries.length };
}

// ── ADD: Creates one row per kid ────────────────────────────────────────────

function handleAdd(body) {
  var entry = body.entry;
  if (!entry) return { success: false, error: "No entry provided" };

  var dateStr = entry.date || new Date().toISOString().slice(0, 10);
  var tabName = getMonthTabName(dateStr);
  var sheet = getOrCreateSheet(tabName);
  var numKids = parseInt(entry.numKids) || 1;
  var formattedDate = formatDate(dateStr);
  var timing = formatTiming(entry.timeIn, entry.timeOut);
  var amount = parseInt(entry.amount) || 0;
  var results = [];

  for (var k = 0; k < numKids; k++) {
    var slNo = getNextSlNo(sheet, formattedDate);
    var customerName = entry.customerName || "";
    // If multiple kids, add "- Kid 1", "- Kid 2" etc.
    if (numKids > 1) {
      // Only add suffix if not already present
      if (customerName.indexOf("- Kid") === -1) {
        customerName = customerName + " - Kid " + (k + 1);
      }
    }

    var row = [
      slNo,
      formattedDate,
      customerName,
      amount,
      entry.mop || "",
      entry.socks || "-",
      entry.socksMop || "-",
      1,
      entry.hours || "1",
      timing,
      entry.phone || "",
      entry.dob || "",
      "",  // EOD total — will be calculated below
      entry.entryType || "funzone",
      new Date().toISOString()
    ];

    sheet.appendRow(row);
    results.push({ slNo: slNo, row: sheet.getLastRow() });
  }

  // Recalculate EOD totals for this date
  recalcEodForDate(sheet, formattedDate);

  return {
    success: true,
    message: numKids + " row(s) added",
    tab: tabName,
    entries: results
  };
}

// ── UPDATE ──────────────────────────────────────────────────────────────────

function handleUpdate(body) {
  var tabName = body.tab;
  var rowIndex = body.rowIndex;
  var entry = body.entry;

  if (!tabName || !rowIndex || !entry) {
    return { success: false, error: "tab, rowIndex, and entry required" };
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return { success: false, error: "Tab not found: " + tabName };

  var dateStr = entry.date || new Date().toISOString().slice(0, 10);
  var formattedDate = formatDate(dateStr);
  var timing = formatTiming(entry.timeIn, entry.timeOut);

  var row = [
    entry.slNo || "",
    formattedDate,
    entry.customerName || "",
    parseInt(entry.amount) || 0,
    entry.mop || "",
    entry.socks || "-",
    entry.socksMop || "-",
    entry.numKids || 1,
    entry.hours || "1",
    timing,
    entry.phone || "",
    entry.dob || "",
    "",
    entry.entryType || "funzone",
    new Date().toISOString()
  ];

  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  recalcEodForDate(sheet, formattedDate);

  return { success: true, message: "Entry updated", tab: tabName, rowIndex: rowIndex };
}

// ── DELETE ───────────────────────────────────────────────────────────────────

function handleDelete(body) {
  var tabName = body.tab;
  var rowIndex = body.rowIndex;

  if (!tabName || !rowIndex) {
    return { success: false, error: "tab and rowIndex required" };
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return { success: false, error: "Tab not found" };

  // Get the date before deleting so we can recalc EOD
  var dateVal = "";
  try {
    dateVal = String(sheet.getRange(rowIndex, 2).getValue());
  } catch(e) {}

  sheet.deleteRow(rowIndex);

  // Recalculate EOD totals for that date
  if (dateVal) {
    recalcEodForDate(sheet, dateVal);
  }

  return { success: true, message: "Entry deleted", tab: tabName };
}

// ── BIRTHDAYS ───────────────────────────────────────────────────────────────
// Scans all "Funzone -" tabs for DOB entries falling in the target month.
// Merges with the "Birthday Calls" tab for contacted status, notes, parent name.

var BIRTHDAY_CALLS_TAB = "Birthday Calls";
var BIRTHDAY_CALL_HEADERS = [
  "Key", "Year", "Month", "Day", "Kid Name", "Parent Name",
  "Phone", "Status", "Notes", "Last Updated"
];
// Status is one of: not_contacted, warm, rejected, booking

function getBirthdayCallsSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(BIRTHDAY_CALLS_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(BIRTHDAY_CALLS_TAB);
    sheet.getRange(1, 1, 1, BIRTHDAY_CALL_HEADERS.length).setValues([BIRTHDAY_CALL_HEADERS]);
    sheet.getRange(1, 1, 1, BIRTHDAY_CALL_HEADERS.length).setFontWeight("bold").setBackground("#f0f0f0");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function makeBirthdayKey(name, day, month, year) {
  return String(name).trim().toLowerCase() + "|" + day + "|" + month + "|" + year;
}

function parseDobToParts(val) {
  // Returns {day, month, year} or null if unparseable
  if (!val) return null;
  if (val instanceof Date || (typeof val === "object" && val.getMonth)) {
    return { day: val.getDate(), month: val.getMonth() + 1, year: val.getFullYear() };
  }
  var s = String(val).trim();
  if (!s || s === "-") return null;
  // YYYY-MM-DD (from <input type="date">)
  var m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m1) return { day: parseInt(m1[3]), month: parseInt(m1[2]), year: parseInt(m1[1]) };
  // DD/MM/YYYY
  var m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) return { day: parseInt(m2[1]), month: parseInt(m2[2]), year: parseInt(m2[3]) };
  // DD.MM.YYYY
  var m3 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m3) return { day: parseInt(m3[1]), month: parseInt(m3[2]), year: parseInt(m3[3]) };
  return null;
}

function cleanKidName(name) {
  if (!name) return name;
  // Strip " - Kid 1", " - Kid 2" etc. suffix for display
  return String(name).replace(/\s*-\s*Kid\s*\d+\s*$/i, "").trim();
}

function handleBirthdays(params) {
  var targetMonth = params.month ? parseInt(params.month) : (new Date().getMonth() + 1);
  var targetYear = params.year ? parseInt(params.year) : (new Date().getFullYear());

  var ss = getSpreadsheet();
  var sheets = ss.getSheets();
  var seen = {}; // key: name|day|month -> true (dedupe by kid identity, not year)
  var results = [];

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var tabName = sheet.getName();
    if (tabName.indexOf("Funzone -") !== 0) continue;

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) continue;
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    var nameCol = headers.indexOf("Customer name");
    var dobCol = headers.indexOf("DOB");
    var phoneCol = headers.indexOf("Phone number");
    if (nameCol === -1 || dobCol === -1) continue;

    var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (var i = 0; i < rows.length; i++) {
      var dobParts = parseDobToParts(rows[i][dobCol]);
      if (!dobParts || dobParts.month !== targetMonth) continue;

      var rawName = rows[i][nameCol];
      var name = cleanKidName(rawName);
      if (!name) continue;

      var dedupeKey = name.toLowerCase() + "|" + dobParts.day + "|" + dobParts.month;
      if (seen[dedupeKey]) continue;
      seen[dedupeKey] = true;

      var turningAge = dobParts.year ? (targetYear - dobParts.year) : null;
      var week = Math.min(5, Math.ceil(dobParts.day / 7));

      results.push({
        key: makeBirthdayKey(name, dobParts.day, dobParts.month, targetYear),
        kidName: name,
        parentName: "",
        day: dobParts.day,
        month: dobParts.month,
        year: targetYear,
        birthYear: dobParts.year || null,
        turningAge: turningAge,
        week: week,
        phone: phoneCol !== -1 ? String(rows[i][phoneCol] || "") : "",
        status: "not_contacted",
        notes: ""
      });
    }
  }

  // Merge with Birthday Calls tab for status/notes/parentName overrides
  var callsSheet = getBirthdayCallsSheet();
  var callsLastRow = callsSheet.getLastRow();
  if (callsLastRow > 1) {
    var callRows = callsSheet.getRange(2, 1, callsLastRow - 1, BIRTHDAY_CALL_HEADERS.length).getValues();
    var callMap = {};
    for (var c = 0; c < callRows.length; c++) {
      callMap[String(callRows[c][0])] = {
        parentName: callRows[c][5] || "",
        phone: callRows[c][6] || "",
        status: callRows[c][7] || "not_contacted",
        notes: callRows[c][8] || ""
      };
    }
    for (var r = 0; r < results.length; r++) {
      var match = callMap[results[r].key];
      if (match) {
        results[r].parentName = match.parentName || "";
        results[r].phone = match.phone || results[r].phone;
        results[r].status = match.status;
        results[r].notes = match.notes || "";
      }
    }
  }

  results.sort(function(a, b) { return a.day - b.day; });

  return { success: true, month: targetMonth, year: targetYear, data: results, count: results.length };
}

// Upsert a birthday call record (status, notes, parent name, phone override)
function handleUpdateBirthdayCall(body) {
  var key = body.key;
  if (!key) return { success: false, error: "key required" };

  var sheet = getBirthdayCallsSheet();
  var lastRow = sheet.getLastRow();
  var rowIndex = -1;

  if (lastRow > 1) {
    var keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < keys.length; i++) {
      if (String(keys[i][0]) === key) { rowIndex = i + 2; break; }
    }
  }

  var row = [
    key,
    body.year || "",
    body.month || "",
    body.day || "",
    body.kidName || "",
    body.parentName || "",
    body.phone || "",
    body.status || "not_contacted",
    body.notes || "",
    new Date().toISOString()
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return { success: true, message: "Birthday call record saved" };
}

// ── TABS ────────────────────────────────────────────────────────────────────

function handleListTabs() {
  var ss = getSpreadsheet();
  var sheets = ss.getSheets();
  var tabs = [];
  for (var i = 0; i < sheets.length; i++) {
    tabs.push({
      name: sheets[i].getName(),
      rows: sheets[i].getLastRow(),
      index: i
    });
  }
  return { success: true, tabs: tabs };
}
