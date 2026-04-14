# FunTunes Staff App

Customer entry and management app for FunTunes play zone.

## Project Structure

```
funtunes-app/
├── index.html          ← Main page
├── manifest.json       ← PWA config (mobile install)
├── sw.js               ← Service worker (PWA caching)
├── netlify.toml        ← Netlify deployment config
├── css/
│   └── app.css         ← All styles & animations
├── js/
│   ├── config.js       ← Settings (API URL, entry types, prices)
│   ├── api.js          ← Google Sheets API layer
│   ├── components.jsx  ← Reusable UI components
│   └── app.jsx         ← Main app logic & screens
└── icons/
    ├── icon-192.png    ← App icon 192x192
    └── icon-512.png    ← App icon 512x512
```

## How to Update

1. Edit the file you need to change
2. Commit and push to GitHub
3. Netlify auto-deploys in ~30 seconds

## Key Files to Edit

- **Change prices, payment modes, entry types** → `js/config.js`
- **Change API backend URL** → `js/config.js`
- **Change form fields or screens** → `js/app.jsx`
- **Change UI components** → `js/components.jsx`
- **Change colors or animations** → `css/app.css`

## PWA Install

Staff can install the app on their phones:
1. Open the site in Chrome/Safari
2. Tap "Add to Home Screen"
3. App icon appears on home screen
