
const { app, BrowserWindow, BrowserView, session, ipcMain, dialog } = require('electron');
const path = require('path');
const passwordManager = require('./passwordManager');
const { installAdblock } = require('./adblock-setup');
const Store = require('electron-store');
const fetch = require('cross-fetch');
const store = new Store({ name: 'librebrowse-prefs' });

// Security flags
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-translate');
app.commandLine.appendSwitch('disable-client-side-phishing-detection');
app.commandLine.appendSwitch('force-webrtc-ip-handling-policy', 'disable_non_proxied_udp');

let mainWindow;
let view;

function randomizeUserAgent(original) {
  const parts = original.split(' ');
  const idx = Math.floor(Math.random() * parts.length);
  parts[idx] = parts[idx] + '-' + Math.random().toString(36).slice(2,6);
  return parts.join(' ');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webviewTag: false
    }
  });

  // BrowserView for content (isolated)
  view = new BrowserView({
    webPreferences: {
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      partition: 'persist:content'
    }
  });
  mainWindow.setBrowserView(view);
  const bounds = { x: 0, y: 72, width: 1200, height: 748 };
  view.setBounds(bounds);
  view.setAutoResize({ width: true, height: true });

  const ses = view.webContents.session;
  ses.setUserAgent(randomizeUserAgent(ses.getUserAgent()));
  ses.setPermissionRequestHandler((wc, perm, cb) => { cb(false); });

  try { await installAdblock(ses); } catch (e) { console.warn('adblock failed', e); }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
}

async function navigateTo(url) {
  try {
    if (!url.startsWith('http') && !url.startsWith('about:')) url = 'https://' + url;
    if (store.get('prefs.useDoH')) {
      const ok = await dohResolve(url);
      if (!ok) throw new Error('DNS resolution failed');
    }
    if (store.get('prefs.tor.enabled')) {
      const proxy = store.get('prefs.tor.proxy','socks5://127.0.0.1:9050');
      await view.webContents.session.setProxy({ proxyRules: proxy });
    } else {
      await view.webContents.session.setProxy({ proxyRules: '' });
    }
    await view.webContents.loadURL(url, { userAgent: view.webContents.session.getUserAgent() });
  } catch (e) {
    console.error('navigate failed', e);
    dialog.showErrorBox('Navigation error', String(e));
  }
}

async function dohResolve(url) {
  try {
    const hostname = new URL(url).hostname;
    const q = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const res = await fetch(q, { headers: { accept: 'application/dns-json' } });
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data && data.Answer && data.Answer.length);
  } catch (e) {
    console.warn('DoH failed', e);
    return false;
  }
}

// IPC handlers
ipcMain.handle('navigate', async (e, url) => { await navigateTo(url); return true; });
ipcMain.handle('prefs:get', (e, k) => store.get(k));
ipcMain.handle('prefs:set', (e, k, v) => store.set(k, v));

ipcMain.handle('pw:init', async () => passwordManager.init());
ipcMain.handle('pw:setMaster', async (e, pwd) => passwordManager.setMasterPassword(pwd));
ipcMain.handle('pw:unlock', async (e, pwd) => passwordManager.unlock(pwd));
ipcMain.handle('pw:lock', async () => passwordManager.lock());
ipcMain.handle('pw:isLocked', async () => passwordManager.isLocked());
ipcMain.handle('pw:list', async (e, pwd) => passwordManager.getAllCredentials(pwd));
ipcMain.handle('pw:get', async (e, id, pwd) => passwordManager.getCredential(id, pwd));
ipcMain.handle('pw:save', async (e, cred, pwd) => passwordManager.saveCredential(cred, pwd));
ipcMain.handle('pw:delete', async (e, id, pwd) => passwordManager.deleteCredential(id, pwd));

app.whenReady().then(async () => {
  try { await passwordManager.init(); } catch (e) { console.warn('pw init failed', e); }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
