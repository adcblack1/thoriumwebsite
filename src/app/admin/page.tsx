'use client';

import { useState, useEffect, useCallback } from 'react';

interface CreativePerformance {
  id: string;
  date: string;
  utm_campaign: string | null;
  utm_content: string;
  subscribers_count: number;
  avg_open_rate: number | null;
  avg_ctr: number | null;
  quality_score: number | null;
}

interface CreativeBreakdown {
  [creative: string]: {
    count: number;
    campaign: string | null;
    qualified: number;
    firstSeen: string;
    lastSeen: string;
  };
}

interface EngagedEvent {
  id: string;
  email_hash: string;
  open_rate: number;
  ctr: number;
  utm_content: string | null;
  sent_to_meta: boolean;
  created_at: string;
}

interface DashboardData {
  creative_performance: CreativePerformance[];
  creative_breakdown: CreativeBreakdown;
  engaged_events: EngagedEvent[];
  funnel: {
    last_30_days: {
      total_signups: number;
      completed: number;
      qualified: number;
      completion_rate: number;
      qualification_rate: number;
    };
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/creative-stats');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/sync-engaged');
      const json = await res.json();
      setSyncResult(`Processed ${json.processed} subs | ${json.engaged} engaged | ${json.sent_to_meta} sent to Meta | ${json.creatives_tracked} creatives`);
      fetchData(); // Refresh data
    } catch {
      setSyncResult('Sync failed');
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  const funnel = data?.funnel.last_30_days;
  const creatives = data?.creative_breakdown || {};
  const perfData = data?.creative_performance || [];
  const events = data?.engaged_events || [];

  // Merge creative breakdown with performance data
  const mergedCreatives = Object.entries(creatives).map(([creative, info]) => {
    const perfMatch = perfData.find(p => p.utm_content === creative);
    return {
      creative,
      subscribers: info.count,
      qualified: info.qualified,
      qualRate: info.count > 0 ? Math.round((info.qualified / info.count) * 100) : 0,
      campaign: info.campaign || perfMatch?.utm_campaign || '—',
      avgOpenRate: perfMatch?.avg_open_rate ?? null,
      avgCtr: perfMatch?.avg_ctr ?? null,
      qualityScore: perfMatch?.quality_score ?? null,
      firstSeen: new Date(info.firstSeen).toLocaleDateString(),
      lastSeen: new Date(info.lastSeen).toLocaleDateString(),
    };
  }).sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>THORIUM VALLEY</h1>
        <p style={styles.subtitle}>Ad Creative Performance Dashboard</p>
        <button 
          onClick={triggerSync} 
          disabled={syncing}
          style={{
            ...styles.syncButton,
            opacity: syncing ? 0.5 : 1,
          }}
        >
          {syncing ? 'Syncing...' : '↻ Sync Engagement Data'}
        </button>
        {syncResult && <p style={styles.syncResult}>{syncResult}</p>}
      </div>

      {/* Funnel Overview */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📈 Funnel (Last 30 Days)</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{funnel?.total_signups || 0}</div>
            <div style={styles.statLabel}>Email Entries</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{funnel?.completed || 0}</div>
            <div style={styles.statLabel}>Completed Survey</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{funnel?.qualified || 0}</div>
            <div style={styles.statLabel}>Qualified (ICP)</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{funnel?.completion_rate || 0}%</div>
            <div style={styles.statLabel}>Completion Rate</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{funnel?.qualification_rate || 0}%</div>
            <div style={styles.statLabel}>ICP Rate</div>
          </div>
        </div>
      </div>

      {/* Creative Performance Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🎨 Creative Performance</h2>
        <p style={styles.sectionDesc}>
          Quality data populates after the weekly sync checks Beehiiv engagement (7-14 days post-signup)
        </p>
        {mergedCreatives.length === 0 ? (
          <div style={styles.emptyState}>
            No creative data yet. Subscribers need <code>utm_content</code> in their signup URL.<br/>
            Example: <code>thoriumvalley.com/subscribe?utm_content=dark_founder_v1&utm_campaign=spring_2026</code>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Creative</th>
                  <th style={styles.th}>Campaign</th>
                  <th style={styles.th}>Subs</th>
                  <th style={styles.th}>Qualified</th>
                  <th style={styles.th}>ICP %</th>
                  <th style={styles.thHighlight}>Open Rate</th>
                  <th style={styles.thHighlight}>CTR</th>
                  <th style={styles.thHighlight}>Quality Score</th>
                  <th style={styles.th}>Active</th>
                </tr>
              </thead>
              <tbody>
                {mergedCreatives.map((c) => (
                  <tr key={c.creative} style={styles.tr}>
                    <td style={styles.tdBold}>{c.creative}</td>
                    <td style={styles.td}>{c.campaign}</td>
                    <td style={styles.td}>{c.subscribers}</td>
                    <td style={styles.td}>{c.qualified}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: c.qualRate >= 80 ? '#10b981' : c.qualRate >= 50 ? '#f59e0b' : '#ef4444',
                      }}>
                        {c.qualRate}%
                      </span>
                    </td>
                    <td style={styles.tdHighlight}>
                      {c.avgOpenRate !== null ? (
                        <span style={{
                          ...styles.badge,
                          backgroundColor: c.avgOpenRate >= 40 ? '#10b981' : c.avgOpenRate >= 25 ? '#f59e0b' : '#ef4444',
                        }}>
                          {c.avgOpenRate.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={styles.tdHighlight}>
                      {c.avgCtr !== null ? (
                        <span style={{
                          ...styles.badge,
                          backgroundColor: c.avgCtr >= 3 ? '#10b981' : c.avgCtr >= 1.5 ? '#f59e0b' : '#ef4444',
                        }}>
                          {c.avgCtr.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={styles.tdHighlight}>
                      {c.qualityScore !== null ? (
                        <span style={{
                          ...styles.badgeLg,
                          backgroundColor: c.qualityScore >= 30 ? '#10b981' : c.qualityScore >= 18 ? '#f59e0b' : '#ef4444',
                        }}>
                          {c.qualityScore.toFixed(1)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={styles.td}>{c.firstSeen} – {c.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Engaged Subscriber Log */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔥 Engaged Subscribers Sent to Meta</h2>
        <p style={styles.sectionDesc}>
          These high-quality subscribers ({'>'} 40% open rate) were reported back to Meta via Conversions API 
          so the algorithm learns to find more like them.
        </p>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            No engaged subscriber events yet. Run a sync after subscribers have been active for 7+ days.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Creative</th>
                  <th style={styles.th}>Open Rate</th>
                  <th style={styles.th}>CTR</th>
                  <th style={styles.th}>Sent to Meta</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(e.created_at).toLocaleDateString()}</td>
                    <td style={styles.tdBold}>{e.utm_content || 'organic'}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: '#10b981' }}>
                        {e.open_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={styles.td}>{e.ctr.toFixed(1)}%</td>
                    <td style={styles.td}>{e.sent_to_meta ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 How to Use</h2>
        <div style={styles.instructions}>
          <p><strong>1. Tag your ads:</strong> Set the destination URL for each Meta ad creative to:</p>
          <code style={styles.codeBlock}>
            thoriumvalley.com/subscribe?utm_source=meta&utm_campaign=YOUR_CAMPAIGN&utm_content=YOUR_CREATIVE_NAME
          </code>
          <p><strong>2. Wait 7-14 days</strong> for subscribers to engage with emails.</p>
          <p><strong>3. Click &quot;Sync Engagement Data&quot;</strong> above (or wait for the weekly auto-sync).</p>
          <p><strong>4. Read the table:</strong></p>
          <ul>
            <li>🟢 Green = good (open rate {'>'} 40%, CTR {'>'} 3%)</li>
            <li>🟡 Yellow = mediocre (open rate 25-40%, CTR 1.5-3%)</li>
            <li>🔴 Red = bad — kill this creative</li>
          </ul>
          <p><strong>5. Optimize in Ads Manager:</strong> Scale creatives with high quality scores. Kill low ones.</p>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e5e5e5',
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#888',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #222',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '0.15em',
    margin: 0,
    background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    marginTop: '0.5rem',
    fontWeight: 400,
  },
  syncButton: {
    marginTop: '1rem',
    padding: '0.6rem 1.5rem',
    backgroundColor: '#1a1a2e',
    color: '#8b5cf6',
    border: '1px solid #8b5cf6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  syncResult: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#10b981',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  sectionDesc: {
    color: '#666',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  statCard: {
    backgroundColor: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '0.3rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    borderRadius: '12px',
    border: '1px solid #222',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.8rem 1rem',
    backgroundColor: '#111',
    color: '#888',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #222',
  },
  thHighlight: {
    textAlign: 'left' as const,
    padding: '0.8rem 1rem',
    backgroundColor: '#0f1424',
    color: '#8b5cf6',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #222',
  },
  tr: {
    borderBottom: '1px solid #1a1a1a',
  },
  td: {
    padding: '0.7rem 1rem',
    color: '#ccc',
  },
  tdBold: {
    padding: '0.7rem 1rem',
    color: '#fff',
    fontWeight: 600,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: '0.85rem',
  },
  tdHighlight: {
    padding: '0.7rem 1rem',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  badgeLg: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  emptyState: {
    padding: '2rem',
    backgroundColor: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    color: '#666',
    textAlign: 'center',
    lineHeight: 1.8,
  },
  instructions: {
    backgroundColor: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    lineHeight: 1.8,
  },
  codeBlock: {
    display: 'block',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '0.8rem 1rem',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: '0.85rem',
    color: '#8b5cf6',
    margin: '0.5rem 0 1rem',
    overflowX: 'auto' as const,
  },
};
