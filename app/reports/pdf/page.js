'use client';
import { useState, useEffect, useRef, useMemo } from 'react';

const SECTIONS = [
  { key: 'kpis',     label: '📊 KPI Summary',           default: true },
  { key: 'roas',     label: '💰 ROAS & ROI',             default: true },
  { key: 'budget',   label: '🚦 Budget Pacing',          default: true },
  { key: 'platform', label: '📋 Cross-Platform Grid',    default: true },
  { key: 'timeline', label: '📈 Spend Timeline',         default: false },
];

export default function PDFReportBuilderPage() {
  const previewRef = useRef(null);
  const [clients, setClients]           = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientData, setClientData]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [sections, setSections]         = useState(Object.fromEntries(SECTIONS.map(s => [s.key, s.default])));
  const [reportTitle, setReportTitle]   = useState('Performance Report');
  const [dateRange, setDateRange]       = useState('');

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setClientData(null); return; }
    setLoading(true);
    fetch(`/api/reports/pdf?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => setClientData(d.data || null))
      .catch(() => setClientData(null))
      .finally(() => setLoading(false));
  }, [selectedClient]);

  const exportPDF = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        windowWidth: 794, // A4 width in px at 96dpi
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let yOffset = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      while (yOffset < pdfHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, pdfHeight);
        yOffset += pageHeight;
      }

      const clientName = clients.find(c => c._id === selectedClient)?.companyName || 'Report';
      pdf.save(`Sociapa-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { console.error('PDF export error:', err); alert('PDF export failed. Please try again.'); }
    finally { setExporting(false); }
  };

  const client = clients.find(c => c._id === selectedClient);
  const fmt = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div style={{ padding: '24px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>📄 Branded PDF Report Builder</h1>
        <p style={{ margin: '6px 0 0', color: '#718096' }}>Customise, preview, and export a branded Sociapa report as PDF</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* ── CONTROLS PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Client */}
          <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 12, color: '#4a5568' }}>📌 Report Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Client</label>
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', fontSize: '0.88rem' }}>
                  <option value="">— Select Client —</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Report Title</label>
                <input value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Date Range Note</label>
                <input placeholder="e.g. January 2026" value={dateRange} onChange={e => setDateRange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--card-border,#e2e8f0)', background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 12, color: '#4a5568' }}>📑 Report Sections</div>
            {SECTIONS.map(s => (
              <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color,#f0f0f0)' }}>
                <input type="checkbox" checked={!!sections[s.key]} onChange={e => setSections(p => ({ ...p, [s.key]: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#667eea', cursor: 'pointer' }} />
                {s.label}
              </label>
            ))}
          </div>

          {/* Export Button */}
          <button onClick={exportPDF} disabled={!selectedClient || exporting || loading}
            style={{
              padding: '14px', borderRadius: 12, border: 'none',
              background: (!selectedClient || exporting) ? '#e2e8f0' : 'linear-gradient(135deg,#667eea,#764ba2)',
              color: (!selectedClient || exporting) ? '#a0aec0' : '#fff',
              fontWeight: 800, fontSize: '1rem', cursor: selectedClient && !exporting ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', boxShadow: selectedClient && !exporting ? '0 4px 15px rgba(102,126,234,0.4)' : 'none',
            }}>
            {exporting ? '⏳ Generating PDF...' : '📥 Export PDF'}
          </button>

          {!selectedClient && (
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a0aec0' }}>Select a client to enable export</div>
          )}
        </div>

        {/* ── PREVIEW PANEL ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4a5568' }}>👁 Live Preview</span>
            <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>A4 format · 794×1123px</span>
          </div>

          {/* A4 Preview Paper */}
          <div style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div ref={previewRef} style={{ width: 794, background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: 1123 }}>
              {/* PDF Header */}
              <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '36px 48px', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Sociapa</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Ads Intelligence Dashboard</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    {dateRange && <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{dateRange}</div>}
                  </div>
                </div>
                <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 18 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{reportTitle}</div>
                  <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{client?.companyName || '— Select a client —'}</div>
                </div>
              </div>

              {/* PDF Body */}
              <div style={{ padding: '32px 48px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#a0aec0' }}>⏳ Loading client data…</div>
                ) : !selectedClient ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#cbd5e0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                    <div style={{ fontWeight: 700, color: '#a0aec0' }}>Select a client to preview the report</div>
                  </div>
                ) : !clientData ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#a0aec0' }}>No campaign data found for this client yet.</div>
                ) : (
                  <>
                    {/* KPIs */}
                    {sections.kpis && (
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#667eea', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>📊 Key Performance Indicators</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                          {[
                            { label: 'Total Spend', value: fmt(clientData.spend), color: '#667eea' },
                            { label: 'Impressions', value: (clientData.impressions||0).toLocaleString(), color: '#43e97b' },
                            { label: 'Clicks', value: (clientData.clicks||0).toLocaleString(), color: '#f093fb' },
                            { label: 'Conversions', value: (clientData.conversions||0).toLocaleString(), color: '#4facfe' },
                            { label: 'CTR', value: `${clientData.ctr||0}%`, color: '#fa709a' },
                            { label: 'CPC', value: fmt(clientData.cpc), color: '#fee140' },
                            { label: 'CPM', value: fmt(clientData.cpm), color: '#30cfd0' },
                            { label: 'Campaigns', value: clientData.campaignCount||0, color: '#a18dfa' },
                          ].map(kpi => (
                            <div key={kpi.label} style={{ background: '#f8f9ff', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${kpi.color}` }}>
                              <div style={{ fontSize: 10, color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: '#2d3748', marginTop: 4 }}>{kpi.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ROAS */}
                    {sections.roas && (
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#667eea', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>💰 ROAS & ROI Analysis</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {[
                            { label: 'Est. Revenue (2.5x multiplier)', value: fmt((clientData.spend||0)*2.5), color: '#43e97b' },
                            { label: 'ROAS', value: `${clientData.spend > 0 ? ((clientData.spend*2.5)/clientData.spend).toFixed(2) : '0.00'}x`, color: '#43e97b' },
                            { label: 'ROI', value: `${clientData.spend > 0 ? (((clientData.spend*2.5-clientData.spend)/clientData.spend)*100).toFixed(1) : '0.0'}%`, color: '#4facfe' },
                            { label: 'CPA', value: fmt(clientData.cpa), color: '#f093fb' },
                          ].map(kpi => (
                            <div key={kpi.label} style={{ background: '#f8f9ff', borderRadius: 8, padding: '14px 18px', borderLeft: `3px solid ${kpi.color}` }}>
                              <div style={{ fontSize: 10, color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</div>
                              <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, marginTop: 4 }}>{kpi.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Platform Breakdown */}
                    {sections.platform && clientData.platforms && (
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#667eea', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>📋 Cross-Platform Breakdown</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: '#f8f9ff' }}>
                              {['Platform', 'Spend', 'Impressions', 'Clicks', 'CTR', 'CPM', 'Share'].map(h => (
                                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Platform' ? 'left' : 'right', fontWeight: 700, color: '#718096', textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {clientData.platforms.map((p, i) => (
                              <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 700 }}>
                                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.color, marginRight: 6 }} />
                                  {p.platform}
                                </td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(p.spend)}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{(p.impressions||0).toLocaleString()}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{(p.clicks||0).toLocaleString()}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{p.ctr?.toFixed(2)||'0.00'}%</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(p.cpm)}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700 }}>{p.share?.toFixed(1)||'0.0'}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Budget Pacing */}
                    {sections.budget && clientData.budgets && (
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#667eea', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>🚦 Budget Pacing Status</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {clientData.budgets.map((b, i) => {
                            const pct = b.budget > 0 ? Math.min((b.spent / b.budget) * 100, 100) : 0;
                            const color = pct >= 100 ? '#f5576c' : pct >= 85 ? '#f6c90e' : '#43e97b';
                            return (
                              <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                                  <span style={{ fontWeight: 700 }}>{b.platform}</span>
                                  <span style={{ color: '#718096' }}>{fmt(b.spent)} / {fmt(b.budget)} — <b style={{ color }}>{pct.toFixed(1)}%</b></span>
                                </div>
                                <div style={{ background: '#f0f0f0', borderRadius: 99, height: 8 }}>
                                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* PDF Footer */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#a0aec0' }}>
                  <span>Generated by <strong>Sociapa Ads Dashboard</strong></span>
                  <span>Confidential · For internal use only</span>
                  <span>{new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
