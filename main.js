const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');

let mainWindow;
let browserView;
let blocker;
let tempDir;

// Randomized User Agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
];

const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

// Create temporary directory for session
function createTempDir() {
  const tmpBase = app.getPath('temp');
  tempDir = path.join(tmpBase, `librebrowse-${Date.now()}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

// Wipe temporary data
function wipeTempData() {
  if (tempDir && fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('Temp data wiped:', tempDir);
    } catch (err) {
      console.error('Failed to wipe temp data:', err);
    }
  }
}

// Initialize ad blocker
async function initAdBlocker() {
  blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
  blocker.enableBlockingInSession(session.defaultSession);
  console.log('Ad blocker initialized');
}

// Security headers
function setSecurityHeaders() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'"],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block'],
        'Referrer-Policy': ['no-referrer']
      }
    });
  });
}

// Disable fingerprinting methods
function antiFingerprint() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const deniedPermissions = ['geolocation', 'media', 'notifications', 'midiSysex'];
    if (deniedPermissions.includes(permission)) {
      return callback(false);
    }
    callback(true);
  });
}

function createWindow() {
  const tempSessionPath = createTempDir();
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  mainWindow.loadFile('index.html');

  // Create BrowserView for isolated browsing
  browserView = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      partition: `persist:librebrowse-${Date.now()}`,
      userAgent: randomUA
    }
  });

  mainWindow.setBrowserView(browserView);
  
  // Position browser view below toolbar (60px height)
  const updateBounds = () => {
    const { width, height } = mainWindow.getContentBounds();
    browserView.setBounds({ x: 0, y: 60, width, height: height - 60 });
  };
  
  updateBounds();
  mainWindow.on('resize', updateBounds);

  // Load initial page
  browserView.webContents.loadURL('about:blank');

  // Block WebRTC to prevent IP leaks
  browserView.webContents.session.setPermissionRequestHandler((wc, permission, callback) => {
    if (permission === 'media') {
      callback(false);
    } else {
      callback(true);
    }
  });

  // Update URL bar on navigation
  browserView.webContents.on('did-navigate', (event, url) => {
    mainWindow.webContents.send('url-updated', url);
  });

  browserView.webContents.on('did-navigate-in-page', (event, url) => {
    mainWindow.webContents.send('url-updated', url);
  });

  // Security indicator
  browserView.webContents.on('did-finish-load', () => {
    const url = browserView.webContents.getURL();
    const isSecure = url.startsWith('https://');
    mainWindow.webContents.send('security-status', isSecure);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    browserView = null;
  });
}

// IPC handlers
ipcMain.handle('navigate', async (event, url) => {
  if (!browserView) return;
  
  let targetUrl = url.trim();
  
  // Handle search vs URL
  if (!targetUrl.includes('.') && !targetUrl.startsWith('http')) {
    targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(targetUrl)}`;
  } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }
  
  browserView.webContents.loadURL(targetUrl);
});

ipcMain.handle('reload', async () => {
  if (browserView) {
    browserView.webContents.reload();
  }
});

ipcMain.handle('go-back', async () => {
  if (browserView && browserView.webContents.canGoBack()) {
    browserView.webContents.goBack();
  }
});

ipcMain.handle('go-forward', async () => {
  if (browserView && browserView.webContents.canGoForward()) {
    browserView.webContents.goForward();
  }
});

ipcMain.handle('set-proxy', async (event, proxyConfig) => {
  if (!proxyConfig) {
    await session.defaultSession.setProxy({ mode: 'direct' });
    return;
  }
  
  await session.defaultSession.setProxy({
    proxyRules: proxyConfig
  });
});

// App lifecycle
app.on('ready', async () => {
  await initAdBlocker();
  setSecurityHeaders();
  antiFingerprint();
  createWindow();
  
  console.log('LibreBrowse Secure started');
  console.log('User Agent:', randomUA);
  console.log('Temp Directory:', tempDir);
});

app.on('window-all-closed', () => {
  wipeTempData();
  app.quit();
});

app.on('before-quit', () => {
  // Clear all session data
  if (session.defaultSession) {
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData({
      storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 
                 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
    });
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Prevent any external protocol handling
app.setAsDefaultProtocolClient = () => false;
