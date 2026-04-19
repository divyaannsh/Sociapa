'use client';
import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartAnnotationsPage() {
  const [clients, setClients]     = useState([]);
  const [selected, setSelected]   = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [annotations, setAnnotations] = useState([
    { id: 1, date: '2025-09-15', label: '🚀 Campaign Launch', color: '#667eea', note: 'New creative set went live' },
    { id: 2, date: '2025-09-22', label: '📉 Budget Cut', color: '#f5576c', note: 'Client reduced budget by 20%' },
    { id: 3, date: '2025-10-05', label: '🎉 Sale Event', color: '#43e97b', note: 'Dussehra promotion started' },
  ]);
  const [newNote, setNewNote] = useState({ date: '', label: '', color: '#667eea', note: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/campaigns?clientId=${selected}`).then(r => r.json()).then(d => setCampaigns(d.campaigns || []));
  }, [selected]);

  const chartData = useMemo(() => {
    const map = new Map();
    campaigns.forEach(c => (c.rows || []).forEach(row => {
      const ds = row['Reporting starts'] || row['Date'] || row['date'] || c.uploadedAt;
      if (!ds) return;
      const d = new Date(ds); if (isNaN(d)) return;
      const key = d.toISOString().split('T')[0];
      if (!map.has(key)) map.set(key, { date: key, spend: 0, impressions: 0 });
      map.get(key).spend += parseFloat(row['Amount spent (INR)'] || row['Amount spent'] || 0) || 0;
      map.get(key).impressions += parseFloat(row['Impressions'] || 0) || 0;
    }));
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [campaigns]);

  const addAnnotation = (e) => {
    e.preventDefault();
    if (!newNote.date || !newNote.label) return;
    setAnnotations(prev => [...prev, { ...newNote, id: Date.now() }]);
    setNewNote({ date: '', label: '', color: '#667eea', note: '' });
    setShowForm(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const ann = annotations.find(a => a.date === label);
    return (
      <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 10, padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem' }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '0.82rem' }}>{p.name}: <b>{p.name === 'Spend' ? '₹' : ''}{Number(p.value).toLocaleString()}</b></div>
        ))}
        {ann && <div style={{ marginTop: 8, padding: '6px 10px', background: `${ann.color}20`, borderRadius: 6, color: ann.color, fontSize: '0.78rem', fontWeight: 700 }}>📌 {ann.label}: {ann.note}</div>}
      </div>
    );
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>✏️ Chart Annotations</h1>
          <p style={{ margin: '6px 0 0', color: '#718096' }}>Leave notes on performance spikes & drops — &quot;Holiday sale started&quot;, &quot;Budget cut&quot;</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)' }}>
            <option value="">— Select Client —</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
          </select>
          <button onClick={() => setShowForm(t => !t)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            + Add Note
          </button>
        </div>
      </div>

      {/* Add Annotation Form */}
      {showForm && (
        <form onSubmit={addAnnotation} style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Date</label>
              <input type="date" value={newNote.date} onChange={e => setNewNote(n => ({ ...n, date: e.target.value }))} required
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Label</label>
              <input type="text" value={newNote.label} onChange={e => setNewNote(n => ({ ...n, label: e.target.value }))} placeholder="🎉 Sale Event" required
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Color</label>
              <input type="color" value={newNote.color} onChange={e => setNewNote(n => ({ ...n, color: e.target.value }))}
                style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', padding: 2, background: 'var(--card-bg,#fff)', cursor: 'pointer' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Note</label>
              <input type="text" value={newNote.note} onChange={e => setNewNote(n => ({ ...n, note: e.target.value }))} placeholder="What happened on this day?"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Note</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'transparent', color: '#718096', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Chart */}
      <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Spend Over Time with Annotations</h6>
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
            {selected ? 'No data available.' : 'Select a client to see the chart.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              {annotations.map(ann => (
                <ReferenceLine key={ann.id} x={ann.date} stroke={ann.color} strokeDasharray="5 4"
                  label={{ position: 'top', value: ann.label, fill: ann.color, fontSize: 10, fontWeight: 700 }} />
              ))}
              <Line type="monotone" dataKey="spend" stroke="#667eea" strokeWidth={2.5} dot={false} name="Spend" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Annotation List */}
      <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-color,#f0f0f0)', fontWeight: 700, fontSize: '0.9rem' }}>All Notes ({annotations.length})</div>
        {annotations.map((ann, i) => (
          <div key={ann.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: i < annotations.length - 1 ? '1px solid var(--border-color,#f0f0f0)' : 'none' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ann.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ann.label}</div>
              {ann.note && <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: 2 }}>{ann.note}</div>}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#a0aec0', flexShrink: 0 }}>{ann.date}</div>
            <button onClick={() => setAnnotations(prev => prev.filter(a => a.id !== ann.id))}
              style={{ background: 'none', border: 'none', color: '#f5576c', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
