/**
 * Match the EXACT subscriber list from Beehiiv dashboard.
 * For each: look up ad creative from Supabase, get open rate + CTR from Beehiiv.
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const BEEHIIV_PUB_ID = 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61';
const SUPABASE_URL = 'https://iyaypvpkozntojbasjuh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXlwdnBrb3pudG9qYmFzanVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTE4ODksImV4cCI6MjA4ODc4Nzg4OX0.Vq5DxGvp3Xobpi234_vWoGEAKj95NY_ecPGiQqlcNA4';

// Every subscriber from the Beehiiv dashboard
const ALL_EMAILS = [
  'natew@uvu.edu','txgoerz@outlook.com','mike@mikewanner.com','daveinsports@gmail.com',
  'jimseiler@hotmail.com','dominguezmike@hotmail.com','jimstegman2005@yahoo.com',
  'linnell.lane.ai@gmail.com','loripaulsen13@outlook.com','amber.r.mcalpine@gmail.com',
  'cbrb.dspaulding@gmail.com','syvvchgox@mozmail.com','caj4@comcast.net',
  'revans9409@hotmail.com','bill@lombardglobal.com','hmc@howardmcohen.com',
  'lcondobery@yahoo.com','dells1965@yahoo.com','dmullin6990@gmail.com',
  'alrightbruce123@gmail.com','brianhwill@sbcglobal.net','jonathan.elens@gmail.com',
  'dahlinjh@lemoyne.edu','buffie.webber@gmail.com','ja.eisert@gmail.com',
  'sastoclips1235@gmail.com','klday1@hotmail.com','vampiresforever06@gmail.com',
  'douglas_bellin@yahoo.com','eric.hole@avnet.com','phastpj1@gmail.com',
  'bruceahawk@hotmail.com','amctinos87@gmail.com','mmvwvan@gmail.com',
  'kevinlcarlson@gmail.com','kent@acmecode.io','storm@fwd-mktg.com',
  'ndcolorado@gmail.com','marthalightfoot@hotmail.com','phillip.beane@aveva.com',
  'carl.sampson@gmail.com','dragotony@gmail.com','medoubleday@gmail.com',
  'heather@knowdo.ai','angie@youngbloodltd.com','bryann5431@gmail.com',
  'mrwashington85@gmail.com','hatim.ahmed.0000@gmail.com','windswptfreedom@optonline.net',
  'khastings60@gmail.com','eli@tenfamcap.com','dokterchristina@gmail.com',
  'mark@markferryauctioneers.com','dshildt@gmail.com','wa9yja@gmail.com',
  'daccullen@protonmail.com','aje4aje@gmail.com','gbasilallen@yahoo.com',
  'kenw44orama@gmail.com','eriklaruffa@me.com','carnagegaming707@gmail.com',
  'robert.coan@gmail.com','flaherty@ksu.edu','williamvmitchelljr4@gmail.com',
  'kidseatfree@gmail.com','push7k@gmail.com','jcg3@protonmail.com',
  'nicopanico@gmail.com','sylvesterartwells@gmail.com','suzi_n_hugh@msn.com',
  'john.catlett@gmail.com','roccilhowe1@gmail.com','jack@gmail.com',
  'alex@thoriumvalley.com','team@thoriumvalley.com','alex@cobaltnews.org',
  'alex@thethirdwave.org','phobiamediaagency@gmail.com','simongeezee@gmail.com',
  'andreast@stanford.edu','andreas@tempereau.com','trcd1@icloud.com',
  'kylasiphone@gmail.com','rochequipleure@yahoo.ca','msalk2001@gmail.com',
  'estherabreu27@gmail.com','info@parsonsproperty.co.uk','starpathm31@gmail.com',
  'jnbetita@gmail.com','leighmattan@yahoo.co.uk','kerriganme@yahoo.com',
  'pastor@tbciowa.org','david.yow@iapmo.org','davidayow@gmail.com',
  'sangfroid929@gmail.com','productions@dubemol.com','nw3letters@navigatingweb3.com',
  'joshuaru@usc.edu','adchun@usc.edu','monica.chun743@gmail.com',
  'alexchun9171@gmail.com','brennanwallman@gmail.com','alexchun707@gmail.com',
  'alexchunbusiness@gmail.com',
];

function norm(rate) {
  if (!rate) return 0;
  return rate > 1 ? rate : rate * 100;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`📡 Processing ${ALL_EMAILS.length} subscribers...\n`);

  // 1. Get all Supabase records for UTM matching
  const supRes = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?select=email,utm_content,completed&order=created_at.desc`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const supSubs = await supRes.json();
  const utmMap = {};
  for (const s of supSubs) {
    utmMap[s.email.toLowerCase().trim()] = s.utm_content || null;
  }

  // 2. Get all Beehiiv subscribers with stats
  let bhAll = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions?expand=stats&limit=100&page=${page}`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    if (!res.ok) break;
    const data = await res.json();
    bhAll.push(...(data?.data || []));
    if ((data?.data || []).length < 100) break;
    page++;
  }
  
  // Map by email
  const bhMap = {};
  for (const bh of bhAll) {
    bhMap[bh.email.toLowerCase().trim()] = bh;
  }

  // 3. Build final records
  const records = [];
  for (const email of ALL_EMAILS) {
    const key = email.toLowerCase().trim();
    const bh = bhMap[key];
    const creative = utmMap[key] || null;
    const stats = bh?.stats || {};
    records.push({
      email,
      creative,
      source: creative ? 'AD' : 'organic',
      status: bh?.status || 'unknown',
      openRate: norm(stats.open_rate),
      clickRate: norm(stats.click_rate),
    });
  }

  // 4. Print every subscriber
  console.log('═'.repeat(130));
  console.log(`ALL ${records.length} SUBSCRIBERS — Ad Source, Open Rate, CTR`);
  console.log('═'.repeat(130));
  console.log(
    '#'.padStart(3) + '  ' +
    'Email'.padEnd(40) +
    'Source'.padEnd(35) +
    'Open%'.padStart(7) +
    'CTR'.padStart(7) +
    '  Status'
  );
  console.log('─'.repeat(130));

  let i = 1;
  for (const r of records) {
    const src = r.creative || 'ORGANIC';
    const orStr = r.openRate > 0 ? `${r.openRate.toFixed(0)}%` : '0%';
    const ctrStr = r.clickRate > 0 ? `${r.clickRate.toFixed(0)}%` : '0%';
    const icon = r.openRate > 0 ? '✅' : '❌';
    console.log(
      String(i).padStart(3) + ` ${icon} ` +
      r.email.padEnd(40) +
      src.padEnd(35) +
      orStr.padStart(7) +
      ctrStr.padStart(7) +
      `  ${r.status}`
    );
    i++;
  }

  // 5. Per-creative summary table
  const groups = {};
  for (const r of records) {
    const key = r.creative || 'ORGANIC';
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  console.log('\n' + '═'.repeat(130));
  console.log('PER-AD SUMMARY (all 9 ads + organic)');
  console.log('═'.repeat(130));
  console.log(
    'Source'.padEnd(38) +
    'Subs'.padStart(6) +
    'Opened'.padStart(8) +
    'Open%'.padStart(8) +
    'Clicked'.padStart(9) +
    'CTR'.padStart(8) +
    'AvgOR'.padStart(8) +
    'AvgCTR'.padStart(8)
  );
  console.log('─'.repeat(130));

  // Sort: ads by volume desc, organic last
  const adEntries = Object.entries(groups).filter(([k]) => k !== 'ORGANIC').sort((a,b) => b[1].length - a[1].length);
  const orgEntry = groups['ORGANIC'] ? [['ORGANIC', groups['ORGANIC']]] : [];

  for (const [key, subs] of [...adEntries, ...orgEntry]) {
    const opened = subs.filter(s => s.openRate > 0);
    const clicked = subs.filter(s => s.clickRate > 0);
    const openPct = ((opened.length / subs.length) * 100).toFixed(0);
    const clickPct = ((clicked.length / subs.length) * 100).toFixed(0);
    const avgOR = (subs.reduce((a,s) => a + s.openRate, 0) / subs.length).toFixed(0);
    const avgCTR = (subs.reduce((a,s) => a + s.clickRate, 0) / subs.length).toFixed(0);
    const label = key === 'ORGANIC' ? '── ORGANIC / NON-AD ──' : key;
    console.log(
      label.padEnd(38) +
      String(subs.length).padStart(6) +
      String(opened.length).padStart(8) +
      `${openPct}%`.padStart(8) +
      String(clicked.length).padStart(9) +
      `${clickPct}%`.padStart(8) +
      `${avgOR}%`.padStart(8) +
      `${avgCTR}%`.padStart(8)
    );
  }

  // Totals
  const allAd = records.filter(r => r.creative);
  const allOrg = records.filter(r => !r.creative);
  console.log('─'.repeat(130));
  const adO = allAd.filter(r=>r.openRate>0).length;
  const adC = allAd.filter(r=>r.clickRate>0).length;
  const orgO = allOrg.filter(r=>r.openRate>0).length;
  const orgC = allOrg.filter(r=>r.clickRate>0).length;
  console.log(`ALL ADS COMBINED                        ${String(allAd.length).padStart(6)}${String(adO).padStart(8)}${(((adO/allAd.length)*100).toFixed(0)+'%').padStart(8)}${String(adC).padStart(9)}${(((adC/allAd.length)*100).toFixed(0)+'%').padStart(8)}`);
  console.log(`ALL ORGANIC                             ${String(allOrg.length).padStart(6)}${String(orgO).padStart(8)}${(((orgO/allOrg.length)*100).toFixed(0)+'%').padStart(8)}${String(orgC).padStart(9)}${(((orgC/allOrg.length)*100).toFixed(0)+'%').padStart(8)}`);
  console.log(`GRAND TOTAL                             ${String(records.length).padStart(6)}${String(adO+orgO).padStart(8)}${((((adO+orgO)/records.length)*100).toFixed(0)+'%').padStart(8)}${String(adC+orgC).padStart(9)}${((((adC+orgC)/records.length)*100).toFixed(0)+'%').padStart(8)}`);
}

main().catch(console.error);
