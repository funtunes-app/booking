// =============================================================================
// FunTunes API Layer
// Handles all communication with Google Sheets backend
// =============================================================================

var api = {
  async call(action, method, body, params) {
    method = method || "GET";
    params = params || {};
    var url = new URL(CONFIG.API_URL);
    url.searchParams.set("action", action);
    Object.entries(params).forEach(function(kv) { url.searchParams.set(kv[0], kv[1]); });
    var opts = { method: method, redirect: "follow" };
    if (body) {
      opts.method = "POST";
      opts.headers = { "Content-Type": "text/plain" };
      opts.body = JSON.stringify(body);
    }
    var res = await fetch(url.toString(), opts);
    return res.json();
  },

  readToday: function() {
    return this.call("read", "GET", null, { date: new Date().toISOString().slice(0, 10) });
  },

  readMonth: function(month) {
    return this.call("read", "GET", null, { month: month });
  },

  addEntry: function(entry) {
    return this.call("add", "POST", { entry: entry });
  },

  updateEntry: function(tab, rowIndex, entry) {
    return this.call("update", "POST", { tab: tab, rowIndex: rowIndex, entry: entry });
  },

  deleteEntry: function(tab, rowIndex) {
    return this.call("delete", "POST", { tab: tab, rowIndex: rowIndex });
  },

  listTabs: function() {
    return this.call("tabs");
  },

  getBirthdays: function(month, year) {
    var params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.call("birthdays", "GET", null, params);
  },

  updateBirthdayCall: function(record) {
    return this.call("updateBirthdayCall", "POST", record);
  },

  lookupPhone: function(phone) {
    return this.call("lookupPhone", "GET", null, { phone: phone });
  },

  addEnquiry: function(enquiry) {
    return this.call("addEnquiry", "POST", enquiry);
  },

  listEnquiries: function() {
    return this.call("enquiries");
  },
};
