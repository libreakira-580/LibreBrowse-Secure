
# Security Notes

- Prefer OS keychain (keytar). If not available, encrypted file stored in app data (AES-256-GCM with scrypt-derived key).
- Use strong master password. Consider platform disk encryption for better protection.
- Autofill is opt-in and requires explicit unlock and user consent per site.
- Certificate pinning is optional and stored in preferences; provide recovery/unpin flow.
- Avoid injecting content scripts into BrowserView; use observable navigation events and prompt user in UI for offers to save credentials.
- All renderer APIs are exposed via contextBridge with explicit methods only.
