// =============================================================================
// FunTunes API Layer — Supabase backend
// =============================================================================

if (!window.supabase || !window.supabase.createClient) {
  console.error("Supabase JS library not loaded — check the CDN script in index.html");
}
var supabaseClient = window.supabase && window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

function _fmtTime12(t24) {
  if (!t24 || t24.indexOf(":") === -1) return t24 || "";
  var parts = t24.split(":");
  var h = parseInt(parts[0]), m = parts[1];
  var ap = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return String(h).padStart(2, "0") + ":" + m + " " + ap;
}

function _rowToEntry(row) {
  return {
    id: row.id,
    date: row.date,
    customerName: row.customer_name,
    amount: row.amount,
    mop: row.mop,
    socks: row.socks,
    socksMop: row.socks_mop,
    numKids: row.num_kids,
    hours: row.hours,
    timeIn: row.time_in,
    timeOut: row.time_out,
    timing: row.timing,
    phone: row.phone,
    dob: row.dob,
    entryType: row.entry_type,
    createdAt: row.created_at,
  };
}

function _entryToRow(entry) {
  var timeIn = entry.timeIn || "";
  var timeOut = entry.timeOut || "";
  var timing = "";
  if (timeIn) timing = _fmtTime12(timeIn) + " to " + _fmtTime12(timeOut);
  return {
    date: entry.date || new Date().toISOString().slice(0, 10),
    customer_name: entry.customerName || "",
    amount: parseInt(entry.amount) || 0,
    mop: entry.mop || "",
    socks: parseInt(entry.socks) || 0,
    socks_mop: entry.socksMop || "",
    num_kids: parseInt(entry.numKids) || 1,
    hours: String(entry.hours || "1"),
    time_in: timeIn,
    time_out: timeOut,
    timing: timing,
    phone: entry.phone || "",
    dob: entry.dob || "",
    entry_type: entry.entryType || "funzone",
  };
}

var api = {
  readToday: async function () {
    var today = new Date().toISOString().slice(0, 10);
    var { data, error } = await supabaseClient
      .from("entries")
      .select("*")
      .eq("date", today)
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []).map(_rowToEntry) };
  },

  readMonth: async function (month) {
    var startDate, endDate;
    if (month && month.includes(" ")) {
      var parts = month.split(" ");
      var monthNames = ["January","February","March","April","May","June",
        "July","August","September","October","November","December"];
      var mi = monthNames.indexOf(parts[0]);
      var yr = parseInt(parts[1]);
      if (mi >= 0 && yr) {
        startDate = yr + "-" + String(mi + 1).padStart(2, "0") + "-01";
        var lastDay = new Date(yr, mi + 1, 0).getDate();
        endDate = yr + "-" + String(mi + 1).padStart(2, "0") + "-" + String(lastDay).padStart(2, "0");
      }
    }
    if (!startDate) {
      var d = new Date();
      startDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01";
      var ld = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      endDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(ld).padStart(2, "0");
    }
    var { data, error } = await supabaseClient
      .from("entries")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []).map(_rowToEntry) };
  },

  addEntry: async function (entry) {
    var row = _entryToRow(entry);
    var { data, error } = await supabaseClient
      .from("entries")
      .insert(row)
      .select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? _rowToEntry(data[0]) : null };
  },

  updateEntry: async function (id, entry) {
    var row = _entryToRow(entry);
    var { data, error } = await supabaseClient
      .from("entries")
      .update(row)
      .eq("id", id)
      .select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? _rowToEntry(data[0]) : null };
  },

  deleteEntry: async function (id) {
    var { error } = await supabaseClient
      .from("entries")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  listTabs: async function () {
    return { success: true, data: [] };
  },

  lookupPhone: async function (phone) {
    var { data, error } = await supabaseClient
      .from("entries")
      .select("customer_name, dob")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) return { success: false, error: error.message };
    if (data && data.length > 0) {
      return { success: true, found: true, customerName: data[0].customer_name, dob: data[0].dob };
    }
    return { success: true, found: false };
  },

  // Birthday & enquiry methods — stubbed until separate tables are set up
  getBirthdays: async function () {
    return { success: true, data: [] };
  },

  updateBirthdayCall: async function () {
    return { success: false, error: "Not yet migrated to Supabase" };
  },

  addEnquiry: async function () {
    return { success: false, error: "Not yet migrated to Supabase" };
  },

  listEnquiries: async function () {
    return { success: true, data: [] };
  },
};
