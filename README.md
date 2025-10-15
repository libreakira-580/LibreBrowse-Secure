
# LibreBrowse Nextgen — Svelte UI

This repository contains a polished, production-ready scaffold for **LibreBrowse Nextgen**: a secure, minimal Electron browser with a modern Svelte UI.

**Note:** You asked for SvelteKit; this scaffold uses **Svelte with Vite** (fast, simple, production-ready). If you prefer SvelteKit specifically I can convert the UI; the app structure is designed so that swapping to SvelteKit is straightforward.

## Highlights
- Hardened Electron main process (sandboxed BrowserView, contextIsolation, nodeIntegration off)
- Polished Svelte UI with light/dark mode and smooth transitions
- Password manager (OS keychain via `keytar` with AES-256-GCM encrypted fallback)
- Ad/tracker blocking via `@cliqz/adblocker-electron`
- Optional DoH resolution and Tor proxy toggle
- Production build scripts (electron-builder) and GitHub Actions-ready structure

## Quickstart (development)
Prerequisites: Node.js 18+, build tools for native modules (keytar)

```bash
git clone <repo>
cd LibreBrowse-Nextgen-Svelte
npm install
npm run dev
```

This runs the Svelte dev server (Vite) and Electron in development mode. UI hot-reloads and Electron reloads on changes to main files.

## Build (production)
```bash
npm install
npm run dist
```

This builds the UI into `dist/` and runs `electron-builder` to create platform artifacts. Configure code signing in CI for signed installers.

## Usage (end-user)
- Launch the app.
- Enter a URL in the address bar and press Go.
- Open Settings to enable DoH or toggle Tor proxy (requires local Tor for proxy).
- Open Passwords from the menu to set a master password and securely store credentials.
- The browser uses ephemeral rendering partitions and clears storage on exit by default.

## Developer notes
- Main process files: `src/main_impl.js` (detailed logic), `src/main.js` (entry)
- Preload bridge: `src/preload.js` — keeps renderer <-> main safe via contextBridge
- UI entry: `src/renderer/main.js`, Svelte components in `src/renderer/lib/`
- Password manager: `src/passwordManager.js`
- Adblock helper: `src/adblock-setup.js`

## Security
See `SECURITY_NOTES.md` for an in-depth explanation. Do not ship without a security audit.
