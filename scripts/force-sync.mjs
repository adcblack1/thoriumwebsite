/**
 * Force-sync: Pull Beehiiv engagement stats for ALL subscribers
 * and output per-creative open rate / CTR analysis.
 * 
 * Run: node scripts/force-sync.mjs
 */

const BEEHIIV_API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const BEEHIIV_PUB_ID = 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61';
const SUPABASE_URL = 'https://iyaypvpkozntojbasjuh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXlwdnBrb3pudG9qYmFzanVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTE4ODksImV4cCI6MjA4ODc4Nzg4OX0.Vq5DxGvp3Xobpi234_vWoGEAKj95NY_ecPGiQqlcNA4';

async function getSubscribers() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?completed=eq.true&beehiiv_subscriber_id=not.is.null&select=id,email,utm_content,utm_campaign,beehiiv_subscriber_id,seniority,company_size,main_goal,created_at&order=created_at.desc`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );
  return res.json();
}

async function getBeehiivStats(subscriptionId) {
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions/${subscriptionId}?expand=stats`,
    {
      headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` },
    }
  );
  if (!res.ok) {
    console.error(`  ❌ Beehiiv error for ${subscriptionId}: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data?.data || null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('📡 Fetching subscribers from Supabase...');
  const subscribers = await getSubscribers();
  console.log(`   Found ${subscribers.length} completed subscribers with Beehiiv IDs\n`);

  const creativeStats = {};
  const allResults = [];

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    const creative = sub.utm_content || 'organic';
    
    process.stdout.write(`[${i+1}/${subscribers.length}] ${sub.email.substring(0,25).padEnd(25)} (${creative})... `);
    
    await sleep(200); // Rate limit
    const beehiiv = await getBeehiivStats(sub.beehiiv_subscriber_id);
    
    if (!beehiiv?.stats) {
      console.log('⚠️  no stats');
      continue;
    }

    const openRate = (beehiiv.stats.open_rate ?? 0) * 100;
    const ctr = (beehiiv.stats.click_rate ?? 0) * 100;
    const emailsSent = beehiiv.stats.emails_sent ?? 0;
    const emailsOpened = beehiiv.stats.emails_opened ?? 0;
    const emailsClicked = beehiiv.stats.emails_clicked ?? 0;

    console.log(`OR: ${openRate.toFixed(1)}% | CTR: ${ctr.toFixed(1)}% | Sent: ${emailsSent} | Opened: ${emailsOpened} | Clicked: ${emailsClicked}`);

    allResults.push({
      email: sub.email,
      creative,
      seniority: sub.seniority,
      company_size: sub.company_size,
      main_goal: sub.main_goal,
      openRate,
      ctr,
      emailsSent,
      emailsOpened,
      emailsClicked,
      daysOld: Math.floor((Date.now() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    });

    if (!creativeStats[creative]) {
      creativeStats[creative] = { openRates: [], ctrs: [], count: 0, emailsSent: [], qualified: 0 };
    }
    creativeStats[creative].openRates.push(openRate);
    creativeStats[creative].ctrs.push(ctr);
    creativeStats[creative].emailsSent.push(emailsSent);
    creativeStats[creative].count++;
    if (sub.seniority !== 'Student' && sub.company_size !== 'Just me') {
      creativeStats[creative].qualified++;
    }
  }

  // ── Summary ──
  console.log('\n' + '═'.repeat(120));
  console.log('📊 PER-CREATIVE PERFORMANCE');
  console.log('═'.repeat(120));
  console.log(
    'Creative'.padEnd(35) +
    'Subs'.padStart(6) +
    'Qual'.padStart(6) +
    'Qual%'.padStart(7) +
    'Avg OR%'.padStart(9) +
    'Avg CTR%'.padStart(10) +
    'Avg Sent'.padStart(10) +
    'Quality'.padStart(9)
  );
  console.log('─'.repeat(120));

  const sorted = Object.entries(creativeStats).sort((a, b) => {
    const scoreA = avg(a[1].openRates) * 0.6 + avg(a[1].ctrs) * 0.4;
    const scoreB = avg(b[1].openRates) * 0.6 + avg(b[1].ctrs) * 0.4;
    return scoreB - scoreA;
  });

  for (const [creative, stats] of sorted) {
    const avgOR = avg(stats.openRates);
    const avgCTR = avg(stats.ctrs);
    const avgSent = avg(stats.emailsSent);
    const quality = avgOR * 0.6 + avgCTR * 0.4;
    const qualRate = stats.count > 0 ? (stats.qualified / stats.count * 100) : 0;
    
    console.log(
      creative.padEnd(35) +
      String(stats.count).padStart(6) +
      String(stats.qualified).padStart(6) +
      `${qualRate.toFixed(0)}%`.padStart(7) +
      `${avgOR.toFixed(1)}%`.padStart(9) +
      `${avgCTR.toFixed(1)}%`.padStart(10) +
      `${avgSent.toFixed(1)}`.padStart(10) +
      `${quality.toFixed(1)}`.padStart(9)
    );
  }

  // ── Top individual subscribers ──
  console.log('\n' + '═'.repeat(120));
  console.log('🏆 TOP ENGAGED SUBSCRIBERS (by open rate, 2+ emails sent)');
  console.log('═'.repeat(120));

  const engaged = allResults
    .filter(r => r.emailsSent >= 2)
    .sort((a, b) => b.openRate - a.openRate)
    .slice(0, 15);

  for (const r of engaged) {
    console.log(
      `  ${r.email.substring(0, 30).padEnd(30)} | ${r.creative.padEnd(30)} | OR: ${r.openRate.toFixed(0)}% | CTR: ${r.ctr.toFixed(0)}% | Sent: ${r.emailsSent} | ${r.seniority} @ ${r.company_size} | "${r.main_goal}" | ${r.daysOld}d old`
    );
  }

  // ── Zero engagement ──
  console.log('\n' + '═'.repeat(120));
  console.log('💀 ZERO ENGAGEMENT (0% open rate, 2+ emails sent)');
  console.log('═'.repeat(120));

  const dead = allResults
    .filter(r => r.emailsSent >= 2 && r.openRate === 0)
    .sort((a, b) => b.emailsSent - a.emailsSent);

  for (const r of dead) {
    console.log(
      `  ${r.email.substring(0, 30).padEnd(30)} | ${r.creative.padEnd(30)} | Sent: ${r.emailsSent} | ${r.seniority} @ ${r.company_size} | "${r.main_goal}" | ${r.daysOld}d old`
    );
  }

  console.log(`\n📈 Total: ${allResults.length} subscribers analyzed`);
  console.log(`   Engaged (>0% OR): ${allResults.filter(r => r.openRate > 0).length}`);
  console.log(`   Dead (0% OR, 2+ sent): ${dead.length}`);
  console.log(`   Too new (<2 emails): ${allResults.filter(r => r.emailsSent < 2).length}`);
}

function avg(arr) { return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

main().catch(console.error);
