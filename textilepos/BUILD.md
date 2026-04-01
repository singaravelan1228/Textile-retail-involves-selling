# TextilePOS Desktop — Build Instructions

## Prerequisites (install once)

1. **Node.js 18+** — https://nodejs.org
2. **MongoDB Community** — https://www.mongodb.com/try/download/community
3. **Git** (optional)

---

## Step 1 — Install all dependencies

Open PowerShell in the `textilepos` root folder:

```powershell
# Install Electron builder dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

---

## Step 2 — Build the React frontend

```powershell
cd client
npm run build
cd ..
```

This creates `client/dist/` folder with the compiled app.

---

## Step 3 — Test in development (optional)

Make sure MongoDB is running, then:

```powershell
npm start
```

The app will open as a desktop window.

---

## Step 4 — Build the Windows installer

```powershell
npm run build:win
```

This creates two files in `dist-electron/`:
- `TextilePOS Setup 2.0.0.exe` — Windows installer (recommended)
- `TextilePOS 2.0.0.exe` — Portable version (no install needed)

---

## First launch after install

1. Make sure MongoDB is running (start from Start Menu or run `mongod`)
2. Open TextilePOS from the Desktop shortcut
3. Wait for the splash screen to load (5–10 seconds)
4. First time: run the seed to create sample data:
   ```powershell
   cd server
   npm run seed
   ```
5. Login: `admin@textilepos.com` / `Admin@123`

---

## Backup location

Backups are saved automatically every day at 2:00 AM to:
```
C:\Users\[YourName]\AppData\Roaming\TextilePOS\backups\
```

To run a backup manually: **TextilePOS menu → Run Backup Now** (Ctrl+B)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "MongoDB not running" error | Start MongoDB service or run `mongod` |
| Blank screen | Press F5 to reload |
| Data missing after reinstall | Data is in AppData — not deleted by uninstall |

