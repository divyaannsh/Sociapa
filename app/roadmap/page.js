'use client';

import Link from 'next/link';

const weeks = [
  {
    week: 'Week 1',
    days: 'Days 1–7',
    title: 'Quick Wins & Auth',
    subtitle: 'Foundation sprint',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    status: 'completed',
    features: [
      { emoji: '🔐', name: 'Client-Specific Logins', desc: 'MongoDB + bcryptjs isolated views per client', status: 'done' },
      { emoji: '🌙', name: 'Dark / Light Mode Toggle', desc: 'User-facing switch with persisted preference', status: 'done' },
      { emoji: '📧', name: 'Weekly Email Snapshots', desc: 'nodemailer basic Monday-morning digest', status: 'done' },
      { emoji: '🧱', name: 'RBAC Structure', desc: 'Admin / Manager / Viewer role schema', status: 'done' },
    ],
  },
  {
    week: 'Week 2',
    days: 'Days 8–14',
    title: 'Live API Connections',
    subtitle: 'Data pipeline build',
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    status: 'upcoming',
    features: [
      { emoji: '📘', name: 'Meta Graph API', desc: 'Fetch FB & Instagram campaign spend & engagement', status: 'pending' },
      { emoji: '🔍', name: 'Google Ads API', desc: 'Sync search, display & YouTube performance', status: 'pending' },
      { emoji: '🔗', name: 'LinkedIn Marketing API', desc: 'B2B campaign data pull', status: 'pending' },
      { emoji: '⏰', name: 'Nightly Cron Jobs', desc: 'Auto-sync all platforms, no manual uploads', status: 'pending' },
    ],
  },
  {
    week: 'Week 3',
    days: 'Days 15–21',
    title: 'Advanced Analytics',
    subtitle: 'Intelligence layer',
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    status: 'upcoming',
    features: [
      { emoji: '💰', name: 'ROAS & ROI Tracking', desc: 'Revenue integration for true return metrics', status: 'pending' },
      { emoji: '🎯', name: 'CPA Dashboard', desc: 'Cost-per-acquisition across all platforms', status: 'pending' },
      { emoji: '🚦', name: 'Budget Pacing Bars', desc: 'Visual alerts when campaigns overspend', status: 'pending' },
      { emoji: '📊', name: 'Cross-Platform Grid', desc: 'Side-by-side platform performance comparison', status: 'pending' },
    ],
  },
  {
    week: 'Week 4',
    days: 'Days 22–30',
    title: 'Reports & Polish',
    subtitle: 'Delivery & delight',
    color: '#4facfe',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    status: 'upcoming',
    features: [
      { emoji: '📄', name: 'Branded PDF Reports', desc: 'Custom Sociapa report builder & instant export', status: 'pending' },
      { emoji: '📅', name: 'Scheduled Email Reports', desc: 'Monthly & weekly HTML/PDF to clients', status: 'pending' },
      { emoji: '📱', name: 'PWA Support', desc: 'Installable on mobile like a native app', status: 'pending' },
      { emoji: '✏️', name: 'Chart Annotations', desc: 'Leave notes on spikes — "Holiday sale started"', status: 'pending' },
    ],
  },
];

const statusConfig = {
  done:    { label: 'Completed', bg: 'rgba(67,233,123,0.15)', color: '#2f9e5f', border: 'rgba(67,233,123,0.35)' },
  pending: { label: 'Upcoming',  bg: 'rgba(160,174,192,0.1)', color: '#718096', border: 'rgba(160,174,192,0.2)' },
};

export default function RoadmapPage() {
  const totalFeatures = weeks.reduce((s, w) => s + w.features.length, 0);
  const doneFeatures  = weeks.reduce((s, w) => s + w.features.filter(f => f.status === 'done').length, 0);
  const progress = Math.round((doneFeatures / totalFeatures) * 100);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              30-Day Sprint Roadmap
            </h1>
            <p style={{ margin: '6px 0 0', color: '#718096', fontSize: '0.95rem' }}>
              5 Phases · 16 Features · 4 Weeks · Sociapa Ads Dashboard
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Overall Progress</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#667eea' }}>{progress}%</div>
            </div>
            <div style={{ width: 72, height: 72, position: 'relative' }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 72, height: 72 }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#pg)" strokeWidth="2.5"
                  strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#667eea' }}>
                {doneFeatures}/{totalFeatures}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 20, background: '#e2e8f0', borderRadius: 99, height: 6 }}>
          <div style={{ width: `${progress}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(135deg, #667eea, #764ba2)', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Weeks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {weeks.map((week) => (
          <div key={week.week} style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--card-border, #e2e8f0)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
          >
            {/* Week Header */}
            <div style={{ background: week.gradient, padding: '20px 22px 16px', position: 'relative' }}>
              {week.status === 'completed' && (
                <span style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  ✓ DONE
                </span>
              )}
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                {week.week} · {week.days}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{week.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{week.subtitle}</div>

              {/* Mini progress dots */}
              <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
                {week.features.map((f, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: f.status === 'done' ? '#fff' : 'rgba(255,255,255,0.3)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            </div>

            {/* Features List */}
            <div style={{ padding: '12px 0' }}>
              {week.features.map((feature, idx) => {
                const sc = statusConfig[feature.status];
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '11px 20px',
                    borderBottom: idx < week.features.length - 1 ? '1px solid var(--border-color, #f0f0f0)' : 'none',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, #f8f9ff)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '1.3rem', lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{feature.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary, #2d3748)' }}>{feature.name}</span>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                          textTransform: 'uppercase', letterSpacing: 0.7, flexShrink: 0,
                        }}>
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-muted, #718096)', lineHeight: 1.45 }}>{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 28, textAlign: 'center', fontSize: '0.8rem', color: '#a0aec0' }}>
        Sociapa Ads Dashboard · 30-Day Sprint Plan · Updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
}
