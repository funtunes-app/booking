// =============================================================================
// FunTunes Configuration
// Change settings here — no need to touch other files
// =============================================================================

var CONFIG = {
  // Google Apps Script Web App URL (current backend)
  API_URL: "https://script.google.com/macros/s/AKfycbyoIltvpeTWuFR2tWUfh4qNKQnfjmEabJAtDLFIrcE3Mmnjh6j9WH-Ntb9qMrOEFhYi/exec",

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

  // Duration options
  HOUR_OPTIONS: [
    { label: "30m", value: "30 mins" },
    { label: "45m", value: "45 mins" },
    { label: "1h", value: "1" },
    { label: "1.5h", value: "1.5" },
    { label: "2h", value: "2" },
    { label: "3h", value: "3" },
  ],

  // Socks rate (₹ per pair)
  SOCKS_RATE: 15,

  // Quick amount chips
  AMOUNT_PRESETS: [150, 200, 250, 300, 400, 500, 600],

  // Default amount for new entries
  DEFAULT_AMOUNT: "300",

  // Default payment mode
  DEFAULT_MOP: "Bank - HDFC",
};
