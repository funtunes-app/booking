// =============================================================================
// FunTunes Configuration
// Change settings here — no need to touch other files
// =============================================================================

var CONFIG = {
  // Google Apps Script Web App URL (current backend)
  API_URL: "https://script.google.com/macros/s/AKfycbwxqflJtQWD6zIx3lvQwyExi6zg7dgkmhTjBbc2j8jMtKym3A5En5M_KkI01rQZj7Gu/exec",

  // App info
  APP_NAME: "FunTunes-dev",
  VERSION: "1.0.0",

  // Entry types available in the form
  ENTRY_TYPES: [
    { key: "funzone", label: "Funzone", icon: "\u{1F3AA}", color: "#e85d26" },
    { key: "birthday", label: "Birthday", icon: "\u{1F382}", color: "#a855f7" },
    { key: "event", label: "Event", icon: "\u{1F389}", color: "#0ea5e9" },
    { key: "daycare", label: "Daycare", icon: "\u{1F9D2}", color: "#f59e0b" },
  ],

  // Payment modes
  MOP_OPTIONS: [
    { label: "HDFC", value: "Bank - HDFC", icon: "\u{1F3E6}" },
    { label: "ICICI", value: "Bank - ICICI", icon: "\u{1F3DB}\uFE0F" },
    { label: "Cash", value: "Cash", icon: "\u{1F4B5}" },
  ],

  // Pricing — amount per kid is derived from the duration:
  // every full hour is charged at RATE_PER_HOUR, a trailing half hour at
  // RATE_PER_HALF_HOUR. e.g. 1.5h = 300 + 200 = 500.
  RATE_PER_HOUR: 300,
  RATE_PER_HALF_HOUR: 200,

  // Duration options (hours). The form adds a "Custom" choice after these.
  HOUR_OPTIONS: [
    { label: "30 mins", value: "0.5" },
    { label: "1 hour", value: "1" },
    { label: "1.5 hours", value: "1.5" },
    { label: "2 hours", value: "2" },
    { label: "2.5 hours", value: "2.5" },
    { label: "3 hours", value: "3" },
  ],
  DEFAULT_HOURS: "1",

  // Socks rate (₹ per pair)
  SOCKS_RATE: 15,

  // Sock pair-count options. The form adds a "Custom" choice after these.
  SOCK_COUNT_OPTIONS: [0, 1, 2, 3, 4],
  DEFAULT_SOCK_COUNT: 1,

  // Default payment mode
  DEFAULT_MOP: "Bank - HDFC",
};
