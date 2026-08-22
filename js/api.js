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
    playUpi: row.play_upi,
    playCash: row.play_cash,
    socksUpi: row.socks_upi,
    socksCash: row.socks_cash,
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
    play_upi: parseInt(entry.playUpi) || 0,
    play_cash: parseInt(entry.playCash) || 0,
    socks_upi: parseInt(entry.socksUpi) || 0,
    socks_cash: parseInt(entry.socksCash) || 0,
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
  readEntries: async function (year, month, day) {
    var mm = String(month).padStart(2, "0");
    var query = supabaseClient.from("entries").select("*");
    if (day && day !== "all") {
      query = query.eq("date", year + "-" + mm + "-" + String(day).padStart(2, "0"));
    } else {
      var startDate = year + "-" + mm + "-01";
      var lastDay = new Date(year, month, 0).getDate();
      var endDate = year + "-" + mm + "-" + String(lastDay).padStart(2, "0");
      query = query.gte("date", startDate).lte("date", endDate);
    }
    var { data, error } = await query.order("created_at", { ascending: false });
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

  readDateRange: async function (startDate, endDate) {
    var { data, error } = await supabaseClient.from("entries").select("*")
      .gte("date", startDate).lte("date", endDate)
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []).map(_rowToEntry) };
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

  getBirthdays: async function (month) {
    var mm = String(month).padStart(2, "0");
    var { data, error } = await supabaseClient
      .from("entries")
      .select("customer_name, phone, dob")
      .neq("dob", "")
      .like("dob", "%-" + mm + "-%")
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };

    var seen = {};
    var results = [];
    (data || []).forEach(function(row) {
      if (!row.dob || row.dob.length < 10) return;
      var key = (row.customer_name || "").trim().toLowerCase() + "|" + row.dob;
      if (seen[key]) return;
      seen[key] = true;
      var parts = row.dob.split("-");
      results.push({
        key: key,
        kidName: row.customer_name || "",
        phone: row.phone || "",
        dob: row.dob,
        day: parseInt(parts[2]) || 1,
        month: parseInt(parts[1]) || month,
        year: parseInt(parts[0]) || 2020,
      });
    });

    results.sort(function(a, b) { return a.day - b.day; });

    try {
      var crm = JSON.parse(localStorage.getItem("funtunes_bday_crm") || "{}");
      results.forEach(function(r) {
        var saved = crm[r.key];
        if (saved) {
          r.status = saved.status || "not_contacted";
          r.notes = saved.notes || "";
          if (saved.phone) r.phone = saved.phone;
        }
      });
    } catch(e) {}

    return { success: true, data: results };
  },

  updateBirthdayCall: async function (record) {
    try {
      var crm = JSON.parse(localStorage.getItem("funtunes_bday_crm") || "{}");
      crm[record.key] = {
        status: record.status || "not_contacted",
        notes: record.notes || "",
        phone: record.phone || "",
      };
      localStorage.setItem("funtunes_bday_crm", JSON.stringify(crm));
      return { success: true };
    } catch(e) {
      return { success: false, error: e.message };
    }
  },

  readExpenses: async function (startDate, endDate) {
    var query = supabaseClient.from("cash_expenses").select("*");
    if (startDate === endDate) {
      query = query.eq("date", startDate);
    } else {
      query = query.gte("date", startDate).lte("date", endDate);
    }
    var { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  },

  addExpense: async function (expense) {
    var row = {
      date: expense.date || new Date().toISOString().slice(0, 10),
      amount: parseInt(expense.amount) || 0,
      description: expense.description || "",
      category: expense.category || "misc",
    };
    var { data, error } = await supabaseClient
      .from("cash_expenses").insert(row).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? data[0] : null };
  },

  deleteExpense: async function (id) {
    var { error } = await supabaseClient
      .from("cash_expenses").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  readMonthlyExpenses: async function (month, year) {
    var { data, error } = await supabaseClient
      .from("monthly_expenses").select("*")
      .eq("month", month).eq("year", year)
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  },

  addMonthlyExpense: async function (expense) {
    var row = {
      month: parseInt(expense.month),
      year: parseInt(expense.year),
      category: expense.category || "misc",
      amount: parseInt(expense.amount) || 0,
      description: expense.description || "",
    };
    var { data, error } = await supabaseClient
      .from("monthly_expenses").insert(row).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? data[0] : null };
  },

  updateMonthlyExpense: async function (id, expense) {
    var row = {
      category: expense.category || "misc",
      amount: parseInt(expense.amount) || 0,
      description: expense.description || "",
    };
    var { data, error } = await supabaseClient
      .from("monthly_expenses").update(row).eq("id", id).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? data[0] : null };
  },

  deleteMonthlyExpense: async function (id) {
    var { error } = await supabaseClient
      .from("monthly_expenses").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Staff ──

  readStaff: async function () {
    var { data, error } = await supabaseClient
      .from("staff").select("*").order("name");
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  },

  addStaff: async function (staff) {
    var row = {
      name: staff.name || "",
      phone: staff.phone || "",
      role: staff.role || "Staff",
      monthly_salary: parseInt(staff.monthly_salary) || 0,
      join_date: staff.join_date || null,
      active: staff.active !== false,
    };
    var { data, error } = await supabaseClient
      .from("staff").insert(row).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? data[0] : null };
  },

  updateStaff: async function (id, staff) {
    var row = {
      name: staff.name || "",
      phone: staff.phone || "",
      role: staff.role || "Staff",
      monthly_salary: parseInt(staff.monthly_salary) || 0,
      join_date: staff.join_date || null,
      active: staff.active !== false,
    };
    var { data, error } = await supabaseClient
      .from("staff").update(row).eq("id", id).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? data[0] : null };
  },

  deleteStaff: async function (id) {
    var { error } = await supabaseClient.from("staff").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Attendance ──

  readAttendance: async function (month, year) {
    var mm = String(month).padStart(2, "0");
    var startDate = year + "-" + mm + "-01";
    var lastDay = new Date(year, month, 0).getDate();
    var endDate = year + "-" + mm + "-" + String(lastDay).padStart(2, "0");
    var { data, error } = await supabaseClient
      .from("staff_attendance").select("*")
      .gte("date", startDate).lte("date", endDate)
      .order("date");
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  },

  upsertAttendance: async function (record) {
    var row = {
      staff_id: parseInt(record.staff_id),
      date: record.date,
      status: record.status || "present",
      check_in: record.check_in || "",
      check_out: record.check_out || "",
      notes: record.notes || "",
    };
    var { data, error } = await supabaseClient
      .from("staff_attendance").upsert(row, { onConflict: "staff_id,date" }).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data && data[0] ? data[0] : null };
  },

  deleteAttendance: async function (id) {
    var { error } = await supabaseClient.from("staff_attendance").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  addEnquiry: async function () {
    return { success: false, error: "Not yet migrated to Supabase" };
  },

  listEnquiries: async function () {
    return { success: true, data: [] };
  },
};
