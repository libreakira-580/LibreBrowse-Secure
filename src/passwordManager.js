
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
let keytar; try { keytar = require('keytar'); } catch (e) { keytar = null; }
const { app } = require('electron');
const Store = require('electron-store');
const store = new Store({ name: 'librebrowse-meta' });

const PASSWORD_FILE = path.join(app.getPath('userData'), 'passwords.enc');
const SERVICE_NAME = 'LibreBrowse-Secure-Passwords';

function deriveKey(masterPassword, salt) { return crypto.scryptSync(masterPassword, salt, 32); }
function encryptJSON(jsonObj, masterPassword) {
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = deriveKey(masterPassword, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(jsonObj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from('LBS1'), salt, iv, tag, ciphertext]);
}
function decryptBlob(blobBuf, masterPassword) {
  if (blobBuf.slice(0,4).toString() !== 'LBS1') throw new Error('Invalid blob');
  const salt = blobBuf.slice(4,20), iv = blobBuf.slice(20,32), tag = blobBuf.slice(32,48), ciphertext = blobBuf.slice(48);
  const key = deriveKey(masterPassword, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}
let cache = { credentials: null, locked: true };
async function saveFileEncrypted(jsonObj, masterPassword) { const blob = encryptJSON(jsonObj, masterPassword); fs.writeFileSync(PASSWORD_FILE, blob, { mode: 0o600 }); store.set('passwords.exists', true); }
async function loadFileEncrypted(masterPassword) { if (!fs.existsSync(PASSWORD_FILE)) return null; const blob = fs.readFileSync(PASSWORD_FILE); return decryptBlob(blob, masterPassword); }

module.exports = {
  async init() { return { keytarAvailable: !!keytar, fileExists: fs.existsSync(PASSWORD_FILE) }; },
  async setMasterPassword(masterPassword) { const empty = { credentials: [], created: new Date().toISOString() }; await saveFileEncrypted(empty, masterPassword); cache.credentials = empty.credentials; cache.locked = false; if (keytar) await keytar.setPassword(SERVICE_NAME, 'sentinel', crypto.randomBytes(32).toString('hex')); return true; },
  async unlock(masterPassword) { try { const data = await loadFileEncrypted(masterPassword); if (!data) return false; cache.credentials = data.credentials || []; cache.locked = false; return true; } catch (e) { console.error('unlock failed', e); return false; } },
  async lock() { cache.credentials = null; cache.locked = true; }, isLocked() { return cache.locked; },
  async saveCredential({ id, url, username, password, notes }, masterPasswordIfNeeded) {
    if (!id) id = crypto.randomBytes(12).toString('hex');
    if (keytar) {
      const secret = JSON.stringify({ username, password, notes, url });
      await keytar.setPassword(SERVICE_NAME, id, secret);
      let meta = cache.credentials || [];
      meta = meta.filter(x => x.id !== id);
      meta.push({ id, url, username, created: new Date().toISOString() });
      cache.credentials = meta;
      const full = { credentials: meta, created: new Date().toISOString() };
      if (!masterPasswordIfNeeded) throw new Error('master password required to persist metadata');
      await saveFileEncrypted(full, masterPasswordIfNeeded);
      return id;
    } else {
      if (!masterPasswordIfNeeded) throw new Error('master password required');
      let meta = cache.credentials || [];
      meta = meta.filter(x => x.id !== id);
      meta.push({ id, url, username, created: new Date().toISOString(), notes: notes || '' });
      cache.credentials = meta;
      const full = { credentials: meta, created: new Date().toISOString(), secrets: cache.secrets || {} };
      full.secrets = full.secrets || {};
      full.secrets[id] = { password };
      await saveFileEncrypted(full, masterPasswordIfNeeded);
      return id;
    }
  },
  async getAllCredentials(masterPasswordIfNeeded) {
    if (keytar) { if (cache.locked) { if (!masterPasswordIfNeeded) throw new Error('locked'); await this.unlock(masterPasswordIfNeeded); } return cache.credentials || []; } else { if (cache.locked) { if (!masterPasswordIfNeeded) throw new Error('locked'); await this.unlock(masterPasswordIfNeeded); } const list = cache.credentials || []; return list.map(x => ({ id: x.id, url: x.url, username: x.username, created: x.created })); }
  },
  async getCredential(id, masterPasswordIfNeeded) {
    if (keytar) { const meta = (cache.credentials || []).find(x => x.id === id); if (!meta) return null; const secret = await keytar.getPassword(SERVICE_NAME, id); if (!secret) return null; return Object.assign({}, meta, JSON.parse(secret)); } else { if (cache.locked) { if (!masterPasswordIfNeeded) throw new Error('locked'); await this.unlock(masterPasswordIfNeeded); } const full = await loadFileEncrypted(masterPasswordIfNeeded); const meta = (full.credentials || []).find(x => x.id === id); if (!meta) return null; const secret = (full.secrets || {})[id]; return Object.assign({}, meta, secret || {}); }
  },
  async deleteCredential(id, masterPasswordIfNeeded) {
    if (keytar) { await keytar.deletePassword(SERVICE_NAME, id); const meta = (cache.credentials || []).filter(x => x.id !== id); cache.credentials = meta; const full = { credentials: meta, created: new Date().toISOString() }; if (!masterPasswordIfNeeded) throw new Error('master password required to persist metadata'); await saveFileEncrypted(full, masterPasswordIfNeeded); return true; } else { if (cache.locked) { if (!masterPasswordIfNeeded) throw new Error('locked'); await this.unlock(masterPasswordIfNeeded); } const full = await loadFileEncrypted(masterPasswordIfNeeded); if (!full) return false; full.credentials = (full.credentials || []).filter(x => x.id !== id); delete full.secrets[id]; await saveFileEncrypted(full, masterPasswordIfNeeded); cache.credentials = full.credentials; return true; }
  }
};
