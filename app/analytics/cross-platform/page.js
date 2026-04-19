'use client';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useMemo } from 'react';

const PLATFORMS = ['Meta (Facebook)', 'Google Ads', 'LinkedIn', 'Other'];
const COLORS = { 'Meta (Facebook)': '#1877f2', 'Google Ads': '#ea4335', 'LinkedIn': '#0a66c2', 'Other': '#a0aec0' };
const METRICS = ['spend', 'impressions', 'clicks', 'cpm', 'cpc', 'ctr'];
const METRIC_LABELS = { spend: 'Total Spend (₹)', impressions: 'Impressions', clicks: 'Clicks', cpm: 'CPM (₹)', cpc: 'CPC (₹)', ctr: 'CTR (%)' };

export default function CrossPlatformPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortMetric, setSortMetric] = useState('spend');

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/campaigns?clientId=${selected}`)
      .then(r => r.json()).then(d => { setCampaigns(d.campaigns || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selected]);

  const grid = useMemo(() => {
    const map = {};
    PLATFORMS.forEach(p => { map[p] = { platform: p, spend: 0, impressions: 0, clicks: 0, color: COLORS[p] }; });

    campaigns.forEach(c => (c.rows || []).forEach(row => {
      const raw = (row['Platform'] || row['platform'] || 'Other').toLowerCase();
      const key = raw.includes('google') ? 'Google Ads'
        : raw.includes('facebook') || raw.includes('meta') || raw.includes('instagram') ? 'Meta (Facebook)'
          : raw.includes('linkedin') ? 'LinkedIn' : 'Other';
      map[key].spend += parseFloat(row['Amount spent (INR)'] || row['Amount spent'] || 0) || 0;
      map[key].impressions += parseFloat(row['Impressions'] || 0) || 0;
      map[key].clicks += parseFloat(row['Clicks (all)'] || row['Clicks'] || 0) || 0;
    }));

    return PLATFORMS.map(p => {
      const d = map[p];
      d.cpm = d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0;
      d.cpc = d.clicks > 0 ? d.spend / d.clicks : 0;
      d.ctr = d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0;
      return d;
    }).sort((a, b) => b[sortMetric] - a[sortMetric]);
  }, [campaigns, sortMetric]);

  const totalSpend = grid.reduce((s, r) => s + r.spend, 0);
  const best = grid.reduce((a, b) => b[sortMetric] > a[sortMetric] ? b : a, grid[0] || {});

  const fmtVal = (v, metric) => {
    if (metric === 'spend' || metric === 'cpm' || metric === 'cpc')
      return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v);
    if (metric === 'ctr') return v.toFixed(2) + '%';
    return new Intl.NumberFormat('en-IN').format(Math.round(v));
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>📊 Cross-Platform Grid</h1>
            <p style={{ margin: '6px 0 0', color: '#718096' }}>Side-by-side performance comparison across all ad platforms</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select value={selected} onChange={e => setSelected(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)' }}>
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
            </select>
            <select value={sortMetric} onChange={e => setSortMetric(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)' }}>
              {METRICS.map(m => <option key={m} value={m}>Sort by {METRIC_LABELS[m]}</option>)}
            </select>
            {selected && (
              <button onClick={() => router.push(`/reports/pdf?clientId=${selected}`)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                📥 Export PDF
              </button>
            )}
          </div>
        </div>

        {!selected ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a0aec0' }}>
            <div style={{ fontSize: '3rem' }}>📊</div>
            <p style={{ marginTop: 12, fontSize: '1.1rem', fontWeight: 600 }}>Select a client to compare platform performance</p>
          </div>
        ) : loading ? <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div> : (
          <>
            {/* Winner Badge */}
            {best.platform && (
              <div style={{ background: `${COLORS[best.platform]}18`, border: `1px solid ${COLORS[best.platform]}40`, borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: COLORS[best.platform] }}>Best Performing: {best.platform}</div>
                  <div style={{ fontSize: '0.82rem', color: '#718096' }}>Highest {METRIC_LABELS[sortMetric]} — {fmtVal(best[sortMetric], sortMetric)}</div>
                </div>
              </div>
            )}

            {/* Grid Table */}
            <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--hover-bg,#f8f9ff)' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.8 }}>Platform</th>
                    {METRICS.map(m => (
                      <th key={m} onClick={() => setSortMetric(m)}
                        style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: m === sortMetric ? '#667eea' : '#718096', textTransform: 'uppercase', letterSpacing: 0.8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {METRIC_LABELS[m]} {m === sortMetric ? '▼' : ''}
                      </th>
                    ))}
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.8 }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row, i) => {
                    const share = totalSpend > 0 ? (row.spend / totalSpend) * 100 : 0;
                    const isTop = row.platform === best.platform;
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-color,#f0f0f0)', background: isTop ? `${COLORS[row.platform]}08` : 'transparent' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[row.platform], flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{row.platform}</span>
                            {isTop && <span style={{ fontSize: '0.65rem', background: COLORS[row.platform], color: '#fff', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>BEST</span>}
                          </div>
                        </td>
                        {METRICS.map(m => (
                          <td key={m} style={{ padding: '16px', textAlign: 'right', fontWeight: m === sortMetric ? 800 : 500, color: m === sortMetric ? 'var(--text-primary,#2d3748)' : '#718096', fontSize: '0.88rem' }}>
                            {fmtVal(row[m], m)}
                          </td>
                        ))}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <div style={{ width: 60, height: 6, background: 'var(--border-color,#f0f0f0)', borderRadius: 99 }}>
                              <div style={{ width: `${share}%`, height: '100%', background: COLORS[row.platform], borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS[row.platform], minWidth: 36 }}>{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Platform Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {grid.map((row, i) => (
                <div key={i} style={{ background: 'var(--card-bg,#fff)', border: `2px solid ${COLORS[row.platform]}40`, borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[row.platform] }} />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{row.platform}</span>
                  </div>
                  {METRICS.slice(0, 4).map(m => (
                    <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border-color,#f0f0f0)' }}>
                      <span style={{ fontSize: '0.78rem', color: '#718096' }}>{METRIC_LABELS[m]}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{fmtVal(row[m], m)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
