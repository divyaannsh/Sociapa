'use client';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

const ROAS_TARGET = 3.0; // target: ₹3 return per ₹1 spent

export default function ROASPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [revenueMultiplier, setRevenueMultiplier] = useState(2.5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setLoading(true);
    fetch(`/api/campaigns?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => { setCampaigns(d.campaigns || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedClient]);

  const metrics = useMemo(() => {
    let spend = 0, impressions = 0, clicks = 0, conversions = 0;
    campaigns.forEach(c => (c.rows || []).forEach(row => {
      spend += parseFloat(row['Amount spent (INR)'] || row['Amount spent'] || 0) || 0;
      impressions += parseFloat(row['Impressions'] || 0) || 0;
      clicks += parseFloat(row['Clicks (all)'] || row['Clicks'] || 0) || 0;
      conversions += parseFloat(row['Results'] || row['Conversions'] || 0) || 0;
    }));
    const revenue = spend * revenueMultiplier;
    const roas = spend > 0 ? revenue / spend : 0;
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    return { spend, revenue, roas, roi, impressions, clicks, conversions, cpa, cpc, cpm };
  }, [campaigns, revenueMultiplier]);

  const chartData = useMemo(() => {
    const map = new Map();
    campaigns.forEach(c => (c.rows || []).forEach(row => {
      const dateStr = row['Reporting starts'] || row['Date'] || row['date'] || c.uploadedAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date)) return;
      const key = date.toISOString().split('T')[0];
      if (!map.has(key)) map.set(key, { date: key, spend: 0, revenue: 0 });
      const s = parseFloat(row['Amount spent (INR)'] || row['Amount spent'] || 0) || 0;
      map.get(key).spend += s;
      map.get(key).revenue += s * revenueMultiplier;
    }));
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, roas: d.spend > 0 ? d.revenue / d.spend : 0 }));
  }, [campaigns, revenueMultiplier]);

  const fmt = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const roasColor = metrics.roas >= ROAS_TARGET ? '#43e97b' : metrics.roas >= 1 ? '#f6c90e' : '#f5576c';

  return (
    <div className="main-content">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>💰 ROAS & ROI Tracking</h1>
            <p style={{ margin: '6px 0 0', color: '#718096' }}>Return on Ad Spend · Revenue Intelligence · Profitability Analysis</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--card-border, #e2e8f0)', background: 'var(--card-bg, #fff)', color: 'var(--text-primary, #2d3748)', fontSize: '0.9rem' }}
            >
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e2e8f0)', borderRadius: 8, padding: '8px 14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096' }}>Revenue Multiplier</label>
              <input
                type="number" min="0.1" step="0.1"
                value={revenueMultiplier}
                onChange={e => setRevenueMultiplier(parseFloat(e.target.value) || 1)}
                style={{ width: 60, border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #2d3748)', outline: 'none' }}
              />
            </div>
            {selectedClient && (
              <button
                onClick={() => router.push(`/reports/pdf?clientId=${selectedClient}`)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                📥 Export PDF
              </button>
            )}
          </div>
        </div>

        {!selectedClient ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a0aec0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💰</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select a client to view ROAS & ROI data</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Ad Spend', value: fmt(metrics.spend), icon: '📤', color: '#667eea' },
                { label: 'Estimated Revenue', value: fmt(metrics.revenue), icon: '📥', color: '#43e97b' },
                { label: 'ROAS', value: `${metrics.roas.toFixed(2)}x`, icon: '📈', color: roasColor, sub: metrics.roas >= ROAS_TARGET ? '✓ Target Met' : `Target: ${ROAS_TARGET}x` },
                { label: 'ROI', value: `${metrics.roi.toFixed(1)}%`, icon: '🎯', color: metrics.roi >= 0 ? '#43e97b' : '#f5576c' },
                { label: 'CPA', value: fmt(metrics.cpa), icon: '💡', color: '#f093fb' },
                { label: 'Total Clicks', value: metrics.clicks.toLocaleString(), icon: '👆', color: '#4facfe' },
              ].map((kpi, i) => (
                <div key={i} style={{
                  background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e2e8f0)',
                  borderRadius: 14, padding: '18px 20px', borderLeft: `4px solid ${kpi.color}`
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.8 }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color, margin: '6px 0 2px' }}>{kpi.value}</div>
                  {kpi.sub && <div style={{ fontSize: '0.7rem', color: '#718096' }}>{kpi.sub}</div>}
                </div>
              ))}
            </div>

            {/* ROAS Target Meter */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e2e8f0)', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
              <h6 style={{ fontWeight: 700, marginBottom: 16 }}>ROAS vs Target ({ROAS_TARGET}x)</h6>
              <div style={{ position: 'relative', height: 28, background: 'var(--border-color, #f0f0f0)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((metrics.roas / (ROAS_TARGET * 1.5)) * 100, 100)}%`,
                  height: '100%', borderRadius: 99,
                  background: `linear-gradient(90deg, ${roasColor}, ${roasColor}90)`,
                  transition: 'width 1s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10
                }}>
                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>{metrics.roas.toFixed(2)}x</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: '#718096' }}>
                <span>0x</span><span style={{ color: '#667eea' }}>Target: {ROAS_TARGET}x</span><span>{(ROAS_TARGET * 1.5).toFixed(1)}x+</span>
              </div>
            </div>

            {/* Spend vs Revenue Chart */}
            {chartData.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e2e8f0)', borderRadius: 16, padding: 24 }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Spend vs Revenue Over Time</h6>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#43e97b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#43e97b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="spG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => fmt(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#43e97b" fill="url(#revG)" name="Revenue" />
                      <Area type="monotone" dataKey="spend" stroke="#667eea" fill="url(#spG)" name="Spend" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e2e8f0)', borderRadius: 16, padding: 24 }}>
                  <h6 style={{ fontWeight: 700, marginBottom: 16 }}>ROAS Over Time</h6>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => v.toFixed(2) + 'x'} />
                      <ReferenceLine y={ROAS_TARGET} stroke="#f5576c" strokeDasharray="4 4" label={{ value: `Target ${ROAS_TARGET}x`, fill: '#f5576c', fontSize: 10 }} />
                      <Line type="monotone" dataKey="roas" stroke={roasColor} strokeWidth={2.5} dot={false} name="ROAS" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
