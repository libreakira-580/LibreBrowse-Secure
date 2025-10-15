
<script>
  import { onMount } from 'svelte';
  let url = 'https://duckduckgo.com';
  let prefs = { dark: true };
  onMount(async () => {
    try { prefs.useDoH = await window.libre.prefs.get('prefs.useDoH') || false; prefs.tor = await window.libre.prefs.get('prefs.tor.enabled') || false; } catch(e) {}
  });
  function go() { if (!url) return; window.libre.navigate(url); }
  function openSettings() { showSettings = true; }
  let showSettings = false;
  let showPasswords = false;
</script>

<style>
  :global(body){ margin:0; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: var(--bg); color:var(--fg); }
  .top { display:flex; gap:8px; padding:12px; align-items:center; background: linear-gradient(90deg, rgba(10,12,20,1) 0%, rgba(18,24,34,1) 100%); }
  .input { flex:1; padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); color:inherit; }
  .btn { padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.03); cursor:pointer; }
  .center { display:grid; place-items:center; height:calc(100vh - 72px); color:#9aa3b2; }
  .modal { position:fixed; inset:0; display:grid; place-items:center; background:rgba(0,0,0,0.5); }
  .card { background: #0b1220; padding:16px; border-radius:10px; color:#e6eef8; width:480px; }
</style>

<svelte:head>
  <style>{prefs.dark ? `:root{--bg:#071025;--fg:#dbeafe}` : `:root{--bg:#ffffff;--fg:#0f172a}`}</style>
</svelte:head>

<div class="top">
  <button class="btn" on:click={() => window.libre.navigate('about:blank')}>Home</button>
  <input class="input" bind:value={url} placeholder="Enter URL or search" on:keydown={(e)=> e.key==='Enter' && go()} />
  <button class="btn" on:click={go}>Go</button>
  <button class="btn" on:click={() => showPasswords = true}>Passwords</button>
  <button class="btn" on:click={() => showSettings = true}>Settings</button>
</div>

<div class="center">
  <div>Content rendered in an isolated BrowserView.</div>
</div>

{#if showSettings}
  <div class="modal">
    <div class="card">
      <h3>Settings</h3>
      <label style="display:block;margin-top:8px"><input type="checkbox" bind:checked={prefs.useDoH} on:change={async ()=> await window.libre.prefs.set('prefs.useDoH', prefs.useDoH)} /> Use DNS-over-HTTPS</label>
      <label style="display:block;margin-top:8px"><input type="checkbox" bind:checked={prefs.tor} on:change={async ()=> await window.libre.prefs.set('prefs.tor.enabled', prefs.tor)} /> Enable Tor proxy (local Tor required)</label>
      <div style="text-align:right;margin-top:12px"><button class="btn" on:click={()=> showSettings=false}>Close</button></div>
    </div>
  </div>
{/if}

{#if showPasswords}
  <div class="modal">
    <div class="card">
      <h3>Passwords</h3>
      <PasswordManager on:close={()=> showPasswords=false} />
    </div>
  </div>
{/if}

<script>
  import PasswordManager from './lib/PasswordManager.svelte';
</script>
