import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

/**
 * GET /api/admin/creative-stats
 * Returns per-creative subscriber quality data for the admin dashboard.
 */
export async function GET() {
  try {
    // 1. Creative performance (from cron job data)
    const { data: creativePerf } = await supabase()
      .from('creative_performance')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    // 2. Subscriber breakdown by creative (from subscribers table)
    const { data: subscribers } = await supabase()
      .from('subscribers')
      .select('utm_content, utm_campaign, created_at, seniority, company_size')
      .eq('completed', true)
      .not('utm_content', 'is', null);

    // Group subscribers by creative
    const creativeBreakdown: Record<string, {
      count: number;
      campaign: string | null;
      qualified: number;
      firstSeen: string;
      lastSeen: string;
    }> = {};

    for (const sub of subscribers || []) {
      const creative = sub.utm_content || 'unknown';
      if (!creativeBreakdown[creative]) {
        creativeBreakdown[creative] = {
          count: 0,
          campaign: sub.utm_campaign,
          qualified: 0,
          firstSeen: sub.created_at,
          lastSeen: sub.created_at,
        };
      }
      creativeBreakdown[creative].count++;
      // Check if ICP qualified (not Student, not Just me)
      if (sub.seniority !== 'Student' && sub.company_size !== 'Just me') {
        creativeBreakdown[creative].qualified++;
      }
      if (sub.created_at < creativeBreakdown[creative].firstSeen) {
        creativeBreakdown[creative].firstSeen = sub.created_at;
      }
      if (sub.created_at > creativeBreakdown[creative].lastSeen) {
        creativeBreakdown[creative].lastSeen = sub.created_at;
      }
    }

    // 3. Engaged subscriber events (sent to Meta)
    const { data: engagedEvents } = await supabase()
      .from('engaged_subscriber_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // 4. Funnel stats (total signups, completions, by day)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSubs } = await supabase()
      .from('subscribers')
      .select('created_at, completed, seniority, company_size')
      .gte('created_at', thirtyDaysAgo);

    const totalSignups = recentSubs?.length || 0;
    const completedSignups = recentSubs?.filter(s => s.completed).length || 0;
    const qualifiedSignups = recentSubs?.filter(s => 
      s.completed && s.seniority !== 'Student' && s.company_size !== 'Just me'
    ).length || 0;

    return NextResponse.json({
      creative_performance: creativePerf || [],
      creative_breakdown: creativeBreakdown,
      engaged_events: engagedEvents || [],
      funnel: {
        last_30_days: {
          total_signups: totalSignups,
          completed: completedSignups,
          qualified: qualifiedSignups,
          completion_rate: totalSignups > 0 
            ? Math.round((completedSignups / totalSignups) * 1000) / 10 
            : 0,
          qualification_rate: completedSignups > 0 
            ? Math.round((qualifiedSignups / completedSignups) * 1000) / 10 
            : 0,
        },
      },
    });
  } catch (err) {
    console.error('[Creative Stats] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
