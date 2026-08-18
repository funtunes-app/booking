# FunTunes Booking App — Complete Developer Handoff

## What is this?

A staff-facing PWA for **FunTunes**, a kids indoor play zone. Staff use it on a tablet/phone to log walk-in entries, track payments, and look up birthday contacts. It runs as a static site (no build step) with Supabase (PostgreSQL) as the backend.

**Live branch:** `supadev`  
**Repo:** `funtunes-app/booking` (GitHub, currently public)  
**Supabase project:** `gsdthdubpvqhlzwagaye.supabase.co`

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 (CDN) + Babel Standalone | JSX compiled in-browser via `<script type="text/babel">` |
| Styling | Hand-written CSS (single file) | CSS custom properties, no preprocessor |
| Backend | Supabase (PostgreSQL) | JS client via UMD CDN from unpkg |
| Hosting | Static files (GitHub Pages / Netlify) | `netlify.toml` present for caching headers |
| PWA | Service Worker + manifest.json | Offline-capable, installable on mobile |
| Font | Google Fonts — Nunito | Loaded via `<link>` in index.html |
| Migration | Google Apps Script | One-time script to bulk-import from Google Sheets |

**No build step.** Babel compiles JSX in the browser at runtime. To verify JSX syntax locally:
```bash
node -e "const b=require('@babel/standalone');const fs=require('fs');b.transform(fs.readFileSync('js/app.jsx','utf8'),{presets:['react']});console.log('OK')"
```

---

## File Structure

```
booking/
  index.html              # Entry point — loads all CDN scripts + app files
  manifest.json           # PWA manifest (standalone, portrait, purple theme)
  sw.js                   # Service worker (cache version: funtunes-v20)
  netlify.toml            # Static asset caching headers
  package.json            # Only devDep: @babel/standalone (for local JSX validation)
  css/
    app.css               # Complete design system — tokens, components, dark theme
  js/
    config.js             # All configurable values — Supabase creds, pricing, options
    api.js                # Supabase CRUD layer — snake_case DB <-> camelCase JS mapping
    components.jsx        # Shared UI components (Spinner, InputField, Dropdown, etc.)
    app.jsx               # Main React app — form, dashboard, birthdays screens
  icons/
    logo.png              # App icon
    logo-header.png       # Header bar logo
    icon-192.png          # PWA icon 192x192
    icon-512.png          # PWA icon 512x512
  supabase/
    schema.sql            # Full table schema + indexes + RLS policy
  apps-script/
    google_apps_script.js # Original Google Sheets backend (legacy, not used)
    migrate_to_supabase.js# One-time migration script from Sheets to Supabase
```

---

## Load Order (index.html)

```
1. React 18 (CDN)           — window.React, window.ReactDOM
2. Babel Standalone (CDN)    — enables <script type="text/babel">
3. Supabase JS v2 (unpkg)   — window.supabase.createClient
4. css/app.css               — all styles
5. js/config.js              — CONFIG global object
6. js/api.js                 — api global object (uses CONFIG + window.supabase)
7. js/components.jsx         — shared React components (uses React globals)
8. js/app.jsx                — main App component (uses everything above)
9. Service worker register   — inline script at bottom
```

All scripts share the global scope. `CONFIG`, `api`, `C` (color constants), component functions, and React are all globals.

---

## Configuration (js/config.js)

```js
var CONFIG = {
  SUPABASE_URL: "https://gsdthdubpvqhlzwagaye.supabase.co",
  SUPABASE_KEY: "sb_publishable_9xM0H5gZ1I69aFlggTMpcw_Svl9pn0E",
  APP_NAME: "FunTunes-dev",
  VERSION: "1.0.0",

  ENTRY_TYPES: [
    { key: "funzone",  label: "Play Area", icon: "🎪", color: "#7B2D8E" },
    { key: "birthday", label: "Birthday",  icon: "🎂", color: "#E84393" },
    { key: "event",    label: "Event",     icon: "🎉", color: "#2E86DE" },
  ],

  MOP_OPTIONS: [
    { label: "UPI", value: "UPI" },
    { label: "Cash", value: "Cash" },
    { label: "UPI + Cash", value: "UPI + Cash" },
  ],

  RATE_PER_HOUR: 300,
  RATE_PER_HALF_HOUR: 200,
  HOUR_OPTIONS: [ 0.5, 1, 1.5, 2, 2.5, 3 ],  // plus "Custom" added by form
  DEFAULT_HOURS: "1",

  SOCKS_RATE: 15,                    // per pair
  SOCK_COUNT_OPTIONS: [0, 1, 2, 3, 4],  // plus "Custom" added by form
  DEFAULT_SOCK_COUNT: 1,
  DEFAULT_MOP: "UPI",
};
```

**Pricing formula:** Full hours x RATE_PER_HOUR + trailing half-hour at RATE_PER_HALF_HOUR.  
Example: 1.5 hours = 300 + 200 = 500 per kid.

---

## Database Schema (Supabase PostgreSQL)

Single table: `entries`

```sql
create table entries (
  id          bigint generated always as identity primary key,
  date        date not null default current_date,
  customer_name text not null default '',
  amount      integer not null default 0,       -- playtime amount (total for all kids)
  mop         text not null default '',          -- payment mode string for playtime
  socks       integer not null default 0,        -- socks charge in rupees
  socks_mop   text not null default '',          -- payment mode string for socks
  play_upi    integer not null default 0,        -- UPI portion of playtime payment
  play_cash   integer not null default 0,        -- Cash portion of playtime payment
  socks_upi   integer not null default 0,        -- UPI portion of socks payment
  socks_cash  integer not null default 0,        -- Cash portion of socks payment
  num_kids    integer not null default 1,
  hours       text not null default '1',
  time_in     text not null default '',          -- 24h format "14:30"
  time_out    text not null default '',          -- 24h format "15:30"
  timing      text not null default '',          -- display string "02:30 PM to 03:30 PM"
  phone       text not null default '',          -- 10-digit mobile
  dob         text not null default '',          -- date of birth (YYYY-MM-DD or free text)
  entry_type  text not null default 'funzone',   -- "funzone", "birthday", "event"
  created_at  timestamptz not null default now()
);
```

**Indexes:** `idx_entries_date` (date desc), `idx_entries_phone` (phone)  
**RLS:** Enabled with allow-all policy (no auth — anon key access)

### Column naming convention

DB uses `snake_case`. JS uses `camelCase`. Two helper functions in `api.js` handle the mapping:

- `_rowToEntry(row)` — DB row -> JS object
- `_entryToRow(entry)` — JS object -> DB row

### Payment data model

Each entry stores payment info at two levels:

1. **Display strings** (`mop`, `socks_mop`) — human-readable, e.g. "UPI", "Cash", "UPI ₹200 + Cash ₹100"
2. **Integer columns** (`play_upi`, `play_cash`, `socks_upi`, `socks_cash`) — for SQL aggregation

This lets you query monthly totals like:
```sql
SELECT
  SUM(play_upi) as total_play_upi,
  SUM(play_cash) as total_play_cash,
  SUM(socks_upi) as total_socks_upi,
  SUM(socks_cash) as total_socks_cash
FROM entries
WHERE date BETWEEN '2026-08-01' AND '2026-08-31';
```

### Multi-kid entries

When a booking has multiple kids, the app creates **one row per kid**:
- Each kid gets `amount = Math.round(totalPlaytime / numKids)`
- Kid 0 gets the socks charge; other kids get `socks = 0`
- Payment columns are split proportionally across kids
- All kids share the same `mop` string and timing

---

## API Layer (js/api.js)

The `api` object exposes these async methods:

| Method | Description |
|--------|-------------|
| `api.readEntries(year, month, day)` | Fetch entries. `day="all"` for whole month, otherwise a specific day. Returns `{success, data}` |
| `api.addEntry(entry)` | Insert one entry. Returns `{success, data}` |
| `api.updateEntry(id, entry)` | Update by ID. Returns `{success, data}` |
| `api.deleteEntry(id)` | Delete by ID. Returns `{success}` |
| `api.lookupPhone(phone)` | Find most recent entry by phone for autofill. Returns `{success, found, customerName, dob}` |
| `api.getBirthdays()` | **Stubbed** — returns empty array. Birthday table not yet created. |
| `api.updateBirthdayCall()` | **Stubbed** — returns error. |
| `api.addEnquiry()` | **Stubbed** — returns error. |

All methods return `{success: true/false, data?, error?}`.

---

## Shared Components (js/components.jsx)

Defined in global scope. Used by `app.jsx`.

| Component | Purpose |
|-----------|---------|
| `C` | Color constants object (accent purple, green, blue, pink, etc.) |
| `Spinner` | Animated loading spinner |
| `InputField` | Form field wrapper with label, icon, error message |
| `SectionHeading` | Uppercase section divider with line |
| `ChipSelect` | Horizontal chip radio group |
| `NumberStepper` | +/- stepper for numeric values |
| `Dropdown` | Custom select dropdown with click-outside-to-close |
| `IconMenu` | Icon button that opens a dropdown menu |
| `BirthdayCard` | Expandable card for birthday contact tracking |
| `BirthdayList` | Grid of BirthdayCards with week filtering |
| `EntryList` | Grid of entry rows with edit/delete buttons |
| `MONTH_NAMES` | Array of month name strings |
| `STATUS_ORDER` / `STATUS_META` | Birthday contact status definitions |

---

## Main App (js/app.jsx)

### Screens

The app has three screens controlled by `screen` state:

1. **`"home"`** — Dashboard with stats grid (entries, revenue, kids), date filter (native date picker + "Whole month" + "Today" chips), and entry list with edit/delete actions.

2. **`"form"`** — 3-step booking form with dark purple gradient theme (`.theme-form` class). Steps:
   - **Step 0 (Customer):** Phone (with autofill lookup), kid count, per-kid name + DOB, playtime duration/amount, socks pairs/amount. Two-column layout on desktop (>=720px).
   - **Step 1 (Payment):** Total card, separate UPI/Cash/UPI+Cash selection for playtime and socks, with auto-calculated split amounts.
   - **Step 2 (Review):** Invoice-style preview showing customer, booking details table, per-item payment breakdown, total.

3. **`"birthdays"`** — Birthday contact tracker with month/year dropdowns, week filters (W1-W5), expandable cards with call status tracking (Not Contacted / Warm / Rejected / Booking).

### Form State

```js
{
  customerName, phone, dob, date,
  numKids, kidNames: [], dobs: [],
  hours, hoursMode: "preset"|"custom", timeIn,
  amount,                          // playtime total (string)
  socks,                           // socks charge in rupees (number)
  sockCount, sockMode: "preset"|"custom",
  playMop,                         // "UPI" | "Cash" | "UPI + Cash"
  playUpiAmount, playCashAmount,   // split amounts for playtime
  socksMop,                        // "UPI" | "Cash" | "UPI + Cash"
  socksUpiAmount, socksCashAmount, // split amounts for socks
}
```

### Key Functions

| Function | What it does |
|----------|-------------|
| `getDefaultForm()` | Returns fresh form state with current time, default pricing |
| `set(key, val)` | Generic state setter; auto-recalculates amount when `numKids` changes |
| `setHours(v, autoPrice)` | Sets hours; recalculates amount if `autoPrice=true` (play area only) |
| `setSockCount(n)` | Sets sock count and calculates socks charge |
| `validate(step)` | Step 0: phone, name, amount. Step 1: payment modes. Returns boolean. |
| `getPlayMopString()` | Builds display string: "UPI", "Cash", or "UPI ₹X + Cash ₹Y" |
| `getSocksMopString()` | Same for socks payment |
| `computePaymentCols()` | Returns `{playUpi, playCash, socksUpi, socksCash}` integers |
| `submitEntry()` | Saves entry (or multiple rows for multi-kid) |
| `handleEdit(entry)` | Populates form from existing entry for editing |
| `handleUpdateSubmit()` | Updates existing entry by ID |
| `lookupByPhone(phone)` | Autofills name/DOB from previous entry with same phone |
| `computeTimeOut(timeIn, hours)` | Calculates end time from start + duration |
| `computeAmountForHours(hours)` | Pricing formula: full hours + half-hour rates |

### Entry Type System

Three entry types defined in `CONFIG.ENTRY_TYPES`: Play Area (`funzone`), Birthday, Event. The type is selected via an icon menu in the form header. Only Play Area (`funzone`) has:
- Auto-pricing from duration
- Socks section
- Per-kid amount splitting

Birthday and Event types use manual pricing and no socks.

**Important:** The `key` for play area is `"funzone"` (not "play_area") to match legacy Google Sheet tab naming.

---

## CSS Architecture (css/app.css)

~668 lines, single file, no preprocessor.

### Design Tokens (CSS Custom Properties)

Defined on `:root`, overridden at `>=640px` for desktop density:
- Colors: `--accent` (#7B2D8E purple), `--green`, `--blue`, `--pink`, `--danger`, etc.
- Spacing: `--sp-1` through `--sp-6`, `--gap`, `--stack`
- Radii: `--r-sm`, `--r`, `--r-lg`, `--r-xl`
- Field sizing: `--field-py`, `--field-px`, `--field-fs`
- Shadows: `--shadow-xs`, `--shadow-sm`, `--shadow`, `--shadow-lift`

### Dark Theme (Form Screen)

The `.theme-form` class is applied to `.app-shell` when `screen === "form"`. It sets:
- Dark purple gradient background
- Frosted glass appbar
- Glassmorphism form fields (semi-transparent white, inner shadow)
- Purple-tinted chips, dropdowns, cards
- White action buttons with purple text

**Every UI element has a `.theme-form` override** — field borders, placeholders, hints, dropdowns, menus, steppers, the invoice, etc.

### Layout

- `.container` — max-width 1240px, horizontal padding
- `.container--form` — max-width 620px (narrow)
- `.container--entry` — max-width 960px (form screens)
- `.entry-columns` — flex column on mobile, row on >=720px (two-column form layout)

### Responsive Breakpoints

- `>=640px` — Tighter spacing, smaller fields, hide mobile FAB / show inline button
- `>=720px` — Two-column entry form, two-column entry/birthday grids
- `>=1080px` — Three-column grids

### Key Component Classes

| Class | Purpose |
|-------|---------|
| `.appbar` | Sticky top bar with frosted glass effect |
| `.card`, `.card-pad`, `.card-head` | Card container, padding, header |
| `.fld`, `.fld-lg`, `.fld-compact` | Form inputs at different sizes |
| `.chip`, `.chips`, `.chip.is-on` | Selectable chip buttons |
| `.stepper` | Number +/- control |
| `.stats-grid`, `.stat` | Dashboard stats row |
| `.row-card` | Entry list item |
| `.invoice`, `.invoice-*` | Invoice review styling |
| `.total-card` | Payment total display |
| `.overlay`, `.modal` | Centered modal dialog |
| `.toast` | Top-center notification |
| `.form-actions` | Sticky bottom action bar |
| `.date-filter` | Dashboard date picker row |
| `.dropdown-panel`, `.dropdown-opt` | Custom dropdown menu |
| `.menu`, `.menu-item` | Icon menu dropdown |

### Animations

- `springIn` — Fade up with slight scale (form sections)
- `slideUp` — Mobile FAB entrance
- `popIn` — Modal/dropdown entrance with overshoot
- `checkDraw` — Success checkmark SVG draw
- `shake` — Validation error shake
- `spin` — Loading spinner

---

## Service Worker (sw.js)

- Cache name: `funtunes-v20` (bump this on every deploy)
- Strategy: Network-first with cache fallback for app files
- API calls (supabase, script.google.com) always bypass cache
- On activate: deletes old caches

**Always bump the cache version** when changing any cached file, otherwise users will see stale content until the SW updates.

---

## Birthday Tracking

The birthdays screen has full UI but the **backend is stubbed**. The `api.getBirthdays()` returns an empty array. To make it work, you need to:

1. Create a `birthdays` table in Supabase
2. Implement the API methods in `api.js`

The UI supports:
- Month/year filtering with dropdowns
- Week-of-month filters (W1-W5)
- Expandable cards with phone, notes, call status
- Status tracking: Not Contacted -> Warm -> Rejected -> Booking
- Quick-save status changes
- localStorage caching for current month (refreshes daily)

Similarly, `api.addEnquiry()` is stubbed — the enquiry modal UI is complete but doesn't persist.

---

## Migration from Google Sheets

The app was originally backed by Google Sheets via Apps Script. The migration to Supabase is complete for play area entries. The migration script (`apps-script/migrate_to_supabase.js`) is a one-time Google Apps Script that:

1. Iterates all "Funzone - ..." tabs in the spreadsheet
2. Maps column headers to snake_case DB columns
3. Converts DD/MM/YYYY dates to YYYY-MM-DD
4. Converts 12h timestamps to 24h
5. Batch-inserts 50 rows at a time to Supabase

The old `google_apps_script.js` is kept for reference but not used.

---

## Security Notes

- The **Supabase publishable key is in the codebase** (`config.js` and `migrate_to_supabase.js`). This is an anon key with RLS allow-all. It's safe for a staff-only tool but should be rotated if the repo goes private-to-public or if you add authentication.
- **No authentication** — anyone with the URL can read/write entries. This is intentional for a staff tablet app but should be addressed if exposed publicly.
- RLS is enabled but the policy allows all operations. Add proper policies if you implement auth.

---

## What's Working

- Play area entry form (3-step: Customer -> Payment -> Review)
- Separate UPI/Cash/UPI+Cash payment for playtime and socks
- Split payment amounts with auto-calculation
- Per-item payment tracking columns (play_upi, play_cash, socks_upi, socks_cash)
- Multi-kid entries (splits amount, one row per kid)
- Phone autofill from previous entries
- Dashboard with date/month filtering
- Entry edit and delete
- Invoice-style review before saving
- PWA install and offline caching
- Dark purple theme on form screens
- Responsive layout (mobile-first, two-column on desktop)

## What's Not Yet Done

- **Birthday table** — UI exists, backend stubbed. Needs a Supabase table and API implementation.
- **Enquiry table** — Modal UI exists, backend stubbed.
- **Authentication** — No login, no user roles. Consider Supabase Auth if needed.
- **Dashboard reporting** — The 4 payment columns exist but no monthly summary view uses them yet. Could add charts/tables showing UPI vs Cash breakdown per month.
- **Birthday/Event entry types** — Selectable in the form but pricing/socks logic is play-area-only. These types save to the same `entries` table with `entry_type` set accordingly.
- **Offline write support** — Service worker caches for reads but doesn't queue writes offline.

---

## How to Develop

1. **No build step needed.** Edit files directly and refresh the browser.
2. **Verify JSX** before pushing:
   ```bash
   node -e "require('@babel/standalone').transform(require('fs').readFileSync('js/app.jsx','utf8'),{presets:['react']});console.log('OK')"
   ```
3. **Bump `sw.js` cache version** after any file change (e.g., `funtunes-v20` -> `funtunes-v21`).
4. **Test on mobile** — the app is mobile-first and uses touch-optimized input sizing (16px fields to avoid iOS zoom).

### Adding a new DB column

1. Add to `supabase/schema.sql` (CREATE TABLE)
2. Run `ALTER TABLE entries ADD COLUMN ...` in Supabase SQL Editor
3. Add mapping in `_rowToEntry()` and `_entryToRow()` in `api.js`
4. Use the camelCase name in `app.jsx` form state and submit logic

### Adding a new form field

1. Add to `getDefaultForm()` return object
2. Add input in the appropriate step's JSX
3. Add validation in `validate()` if required
4. Add to `handleEdit()` parsing logic
5. Include in `submitEntry()` and `handleUpdateSubmit()` entry objects
