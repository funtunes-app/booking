# FunTunes Staff App — Handoff

## Overview
Customer entry and management app for FunTunes play zone. Built as a single-page PWA with React 18 (CDN, no build step) and Supabase backend.

**Live site:** https://funtunes-app.github.io/booking/ (deploys from `supadev` branch)

## Tech Stack
- **Frontend:** React 18 + Babel standalone (JSX compiled in-browser)
- **Backend:** Supabase (PostgreSQL)
- **Hosting:** GitHub Pages (supadev branch)
- **PWA:** Service worker + manifest for mobile install

## Project Structure
```
booking/
├── index.html           ← Main HTML shell, loads CDN deps
├── manifest.json        ← PWA config
├── sw.js                ← Service worker
├── css/
│   └── app.css          ← All styles (CSS variables, responsive, dark form theme)
├── js/
│   ├── config.js        ← Supabase URL/key, pricing, entry types, payment modes
│   ├── api.js           ← Supabase API layer (CRUD entries, birthdays, enquiries)
│   ├── components.jsx   ← Shared UI components
│   └── app.jsx          ← Main app logic, screens, routing
├── icons/               ← App icons + logo
├── supabase/
│   └── schema.sql       ← Database schema
└── handoff.md           ← This file
```

## Key Features

### Entry Form (3-step wizard)
1. **Customer** — phone (auto-lookup), name, DOB, number of kids
2. **Payment** — play amount, socks, payment mode (UPI/Cash/Split)
3. **Review** — invoice preview before save

Multi-kid entries split into separate rows. Dark purple theme on the form screen.

### Dashboard (hash-routed: `#list`, `#stats`, `#birthdays`)
Each tab has its own URL via `location.hash`.

**List (`#list`)**
- Full-width rows with: name, DOB, playtime duration, time range, amount with UPI/Cash split, action buttons
- Live time tracking (30s interval): green while playing, red when exceeded, normal after checkout
- Checkout tracked in localStorage (auto-clears daily, no DB column needed)
- Calendar filter (day/month/range) shared with stats

**Stats (`#stats`)**
- Password protected (static password: `FunSamu5`, persists in sessionStorage)
- 4 stat cards: Total Kids, Total Revenue (UPI/Cash split), Playtime Revenue (UPI/Cash split), Socks Revenue (UPI/Cash split)
- Bar charts (kids/revenue per day) when multi-day range selected
- Daily breakdown table

**Birthdays (`#birthdays`)**
- Monthly birthday list from Supabase
- Week filter (W1-W5)
- Status tracking: Not Contacted / Warm / Rejected / Booking
- Phone, notes, call tracking per birthday
- Birthday enquiry form (leads)

## Database Schema (Supabase)
Single `entries` table with columns:
`id`, `date`, `customer_name`, `amount`, `mop`, `socks`, `socks_mop`, `play_upi`, `play_cash`, `socks_upi`, `socks_cash`, `num_kids`, `hours`, `time_in`, `time_out`, `timing`, `phone`, `dob`, `entry_type`, `created_at`

## Key Components (components.jsx)
| Component | Purpose |
|-----------|---------|
| `PasswordGate` | Password input for stats access |
| `LiveEntryList` | List view with live time tracking |
| `LiveEntryRow` | Single entry row with status colors |
| `StatsDashboard` | Stats cards + charts + breakdown |
| `CalendarFilter` | Day/month/range date picker |
| `BarChart` | Simple bar chart |
| `BirthdayList` / `BirthdayCard` | Birthday management |
| `EntryList` | Legacy list (kept, not used in dashboard) |

## Branches
- `supadev` — production branch, deployed to GitHub Pages
- `main` — old Google Sheets version (not active)

## How to Update
1. Edit files on `supadev` branch
2. Push to GitHub
3. GitHub Pages auto-deploys
