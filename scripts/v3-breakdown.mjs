/**
 * Full breakdown of all 41 Consolidated v3 subscribers.
 * Grouped by ad, with TV + Catalyst + Lab open rate & CTR.
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const PUBS = {
  tv:  'pub_6c3bff32-b1eb-4069-919e-953a45d61d61',
  cat: 'pub_fa376b28-d99e-4ef0-8788-26e9db50b70f',
  lab: 'pub_c248791e-d935-4c60-bbf5-efde481bbd69',
};
const SUPABASE_URL = 'https://iyaypvpkozntojbasjuh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXlwdnBrb3pudG9qYmFzanVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTE4ODksImV4cCI6MjA4ODc4Nzg4OX0.Vq5DxGvp3Xobpi234_vWoGEAKj95NY_ecPGiQqlcNA4';

function norm(r) { if (!r) return 0; return r > 1 ? r : r * 100; }

async function fetchAllBhSubs(pubId) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions?expand=stats&limit=100&page=${page}`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    if (!res.ok) break;
    const d = await res.json();
    all.push(...(d?.data || []));
    if ((d?.data || []).length < 100) break;
    page++;
  }
  return all;
}

async function main() {
  console.log('📡 Fetching all data...\n');

  // Get Supabase subs with "- Copy" UTM (Consolidated v3)
  const supRes = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?utm_content=like.*- Copy*&select=email,utm_content,seniority,company_size,main_goal,industry&order=utm_content,created_at.desc`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const v3Subs = await supRes.json();
  console.log(`Consolidated v3 subs from Supabase: ${v3Subs.length}`);

  // Get all Beehiiv subs for all 3 pubs
  const [tvAll, catAll, labAll] = await Promise.all([
    fetchAllBhSubs(PUBS.tv),
    fetchAllBhSubs(PUBS.cat),
    fetchAllBhSubs(PUBS.lab),
  ]);
  console.log(`Beehiiv TV: ${tvAll.length}, Cat: ${catAll.length}, Lab: ${labAll.length}`);

  // Build email maps for each pub
  function buildMap(bhSubs) {
    const m = {};
    for (const s of bhSubs) {
      m[s.email.toLowerCase().trim()] = {
        status: s.status,
        openRate: norm(s.stats?.open_rate),
        clickRate: norm(s.stats?.click_rate),
      };
    }
    return m;
  }
  const tvMap = buildMap(tvAll);
  const catMap = buildMap(catAll);
  const labMap = buildMap(labAll);

  // Group by creative
  const groups = {};
  for (const s of v3Subs) {
    if (!groups[s.utm_content]) groups[s.utm_content] = [];
    const email = s.email.toLowerCase().trim();
    const tv = tvMap[email] || null;
    const cat = catMap[email] || null;
    const lab = labMap[email] || null;
    groups[s.utm_content].push({
      email: s.email,
      seniority: s.seniority,
      company_size: s.company_size,
      main_goal: s.main_goal,
      industry: s.industry,
      tv, cat, lab,
    });
  }

  // Print each group
  const ADS = [
    'AI Eating Window - Copy',
    'Three Phones Expert - Copy',
    'Morning Paper Guy - Copy',
    'Window Guy Variant - Copy',
    'Three Phones Variant - Copy',
    'AI Expert Red Phone B - Copy',
    'Phone Screenshot Dark B - Copy',
    'Phone Screenshot Dark A - Copy',
    'AI Expert Red Phone A - Copy',
  ];

  let totalSubs = 0;
  for (const ad of ADS) {
    const subs = groups[ad] || [];
    totalSubs += subs.length;
    console.log(`\n${'═'.repeat(140)}`);
    console.log(`📋 ${ad}  (${subs.length} subscribers)`);
    console.log('═'.repeat(140));

    if (subs.length === 0) {
      console.log('  No subscribers yet.');
      continue;
    }

    console.log(
      '  ' + 'Email'.padEnd(36) +
      '│ TV Open'.padEnd(10) + 'TV CTR'.padStart(7) +
      ' │ Cat?'.padEnd(7) + 'Cat Open'.padEnd(9) + 'Cat CTR'.padStart(8) +
      ' │ Lab?'.padEnd(7) + 'Lab Open'.padEnd(9) + 'Lab CTR'.padStart(8) +
      ' │ Profile'
    );
    console.log('  ' + '─'.repeat(136));

    const sorted = subs.sort((a, b) => (b.tv?.openRate || 0) - (a.tv?.openRate || 0));
    
    let adTvOpened = 0, adTvClicked = 0;
    let adCatSubs = 0, adCatOpened = 0, adCatClicked = 0;
    let adLabSubs = 0, adLabOpened = 0, adLabClicked = 0;

    for (const s of sorted) {
      const tvOR = s.tv ? `${s.tv.openRate.toFixed(0)}%` : '—';
      const tvCTR = s.tv ? `${s.tv.clickRate.toFixed(0)}%` : '—';
      const tvIcon = (s.tv?.openRate || 0) > 0 ? '✅' : '❌';

      const catOn = s.cat ? 'YES' : 'no';
      const catOR = s.cat ? `${s.cat.openRate.toFixed(0)}%` : '—';
      const catCTR = s.cat ? `${s.cat.clickRate.toFixed(0)}%` : '—';

      const labOn = s.lab ? 'YES' : 'no';
      const labOR = s.lab ? `${s.lab.openRate.toFixed(0)}%` : '—';
      const labCTR = s.lab ? `${s.lab.clickRate.toFixed(0)}%` : '—';

      const profile = `${s.seniority || '?'}, ${s.company_size || '?'}, "${s.main_goal || '?'}"`;

      console.log(
        `  ${tvIcon} ${s.email.padEnd(34)}` +
        `│ ${tvOR.padStart(6)}  ${tvCTR.padStart(6)}` +
        ` │ ${catOn.padEnd(4)} ${catOR.padStart(6)}  ${catCTR.padStart(6)}` +
        ` │ ${labOn.padEnd(4)} ${labOR.padStart(6)}  ${labCTR.padStart(6)}` +
        ` │ ${profile}`
      );

      if (s.tv?.openRate > 0) adTvOpened++;
      if (s.tv?.clickRate > 0) adTvClicked++;
      if (s.cat) { adCatSubs++; if (s.cat.openRate > 0) adCatOpened++; if (s.cat.clickRate > 0) adCatClicked++; }
      if (s.lab) { adLabSubs++; if (s.lab.openRate > 0) adLabOpened++; if (s.lab.clickRate > 0) adLabClicked++; }
    }

    console.log('  ' + '─'.repeat(136));
    console.log(
      `  TOTALS: TV ${adTvOpened}/${subs.length} opened (${((adTvOpened/subs.length)*100).toFixed(0)}%), ${adTvClicked} clicked` +
      ` │ Catalyst ${adCatSubs} subbed, ${adCatOpened} opened, ${adCatClicked} clicked` +
      ` │ Lab ${adLabSubs} subbed, ${adLabOpened} opened, ${adLabClicked} clicked`
    );
  }

  console.log(`\n${'═'.repeat(140)}`);
  console.log(`GRAND TOTAL: ${totalSubs} subscribers across all 9 active ads`);
  console.log('═'.repeat(140));
}

main().catch(console.error);
