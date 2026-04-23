/**
 * Per-creative open rate & CTR for the 9 active ads.
 * Fixes the Beehiiv ratio interpretation (Beehiiv returns percentages, not decimals).
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const BEEHIIV_PUB_ID = 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61';
const SUPABASE_URL = 'https://iyaypvpkozntojbasjuh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXlwdnBrb3pudG9qYmFzanVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTE4ODksImV4cCI6MjA4ODc4Nzg4OX0.Vq5DxGvp3Xobpi234_vWoGEAKj95NY_ecPGiQqlcNA4';

async function getSubscribers() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?completed=eq.true&beehiiv_subscriber_id=not.is.null&select=id,email,utm_content,beehiiv_subscriber_id,seniority,company_size,main_goal,job_function,industry,created_at&order=created_at.desc`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function getBeehiivStats(subscriptionId) {
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions/${subscriptionId}?expand=stats`,
    { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data || null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('📡 Fetching subscribers & Beehiiv stats...\n');
  const subscribers = await getSubscribers();

  // The 9 active ads
  const ACTIVE_ADS = [
    'Phone Screenshot Dark A - Copy',
    'AI Expert Red Phone A - Copy',
    'Phone Screenshot Dark B - Copy',
    'AI Expert Red Phone B - Copy',
    'AI Eating Window - Copy',
    'Three Phones Expert - Copy',
    'Three Phones Variant - Copy',
    'Morning Paper Guy - Copy',
    'Window Guy Variant - Copy',
  ];

  const creativeData = {};
  for (const ad of ACTIVE_ADS) {
    creativeData[ad] = { subs: [], openRates: [], ctrs: [], opened: 0, clicked: 0, total: 0 };
  }

  // Also track organic
  creativeData['organic'] = { subs: [], openRates: [], ctrs: [], opened: 0, clicked: 0, total: 0 };

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    const creative = sub.utm_content || 'organic';
    
    // Only process active ads + organic
    if (!creativeData[creative]) continue;

    process.stdout.write(`\r[${i+1}/${subscribers.length}] ${sub.email.substring(0,30).padEnd(30)}`);
    await sleep(150);
    
    const beehiiv = await getBeehiivStats(sub.beehiiv_subscriber_id);
    if (!beehiiv?.stats) continue;

    // Beehiiv returns open_rate as decimal (0.0 to 1.0)
    const rawOR = beehiiv.stats.open_rate ?? 0;
    const rawCTR = beehiiv.stats.click_rate ?? 0;
    
    // Determine if Beehiiv is returning percentages (>1) or decimals (0-1)
    // If value > 1, it's already a percentage; if <= 1, multiply by 100
    const openRate = rawOR > 1 ? rawOR : rawOR * 100;
    const ctr = rawCTR > 1 ? rawCTR : rawCTR * 100;

    creativeData[creative].total++;
    creativeData[creative].openRates.push(openRate);
    creativeData[creative].ctrs.push(ctr);
    if (openRate > 0) creativeData[creative].opened++;
    if (ctr > 0) creativeData[creative].clicked++;

    creativeData[creative].subs.push({
      email: sub.email,
      seniority: sub.seniority,
      company_size: sub.company_size,
      main_goal: sub.main_goal,
      job_function: sub.job_function,
      industry: sub.industry,
      openRate,
      ctr,
    });
  }

  // ── Per-Creative Table ──
  console.log('\n\n' + '═'.repeat(110));
  console.log('📊 PER-AD CREATIVE: OPEN RATE & CTR (9 Active Ads + Organic)');
  console.log('═'.repeat(110));
  console.log(
    'Ad Creative'.padEnd(38) +
    'Subs'.padStart(5) +
    'Opened'.padStart(8) +
    'Open%'.padStart(8) +
    'Clicked'.padStart(9) +
    'CTR%'.padStart(8) +
    'AvgOR'.padStart(8) +
    'AvgCTR'.padStart(8) +
    '  Signal'
  );
  console.log('─'.repeat(110));

  const sorted = [...ACTIVE_ADS, 'organic'].sort((a, b) => {
    const aRate = creativeData[a].total > 0 ? creativeData[a].opened / creativeData[a].total : -1;
    const bRate = creativeData[b].total > 0 ? creativeData[b].opened / creativeData[b].total : -1;
    return bRate - aRate;
  });

  for (const creative of sorted) {
    const d = creativeData[creative];
    if (d.total === 0) {
      console.log(`${creative.padEnd(38)} ${String(0).padStart(5)}    —       —        —       —       —    ⚪ No data`);
      continue;
    }
    const openPct = ((d.opened / d.total) * 100).toFixed(0);
    const clickPct = ((d.clicked / d.total) * 100).toFixed(0);
    const avgOR = d.openRates.length > 0 ? (d.openRates.reduce((a,b) => a+b, 0) / d.openRates.length).toFixed(0) : '0';
    const avgCTR = d.ctrs.length > 0 ? (d.ctrs.reduce((a,b) => a+b, 0) / d.ctrs.length).toFixed(0) : '0';
    
    let signal = '🔴 Bad';
    if (parseInt(openPct) >= 50) signal = '🟢 Good';
    else if (parseInt(openPct) >= 30) signal = '🟡 OK';

    console.log(
      creative.padEnd(38) +
      String(d.total).padStart(5) +
      String(d.opened).padStart(8) +
      `${openPct}%`.padStart(8) +
      String(d.clicked).padStart(9) +
      `${clickPct}%`.padStart(8) +
      `${avgOR}%`.padStart(8) +
      `${avgCTR}%`.padStart(8) +
      `  ${signal}`
    );
  }

  // ── Per-Creative Detail ──
  for (const creative of ACTIVE_ADS) {
    const d = creativeData[creative];
    if (d.total === 0) continue;

    console.log(`\n${'─'.repeat(110)}`);
    console.log(`📋 ${creative} (${d.total} subs, ${d.opened} opened)`);
    console.log('─'.repeat(110));
    
    const sortedSubs = d.subs.sort((a, b) => b.openRate - a.openRate);
    for (const s of sortedSubs) {
      const icon = s.openRate > 0 ? '✅' : '❌';
      console.log(
        `  ${icon} ${s.email.padEnd(35)} OR:${String(s.openRate.toFixed(0)+'%').padStart(5)} CTR:${String(s.ctr.toFixed(0)+'%').padStart(5)} │ ${s.seniority.padEnd(22)} ${s.company_size.padEnd(10)} │ ${s.main_goal}`
      );
    }
  }
}

main().catch(console.error);
