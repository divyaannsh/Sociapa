'use client';
import { useState, useEffect } from 'react';

export default function ScheduledReportsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ clientId: '', email: '', period: 'weekly', dayOfWeek: 'monday' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [activeTab, setActiveTab] = useState('send');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const r = await fetch('/api/reports/schedules');
      const d = await r.json();
      setSchedules(d.schedules || []);
    } catch { setSchedules([]); }
    finally { setLoadingSchedules(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.clientId || !form.email) { setResult({ error: 'Please select a client and email.' }); return; }
    setSending(true); setResult(null);
    try {
      // 1. Send the email report
      const res = await fetch('/api/reports/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: form.clientId, email: form.email, period: form.period }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ success: data.message });

        // 2. Persist the schedule to MongoDB
        const clientName = clients.find(c => c._id === form.clientId)?.companyName || 'Client';
        await fetch('/api/reports/schedules', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: form.clientId,
            clientName,
            email: form.email,
            period: form.period,
            dayOfWeek: form.dayOfWeek,
          }),
        });

        // 3. Reload the schedules list
        await loadSchedules();
        setActiveTab('schedules');
      } else {
        setResult({ error: data.message });
      }
    } catch { setResult({ error: 'Failed to send report.' }); }
    finally { setSending(false); }
  };

  const deleteSchedule = async (id) => {
    if (!confirm('Delete this scheduled report?')) return;
    setDeletingId(id);
    await fetch(`/api/reports/schedules?id=${id}`, { method: 'DELETE' });
    setSchedules(prev => prev.filter(s => s._id !== id));
    setDeletingId(null);
  };

  const toggleStatus = async (s) => {
    setTogglingId(s._id);
    const newStatus = s.status === 'active' ? 'paused' : 'active';
    await fetch('/api/reports/schedules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s._id, status: newStatus }),
    });
    setSchedules(prev => prev.map(x => x._id === s._id ? { ...x, status: newStatus } : x));
    setTogglingId(null);
  };

  const tabStyle = (t) => ({
    padding: '10px 22px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
    background: activeTab === t ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'var(--hover-bg,#f8f9ff)',
    color: activeTab === t ? '#fff' : 'var(--text-muted,#718096)',
    transition: 'all 0.2s',
  });

  const periodColors = { weekly: '#667eea', monthly: '#43e97b', daily: '#f093fb' };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>📅 Scheduled Email Reports</h1>
        <p style={{ margin: '6px 0 0', color: '#718096' }}>
          Send on-demand reports or set up recurring email schedules for your clients
          {schedules.length > 0 && <span style={{ marginLeft: 10, background: '#667eea', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{schedules.length} active</span>}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setActiveTab('send')} style={tabStyle('send')}>📤 Send Report</button>
        <button onClick={() => setActiveTab('schedules')} style={tabStyle('schedules')}>
          📋 Schedules {schedules.length > 0 && `(${schedules.length})`}
        </button>
      </div>

      {/* SEND TAB */}
      {activeTab === 'send' && (
        <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, padding: 28 }}>
          <h6 style={{ fontWeight: 700, marginBottom: 20 }}>Send Performance Report</h6>
          <form onSubmit={handleSend} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>Client *</label>
                <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)' }}>
                  <option value="">— Select Client —</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>Recipient Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="client@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>Report Period</label>
                <select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)' }}>
                  <option value="weekly">📅 Weekly</option>
                  <option value="monthly">🗓️ Monthly</option>
                  <option value="daily">📆 Daily</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>Send Day</label>
                <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)' }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                </select>
              </div>
            </div>

            {result?.success && (
              <div style={{ background: '#43e97b18', border: '1px solid #43e97b40', borderRadius: 10, padding: '12px 16px', color: '#2f9e5f', fontWeight: 600, fontSize: '0.88rem' }}>
                ✅ {result.success} — Schedule saved to database.
              </div>
            )}
            {result?.error && (
              <div style={{ background: '#f5576c18', border: '1px solid #f5576c40', borderRadius: 10, padding: '12px 16px', color: '#f5576c', fontWeight: 600, fontSize: '0.88rem' }}>
                ❌ {result.error}
              </div>
            )}

            <button type="submit" disabled={sending}
              style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', opacity: sending ? 0.7 : 1, width: 'fit-content', transition: 'opacity 0.2s' }}>
              {sending ? '📤 Sending...' : '📤 Send Report Now'}
            </button>
          </form>
        </div>
      )}

      {/* SCHEDULES TAB */}
      {activeTab === 'schedules' && (
        <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, overflow: 'hidden' }}>
          {loadingSchedules ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#a0aec0' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
              Loading schedules from database...
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#a0aec0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No schedules yet</div>
              <div style={{ fontSize: '0.85rem' }}>Send your first report to create a schedule.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--hover-bg,#f8f9ff)' }}>
                  {['Client', 'Email', 'Period', 'Send Day', 'Last Sent', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s._id} style={{ borderTop: '1px solid var(--border-color,#f0f0f0)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg,#f8f9ff)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.88rem' }}>{s.clientName}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#718096', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${periodColors[s.period] || '#667eea'}18`, color: periodColors[s.period] || '#667eea', textTransform: 'capitalize' }}>
                        {s.period}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem', textTransform: 'capitalize', color: '#4a5568' }}>{s.dayOfWeek}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#718096' }}>
                      {s.lastSent ? new Date(s.lastSent).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button onClick={() => toggleStatus(s)} disabled={togglingId === s._id}
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: s.status === 'active' ? '#43e97b20' : '#a0aec020', color: s.status === 'active' ? '#2f9e5f' : '#718096' }}>
                          {s.status === 'active' ? '● Active' : '○ Paused'}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button onClick={() => deleteSchedule(s._id)} disabled={deletingId === s._id}
                        style={{ background: '#f5576c18', border: '1px solid #f5576c30', color: '#f5576c', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                        {deletingId === s._id ? '...' : '🗑 Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
