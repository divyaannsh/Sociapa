'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

const PLATFORMS = [
  {
    key: 'meta',
    name: 'Meta Ads',
    icon: '📘',
    color: '#1877f2',
    description: 'Facebook & Instagram campaign data via Graph API',
    docsUrl: 'https://developers.facebook.com/docs/marketing-api',
    fields: [
      { key: 'appId',       label: 'App ID',        placeholder: '1234567890', secret: false },
      { key: 'appSecret',   label: 'App Secret',    placeholder: '••••••abc123', secret: true },
      { key: 'accessToken', label: 'Access Token',  placeholder: 'EAA...long token', secret: true },
      { key: 'adAccountId', label: 'Ad Account ID', placeholder: 'act_1234567890', secret: false },
    ],
  },
  {
    key: 'google',
    name: 'Google Ads',
    icon: '🔍',
    color: '#ea4335',
    description: 'Search, Display & YouTube performance via Google Ads API',
    docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
    fields: [
      { key: 'customerId',   label: 'Customer ID',    placeholder: '1234567890 (no dashes)', secret: false },
      { key: 'devToken',     label: 'Developer Token', placeholder: '••••••xyz', secret: true },
      { key: 'clientId',     label: 'OAuth Client ID', placeholder: 'xxx.apps.googleusercontent.com', secret: false },
      { key: 'clientSecret', label: 'Client Secret',   placeholder: 'GOCSPX-...', secret: true },
      { key: 'refreshToken', label: 'Refresh Token',   placeholder: '1//0g...', secret: true },
    ],
  },
  {
    key: 'linkedin',
    name: 'LinkedIn Ads',
    icon: '🔗',
    color: '#0a66c2',
    description: 'B2B campaign data via LinkedIn Marketing API',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
    fields: [
      { key: 'clientId',     label: 'Client ID',      placeholder: '86abc...', secret: false },
      { key: 'clientSecret', label: 'Client Secret',  placeholder: '••••••def', secret: true },
      { key: 'accessToken',  label: 'Access Token',   placeholder: 'AQV...', secret: true },
      { key: 'adAccountId',  label: 'Ad Account ID',  placeholder: 'urn:li:sponsoredAccount:12345678', secret: false },
    ],
  },
];

const STATUS_CONFIG = {
  connected:     { color: '#43e97b', bg: '#43e97b18', label: '🟢 Connected' },
  configured:    { color: '#f6c90e', bg: '#f6c90e18', label: '🟡 Configured' },
  error:         { color: '#f5576c', bg: '#f5576c18', label: '🔴 Error' },
  not_connected: { color: '#a0aec0', bg: '#a0aec018', label: '⚪ Not Connected' },
};

export default function IntegrationsPage() {
  const { isSuperAdmin } = useAuth();
  const router = useRouter();

  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [forms, setForms]               = useState({});
  const [saving, setSaving]             = useState({});
  const [testing, setTesting]           = useState({});
  const [testResults, setTestResults]   = useState({});
  const [syncing, setSyncing]           = useState(false);
  const [syncResult, setSyncResult]     = useState(null);
  const [syncStatus, setSyncStatus]     = useState(null);
  const [openPanel, setOpenPanel]       = useState(null);

  useEffect(() => {
    if (isSuperAdmin && !isSuperAdmin()) { router.push('/'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intRes, statusRes] = await Promise.all([
        fetch('/api/integrations').then(r => r.json()),
        fetch('/api/sync').then(r => r.json()),
      ]);
      setIntegrations(intRes.integrations || {});
      setSyncStatus(statusRes);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSave = async (platformKey) => {
    setSaving(p => ({ ...p, [platformKey]: true }));
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformKey, credentials: forms[platformKey] || {} }),
      });
      const d = await res.json();
      if (res.ok) {
        await loadData();
        setOpenPanel(null);
      } else {
        alert(d.message || 'Save failed');
      }
    } catch {}
    finally { setSaving(p => ({ ...p, [platformKey]: false })); }
  };

  const handleTest = async (platformKey) => {
    setTesting(p => ({ ...p, [platformKey]: true }));
    setTestResults(p => ({ ...p, [platformKey]: null }));
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformKey }),
      });
      const d = await res.json();
      setTestResults(p => ({ ...p, [platformKey]: d }));
    } catch (err) {
      setTestResults(p => ({ ...p, [platformKey]: { valid: false, error: err.message } }));
    }
    finally { setTesting(p => ({ ...p, [platformKey]: false })); }
  };

  const handleSyncNow = async () => {
    setSyncing(true); setSyncResult(null);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const d = await res.json();
      setSyncResult(d);
      await loadData();
    } catch (err) { setSyncResult({ success: false, error: err.message }); }
    finally { setSyncing(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center', color: '#a0aec0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⚡</div>
        <div style={{ fontWeight: 700 }}>Loading integrations...</div>
      </div>
    </div>
  );

  const connectedCount = PLATFORMS.filter(p =>
    (integrations?.[p.key]?.status === 'connected' || integrations?.[p.key]?.status === 'configured')
  ).length;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900 }}>⚡ API Integrations</h1>
          <p style={{ margin: '6px 0 0', color: '#718096' }}>
            Connect Meta, Google Ads, and LinkedIn for automated nightly data sync
            {connectedCount > 0 && (
              <span style={{ marginLeft: 10, background: '#43e97b', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {connectedCount}/3 Connected
              </span>
            )}
          </p>
        </div>
        <button onClick={handleSyncNow} disabled={syncing || connectedCount === 0}
          style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: connectedCount === 0 ? '#e2e8f0' : 'linear-gradient(135deg,#667eea,#764ba2)',
            color: connectedCount === 0 ? '#a0aec0' : '#fff',
            fontWeight: 800, fontSize: '0.9rem', cursor: connectedCount > 0 ? 'pointer' : 'not-allowed',
            boxShadow: connectedCount > 0 ? '0 4px 15px rgba(102,126,234,0.35)' : 'none',
            transition: 'all 0.2s',
          }}>
          {syncing ? '⏳ Syncing...' : '🔄 Sync All Now'}
        </button>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20,
          background: syncResult.success ? '#43e97b18' : '#f5576c18',
          border: `1px solid ${syncResult.success ? '#43e97b40' : '#f5576c40'}`,
          color: syncResult.success ? '#2f9e5f' : '#f5576c',
          fontWeight: 600, fontSize: '0.88rem',
        }}>
          {syncResult.success ? (
            <>
              ✅ Sync completed · {[
                syncResult.results?.meta   && `Meta: ${syncResult.results.meta.rows} rows`,
                syncResult.results?.google && `Google: ${syncResult.results.google.rows} rows`,
                syncResult.results?.linkedin && `LinkedIn: ${syncResult.results.linkedin.rows} rows`,
              ].filter(Boolean).join(' · ') || 'No platforms with active connections'}
              {Object.keys(syncResult.errors || {}).length > 0 && (
                <div style={{ marginTop: 6, fontWeight: 400 }}>
                  ⚠️ Errors: {Object.entries(syncResult.errors).map(([k,v]) => `${k}: ${v}`).join(' · ')}
                </div>
              )}
            </>
          ) : `❌ Sync failed: ${syncResult.error}`}
        </div>
      )}

      {/* Platform Cards */}
      <div style={{ display: 'grid', gap: 20 }}>
        {PLATFORMS.map(platform => {
          const info   = integrations?.[platform.key] || {};
          const status = info.status || 'not_connected';
          const st     = STATUS_CONFIG[status] || STATUS_CONFIG.not_connected;
          const isOpen = openPanel === platform.key;
          const syncSt = syncStatus?.[platform.key] || {};

          return (
            <div key={platform.key} style={{
              background: 'var(--card-bg,#fff)',
              border: `1px solid var(--card-border,#e2e8f0)`,
              borderLeft: `4px solid ${platform.color}`,
              borderRadius: 16, overflow: 'hidden',
              transition: 'box-shadow 0.2s',
              boxShadow: isOpen ? '0 8px 32px rgba(0,0,0,0.1)' : 'none',
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${platform.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {platform.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{platform.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: 2 }}>{platform.description}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Status badge */}
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>

                  {/* Last synced */}
                  {syncSt.lastSynced && (
                    <span style={{ fontSize: '0.72rem', color: '#a0aec0' }}>
                      Last sync: {new Date(syncSt.lastSynced).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}

                  {/* Test button */}
                  {(status === 'connected' || status === 'configured') && (
                    <button onClick={() => handleTest(platform.key)} disabled={testing[platform.key]}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${platform.color}40`, background: `${platform.color}10`, color: platform.color, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      {testing[platform.key] ? '⏳ Testing...' : '🔌 Test'}
                    </button>
                  )}

                  {/* Configure / Edit toggle */}
                  <button onClick={() => {
                    setOpenPanel(isOpen ? null : platform.key);
                    if (!isOpen) {
                      setForms(p => ({ ...p, [platform.key]: {} }));
                      setTestResults(p => ({ ...p, [platform.key]: null }));
                    }
                  }}
                    style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: isOpen ? '#f0f0f0' : platform.color, color: isOpen ? '#4a5568' : '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {isOpen ? '✕ Close' : status === 'not_connected' ? '+ Configure' : '✏️ Edit'}
                  </button>
                </div>
              </div>

              {/* Test Result */}
              {testResults[platform.key] && (
                <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border-color,#f0f0f0)' }}>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 600,
                    color: testResults[platform.key].valid ? '#2f9e5f' : '#f5576c',
                  }}>
                    {testResults[platform.key].valid
                      ? `✅ Connected as: ${testResults[platform.key].name}`
                      : `❌ ${testResults[platform.key].error}`}
                  </span>
                </div>
              )}

              {/* Error display */}
              {syncSt.lastError && (
                <div style={{ padding: '8px 24px', borderTop: '1px solid var(--border-color,#f0f0f0)', background: '#f5576c08' }}>
                  <span style={{ fontSize: '0.78rem', color: '#f5576c' }}>⚠️ Last error: {syncSt.lastError}</span>
                </div>
              )}

              {/* Credential Form */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border-color,#f0f0f0)', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Credentials</div>
                    <a href={platform.docsUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: platform.color, textDecoration: 'none', fontWeight: 600 }}>
                      📖 View API Docs ↗
                    </a>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    {platform.fields.map(field => (
                      <div key={field.key}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>
                          {field.label} {field.secret && <span style={{ color: '#a0aec0', fontWeight: 400 }}>(encrypted)</span>}
                        </label>
                        <input
                          type={field.secret ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={forms[platform.key]?.[field.key] || ''}
                          onChange={e => setForms(p => ({
                            ...p,
                            [platform.key]: { ...p[platform.key], [field.key]: e.target.value }
                          }))}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: 8, boxSizing: 'border-box',
                            border: `1px solid var(--card-border,#e2e8f0)`,
                            background: 'var(--card-bg,#fff)', color: 'var(--text-primary,#2d3748)',
                            fontSize: '0.88rem', fontFamily: field.secret ? 'monospace' : 'inherit',
                            outline: 'none', transition: 'border 0.2s',
                          }}
                          onFocus={e => e.target.style.borderColor = platform.color}
                          onBlur={e => e.target.style.borderColor = 'var(--card-border,#e2e8f0)'}
                        />
                        {info[field.key] && !forms[platform.key]?.[field.key] && (
                          <div style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: 3 }}>
                            Current: {info[field.key]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color,#f0f0f0)' }}>
                    <button onClick={() => handleSave(platform.key)} disabled={saving[platform.key]}
                      style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${platform.color}, ${platform.color}bb)`, color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', opacity: saving[platform.key] ? 0.7 : 1 }}>
                      {saving[platform.key] ? '💾 Saving...' : '💾 Save Credentials'}
                    </button>
                    <button onClick={() => setOpenPanel(null)}
                      style={{ padding: '10px 20px', borderRadius: 9, border: '1px solid var(--card-border,#e2e8f0)', background: 'transparent', color: '#718096', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                  <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#a0aec0' }}>
                    🔒 Sensitive fields are base64-encoded before storage. Use environment variables for production.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nightly Cron Info */}
      <div style={{ marginTop: 28, background: 'var(--card-bg,#fff)', border: '1px solid var(--card-border,#e2e8f0)', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>⏰</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>Nightly Auto-Sync</div>
            <div style={{ fontSize: '0.82rem', color: '#718096', lineHeight: 1.7 }}>
              Auto-sync runs daily at <b>2:00 AM IST</b> via Vercel Cron (endpoint: <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: 4, fontSize: '0.78rem' }}>/api/cron/nightly-sync</code>).
              Set <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: 4, fontSize: '0.78rem' }}>CRON_SECRET</code> in your environment variables to secure this endpoint.
              Add to <b>vercel.json</b>:
            </div>
            <pre style={{ background: '#1a1a2e', color: '#43e97b', borderRadius: 8, padding: '12px 16px', fontSize: '0.78rem', marginTop: 10, overflowX: 'auto' }}>
{`{
  "crons": [{
    "path": "/api/cron/nightly-sync",
    "schedule": "30 20 * * *"
  }]
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
