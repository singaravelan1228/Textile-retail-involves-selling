/**
 * TextilePOS — Electron Main Process
 * Starts Express server → waits for it → opens BrowserWindow
 */

const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, shell } = require('electron');
const path    = require('path');
const { fork } = require('child_process');
const http    = require('http');
const fs      = require('fs');

// ── Paths ──────────────────────────────────────────────────
const SERVER_DIR  = path.join(__dirname, '..', 'server');
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
const DATA_DIR    = path.join(app.getPath('userData'), 'TextilePOS');
const LOG_FILE    = path.join(DATA_DIR, 'app.log');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Logging ────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

// ── Global vars ────────────────────────────────────────────
let mainWindow   = null;
let serverProcess = null;
let tray         = null;
const PORT       = 5000;

// ── Start Express server as child process ──────────────────
function startServer() {
  return new Promise((resolve, reject) => {
    log('Starting Express server...');

    serverProcess = fork(path.join(SERVER_DIR, 'server.js'), [], {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        PORT: PORT,
        NODE_ENV: 'production',
        MONGO_URI: 'mongodb://localhost:27017/textilepos',
        JWT_SECRET: 'textilepos_desktop_secret_key_2024',
        JWT_EXPIRE: '30d',
        ELECTRON: 'true',
        DATA_DIR: DATA_DIR,
      },
      silent: false,
    });

    serverProcess.on('error', (err) => {
      log('Server process error: ' + err.message);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0) log('Server exited with code ' + code);
    });

    // Poll until server is ready
    let attempts = 0;
    const MAX = 30;
    const poll = setInterval(() => {
      attempts++;
      http.get(`http://localhost:${PORT}/api/health`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(poll);
          log('Server is ready on port ' + PORT);
          resolve();
        }
      }).on('error', () => {
        if (attempts >= MAX) {
          clearInterval(poll);
          reject(new Error('Server did not start in time. Is MongoDB running?'));
        }
      });
    }, 1000);
  });
}

// ── Create main window ─────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    title: 'TextilePOS — Retail Billing',
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      nodeIntegration:  false,
      contextIsolation: true,
    },
  });

  // Load the built React app served by Express
  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    log('Window shown');
  });

  mainWindow.on('close', (e) => {
    // Minimize to tray instead of closing
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ── System Tray ────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(fs.existsSync(iconPath) ? iconPath : path.join(__dirname, 'icon_fallback.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open TextilePOS', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: 'separator' },
    { label: 'Run Backup Now',  click: () => runBackupNow() },
    { label: 'Open Data Folder', click: () => shell.openPath(DATA_DIR) },
    { label: 'View Logs',        click: () => shell.openPath(LOG_FILE) },
    { type: 'separator' },
    { label: 'Quit TextilePOS', click: () => quitApp() },
  ]);

  tray.setToolTip('TextilePOS — Retail Billing');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ── App Menu ───────────────────────────────────────────────
function setAppMenu() {
  const template = [
    {
      label: 'TextilePOS',
      submenu: [
        { label: 'About', click: () => dialog.showMessageBox(mainWindow, {
            type: 'info', title: 'TextilePOS',
            message: 'TextilePOS v2.0\nRetail Textiles Billing System\n\nData stored at:\n' + DATA_DIR,
          })
        },
        { type: 'separator' },
        { label: 'Run Backup Now', accelerator: 'CmdOrCtrl+B', click: runBackupNow },
        { label: 'Open Data Folder', click: () => shell.openPath(DATA_DIR) },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: quitApp },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload',         accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { label: 'Force Reload',   accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWindow?.webContents.reloadIgnoringCache() },
        { label: 'Toggle DevTools',accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Zoom In',  accelerator: 'CmdOrCtrl+Plus',  click: () => { const z = mainWindow?.webContents.getZoomFactor(); mainWindow?.webContents.setZoomFactor(Math.min(z + 0.1, 2)); } },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-',     click: () => { const z = mainWindow?.webContents.getZoomFactor(); mainWindow?.webContents.setZoomFactor(Math.max(z - 0.1, 0.5)); } },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0',  click: () => mainWindow?.webContents.setZoomFactor(1) },
        { type: 'separator' },
        { label: 'Fullscreen', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'View Logs',        click: () => shell.openPath(LOG_FILE) },
        { label: 'Open Data Folder', click: () => shell.openPath(DATA_DIR) },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Backup ─────────────────────────────────────────────────
async function runBackupNow() {
  try {
    const backup = require('./backup');
    await backup.run(DATA_DIR, log);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Backup Complete',
      message: 'Database backup completed successfully!\n\nSaved to:\n' + path.join(DATA_DIR, 'backups'),
    });
  } catch (err) {
    dialog.showErrorBox('Backup Failed', err.message);
  }
}

// ── IPC handlers ───────────────────────────────────────────
ipcMain.handle('app:backup-now', runBackupNow);
ipcMain.handle('app:open-data',  () => shell.openPath(DATA_DIR));
ipcMain.handle('app:version',    () => app.getVersion());
ipcMain.handle('app:data-dir',   () => DATA_DIR);

// ── Quit ───────────────────────────────────────────────────
function quitApp() {
  log('Quitting...');
  mainWindow?.removeAllListeners('close');

  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    log('Server process killed');
  }

  tray?.destroy();
  app.quit();
}

// ── Splash screen while server loads ──────────────────────
function showSplash() {
  const splash = new BrowserWindow({
    width: 420, height: 280,
    frame: false, transparent: true, alwaysOnTop: true,
    webPreferences: { nodeIntegration: false },
  });
  splash.loadFile(path.join(__dirname, 'splash.html'));
  return splash;
}

// ── App lifecycle ──────────────────────────────────────────
app.whenReady().then(async () => {
  log('Electron app ready');
  setAppMenu();

  const splash = showSplash();

  try {
    await startServer();
    createWindow();
    createTray();
    splash.destroy();

    // Start auto backup scheduler
    const backup = require('./backup');
    backup.schedule(DATA_DIR, log);

  } catch (err) {
    splash.destroy();
    log('Startup error: ' + err.message);
    dialog.showErrorBox('TextilePOS — Startup Error',
      err.message + '\n\n' +
      'Please make sure MongoDB is running.\n' +
      'Start MongoDB from the Start Menu or run: mongod\n\n' +
      'Then restart TextilePOS.'
    );
    quitApp();
  }
});

app.on('window-all-closed', (e) => {
  // Keep running in tray
  e.preventDefault();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
  else { mainWindow.show(); mainWindow.focus(); }
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill('SIGTERM');
});
