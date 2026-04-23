/**
 * Match Beehiiv subscribers to Supabase UTM data by email.
 * Gets engagement stats from Beehiiv, ad creative attribution from Supabase.
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const BEEHIIV_PUB_ID = 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61';
const SUPABASE_URL = 'https://iyaypvpkozntojbasjuh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXlwdnBrb3pudG9qYmFzanVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTE4ODksImV4cCI6MjA4ODc4Nzg4OX0.Vq5DxGvp3Xobpi234_vWoGEAKj95NY_ecPGiQqlcNA4';

async function getAllBeehiivSubs() {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions?expand=stats&limit=100&page=${page}`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    if (!res.ok) break;
    const data = await res.json();
    const subs = data?.data || [];
    all.push(...subs);
    if (subs.length < 100) break;
    page++;
  }
  return all;
}

async function getAllSupabaseSubs() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?select=email,utm_content,utm_campaign,completed,created_at&order=created_at.desc`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function main() {
  console.log('📡 Fetching from both Beehiiv and Supabase...\n');
  
  const [beehiivSubs, supabaseSubs] = await Promise.all([
    getAllBeehiivSubs(),
    getAllSupabaseSubs(),
  ]);

  console.log(`Beehiiv: ${beehiivSubs.length} subscribers`);
  console.log(`Supabase: ${supabaseSubs.length} subscribers\n`);

  // Build email → utm_content map from Supabase
  const utmMap = {};
  for (const s of supabaseSubs) {
    const email = s.email.toLowerCase().trim();
    if (s.utm_content) {
      utmMap[email] = { creative: s.utm_content, campaign: s.utm_campaign, completed: s.completed };
    }
  }

  // Match Beehiiv subs to Supabase UTM
  const matched = [];
  const unmatched = [];

  for (const bh of beehiivSubs) {
    const email = bh.email.toLowerCase().trim();
    const stats = bh.stats || {};
    const openRate = stats.open_rate ?? 0;
    const clickRate = stats.click_rate ?? 0;
    // Normalize: if > 1 it's already a percentage, otherwise multiply
    const or = openRate > 1 ? openRate : openRate * 100;
    const ctr = clickRate > 1 ? clickRate : clickRate * 100;

    const record = {
      email: bh.email,
      status: bh.status,
      openRate: or,
      clickRate: ctr,
      emailsSent: stats.emails_sent ?? 0,
      emailsOpened: stats.emails_opened ?? 0,
      emailsClicked: stats.emails_clicked ?? 0,
      hasOpened: openRate > 0,
      hasClicked: clickRate > 0,
      created: bh.created,
    };

    if (utmMap[email]) {
      record.creative = utmMap[email].creative;
      record.campaign = utmMap[email].campaign;
      record.completedSurvey = utmMap[email].completed;
      matched.push(record);
    } else {
      record.creative = null;
      unmatched.push(record);
    }
  }

  console.log(`Matched to ad creative: ${matched.length}`);
  console.log(`No ad UTM (organic/other): ${unmatched.length}\n`);

  // ── Per-Creative Table ──
  const creativeGroups = {};
  for (const r of matched) {
    const key = r.creative;
    if (!creativeGroups[key]) creativeGroups[key] = [];
    creativeGroups[key].push(r);
  }

  console.log('═'.repeat(120));
  console.log('📊 PER-AD CREATIVE: ALL SUBSCRIBERS (matched by email, includes survey non-completers)');
  console.log('═'.repeat(120));
  console.log(
    'Ad Creative'.padEnd(38) +
    'Total'.padStart(6) +
    'Active'.padStart(8) +
    'Survey'.padStart(8) +
    'Opened'.padStart(8) +
    'Open%'.padStart(8) +
    'Clicked'.padStart(9) +
    'Click%'.padStart(8) +
    'AvgOR'.padStart(8) +
    'AvgCTR'.padStart(8)
  );
  console.log('─'.repeat(120));

  const sorted = Object.entries(creativeGroups).sort((a, b) => b[1].length - a[1].length);

  for (const [creative, subs] of sorted) {
    const active = subs.filter(s => s.status === 'active');
    const surveyed = subs.filter(s => s.completedSurvey);
    const opened = subs.filter(s => s.hasOpened);
    const clicked = subs.filter(s => s.hasClicked);
    const openPct = subs.length > 0 ? ((opened.length / subs.length) * 100).toFixed(0) : '0';
    const clickPct = subs.length > 0 ? ((clicked.length / subs.length) * 100).toFixed(0) : '0';
    const avgOR = subs.length > 0 ? (subs.reduce((a, s) => a + s.openRate, 0) / subs.length).toFixed(0) : '0';
    const avgCTR = subs.length > 0 ? (subs.reduce((a, s) => a + s.clickRate, 0) / subs.length).toFixed(0) : '0';

    console.log(
      creative.padEnd(38) +
      String(subs.length).padStart(6) +
      String(active.length).padStart(8) +
      String(surveyed.length).padStart(8) +
      String(opened.length).padStart(8) +
      `${openPct}%`.padStart(8) +
      String(clicked.length).padStart(9) +
      `${clickPct}%`.padStart(8) +
      `${avgOR}%`.padStart(8) +
      `${avgCTR}%`.padStart(8)
    );
  }

  // ── Per-creative individual detail ──
  for (const [creative, subs] of sorted) {
    console.log(`\n${'─'.repeat(120)}`);
    console.log(`📋 ${creative} (${subs.length} subs)`);
    console.log('─'.repeat(120));
    const sortedSubs = subs.sort((a, b) => b.openRate - a.openRate);
    for (const s of sortedSubs) {
      const openIcon = s.hasOpened ? '✅' : '❌';
      const surveyIcon = s.completedSurvey ? '📝' : '  ';
      console.log(
        `  ${openIcon}${surveyIcon} ${s.email.padEnd(38)} OR:${String(s.openRate.toFixed(0)+'%').padStart(5)} CTR:${String(s.clickRate.toFixed(0)+'%').padStart(5)} | Sent:${String(s.emailsSent).padStart(3)} Op:${String(s.emailsOpened).padStart(3)} Cl:${String(s.emailsClicked).padStart(3)} | ${s.status}`
      );
    }
  }

  // ── Unmatched (truly organic) ──
  console.log(`\n${'═'.repeat(120)}`);
  console.log(`📋 ORGANIC / NO AD UTM (${unmatched.length} subs)`);
  console.log('═'.repeat(120));
  const orgOpened = unmatched.filter(s => s.hasOpened);
  const orgClicked = unmatched.filter(s => s.hasClicked);
  console.log(`  Opened: ${orgOpened.length}/${unmatched.length} (${((orgOpened.length/unmatched.length)*100).toFixed(0)}%)`);
  console.log(`  Clicked: ${orgClicked.length}/${unmatched.length} (${((orgClicked.length/unmatched.length)*100).toFixed(0)}%)\n`);
  const sortedOrg = unmatched.sort((a, b) => b.openRate - a.openRate);
  for (const s of sortedOrg) {
    const icon = s.hasOpened ? '✅' : '❌';
    console.log(
      `  ${icon} ${s.email.padEnd(38)} OR:${String(s.openRate.toFixed(0)+'%').padStart(5)} CTR:${String(s.clickRate.toFixed(0)+'%').padStart(5)} | Sent:${String(s.emailsSent).padStart(3)} Op:${String(s.emailsOpened).padStart(3)} Cl:${String(s.emailsClicked).padStart(3)} | ${s.status}`
    );
  }

  // ── Final summary ──
  console.log('\n' + '═'.repeat(120));
  console.log('📈 FINAL SUMMARY');
  console.log('═'.repeat(120));
  const allAd = matched;
  const adO = allAd.filter(s => s.hasOpened).length;
  const orgO = unmatched.filter(s => s.hasOpened).length;
  console.log(`Ad total:     ${allAd.length} subs → ${adO} opened (${((adO/allAd.length)*100).toFixed(0)}%)`);
  console.log(`Organic total: ${unmatched.length} subs → ${orgO} opened (${((orgO/unmatched.length)*100).toFixed(0)}%)`);
}

main().catch(console.error);
