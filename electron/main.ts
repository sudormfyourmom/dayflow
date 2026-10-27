import { app, BrowserWindow, ipcMain, session } from 'electron';
import fs from 'fs';
import path from 'path';
import { BrowserManager } from './browser/BrowserManager';
import { NotificationManager } from './notifications/NotificationManager';

let mainWindow: BrowserWindow | null = null;
let browserManager: BrowserManager | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (hasSingleInstanceLock) {
  const previousSessionDataPath = app.getPath('sessionData');
  const localAppDataPath = process.env.LOCALAPPDATA || app.getPath('appData');
  const sessionDataPath = path.join(localAppDataPath, 'DayFlow', 'SessionData');

  try {
    fs.mkdirSync(sessionDataPath, { recursive: true });

    // Migrate browser storage once, while leaving Chromium's potentially locked
    // cache directories behind in the old roaming profile.
    const localStoragePath = path.join(sessionDataPath, 'Local Storage');
    if (!fs.existsSync(localStoragePath) && fs.existsSync(previousSessionDataPath)) {
      const transientDirectories = new Set([
        'Cache',
        'Code Cache',
        'GPUCache',
        'DawnGraphiteCache',
        'DawnWebGPUCache',
        'GrShaderCache',
        'Shared Dictionary',
      ]);

      fs.cpSync(previousSessionDataPath, sessionDataPath, {
        recursive: true,
        filter: (source) => {
          const relativePath = path.relative(previousSessionDataPath, source);
          const firstPathSegment = relativePath.split(path.sep)[0];
          return !transientDirectories.has(firstPathSegment);
        },
      });
    }

    app.setPath('sessionData', sessionDataPath);
  } catch (error) {
    console.error('[DayFlow] Could not move Chromium session data to Local AppData:', error);
  }

  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#0c0d0e',
  show: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0c0d0e',
      symbolColor: '#9ca3af',
      height: 38,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  browserManager = new BrowserManager(mainWindow);

  // Security: Restrict navigation of the main window itself
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Only allow loading dev server or local index.html
    if (isDev && url.startsWith('http://localhost:5173')) return;
    if (url.startsWith('file://')) return;
    event.preventDefault();
  });

  if (isDev && process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    browserManager?.cleanup();
    browserManager = null;
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  if (!hasSingleInstanceLock) {
    app.quit();
    return;
  }

  // Set default Content Security Policy headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' https: http:; img-src 'self' data: https:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https: wss:;"
        ],
      },
    });
  });

  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers(): void {
  // Browser Tabs & WebContentsView Handlers
  ipcMain.handle('browser:create-tab', (_event, url) => {
    return browserManager?.createTab(url);
  });

  ipcMain.handle('browser:close-tab', (_event, tabId) => {
    browserManager?.closeTab(tabId);
  });

  ipcMain.handle('browser:switch-tab', (_event, tabId) => {
    browserManager?.switchTab(tabId);
  });

  ipcMain.handle('browser:navigate-tab', (_event, tabId, url) => {
    browserManager?.navigateTab(tabId, url);
  });

  ipcMain.handle('browser:go-back', (_event, tabId) => {
    browserManager?.goBack(tabId);
  });

  ipcMain.handle('browser:go-forward', (_event, tabId) => {
    browserManager?.goForward(tabId);
  });

  ipcMain.handle('browser:reload-tab', (_event, tabId) => {
    browserManager?.reloadTab(tabId);
  });

  ipcMain.handle('browser:stop-tab', (_event, tabId) => {
    browserManager?.stopTab(tabId);
  });

  ipcMain.handle('browser:update-bounds', (_event, params) => {
    browserManager?.updateBounds(params);
  });

  ipcMain.handle('browser:show-views', () => {
    browserManager?.showWebViews();
  });

  ipcMain.handle('browser:hide-views', () => {
    browserManager?.hideWebViews();
  });

  // Windows Notifications
  ipcMain.handle('system:send-notification', (_event, title, body) => {
    return NotificationManager.show(title, body);
  });

  // Window Controls
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });
}
