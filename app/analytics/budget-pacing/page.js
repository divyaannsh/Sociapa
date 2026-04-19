'use client';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DEFAULT_BUDGETS = [
  { platform: 'Meta (Facebook)', budget: 50000, color: '#1877f2' },
  { platform: 'Google Ads', budget: 40000, color: '#ea4335' },
  { platform: 'LinkedIn', budget: 30000, color: '#0a66c2' },
  { platform: 'Other', budget: 20000, color: '#a0aec0' },
];

export default function BudgetPacingPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load clients on mount
  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
  }, []);

  // Load campaigns + saved budget targets when client changes
  useEffect(() => {
    if (!selectedClient) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/campaigns?clientId=${selectedClient}`).then(r => r.json()),
      fetch(`/api/analytics/budget-targets?clientId=${selectedClient}`).then(r => r.json()),
    ]).then(([campaignData, budgetData]) => {
      setCampaigns(campaignData.campaigns || []);
      if (budgetData.budgets) {
        setBudgets(budgetData.budgets);
      } else {
        setBudgets(DEFAULT_BUDGETS);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClient]);

  const saveBudgets = async () => {
    if (!selectedClient) return;
    setSaving(true); setSaveMsg('');
    try {
      const r = await fetch('/api/analytics/budget-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient, budgets }),
      });
      if (r.ok) { setSaveMsg('✅ Saved'); setTimeout(() => setSaveMsg(''), 2500); }
      else setSaveMsg('❌ Failed to save');
    } catch { setSaveMsg('❌ Error saving'); }
    finally { setSaving(false); }
  };

  const spendByPlatform = useMemo(() => {
    const map = {};
    campaigns.forEach(c => (c.rows || []).forEach(row => {
      const p = (row['Platform'] || row['platform'] || 'Other').toLowerCase();
      const s = parseFloat(row['Amount spent (INR)'] || row['Amount spent'] || 0) || 0;
      const key = p.includes('google') ? 'Google Ads'
        : p.includes('facebook') || p.includes('meta') || p.includes('instagram') ? 'Meta (Facebook)'
          : p.includes('linkedin') ? 'LinkedIn' : 'Other';
      map[key] = (map[key] || 0) + s;
    }));
    return map;
  }, [campaigns]);

  const rows = useMemo(() => budgets.map(b => {
    const spent = spendByPlatform[b.platform] || 0;
    const pct = b.budget > 0 ? (spent / b.budget) * 100 : 0;
    const status = pct >= 100 ? 'overspent' : pct >= 85 ? 'warning' : pct >= 50 ? 'on-track' : 'under';
    return { ...b, spent, pct: Math.min(pct, 100), rawPct: pct, status };
  }), [budgets, spendByPlatform]);

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const statusStyle = { overspent: '#f5576c', warning: '#f6c90e', 'on-track': '#43e97b', under: '#a0aec0' };
  const statusLabel = { overspent: '🔴 Overspent', warning: '🟡 Warning', 'on-track': '🟢 On Track', under: '⚪ Under-pacing' };
  const fmt = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="main-content">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>🚦 Budget Pacing</h1>
            <p style={{ margin: '6px 0 0', color: '#718096' }}>Live spend vs budget tracking · Overspend alerts per platform</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--card-border, #e2e8f0)', background: 'var(--card-bg, #fff)', color: 'var(--text-primary, #2d3748)' }}>
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
            </select>
            {selectedClient && (
              <>
                <button onClick={saveBudgets} disabled={saving}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : '💾 Save Budgets'}
                </button>
                <button onClick={() => router.push(`/reports/pdf?clientId=${selectedClient}`)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--hover-bg,#f8f9ff)', color: '#667eea', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', border: '1px solid #667eea40' }}>
                  📥 Export PDF
                </button>
              </>
            )}
            {saveMsg && <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{saveMsg}</span>}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#a0aec0' }}>⏳ Loading campaign data...</div>
        ) : (
          <>
            {/* Total Pacing Card */}
            <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.8 }}>Overall Budget Pacing</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>
                    {fmt(totalSpent)} <span style={{ fontSize: '1rem', color: '#718096' }}>/ {fmt(totalBudget)}</span>
                  </div>
                  {!selectedClient && <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: 4 }}>Select a client to load real data</div>}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: totalPct >= 100 ? '#f5576c' : totalPct >= 85 ? '#f6c90e' : '#43e97b' }}>
                  {totalPct.toFixed(1)}%
                </div>
              </div>
              <div style={{ background: 'var(--border-color,#f0f0f0)', borderRadius: 99, height: 22, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(totalPct, 100)}%`, height: '100%', borderRadius: 99,
                  background: totalPct >= 100 ? '#f5576c' : totalPct >= 85 ? '#f6c90e' : 'linear-gradient(90deg,#667eea,#43e97b)',
                  transition: 'width 0.9s ease',
                }} />
              </div>
            </div>

            {/* Per-Platform Rows */}
            <div style={{ display: 'grid', gap: 14, marginBottom: 28 }}>
              {rows.map((row, i) => (
                <div key={i} style={{ background: 'var(--card-bg,#fff)', border: `1px solid var(--card-border,#e2e8f0)`, borderRadius: 14, padding: '18px 22px', borderLeft: `4px solid ${statusStyle[row.status]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color }} />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{row.platform}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${statusStyle[row.status]}20`, color: statusStyle[row.status] }}>
                        {statusLabel[row.status]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#718096' }}>Spent: <b>{fmt(row.spent)}</b></span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.8rem', color: '#718096' }}>Budget:</span>
                        <input type="number" value={row.budget}
                          onChange={e => setBudgets(prev => prev.map((b, idx) => idx === i ? { ...b, budget: parseFloat(e.target.value) || 0 } : b))}
                          style={{ width: 110, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', fontWeight: 700, fontSize: '0.85rem' }}
                        />
                      </div>
                      <b style={{ color: statusStyle[row.status], minWidth: 46, textAlign: 'right' }}>{row.rawPct.toFixed(1)}%</b>
                    </div>
                  </div>
                  <div style={{ background: 'var(--border-color,#f0f0f0)', borderRadius: 99, height: 14, overflow: 'hidden' }}>
                    <div style={{
                      width: `${row.pct}%`, height: '100%', borderRadius: 99,
                      background: statusStyle[row.status], transition: 'width 0.9s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, padding: 24 }}>
              <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Budget vs Spend by Platform</h6>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={rows} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" radius={[6, 6, 0, 0]}>
                    {rows.map((r, i) => <Cell key={i} fill={statusStyle[r.status]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#a0aec0', textAlign: 'center' }}>
                💡 Edit budget targets above and click <b>Save Budgets</b> — values persist per client in MongoDB
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
