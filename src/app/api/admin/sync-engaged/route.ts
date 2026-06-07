import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUBLICATION_ID!;
const META_PIXEL_ID = '773797471916037';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// SHA256 hash for Meta Conversions API
function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Get subscriber stats from Beehiiv
async function getBeehiivSubscription(subscriptionId: string) {
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions/${subscriptionId}?expand=stats,custom_fields`,
    {
      headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data || null;
}

// Send EngagedSubscriber event to Meta Conversions API
async function sendToMetaConversionsAPI(
  emailHash: string,
  openRate: number,
  ctr: number,
  utmContent: string | null
) {
  if (!META_ACCESS_TOKEN) {
    console.log('[Sync] META_ACCESS_TOKEN not set, skipping Conversions API');
    return false;
  }

  const eventData = {
    data: [
      {
        event_name: 'EngagedSubscriber',
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: [emailHash],
        },
        custom_data: {
          open_rate: openRate,
          click_through_rate: ctr,
          ...(utmContent && { creative: utmContent }),
        },
        action_source: 'system_generated',
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }
    );
    const result = await res.json();
    return result?.events_received === 1;
  } catch (err) {
    console.error('[Sync] Meta CAPI error:', err);
    return false;
  }
}

/**
 * GET /api/admin/sync-engaged
 * 
 * Called hourly by Vercel Cron. Does:
 * 1. Finds completed subscribers with beehiiv IDs not yet processed
 * 2. Checks their engagement in Beehiiv
 * 3. For engaged ones (open rate > 40% AND 7+ days old), sends EngagedSubscriber to Meta
 * 4. Groups by utm_content and saves/updates creative performance stats
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get already-processed subscriber IDs to skip them
    const { data: alreadyProcessed } = await supabase()
      .from('engaged_subscriber_events')
      .select('subscriber_id');
    
    const processedIds = new Set((alreadyProcessed || []).map(e => e.subscriber_id));

    // 2. Get all completed subscribers with beehiiv IDs (signed up 7+ days ago)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: subscribers, error } = await supabase()
      .from('subscribers')
      .select('id, email, beehiiv_subscriber_id, utm_campaign, utm_content, created_at')
      .eq('completed', true)
      .not('beehiiv_subscriber_id', 'is', null)
      .lte('created_at', sevenDaysAgo);

    if (error) {
      console.error('[Sync] Supabase query error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Filter out already-processed subscribers
    const newSubscribers = (subscribers || []).filter(s => !processedIds.has(s.id));

    if (newSubscribers.length === 0) {
      return NextResponse.json({ message: 'No new subscribers to process', processed: 0 });
    }

    console.log(`[Sync] Processing ${newSubscribers.length} new subscribers`);

    // 3. Check each subscriber's engagement in Beehiiv
    const creativeStats: Record<string, { 
      openRates: number[]; 
      ctrs: number[]; 
      count: number;
      campaign: string | null;
    }> = {};

    let engagedCount = 0;
    let sentToMeta = 0;

    for (const sub of newSubscribers) {
      if (!sub.beehiiv_subscriber_id) continue;

      // Rate limit: Beehiiv API allows ~10 req/sec
      await new Promise(resolve => setTimeout(resolve, 150));

      const beehiivData = await getBeehiivSubscription(sub.beehiiv_subscriber_id);
      if (!beehiivData?.stats) continue;

      const openRate = beehiivData.stats.open_rate ?? 0;
      const ctr = beehiivData.stats.click_rate ?? 0;
      const creative = sub.utm_content || 'organic';

      // Track stats by creative
      if (!creativeStats[creative]) {
        creativeStats[creative] = { openRates: [], ctrs: [], count: 0, campaign: sub.utm_campaign };
      }
      creativeStats[creative].openRates.push(openRate * 100);
      creativeStats[creative].ctrs.push(ctr * 100);
      creativeStats[creative].count++;

      // 4. If engaged (>40% open rate), send to Meta
      const emailHash = sha256(sub.email);
      const isEngaged = openRate > 0.4;
      let sent = false;

      if (isEngaged) {
        engagedCount++;
        sent = await sendToMetaConversionsAPI(emailHash, openRate * 100, ctr * 100, sub.utm_content);
        if (sent) sentToMeta++;
      }

      // Log ALL processed subscribers (engaged or not) so we don't re-process
      await supabase()
        .from('engaged_subscriber_events')
        .insert({
          subscriber_id: sub.id,
          beehiiv_subscriber_id: sub.beehiiv_subscriber_id,
          email_hash: emailHash,
          open_rate: openRate * 100,
          ctr: ctr * 100,
          utm_content: sub.utm_content,
          sent_to_meta: sent,
        });
    }

    // 5. Update creative performance stats (delete today's rows first, then re-insert fresh)
    const today = new Date().toISOString().split('T')[0];
    
    for (const [creative, stats] of Object.entries(creativeStats)) {
      const avgOpenRate = stats.openRates.reduce((a, b) => a + b, 0) / stats.openRates.length;
      const avgCtr = stats.ctrs.reduce((a, b) => a + b, 0) / stats.ctrs.length;
      const qualityScore = avgOpenRate * 0.6 + avgCtr * 0.4;

      // Delete existing row for today+creative, then insert fresh
      await supabase()
        .from('creative_performance')
        .delete()
        .eq('date', today)
        .eq('utm_content', creative);

      await supabase()
        .from('creative_performance')
        .insert({
          date: today,
          utm_campaign: stats.campaign,
          utm_content: creative,
          subscribers_count: stats.count,
          avg_open_rate: Math.round(avgOpenRate * 100) / 100,
          avg_ctr: Math.round(avgCtr * 100) / 100,
          quality_score: Math.round(qualityScore * 100) / 100,
          raw_data: stats,
        });
    }

    return NextResponse.json({
      success: true,
      processed: newSubscribers.length,
      engaged: engagedCount,
      sent_to_meta: sentToMeta,
      creatives_tracked: Object.keys(creativeStats).length,
    });
  } catch (err) {
    console.error('[Sync] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

