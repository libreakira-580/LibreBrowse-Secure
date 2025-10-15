
<script>
  import { onMount, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let locked = true;
  let master = '';
  let list = [];
  onMount(async ()=>{ const info = await window.libre.pw.init(); locked = await window.libre.pw.isLocked(); });
  async function setMaster(){ await window.libre.pw.setMaster(master); locked = false; await refresh(); }
  async function unlock(){ const ok = await window.libre.pw.unlock(master); locked = !ok; if (ok) await refresh(); }
  async function refresh(){ list = await window.libre.pw.list(master) || []; }
  async function save(){ const url = prompt('Site URL'); const user = prompt('Username'); const pass = prompt('Password'); await window.libre.pw.save({ url, username: user, password: pass }, master); await refresh(); }
  async function viewItem(id){ const r = await window.libre.pw.get(id, master); alert(`URL:${r.url}\nUser:${r.username}\nPass:${r.password}`); }
  async function del(id){ if (!confirm('Delete?')) return; await window.libre.pw.delete(id, master); await refresh(); }
</script>

<style>
  .line{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid rgba(255,255,255,0.04);}
  .small{font-size:13px;color:#aab7c7}
</style>

{#if locked}
  <div>
    <input placeholder="Master password" type="password" bind:value={master} style="width:100%;padding:8px;border-radius:6px;background:transparent;border:1px solid rgba(255,255,255,0.03);color:inherit" />
    <div style="margin-top:8px"><button on:click={setMaster} class="btn">Set Master (new)</button> <button on:click={unlock} class="btn">Unlock</button></div>
  </div>
{:else}
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center"><div class="small">Unlocked</div><div><button on:click={()=>{ window.libre.pw.lock(); locked=true; list=[]; }} class="btn">Lock</button></div></div>
    <div style="margin-top:8px"><button on:click={save} class="btn">Add credential</button></div>
    <div style="max-height:220px;overflow:auto;margin-top:8px">
      {#each list as item}
        <div class="line"><div><div>{item.url}</div><div class="small">{item.username}</div></div><div><button on:click={()=>viewItem(item.id)} class="btn">View</button> <button on:click={()=>del(item.id)} class="btn">Del</button></div></div>
      {/each}
    </div>
    <div style="text-align:right;margin-top:8px"><button class="btn" on:click={()=> dispatch('close')}>Close</button></div>
  </div>
{/if}
