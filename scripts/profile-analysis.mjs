/**
 * Deep profile analysis: which subscriber profiles actually open?
 * Cross-references seniority × goal × industry × company_size with Beehiiv open rates.
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
  console.log('📡 Fetching subscribers...');
  const subscribers = await getSubscribers();
  console.log(`   Found ${subscribers.length} subscribers\n`);

  const results = [];

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    process.stdout.write(`[${i+1}/${subscribers.length}] ${sub.email.substring(0,30).padEnd(30)}... `);
    await sleep(200);
    const beehiiv = await getBeehiivStats(sub.beehiiv_subscriber_id);
    if (!beehiiv?.stats) { console.log('skip'); continue; }

    const openRate = (beehiiv.stats.open_rate ?? 0) * 100;
    const hasOpened = openRate > 0;
    console.log(hasOpened ? `✅ ${openRate.toFixed(0)}%` : '❌ 0%');

    results.push({
      email: sub.email,
      creative: sub.utm_content || 'organic',
      seniority: sub.seniority,
      company_size: sub.company_size,
      main_goal: sub.main_goal,
      job_function: sub.job_function,
      industry: sub.industry,
      openRate,
      hasOpened,
      isAd: !!sub.utm_content,
    });
  }

  // ── ANALYSIS ──
  const ad = results.filter(r => r.isAd);
  const organic = results.filter(r => !r.isAd);

  console.log('\n' + '═'.repeat(100));
  console.log('📊 OPEN RATE BY SENIORITY');
  console.log('═'.repeat(100));
  printBreakdown(results, 'seniority');

  console.log('\n' + '═'.repeat(100));
  console.log('📊 OPEN RATE BY MAIN GOAL');
  console.log('═'.repeat(100));
  printBreakdown(results, 'main_goal');

  console.log('\n' + '═'.repeat(100));
  console.log('📊 OPEN RATE BY COMPANY SIZE');
  console.log('═'.repeat(100));
  printBreakdown(results, 'company_size');

  console.log('\n' + '═'.repeat(100));
  console.log('📊 OPEN RATE BY INDUSTRY');
  console.log('═'.repeat(100));
  printBreakdown(results, 'industry');

  console.log('\n' + '═'.repeat(100));
  console.log('📊 OPEN RATE BY JOB FUNCTION');
  console.log('═'.repeat(100));
  printBreakdown(results, 'job_function');

  // ── Cross-tab: Seniority × Goal ──
  console.log('\n' + '═'.repeat(100));
  console.log('🔬 CROSS-TAB: SENIORITY × MAIN GOAL (ad-sourced only)');
  console.log('═'.repeat(100));
  const combos = {};
  for (const r of ad) {
    const key = `${r.seniority} | ${r.main_goal}`;
    if (!combos[key]) combos[key] = { total: 0, opened: 0 };
    combos[key].total++;
    if (r.hasOpened) combos[key].opened++;
  }
  const sortedCombos = Object.entries(combos).sort((a, b) => {
    const rateA = a[1].opened / a[1].total;
    const rateB = b[1].opened / b[1].total;
    return rateB - rateA;
  });
  console.log('Combination'.padEnd(60) + 'Total'.padStart(7) + 'Opened'.padStart(8) + 'Rate'.padStart(8));
  console.log('─'.repeat(100));
  for (const [combo, stats] of sortedCombos) {
    const rate = ((stats.opened / stats.total) * 100).toFixed(0);
    const bar = stats.opened > 0 ? '🟢' : '🔴';
    console.log(`${bar} ${combo.padEnd(58)} ${String(stats.total).padStart(7)} ${String(stats.opened).padStart(8)} ${rate}%`.padStart(7));
  }

  // ── Individual list: opened vs not ──
  console.log('\n' + '═'.repeat(100));
  console.log('✅ AD-SOURCED SUBSCRIBERS WHO OPENED (your actual engaged cohort)');
  console.log('═'.repeat(100));
  const adOpened = ad.filter(r => r.hasOpened);
  for (const r of adOpened) {
    console.log(`  ${r.email.padEnd(35)} | ${r.seniority.padEnd(20)} | ${r.company_size.padEnd(10)} | ${r.main_goal.padEnd(30)} | ${r.industry}`);
  }

  console.log('\n' + '═'.repeat(100));
  console.log('❌ AD-SOURCED SUBSCRIBERS WHO NEVER OPENED');
  console.log('═'.repeat(100));
  const adDead = ad.filter(r => !r.hasOpened);
  for (const r of adDead) {
    console.log(`  ${r.email.padEnd(35)} | ${r.seniority.padEnd(20)} | ${r.company_size.padEnd(10)} | ${r.main_goal.padEnd(30)} | ${r.industry}`);
  }

  // ── Summary stats ──
  console.log('\n' + '═'.repeat(100));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(100));
  console.log(`Total subscribers analyzed: ${results.length}`);
  console.log(`  Ad-sourced: ${ad.length} (${ad.filter(r=>r.hasOpened).length} opened = ${((ad.filter(r=>r.hasOpened).length/ad.length)*100).toFixed(0)}%)`);
  console.log(`  Organic:    ${organic.length} (${organic.filter(r=>r.hasOpened).length} opened = ${((organic.filter(r=>r.hasOpened).length/organic.length)*100).toFixed(0)}%)`);
}

function printBreakdown(results, field) {
  const groups = {};
  for (const r of results) {
    const val = r[field] || 'Unknown';
    if (!groups[val]) groups[val] = { total: 0, opened: 0, adTotal: 0, adOpened: 0 };
    groups[val].total++;
    if (r.hasOpened) groups[val].opened++;
    if (r.isAd) {
      groups[val].adTotal++;
      if (r.hasOpened) groups[val].adOpened++;
    }
  }
  console.log(
    'Value'.padEnd(35) +
    'Total'.padStart(7) + 'Opened'.padStart(8) + 'Rate'.padStart(7) +
    ' │ ' +
    'Ad'.padStart(5) + 'AdOpen'.padStart(8) + 'AdRate'.padStart(8)
  );
  console.log('─'.repeat(100));
  const sorted = Object.entries(groups).sort((a, b) => (b[1].opened/b[1].total) - (a[1].opened/a[1].total));
  for (const [val, s] of sorted) {
    const rate = ((s.opened / s.total) * 100).toFixed(0);
    const adRate = s.adTotal > 0 ? ((s.adOpened / s.adTotal) * 100).toFixed(0) : 'n/a';
    console.log(
      val.padEnd(35) +
      String(s.total).padStart(7) + String(s.opened).padStart(8) + `${rate}%`.padStart(7) +
      ' │ ' +
      String(s.adTotal).padStart(5) + String(s.adOpened).padStart(8) + `${adRate}%`.padStart(8)
    );
  }
}

main().catch(console.error);
