/**
 * Full analysis across ALL 3 newsletters (TV, Catalyst, Lab).
 * Matches every Beehiiv subscriber to ad creative from Supabase.
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const PUBS = {
  'Thorium Valley': 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61',
  'Catalyst': 'pub_fa376b28-d99e-4ef0-8788-26e9db50b70f',
  'The Lab': 'pub_c248791e-d935-4c60-bbf5-efde481bbd69',
};
const SUPABASE_URL = 'https://iyaypvpkozntojbasjuh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXlwdnBrb3pudG9qYmFzanVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTE4ODksImV4cCI6MjA4ODc4Nzg4OX0.Vq5DxGvp3Xobpi234_vWoGEAKj95NY_ecPGiQqlcNA4';

async function getAllBeehiivSubs(pubId, pubName) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions?expand=stats&limit=100&page=${page}`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    if (!res.ok) { console.error(`  Beehiiv error for ${pubName}: ${res.status}`); break; }
    const data = await res.json();
    const subs = data?.data || [];
    all.push(...subs);
    if (subs.length < 100) break;
    page++;
  }
  console.log(`  ${pubName}: ${all.length} subscribers`);
  return all;
}

async function getAllSupabaseSubs() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?select=email,utm_content,utm_campaign,completed,seniority,company_size,main_goal,job_function,industry,child_newsletters,created_at&order=created_at.desc`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

function norm(rate) {
  if (rate === null || rate === undefined) return 0;
  return rate > 1 ? rate : rate * 100;
}

function printCreativeTable(newsletter, subs) {
  // Group by creative
  const groups = {};
  for (const s of subs) {
    const key = s.creative || '(no ad — organic/direct)';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }

  const adGroups = Object.entries(groups).filter(([k]) => k !== '(no ad — organic/direct)');
  const orgGroup = groups['(no ad — organic/direct)'] || [];

  console.log(`\n${'═'.repeat(130)}`);
  console.log(`📊 ${newsletter.toUpperCase()} — PER-AD CREATIVE BREAKDOWN`);
  console.log(`   Total: ${subs.length} subs | Ad-sourced: ${subs.length - orgGroup.length} | Non-ad: ${orgGroup.length}`);
  console.log('═'.repeat(130));
  console.log(
    'Ad Creative'.padEnd(38) +
    'Subs'.padStart(6) +
    'Active'.padStart(8) +
    'Opened'.padStart(8) +
    'Open%'.padStart(8) +
    'Clicked'.padStart(9) +
    'Click%'.padStart(8) +
    'AvgOR'.padStart(8) +
    'AvgCTR'.padStart(8) +
    '  Signal'
  );
  console.log('─'.repeat(130));

  // Sort by volume desc
  const sorted = adGroups.sort((a, b) => b[1].length - a[1].length);

  for (const [creative, csubs] of sorted) {
    printRow(creative, csubs);
  }
  // Print organic row
  if (orgGroup.length > 0) {
    console.log('─'.repeat(130));
    printRow('(no ad — organic/direct)', orgGroup);
  }

  // Individual detail for each ad creative
  for (const [creative, csubs] of sorted) {
    console.log(`\n  ┌── ${creative} (${csubs.length} subs)`);
    const sortedSubs = csubs.sort((a, b) => b.openRate - a.openRate);
    for (const s of sortedSubs) {
      const oIcon = s.openRate > 0 ? '✅' : '❌';
      const profile = s.seniority ? `${s.seniority}, ${s.company_size}, "${s.main_goal}"` : '';
      console.log(
        `  │ ${oIcon} ${s.email.padEnd(38)} OR:${String(s.openRate.toFixed(0)+'%').padStart(5)} CTR:${String(s.clickRate.toFixed(0)+'%').padStart(5)} | ${profile}`
      );
    }
    console.log('  └──');
  }
}

function printRow(creative, csubs) {
  const active = csubs.filter(s => s.status === 'active');
  const opened = csubs.filter(s => s.openRate > 0);
  const clicked = csubs.filter(s => s.clickRate > 0);
  const openPct = csubs.length > 0 ? ((opened.length / csubs.length) * 100).toFixed(0) : '0';
  const clickPct = csubs.length > 0 ? ((clicked.length / csubs.length) * 100).toFixed(0) : '0';
  const avgOR = csubs.length > 0 ? (csubs.reduce((a, s) => a + s.openRate, 0) / csubs.length).toFixed(0) : '0';
  const avgCTR = csubs.length > 0 ? (csubs.reduce((a, s) => a + s.clickRate, 0) / csubs.length).toFixed(0) : '0';
  let signal = '🔴';
  if (parseInt(openPct) >= 50) signal = '🟢';
  else if (parseInt(openPct) >= 30) signal = '🟡';
  console.log(
    creative.padEnd(38) +
    String(csubs.length).padStart(6) +
    String(active.length).padStart(8) +
    String(opened.length).padStart(8) +
    `${openPct}%`.padStart(8) +
    String(clicked.length).padStart(9) +
    `${clickPct}%`.padStart(8) +
    `${avgOR}%`.padStart(8) +
    `${avgCTR}%`.padStart(8) +
    `  ${signal}`
  );
}

async function main() {
  console.log('📡 Fetching from Beehiiv (all 3 pubs) + Supabase...\n');

  // Fetch all in parallel
  const [tvSubs, catSubs, labSubs, supabaseSubs] = await Promise.all([
    getAllBeehiivSubs(PUBS['Thorium Valley'], 'Thorium Valley'),
    getAllBeehiivSubs(PUBS['Catalyst'], 'Catalyst'),
    getAllBeehiivSubs(PUBS['The Lab'], 'The Lab'),
    getAllSupabaseSubs(),
  ]);

  console.log(`  Supabase: ${supabaseSubs.length} subscriber records`);

  // Build email → ad creative map from Supabase
  const utmMap = {};
  for (const s of supabaseSubs) {
    const email = s.email.toLowerCase().trim();
    utmMap[email] = {
      creative: s.utm_content || null,
      campaign: s.utm_campaign || null,
      completed: s.completed,
      seniority: s.seniority,
      company_size: s.company_size,
      main_goal: s.main_goal,
      job_function: s.job_function,
      industry: s.industry,
    };
  }

  // Process each newsletter
  function processPub(bhSubs) {
    return bhSubs.map(bh => {
      const email = bh.email.toLowerCase().trim();
      const stats = bh.stats || {};
      const sup = utmMap[email] || {};
      return {
        email: bh.email,
        status: bh.status,
        openRate: norm(stats.open_rate),
        clickRate: norm(stats.click_rate),
        emailsSent: stats.emails_sent ?? 0,
        emailsOpened: stats.emails_opened ?? 0,
        emailsClicked: stats.emails_clicked ?? 0,
        creative: sup.creative || null,
        seniority: sup.seniority || null,
        company_size: sup.company_size || null,
        main_goal: sup.main_goal || null,
        job_function: sup.job_function || null,
        industry: sup.industry || null,
      };
    });
  }

  const tvProcessed = processPub(tvSubs);
  const catProcessed = processPub(catSubs);
  const labProcessed = processPub(labSubs);

  printCreativeTable('Thorium Valley (Main Newsletter)', tvProcessed);
  printCreativeTable('The Catalyst', catProcessed);
  printCreativeTable('The Lab', labProcessed);

  // Final cross-newsletter summary
  console.log(`\n${'═'.repeat(130)}`);
  console.log('📈 CROSS-NEWSLETTER SUMMARY');
  console.log('═'.repeat(130));
  for (const [name, processed] of [['Thorium Valley', tvProcessed], ['Catalyst', catProcessed], ['The Lab', labProcessed]]) {
    const adSubs = processed.filter(s => s.creative);
    const orgSubs = processed.filter(s => !s.creative);
    const adOpened = adSubs.filter(s => s.openRate > 0).length;
    const orgOpened = orgSubs.filter(s => s.openRate > 0).length;
    const adClicked = adSubs.filter(s => s.clickRate > 0).length;
    const orgClicked = orgSubs.filter(s => s.clickRate > 0).length;
    console.log(`\n  ${name}:`);
    console.log(`    Total: ${processed.length} | Active: ${processed.filter(s=>s.status==='active').length}`);
    console.log(`    Ad-sourced:  ${adSubs.length} subs → ${adOpened} opened (${adSubs.length>0?((adOpened/adSubs.length)*100).toFixed(0):0}%) → ${adClicked} clicked (${adSubs.length>0?((adClicked/adSubs.length)*100).toFixed(0):0}%)`);
    console.log(`    Non-ad:      ${orgSubs.length} subs → ${orgOpened} opened (${orgSubs.length>0?((orgOpened/orgSubs.length)*100).toFixed(0):0}%) → ${orgClicked} clicked (${orgSubs.length>0?((orgClicked/orgSubs.length)*100).toFixed(0):0}%)`);
  }
}

main().catch(console.error);
