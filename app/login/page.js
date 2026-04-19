'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(username, password);
    if (result.success) {
      router.push('/analytics/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = (u, p) => { setUsername(u); setPassword(p); };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Left Brand Panel */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="login-brand-panel"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(102,126,234,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(118,75,162,0.10)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 20px 40px rgba(102,126,234,0.4)',
          }}>
            <i className="feather-bar-chart-2" style={{ color: 'white', fontSize: '2rem' }} />
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, margin: 0 }}>Sociapa</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0', fontSize: '0.95rem', fontWeight: 400 }}>
            Ads Intelligence Hub
          </p>
        </div>

        {/* Feature list */}
        <div style={{ marginTop: 56, zIndex: 1, width: '100%', maxWidth: 320 }}>
          {[
            { icon: 'feather-activity', label: 'Real-time campaign analytics' },
            { icon: 'feather-bar-chart-2', label: 'ROAS & ROI tracking' },
            { icon: 'feather-users', label: 'Multi-client management' },
            { icon: 'feather-file-text', label: 'Branded PDF reports' },
            { icon: 'feather-moon', label: 'Dark / Light mode' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0',
              borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(102,126,234,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={f.icon} style={{ color: '#a78bfa', fontSize: '0.9rem' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>{f.label}</span>
            </div>
          ))}
        </div>

        <p style={{ position: 'absolute', bottom: 24, color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', zIndex: 1 }}>
          © 2026 Sociapa · All rights reserved
        </p>
      </div>

      {/* Right Login Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f8fc',
        padding: '40px 32px',
      }}
        className="login-form-panel"
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a202c', margin: 0 }}>Welcome back</h2>
            <p style={{ color: '#718096', marginTop: 8, fontSize: '0.95rem' }}>Sign in to your dashboard</p>
          </div>

          {/* Demo credentials box */}
          <div style={{
            background: 'linear-gradient(135deg, #ebf4ff 0%, #f0ebff 100%)',
            border: '1px solid #c3dafe',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5a67d8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔑 Demo Credentials
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Super Admin', u: 'admin', p: 'sociapa' },
              ].map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => fillDemo(d.u, d.p)}
                  style={{
                    background: 'white', border: '1px solid #c3dafe', borderRadius: 8,
                    padding: '6px 12px', cursor: 'pointer', fontSize: '0.78rem',
                    color: '#4c51bf', fontWeight: 600, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#667eea'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  {d.label}: <code style={{ color: '#5a67d8' }}>{d.u} / {d.p}</code>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20, color: '#c53030',
              fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="feather-alert-circle" style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <i className="feather-user" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#a0aec0', fontSize: '0.9rem', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    border: '2px solid #e2e8f0', borderRadius: 10,
                    fontSize: '0.95rem', outline: 'none', background: 'white',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="feather-lock" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#a0aec0', fontSize: '0.9rem', pointerEvents: 'none',
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%', padding: '12px 44px 12px 42px',
                    border: '2px solid #e2e8f0', borderRadius: 10,
                    fontSize: '0.95rem', outline: 'none', background: 'white',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#a0aec0', padding: 0, lineHeight: 1,
                  }}
                >
                  <i className={showPass ? 'feather-eye-off' : 'feather-eye'} style={{ fontSize: '0.9rem' }} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '0.3px',
                boxShadow: loading ? 'none' : '0 8px 20px rgba(102,126,234,0.4)',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : '→ Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a href="/client-portal/login" style={{ color: '#667eea', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
              Client? Access your portal →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
          .login-form-panel { padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  );
}
