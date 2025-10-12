# 🛡️ LibreBrowse Secure

A privacy-first, minimal browser built on Electron that focuses on security, local privacy, and zero tracking. Browse the web without leaving a trace.

## ✨ Features

### 🔒 Privacy Protection
- **Ephemeral Sessions** - All browsing data stored in temporary directory, automatically wiped on exit
- **No History or Cache** - Zero persistence between sessions
- **Anti-Fingerprinting** - Randomized User-Agent rotation on each launch
- **No Telemetry** - Absolutely no data collection or tracking

### 🚫 Content Blocking
- **Ad & Tracker Blocking** - Built-in blocker using industry-standard filter lists
- **Script Protection** - Blocks malicious and tracking scripts automatically
- **WebRTC Disabled** - Prevents IP address leaks

### 🔐 Security Hardening
- **Sandboxed BrowserView** - Isolated browsing context with maximum security
- **Context Isolation** - Renderer process cannot access Node.js APIs
- **Security Headers** - CSP, X-Frame-Options, X-XSS-Protection enabled
- **Permission Blocking** - Automatic denial of geolocation, media access, and notifications
- **HTTPS-First** - Visual security indicators for connection status

### 🌐 Network Privacy
- **Proxy Support** - Built-in SOCKS5/HTTP/HTTPS proxy configuration
- **Tor Compatible** - Works seamlessly with Tor for anonymous browsing
- **Direct Connection Mode** - Easy toggle between proxy and direct connections

### 🎨 User Interface
- **Minimal Design** - Clean, distraction-free dark theme
- **Security Indicators** - Live visual feedback for connection security
- **Fast Navigation** - Back, forward, and reload controls
- **Smart URL Bar** - Automatic search and URL detection

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/libreakira-580/librebrowse-secure.git
cd librebrowse-secure
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the browser**
```bash
npm start
```

## 🚀 Quick Start

### Basic Usage
1. Launch LibreBrowse Secure
2. Enter a URL or search term in the address bar
3. Press Enter to navigate
4. Browse privately - all data is automatically cleared on exit

### Using a Proxy
1. Enter your proxy address in the proxy field (e.g., `socks5://127.0.0.1:9050`)
2. Click "Set Proxy" to activate
3. All traffic will now route through the configured proxy

### Tor Integration
To use LibreBrowse with Tor:
1. Install and run [Tor Browser](https://www.torproject.org/) or Tor daemon
2. In LibreBrowse, set proxy to: `socks5://127.0.0.1:9050`
3. Click "Set Proxy" - you're now browsing through Tor

## 🏗️ Building from Source

### Development Mode
```bash
npm run dev
```

### Package for Distribution

**Windows**
```bash
npm install electron-builder --save-dev
npx electron-builder --win
```

**macOS**
```bash
npm install electron-builder --save-dev
npx electron-builder --mac
```

**Linux**
```bash
npm install electron-builder --save-dev
npx electron-builder --linux
```

## 🔧 Configuration

LibreBrowse Secure is designed to work out-of-the-box with secure defaults. No configuration files are needed or stored.

### Security Settings
All security settings are hardcoded and cannot be disabled:
- Sandboxing: Always enabled
- Context isolation: Always enabled
- Node integration: Always disabled
- WebRTC: Always blocked
- Dangerous permissions: Always denied

## 📁 Project Structure

```
librebrowse-secure/
├── main.js          # Main process - app lifecycle and security
├── preload.js       # Secure IPC bridge
├── index.html       # UI and toolbar
├── package.json     # Dependencies and scripts
├── LICENSE          # MIT License
└── README.md        # This file
```

## 🛠️ Technical Details

### Built With
- **Electron** - Cross-platform desktop framework
- **@cliqz/adblocker-electron** - High-performance ad and tracker blocking
- **cross-fetch** - Universal fetch API

### Security Architecture
- **BrowserView Isolation** - Web content runs in a separate, sandboxed BrowserView
- **Temporary Session Storage** - All data stored in OS temp directory with random naming
- **Automatic Data Wiping** - Clears cookies, cache, localStorage, IndexedDB, and all other storage on exit
- **User-Agent Rotation** - Randomly selects from a pool of common user agents

### Anti-Fingerprinting Measures
- Randomized User-Agent strings
- WebRTC blocking (prevents IP leaks)
- Canvas fingerprinting protection (via sandboxing)
- Geolocation blocking
- Media device enumeration blocking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Maintain the security-first approach
- Keep the UI minimal and distraction-free
- Never add telemetry or tracking
- Test thoroughly before submitting PRs

## 🐛 Known Limitations

- **No Persistent Sessions** - Bookmarks and saved passwords are not supported by design
- **Basic UI** - Intentionally minimal to reduce attack surface
- **Certificate Warnings** - Self-signed certificates will show warnings (this is intentional for security)

## 📋 Roadmap

- [ ] Import/Export bookmarks (encrypted)
- [ ] Multiple tab support with isolation
- [ ] Built-in VPN integration
- [ ] Enhanced fingerprint randomization
- [ ] Custom filter list support
- [ ] Encrypted bookmark sync (optional)

## ⚠️ Disclaimer

LibreBrowse Secure is designed for privacy and security, but no software can guarantee complete anonymity. For maximum security:
- Use in combination with Tor
- Keep your system and LibreBrowse updated
- Practice good operational security (OPSEC)
- Understand the limitations of browser-based privacy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Framework foundation
- [Cliqz AdBlocker](https://github.com/ghostery/adblocker) - Content blocking engine
- The open-source privacy community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/libreakira-580/librebrowse-secure/issues)

---

**Made with privacy in mind** 🛡️

*LibreBrowse Secure - Browse freely, leave no trace fuck big companies.*
