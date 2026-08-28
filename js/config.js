// =============================================================================
// FunTunes Configuration
// Change settings here — no need to touch other files
// =============================================================================

var CONFIG = {
  // Supabase backend
  SUPABASE_URL: "https://gsdthdubpvqhlzwagaye.supabase.co",
  SUPABASE_KEY: "sb_publishable_9xM0H5gZ1I69aFlggTMpcw_Svl9pn0E",

  // App info
  APP_NAME: "FunTunes-dev",
  VERSION: "1.0.0",

  // Entry types — each has its own form, reached from the header.
  // NOTE: the play area key stays "funzone" so existing sheet rows (and the
  // "Funzone - <Month>" tab naming) keep matching; only the label changed.
  ENTRY_TYPES: [
    { key: "funzone",  label: "Play Area", icon: "\u{1F3AA}", color: "#7B2D8E" },
    { key: "birthday", label: "Birthday",  icon: "\u{1F382}", color: "#E84393" },
    { key: "event",    label: "Event",     icon: "\u{1F389}", color: "#2E86DE" },
  ],

  // Payment modes
  MOP_OPTIONS: [
    { label: "UPI", value: "UPI" },
    { label: "Cash", value: "Cash" },
    { label: "UPI + Cash", value: "UPI + Cash" },
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
  DEFAULT_MOP: "UPI",

  // Unlimited pass options
  PASS_TYPES: [
    { key: "10_hours", label: "10 Hours", amount: 2500, hours: 10, durationDays: 30 },
    { key: "unlimited", label: "Unlimited", amount: 3500, hours: null, durationDays: 30 },
  ],
};
