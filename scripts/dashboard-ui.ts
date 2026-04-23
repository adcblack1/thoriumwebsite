import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DASHBOARD_EMAILS = (Deno.env.get('DASHBOARD_EMAILS') || '').split(',').map(e => e.trim().toLowerCase());
const SYNC_URL = `${SUPABASE_URL}/functions/v1/dashboard-sync`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getCookie(req: Request, name: string): string | null {
  const cookies = req.headers.get('cookie') || '';
  const match = cookies.split(';').find(c => c.trim().startsWith(`${name}=`));
  return match ? match.split('=')[1]?.trim() || null : null;
}

async function validateSession(req: Request): Promise<string | null> {
  const token = getCookie(req, 'ds_token');
  if (!token) return null;
  const { data } = await supabase.from('dashboard_sessions').select('email, expires_at').eq('token', token).single();
  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('dashboard_sessions').delete().eq('token', token);
    return null;
  }
  return data.email;
}

function loginPage(error?: string): Response {
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard Login</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#e5e5e5;font-family:Inter,-apple-system,sans-serif}
.card{background:#111;border:1px solid #222;border-radius:16px;padding:2.5rem;width:360px;text-align:center}
h1{font-size:1.4rem;font-weight:800;letter-spacing:.1em;margin-bottom:.5rem}
p{color:#666;font-size:.85rem;margin-bottom:1.5rem}
input{width:100%;padding:.8rem 1rem;background:#0a0a0a;border:1px solid #333;border-radius:8px;color:#fff;font-size:.95rem;margin-bottom:1rem}
button{width:100%;padding:.8rem;background:#8b5cf6;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer}
button:hover{background:#7c3aed}
.err{color:#ef4444;font-size:.85rem;margin-bottom:1rem}
</style></head><body><div class="card"><h1>THORIUM VALLEY</h1><p>Ad Performance Dashboard</p>
${error ? `<div class="err">${error}</div>` : ''}
<form method="POST"><input name="email" type="email" placeholder="Enter your email" required><button type="submit">Access Dashboard</button></form></div></body></html>`, {
    status: error ? 401 : 200, headers: { 'Content-Type': 'text/html' },
  });
}

function renderDashboard(data: any): string {
  const h = data?.health || {};
  const ads = data?.ads || [];
  const fr = data?.freshness || {};
  const synced = data?.synced_at;
  
  const activeAds = ads.filter((a: any) => a.is_active);
  const killedAds = ads.filter((a: any) => !a.is_active);
  
  // Sort by quality score
  activeAds.sort((a: any, b: any) => (b.quality_score || 0) - (a.quality_score || 0));
  
  // Top 2 / bottom 2 by cost per engaged
  const ranked = [...activeAds].filter((a: any) => a.engaged_readers > 0).sort((a: any, b: any) => a.cost_per_engaged - b.cost_per_engaged);
  const top2 = new Set(ranked.slice(0, 2).map((a: any) => a.ad_name));
  const bot2 = new Set(ranked.slice(-2).map((a: any) => a.ad_name));

  function badge(val: number | null | undefined, thresholds: [number, number], fmt = 'pct'): string {
    if (val === null || val === undefined) return '<span style="color:#555">\u2014</span>';
    const color = val >= thresholds[0] ? '#10b981' : val >= thresholds[1] ? '#f59e0b' : '#ef4444';
    const display = fmt === 'dollar' ? `$${Math.round(val)}` : `${val.toFixed(1)}%`;
    return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-weight:600;font-size:.8rem">${display}</span>`;
  }
  
  function confBadge(c: string): string {
    if (c === 'high') return '<span title="30+ subs">🟢</span>';
    if (c === 'medium') return '<span title="10-29 subs">🟡</span>';
    return '<span title="<10 subs">🔴</span>';
  }
  
  function deltaCell(today: number | null | undefined, hasYesterday: boolean): string {
    if (!hasYesterday || today === null || today === undefined) return '<span style="color:#555">\u2014</span>';
    return String(today);
  }
  
  function freshLabel(ts: string | null): string {
    if (!ts) return '<span style="color:#ef4444">Never ⚠️</span>';
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins > 360) return `<span style="color:#ef4444">${mins > 60 ? Math.floor(mins/60) + 'h' : mins + 'm'} ago ⚠️ STALE</span>`;
    return `<span style="color:#10b981">${mins < 1 ? 'just now' : mins + 'm ago'} ✅</span>`;
  }
  
  function goalBar(mix: Record<string, number>): string {
    const colors: Record<string, string> = {
      'Implement AI at my company': '#8b5cf6', 'Stay ahead of industry trends': '#3b82f6',
      'Work faster with AI': '#10b981', 'Automate repetitive work': '#f59e0b',
      'Build products with AI': '#ef4444', 'Grow my career': '#6b7280',
    };
    const entries = Object.entries(mix).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return '<span style="color:#555">\u2014</span>';
    let bar = '<div style="display:flex;height:16px;border-radius:3px;overflow:hidden;min-width:80px" title="';
    bar += entries.map(([g, p]) => `${g}: ${p}%`).join('&#10;');
    bar += '">';
    for (const [g, p] of entries) {
      bar += `<div style="width:${p}%;background:${colors[g] || '#444'}"></div>`;
    }
    bar += '</div>';
    return bar;
  }
  
  function adRow(a: any, isKilled = false): string {
    const rowBg = isKilled ? 'opacity:.4;text-decoration:line-through' : 
      top2.has(a.ad_name) ? 'background:rgba(16,185,129,.06)' : 
      bot2.has(a.ad_name) ? 'background:rgba(239,68,68,.06)' : '';
    const hasYesterday = a.spend_today !== undefined && a.spend_today !== null && a.subs_today !== undefined;
    
    return `<tr style="border-bottom:1px solid #1a1a1a;${rowBg}">
      <td style="padding:6px 10px;color:#fff;font-weight:600;font-family:monospace;font-size:.82rem;position:sticky;left:0;background:#0f0f0f;z-index:1;min-width:180px">${a.ad_name}</td>
      <td style="padding:6px 8px;color:#888;font-size:.78rem">${a.ad_live_since ? new Date(a.ad_live_since).toLocaleDateString('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric'}) : '\u2014'}</td>
      <td style="padding:6px 8px;color:#ccc">${a.days_running || 0}d</td>
      <td style="padding:6px 8px">${a.is_active ? '<span style="color:#10b981">●</span>' : '<span style="color:#ef4444">■</span>'}</td>
      <td style="padding:6px 8px;color:#ccc;font-family:monospace">$${a.spend_cumulative?.toFixed(0) || 0}</td>
      <td style="padding:6px 8px;color:#666;font-family:monospace">${deltaCell(a.spend_today, hasYesterday)}</td>
      <td style="padding:6px 8px;color:#ccc;font-family:monospace">${a.impressions_cumulative || 0}</td>
      <td style="padding:6px 8px">${badge(a.ad_ctr, [2, 1])}</td>
      <td style="padding:6px 8px;color:#ccc;font-family:monospace">${a.landing_page_views || 0}</td>
      <td style="padding:6px 8px;color:#ccc;font-family:monospace">$${a.cost_per_lpv?.toFixed(2) || '\u2014'}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05);color:#ccc;font-family:monospace">${a.total_subs}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05);color:#ccc;font-family:monospace">${deltaCell(a.subs_today, hasYesterday)}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05);color:#ccc">${a.icp_qualified}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05)">${badge(a.total_subs > 0 ? (a.icp_qualified/a.total_subs)*100 : 0, [80, 50])}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05);color:#ccc;font-family:monospace">$${a.cost_per_sub?.toFixed(0) || '\u2014'}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05);color:#ccc;font-family:monospace">$${a.cost_per_icp?.toFixed(0) || '\u2014'}</td>
      <td style="padding:6px 8px;background:rgba(59,130,246,.05)">${confBadge(a.confidence)}</td>
      <td style="padding:6px 8px;background:rgba(139,92,246,.05)">${goalBar(a.goal_mix || {})}</td>
      <td style="padding:6px 8px;background:rgba(16,185,129,.05)">${badge(a.tv_7d_open_rate, [35, 20])}</td>
      <td style="padding:6px 8px;background:rgba(16,185,129,.05)">${badge(a.tv_30d_open_rate, [35, 20])}</td>
      <td style="padding:6px 8px;background:rgba(16,185,129,.05)">${badge(a.tv_ctr, [5, 2])}</td>
      <td style="padding:6px 8px;background:rgba(16,185,129,.05);color:#ccc;font-family:monospace">${a.tv_unsub_count_cumulative || 0}</td>
      <td style="padding:6px 8px;background:rgba(16,185,129,.05)">${badge(a.tv_unsub_rate, [999, 5])}</td>
      <td style="padding:6px 8px;background:rgba(245,158,11,.05)">${badge(a.cat_sub_pct, [50, 25])}</td>
      <td style="padding:6px 8px;background:rgba(245,158,11,.05)">${badge(a.cat_open_rate, [35, 20])}</td>
      <td style="padding:6px 8px;background:rgba(245,158,11,.05)">${badge(a.cat_ctr, [5, 2])}</td>
      <td style="padding:6px 8px;background:rgba(245,158,11,.05);color:#ccc;font-family:monospace">${a.cat_unsub_count_cumulative || 0}</td>
      <td style="padding:6px 8px;background:rgba(249,115,22,.05)">${badge(a.lab_sub_pct, [50, 25])}</td>
      <td style="padding:6px 8px;background:rgba(249,115,22,.05)">${badge(a.lab_open_rate, [35, 20])}</td>
      <td style="padding:6px 8px;background:rgba(249,115,22,.05)">${badge(a.lab_ctr, [5, 2])}</td>
      <td style="padding:6px 8px;background:rgba(249,115,22,.05);color:#ccc;font-family:monospace">${a.lab_unsub_count_cumulative || 0}</td>
      <td style="padding:6px 8px;background:rgba(6,95,70,.1);color:#ccc;font-family:monospace">${a.engaged_readers}</td>
      <td style="padding:6px 8px;background:rgba(6,95,70,.1)">${a.engaged_readers > 0 ? badge(a.cost_per_engaged, [999, 30], 'dollar') : '<span style="color:#555">\u2014</span>'}</td>
      <td style="padding:6px 8px;background:rgba(6,95,70,.1)">${badge(a.multi_newsletter_pct, [20, 5])}</td>
      <td style="padding:6px 8px;background:rgba(6,95,70,.1)"><span style="background:${a.quality_score >= 30 ? '#10b981' : a.quality_score >= 18 ? '#f59e0b' : '#ef4444'};color:#fff;padding:3px 10px;border-radius:6px;font-weight:700;font-size:.95rem">${a.quality_score?.toFixed(1) || 0}</span></td>
    </tr>`;
  }

  const thStyle = 'padding:8px 8px;font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;font-weight:600;border-bottom:1px solid #333;white-space:nowrap';
  const thGrey = `style="${thStyle};background:#151515;color:#888"`;
  const thBlue = `style="${thStyle};background:#0f1424;color:#60a5fa"`;
  const thPurple = `style="${thStyle};background:#1a0f24;color:#a78bfa"`;
  const thGreen = `style="${thStyle};background:#0f1a14;color:#34d399"`;
  const thYellow = `style="${thStyle};background:#1a1a0f;color:#fbbf24"`;
  const thOrange = `style="${thStyle};background:#1a140f;color:#fb923c"`;
  const thDGreen = `style="${thStyle};background:#0a1a14;color:#10b981"`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thorium Valley | Ad Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e5e5e5;font-family:Inter,-apple-system,sans-serif;font-size:.9rem}
.wrap{max-width:1800px;margin:0 auto;padding:1.5rem}
.hdr{text-align:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #222}
.hdr h1{font-size:1.6rem;font-weight:800;letter-spacing:.12em;background:linear-gradient(135deg,#fff,#888);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr p{color:#666;font-size:.85rem;margin-top:.3rem}
.fresh{display:flex;justify-content:center;gap:1.5rem;margin:.8rem 0;font-size:.78rem}
.tiles{display:grid;grid-template-columns:repeat(6,1fr);gap:.8rem;margin-bottom:1.5rem}
.tile{background:#111;border:1px solid #222;border-radius:10px;padding:1rem;text-align:center}
.tile .v{font-size:1.6rem;font-weight:800;color:#fff}
.tile .l{font-size:.7rem;color:#666;text-transform:uppercase;letter-spacing:.04em;margin-top:.2rem}
.tile .sub{font-size:.7rem;color:#555;margin-top:.2rem}
.controls{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.btn{padding:.5rem 1.2rem;background:#1a1a2e;color:#8b5cf6;border:1px solid #8b5cf6;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600}
.btn:hover{background:#2a1a3e}
.btn:disabled{opacity:.4;cursor:not-allowed}
.tbwrap{overflow-x:auto;border-radius:10px;border:1px solid #222}
table{border-collapse:collapse;width:100%;font-size:.82rem}
.tabs{display:flex;gap:0;margin-bottom:1rem}
.tab{padding:.6rem 1.2rem;background:#111;border:1px solid #222;color:#888;cursor:pointer;font-size:.85rem;font-weight:600}
.tab:first-child{border-radius:8px 0 0 8px}.tab:last-child{border-radius:0 8px 8px 0}
.tab.active{background:#1a1a2e;color:#8b5cf6;border-color:#8b5cf6}
.panel{display:none}.panel.active{display:block}
#explorer-search{width:300px;padding:.5rem .8rem;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:.85rem;margin-bottom:1rem}
</style></head><body><div class="wrap">
<div class="hdr"><h1>THORIUM VALLEY</h1><p>Ad Performance Dashboard</p>
<div class="fresh">
<span>Meta: ${freshLabel(fr.meta_fresh_at)}</span>
<span>Beehiiv: ${freshLabel(fr.beehiiv_fresh_at)}</span>
<span>Supabase: ${freshLabel(fr.supabase_fresh_at)}</span>
</div>
</div>

<div class="tiles">
<div class="tile"><div class="v">$${h.total_spend_7d?.toFixed(0) || 0}</div><div class="l">Spend Today</div></div>
<div class="tile"><div class="v">${h.total_subs_7d || 0}</div><div class="l">Subs Today</div></div>
<div class="tile"><div class="v" style="color:${h.icp_pct >= 50 ? '#10b981' : '#f59e0b'}">${h.icp_pct?.toFixed(1) || 0}%</div><div class="l">ICP Qualified</div></div>
<div class="tile"><div class="v" style="color:${h.blended_7d_open >= 35 ? '#10b981' : h.blended_7d_open >= 20 ? '#f59e0b' : '#ef4444'}">${h.blended_7d_open?.toFixed(1) || 0}%</div><div class="l">7d Open Rate</div></div>
<div class="tile"><div class="v" style="color:${h.blended_30d_open >= 35 ? '#10b981' : h.blended_30d_open >= 20 ? '#f59e0b' : '#ef4444'}">${h.blended_30d_open?.toFixed(1) || 0}%</div><div class="l">30d Open Rate</div><div class="sub">Organic: ${h.organic_benchmark?.toFixed(1) || 0}%</div></div>
<div class="tile"><div class="v">${ads.filter((a:any) => a.is_active).length}</div><div class="l">Active Ads</div></div>
</div>

<div class="controls">
<div style="display:flex;gap:.5rem;align-items:center">
<button class="btn" id="refreshBtn" onclick="doRefresh()">↻ Refresh All</button>
<button class="btn" style="font-size:.75rem;padding:.4rem .8rem" id="toggleKilled" onclick="toggleKilled()">Show Killed Ads</button>
</div>
<span style="color:#555;font-size:.78rem">Last synced: ${synced ? new Date(synced).toLocaleString('en-US',{timeZone:'America/Los_Angeles'}) : 'Never'}</span>
</div>

<div class="tabs">
<div class="tab active" onclick="showTab(0)">Performance</div>
<div class="tab" onclick="showTab(1)">Subscriber Explorer</div>
</div>

<div class="panel active" id="panel-0">
<div class="tbwrap"><table>
<thead><tr>
<th style="${thStyle};background:#151515;color:#888;position:sticky;left:0;z-index:2">Ad Name</th>
<th ${thGrey}>Since</th><th ${thGrey}>Days</th><th ${thGrey}>St</th>
<th ${thGrey}>Spend</th><th ${thGrey}>+Today</th><th ${thGrey}>Impr</th><th ${thGrey}>Ad CTR</th><th ${thGrey}>LPV</th><th ${thGrey}>$/LPV</th>
<th ${thBlue}>Subs</th><th ${thBlue}>+Today</th><th ${thBlue}>ICP</th><th ${thBlue}>ICP%</th><th ${thBlue}>$/Sub</th><th ${thBlue}>$/ICP</th><th ${thBlue}>Conf</th>
<th ${thPurple}>Goals</th>
<th ${thGreen}>7d Open</th><th ${thGreen}>30d Open</th><th ${thGreen}>TV CTR</th><th ${thGreen}>Unsubs</th><th ${thGreen}>Unsub%</th>
<th ${thYellow}>Cat%</th><th ${thYellow}>Cat Open</th><th ${thYellow}>Cat CTR</th><th ${thYellow}>Cat Uns</th>
<th ${thOrange}>Lab%</th><th ${thOrange}>Lab Open</th><th ${thOrange}>Lab CTR</th><th ${thOrange}>Lab Uns</th>
<th ${thDGreen}>Engaged</th><th ${thDGreen}>$/Eng</th><th ${thDGreen}>Multi%</th><th ${thDGreen}>Score</th>
</tr></thead>
<tbody>
${activeAds.map((a: any) => adRow(a)).join('')}
</tbody>
<tbody id="killedRows" style="display:none">
${killedAds.map((a: any) => adRow(a, true)).join('')}
</tbody>
</table></div>
</div>

<div class="panel" id="panel-1">
<input id="explorer-search" placeholder="Search by email or ad name..." oninput="filterExplorer(this.value)">
<div class="tbwrap"><table id="explorer-table">
<thead><tr>
<th ${thGrey}>Email</th><th ${thGrey}>Ad</th><th ${thGrey}>Goal</th><th ${thGrey}>Seniority</th>
<th ${thGrey}>Function</th><th ${thGrey}>Industry</th><th ${thGrey}>Company</th>
<th ${thGreen}>TV Open</th><th ${thYellow}>Cat Open</th><th ${thOrange}>Lab Open</th><th ${thGrey}>Days</th>
</tr></thead>
<tbody id="explorer-body"></tbody>
</table></div>
</div>

</div>
<script>
function showTab(i){document.querySelectorAll('.tab').forEach((t,j)=>{t.classList.toggle('active',j===i)});document.querySelectorAll('.panel').forEach((p,j)=>{p.classList.toggle('active',j===i)})}
function toggleKilled(){const r=document.getElementById('killedRows');const b=document.getElementById('toggleKilled');if(r.style.display==='none'){r.style.display='';b.textContent='Hide Killed Ads'}else{r.style.display='none';b.textContent='Show Killed Ads'}}
async function doRefresh(){const b=document.getElementById('refreshBtn');b.disabled=true;b.textContent='Refreshing...';try{const r=await fetch(window.location.href,{method:'POST'});const d=await r.json();if(d.error){b.textContent=d.error;setTimeout(()=>{b.textContent='↻ Refresh All';b.disabled=false},3000)}else{b.textContent='✓ Done';setTimeout(()=>location.reload(),1500)}}catch(e){b.textContent='Failed';setTimeout(()=>{b.textContent='↻ Refresh All';b.disabled=false},3000)}}
function filterExplorer(q){const rows=document.querySelectorAll('#explorer-body tr');q=q.toLowerCase();rows.forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?'':'none'})}
</script></body></html>`;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST' } });
  }
  
  // POST to login form
  if (req.method === 'POST' && !getCookie(req, 'ds_token')) {
    try {
      const formData = await req.formData();
      const email = (formData.get('email') as string || '').trim().toLowerCase();
      if (!DASHBOARD_EMAILS.includes(email)) {
        return loginPage('Email not authorized');
      }
      const token = crypto.randomUUID() + '-' + crypto.randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await supabase.from('dashboard_sessions').insert({ email, token, expires_at: expires.toISOString() });
      return new Response(null, {
        status: 302,
        headers: {
          'Location': url.pathname,
          'Set-Cookie': `ds_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30*24*60*60}`,
        },
      });
    } catch { return loginPage('Login failed'); }
  }
  
  // POST to trigger refresh (from authenticated user)
  if (req.method === 'POST') {
    const email = await validateSession(req);
    if (!email) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    try {
      const r = await fetch(SYNC_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      const d = await r.json();
      return new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
    }
  }
  
  // GET - validate session
  const email = await validateSession(req);
  if (!email) return loginPage();
  
  // Read from cache
  const { data: cache } = await supabase.from('dashboard_cache').select('data, meta_fresh_at, beehiiv_fresh_at, supabase_fresh_at, last_sync_completed_at').eq('id', 'current').single();
  
  const dashData = cache?.data || {};
  dashData.freshness = {
    meta_fresh_at: cache?.meta_fresh_at,
    beehiiv_fresh_at: cache?.beehiiv_fresh_at,
    supabase_fresh_at: cache?.supabase_fresh_at,
  };
  dashData.synced_at = cache?.last_sync_completed_at;
  
  return new Response(renderDashboard(dashData), {
    headers: { 'Content-Type': 'text/html' },
  });
});
