'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

export default function ClientPortalDashboard() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Verify we're a client user
        fetch('/api/auth/verify').then(r => r.json()).then(d => {
            if (!d.authenticated) {
                router.push('/client-portal/login');
                return;
            }
            if (d.role !== 'client') {
                router.push('/');
                return;
            }
            setUser(d);
            fetchClientData(d.clientId);
        });
    }, []);

    const fetchClientData = async (clientId) => {
        if (!clientId) { setLoading(false); return; }
        const r = await fetch('/api/analytics/clients');
        const d = await r.json();
        const myData = (d.clients || []).find(c => c.id === clientId);
        setData(myData || null);
        setLoading(false);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/client-portal/login');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card text-center p-5">
                    <i className="feather-inbox" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                    <h5 className="mt-3 text-muted">No campaign data yet</h5>
                    <p className="text-muted">Your account manager will upload campaign data soon.</p>
                    <button className="btn btn-outline-danger mt-2" onClick={handleLogout}>Logout</button>
                </div>
            </div>
        );
    }

    const kpis = [
        { label: 'Total Spend', value: `₹${data.spend?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#667eea', icon: 'feather-dollar-sign' },
        { label: 'Impressions', value: data.impressions?.toLocaleString(), color: '#43e97b', icon: 'feather-eye' },
        { label: 'Clicks', value: data.clicks?.toLocaleString(), color: '#f093fb', icon: 'feather-mouse-pointer' },
        { label: 'CPC (₹)', value: `₹${data.cpc}`, color: '#4facfe', icon: 'feather-trending-down' },
        { label: 'CPM (₹)', value: `₹${data.cpm}`, color: '#fa709a', icon: 'feather-bar-chart' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '16px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                        {data.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                        <h6 className="mb-0 text-white fw-bold">{data.name}</h6>
                        <small style={{ color: 'rgba(255,255,255,0.75)' }}>Campaign Performance Portal</small>
                    </div>
                </div>
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 8 }} onClick={handleLogout}>
                    <i className="feather-log-out me-1" />Logout
                </button>
            </header>

            <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
                {/* KPI Cards */}
                <div className="row g-3 mb-4">
                    {kpis.map(kpi => (
                        <div key={kpi.label} className="col-md col-6">
                            <div className="card" style={{ borderBottom: `4px solid ${kpi.color}` }}>
                                <div className="card-body py-3 text-center">
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${kpi.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                        <i className={kpi.icon} style={{ color: kpi.color, fontSize: '0.9rem' }} />
                                    </div>
                                    <h5 className="mb-0 fw-bold">{kpi.value}</h5>
                                    <small className="text-muted">{kpi.label}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Spend Chart */}
                {data.timeline?.length > 0 && (
                    <div className="row g-4">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header">
                                    <h6 className="mb-0 fw-bold">Spend Over Time</h6>
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={data.timeline}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip formatter={v => `₹${v?.toLocaleString('en-IN')}`} />
                                            <Line type="monotone" dataKey="spend" stroke="#667eea" strokeWidth={2.5} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-header"><h6 className="mb-0 fw-bold">Daily Clicks</h6></div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={data.timeline.slice(-14)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 8 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="clicks" fill="#43e97b" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-center text-muted mt-4" style={{ fontSize: '0.8rem' }}>
                    Powered by <strong>Sociapa Ads Dashboard</strong> · Report generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
}
