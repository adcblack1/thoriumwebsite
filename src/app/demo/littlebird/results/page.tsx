'use client';

import { useEffect, useState } from 'react';

type Counts = Record<string, { views: number; clicks: number; skips: number }>;

export default function LittlebirdResults() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);

  const fetchResults = async () => {
    const res = await fetch('/api/littlebird-test?results=true');
    const data = await res.json();
    setCounts(data.counts);
    setTotal(data.total);
    setDone(data.done);
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (!counts) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-inter">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-12 font-inter">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Littlebird A/B/C Test Results</h1>
        <p className="text-white/40 text-sm mb-1">Auto-refreshes every 5 seconds</p>
        <p className="text-white/60 text-sm mb-8">
          Total views: <span className="font-semibold text-white">{total}</span> / 150
          {done && <span className="ml-3 text-green-400 font-semibold">✓ TEST COMPLETE</span>}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (total / 150) * 100)}%`, backgroundColor: '#5170ff' }}
          />
        </div>

        <div className="grid gap-6">
          {Object.entries(counts).map(([v, c]) => {
            const ctr = c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(1) : '0.0';
            const labels: Record<string, string> = {
              A: 'Meeting Recall (thorium1)',
              B: 'Productivity (thorium2)',
              C: 'Video Demo (thorium3)',
            };
            return (
              <div key={v} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold">Variation {v}</span>
                    <span className="text-white/40 text-sm ml-3">{labels[v]}</span>
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: '#5170ff' }}
                  >
                    {ctr}% CTR
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold">{c.views}</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mt-1">Views</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-400">{c.clicks}</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mt-1">Clicks</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold text-yellow-400">{c.skips}</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mt-1">Skipped</p>
                  </div>
                </div>
                {/* View progress */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(c.views / 50) * 100}%`, backgroundColor: '#5170ff' }}
                    />
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">{c.views}/50 views</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset button */}
        <button
          onClick={async () => {
            if (confirm('Reset all test data?')) {
              await fetch('/api/littlebird-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variation: 'RESET', type: 'view', uid: 'reset' }),
              });
              // Actually just clear the file manually or add a DELETE handler
              fetchResults();
            }
          }}
          className="mt-8 text-xs text-white/20 hover:text-white/50 transition-colors"
        >
          Reset test data
        </button>
      </div>
    </main>
  );
}
