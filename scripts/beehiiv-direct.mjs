/**
 * Query Beehiiv directly for ALL subscribers, get their UTM data and stats.
 * This catches people who subscribed via ads but never entered Supabase.
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const BEEHIIV_PUB_ID = 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61';

async function listAllSubscribers() {
  let allSubs = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions?expand=stats,custom_fields&limit=100&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` },
    });
    
    if (!res.ok) {
      console.error(`Beehiiv list error: ${res.status}`);
      break;
    }
    
    const data = await res.json();
    const subs = data?.data || [];
    allSubs.push(...subs);
    
    console.log(`  Page ${page}: ${subs.length} subscribers (total so far: ${allSubs.length})`);
    
    // Check pagination
    if (subs.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }
  
  return allSubs;
}

async function main() {
  console.log('📡 Fetching ALL subscribers from Beehiiv API...\n');
  const allSubs = await listAllSubscribers();
  console.log(`\n   Total Beehiiv subscribers: ${allSubs.length}\n`);

  // Separate ad-sourced vs organic based on UTM
  const adSubs = [];
  const organicSubs = [];

  for (const sub of allSubs) {
    const utm = sub.utm_source || '';
    const utmContent = sub.utm_content || '';
    const utmCampaign = sub.utm_campaign || '';
    const utmMedium = sub.utm_medium || '';
    
    // Ad subscribers have utm from Meta (fb, ig, facebook, etc.) or have utm_content matching our ad names
    const isAd = utmMedium === 'paid' || 
                 utmMedium === 'cpc' || 
                 utm === 'fb' || 
                 utm === 'ig' || 
                 utm === 'facebook' || 
                 utm === 'meta' ||
                 utmCampaign.includes('Thorium Valley Newsletter') ||
                 utmContent.includes('Phone') || 
                 utmContent.includes('Expert') ||
                 utmContent.includes('Eating') ||
                 utmContent.includes('Paper') ||
                 utmContent.includes('Window') ||
                 utmContent.includes('Variant');

    const stats = sub.stats || {};
    const openRate = stats.open_rate ?? 0;
    const clickRate = stats.click_rate ?? 0;
    const emailsSent = stats.emails_sent ?? 0;
    const emailsOpened = stats.emails_opened ?? 0;
    const emailsClicked = stats.emails_clicked ?? 0;

    const record = {
      id: sub.id,
      email: sub.email,
      status: sub.status,
      utm_source: utm,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      openRate: openRate > 1 ? openRate : openRate * 100,
      clickRate: clickRate > 1 ? clickRate : clickRate * 100,
      emailsSent,
      emailsOpened,
      emailsClicked,
      created: sub.created,
      hasOpened: openRate > 0,
    };

    if (isAd) {
      adSubs.push(record);
    } else {
      organicSubs.push(record);
    }
  }

  console.log(`Ad-sourced: ${adSubs.length}`);
  console.log(`Organic: ${organicSubs.length}\n`);

  // Show all UTM combos first so we understand the data
  console.log('═'.repeat(110));
  console.log('🔍 ALL UNIQUE UTM COMBINATIONS');
  console.log('═'.repeat(110));
  const utmCombos = {};
  for (const sub of allSubs) {
    const key = `src:${sub.utm_source||'—'} | med:${sub.utm_medium||'—'} | camp:${sub.utm_campaign||'—'} | cont:${sub.utm_content||'—'}`;
    utmCombos[key] = (utmCombos[key] || 0) + 1;
  }
  const sortedUtm = Object.entries(utmCombos).sort((a, b) => b[1] - a[1]);
  for (const [combo, count] of sortedUtm) {
    console.log(`  [${count}] ${combo}`);
  }

  // Group ad subscribers by utm_content (= ad creative name)
  console.log('\n' + '═'.repeat(110));
  console.log('📊 PER-AD CREATIVE: ALL BEEHIIV SUBSCRIBERS (not just survey completers)');
  console.log('═'.repeat(110));

  const creativeGroups = {};
  for (const sub of adSubs) {
    const key = sub.utm_content || 'unknown';
    if (!creativeGroups[key]) creativeGroups[key] = [];
    creativeGroups[key].push(sub);
  }

  console.log(
    'Ad Creative'.padEnd(38) +
    'Total'.padStart(6) +
    'Active'.padStart(8) +
    'Opened'.padStart(8) +
    'Open%'.padStart(8) +
    'Clicked'.padStart(9) +
    'Click%'.padStart(8) +
    'AvgOR'.padStart(8) +
    'AvgCTR'.padStart(8)
  );
  console.log('─'.repeat(110));

  const sortedCreatives = Object.entries(creativeGroups).sort((a, b) => b[1].length - a[1].length);

  for (const [creative, subs] of sortedCreatives) {
    const active = subs.filter(s => s.status === 'active');
    const opened = subs.filter(s => s.hasOpened);
    const clicked = subs.filter(s => s.clickRate > 0);
    const openPct = subs.length > 0 ? ((opened.length / subs.length) * 100).toFixed(0) : '0';
    const clickPct = subs.length > 0 ? ((clicked.length / subs.length) * 100).toFixed(0) : '0';
    const avgOR = subs.length > 0 ? (subs.reduce((a, s) => a + s.openRate, 0) / subs.length).toFixed(0) : '0';
    const avgCTR = subs.length > 0 ? (subs.reduce((a, s) => a + s.clickRate, 0) / subs.length).toFixed(0) : '0';

    console.log(
      creative.padEnd(38) +
      String(subs.length).padStart(6) +
      String(active.length).padStart(8) +
      String(opened.length).padStart(8) +
      `${openPct}%`.padStart(8) +
      String(clicked.length).padStart(9) +
      `${clickPct}%`.padStart(8) +
      `${avgOR}%`.padStart(8) +
      `${avgCTR}%`.padStart(8)
    );
  }

  // Individual subscriber detail per creative
  for (const [creative, subs] of sortedCreatives) {
    console.log(`\n${'─'.repeat(110)}`);
    console.log(`📋 ${creative} (${subs.length} total subs)`);
    console.log('─'.repeat(110));
    
    const sorted = subs.sort((a, b) => b.openRate - a.openRate);
    for (const s of sorted) {
      const icon = s.hasOpened ? '✅' : '❌';
      const statusIcon = s.status === 'active' ? '' : ` [${s.status}]`;
      console.log(
        `  ${icon} ${s.email.padEnd(38)} OR:${String(s.openRate.toFixed(0)+'%').padStart(5)} CTR:${String(s.clickRate.toFixed(0)+'%').padStart(5)} | Sent:${String(s.emailsSent).padStart(3)} Opened:${String(s.emailsOpened).padStart(3)} Clicked:${String(s.emailsClicked).padStart(3)}${statusIcon}`
      );
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(110));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(110));
  const adOpened = adSubs.filter(s => s.hasOpened).length;
  const orgOpened = organicSubs.filter(s => s.hasOpened).length;
  console.log(`Ad-sourced:  ${adSubs.length} total, ${adOpened} opened (${((adOpened/adSubs.length)*100).toFixed(0)}%)`);
  console.log(`Organic:     ${organicSubs.length} total, ${orgOpened} opened (${organicSubs.length > 0 ? ((orgOpened/organicSubs.length)*100).toFixed(0) : 0}%)`);
}

main().catch(console.error);
