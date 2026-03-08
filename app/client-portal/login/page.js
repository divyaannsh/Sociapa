'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientPortalLogin() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const r = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const d = await r.json();
        if (r.ok && d.role === 'client') {
            router.push('/client-portal');
        } else if (r.ok && d.role !== 'client') {
            setError('This is the client portal. Please use the main login for admin access.');
        } else {
            setError(d.message || 'Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #fa709a 100%)',
                padding: 20,
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 420,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 20,
                    padding: '40px 36px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
            >
                <div className="text-center mb-4">
                    <div
                        style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}
                    >
                        <i className="feather-user" style={{ color: 'white', fontSize: '1.5rem' }} />
                    </div>
                    <h4 style={{ fontWeight: 800, color: '#2d3748' }}>Client Portal</h4>
                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>View your campaign performance</p>
                </div>

                {error && (
                    <div className="alert alert-danger mb-3" style={{ fontSize: '0.85rem' }}>
                        <i className="feather-alert-circle me-2" />{error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.username}
                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                            required
                            placeholder="your-username"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2" style={{ borderRadius: 10, fontSize: '1rem', fontWeight: 600 }} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm" /> : 'Sign In to Portal'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/login" style={{ color: '#667eea', fontSize: '0.85rem', textDecoration: 'none' }}>
                        Admin? Login here →
                    </a>
                </div>
            </div>
        </div>
    );
}
