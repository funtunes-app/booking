// =============================================================================
// FunTunes — Migrate Google Sheets data to Supabase
// =============================================================================
// HOW TO USE:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Create a new script file (e.g. "migrate.gs")
// 4. Paste this entire code
// 5. Run the function: migrateToSupabase()
// 6. Check the execution log for progress
// =============================================================================

var SUPA_URL = "https://gsdthdubpvqhlzwagaye.supabase.co";
var SUPA_KEY = "sb_publishable_9xM0H5gZ1I69aFlggTMpcw_Svl9pn0E";
var MIGRATE_SHEET_ID = "17TBKunijIqq1JFuonQg8ygoCzrI6Ncfg81tvP3uduJM";

function migrateToSupabase() {
  var ss = SpreadsheetApp.openById(MIGRATE_SHEET_ID);
  var sheets = ss.getSheets();
  var totalMigrated = 0;
  var totalSkipped = 0;
  var errors = [];

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var tabName = sheet.getName();

    // Only migrate "Funzone - ..." tabs (entry data)
    if (tabName.indexOf("Funzone") !== 0) {
      Logger.log("Skipping tab: " + tabName);
      continue;
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log("Empty tab: " + tabName);
      continue;
    }

    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    Logger.log("Processing " + tabName + " — " + rows.length + " rows");

    // Build column index map
    var colIdx = {};
    for (var h = 0; h < headers.length; h++) {
      colIdx[headers[h]] = h;
    }

    // Batch rows into groups of 50 for Supabase insert
    var batch = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      var customerName = String(row[colIdx["Customer name"]] || "").trim();
      var amount = parseInt(row[colIdx["Amount"]]) || 0;

      // Skip empty rows
      if (!customerName && !amount) {
        totalSkipped++;
        continue;
      }

      var dateVal = parseSheetDate(row[colIdx["Date"]]);
      var timing = String(row[colIdx["Timing"]] || "");
      var timeIn = "", timeOut = "";
      if (timing.indexOf(" to ") > -1) {
        var parts = timing.split(" to ");
        timeIn = convertTo24(parts[0].trim());
        timeOut = convertTo24(parts[1].trim());
      }

      var entry = {
        date: dateVal,
        customer_name: customerName,
        amount: amount,
        mop: String(row[colIdx["MOP"]] || ""),
        socks: parseInt(row[colIdx["Socks"]]) || 0,
        socks_mop: String(row[colIdx["MOP - Socks"]] || ""),
        num_kids: parseInt(row[colIdx["No of kids"]]) || 1,
        hours: String(row[colIdx["Hours"]] || "1"),
        time_in: timeIn,
        time_out: timeOut,
        timing: timing,
        phone: String(row[colIdx["Phone number"]] || "").replace(/\D/g, ""),
        dob: String(row[colIdx["DOB"]] || ""),
        entry_type: String(row[colIdx["Entry Type"]] || "funzone") || "funzone",
      };

      // Parse timestamp for created_at
      var tsVal = row[colIdx["Timestamp"]];
      if (tsVal) {
        try {
          var ts = tsVal instanceof Date ? tsVal : new Date(tsVal);
          if (!isNaN(ts.getTime())) {
            entry.created_at = ts.toISOString();
          }
        } catch (e) {}
      }

      batch.push(entry);

      // Insert in batches of 50
      if (batch.length >= 50) {
        var result = insertBatch(batch);
        if (result.error) {
          errors.push(tabName + " row ~" + (i + 2) + ": " + result.error);
        } else {
          totalMigrated += batch.length;
        }
        batch = [];
        Utilities.sleep(200); // rate limit
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      var result = insertBatch(batch);
      if (result.error) {
        errors.push(tabName + " final batch: " + result.error);
      } else {
        totalMigrated += batch.length;
      }
    }

    Logger.log("Done: " + tabName);
  }

  Logger.log("=== MIGRATION COMPLETE ===");
  Logger.log("Migrated: " + totalMigrated + " rows");
  Logger.log("Skipped:  " + totalSkipped + " empty rows");
  if (errors.length > 0) {
    Logger.log("Errors (" + errors.length + "):");
    errors.forEach(function (e) { Logger.log("  - " + e); });
  } else {
    Logger.log("No errors!");
  }
}

function insertBatch(rows) {
  var url = SUPA_URL + "/rest/v1/entries";
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": "Bearer " + SUPA_KEY,
      "Prefer": "return=minimal",
    },
    payload: JSON.stringify(rows),
    muteHttpExceptions: true,
  };
  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  if (code >= 200 && code < 300) {
    return { success: true };
  }
  return { error: "HTTP " + code + ": " + response.getContentText() };
}

// Parse DD/MM/YYYY or Date object into YYYY-MM-DD for Supabase
function parseSheetDate(val) {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (val instanceof Date || (typeof val === "object" && val.getMonth)) {
    var dd = ("0" + val.getDate()).slice(-2);
    var mm = ("0" + (val.getMonth() + 1)).slice(-2);
    return val.getFullYear() + "-" + mm + "-" + dd;
  }
  var s = String(val).trim();
  // DD/MM/YYYY
  if (s.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    var p = s.split("/");
    return p[2] + "-" + p[1] + "-" + p[0];
  }
  // YYYY-MM-DD
  if (s.match(/^\d{4}-\d{2}-\d{2}/)) {
    return s.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

// Convert "02:30 PM" to "14:30"
function convertTo24(time12) {
  if (!time12) return "";
  var match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12;
  var h = parseInt(match[1]);
  var m = match[2];
  var ap = match[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return ("0" + h).slice(-2) + ":" + m;
}
