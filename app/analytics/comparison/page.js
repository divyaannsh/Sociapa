'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

export default function ComparisonPage() {
    const [clients, setClients] = useState([]);
    const [allData, setAllData] = useState([]);
    const [clientA, setClientA] = useState('');
    const [clientB, setClientB] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/analytics/clients')
            .then(r => r.json())
            .then(d => {
                setClients(d.clients || []);
                setAllData(d.clients || []);
                if (d.clients?.length >= 2) {
                    setClientA(d.clients[0].id);
                    setClientB(d.clients[1].id);
                } else if (d.clients?.length === 1) {
                    setClientA(d.clients[0].id);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const dataA = allData.find(c => c.id === clientA);
    const dataB = allData.find(c => c.id === clientB);

    const kpis = [
        { key: 'spend', label: 'Total Spend (₹)', format: v => `₹${v?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}` },
        { key: 'impressions', label: 'Impressions', format: v => v?.toLocaleString() || 0 },
        { key: 'clicks', label: 'Clicks', format: v => v?.toLocaleString() || 0 },
        { key: 'cpc', label: 'CPC (₹)', format: v => `₹${v?.toFixed(2) || 0}` },
        { key: 'cpm', label: 'CPM (₹)', format: v => `₹${v?.toFixed(2) || 0}` },
    ];

    // Build comparison chart data
    const barData = kpis.map(kpi => ({
        metric: kpi.label,
        [dataA?.name || 'Client A']: dataA?.[kpi.key] || 0,
        [dataB?.name || 'Client B']: dataB?.[kpi.key] || 0,
    }));

    // Build timeline comparison
    const allDates = new Set([
        ...(dataA?.timeline || []).map(t => t.date),
        ...(dataB?.timeline || []).map(t => t.date),
    ]);
    const timelineData = [...allDates].sort().map(date => {
        const a = dataA?.timeline?.find(t => t.date === date);
        const b = dataB?.timeline?.find(t => t.date === date);
        return {
            date,
            [`${dataA?.name || 'A'} Spend`]: a?.spend || 0,
            [`${dataB?.name || 'B'} Spend`]: b?.spend || 0,
        };
    });

    if (loading) {
        return (
            <div className="main-content">
                <PageHeader title="Comparison Mode" breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Comparison', path: '/analytics/comparison' }]} />
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <PageHeader
                title="Comparison Mode"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Analytics', path: '/analytics/dashboard' }, { label: 'Comparison' }]}
            />

            {/* Client Selectors */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card" style={{ borderTop: '4px solid #667eea' }}>
                        <div className="card-body">
                            <label className="form-label fw-semibold">Client A</label>
                            <select className="form-select" value={clientA} onChange={e => setClientA(e.target.value)}>
                                <option value="">-- Select --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card" style={{ borderTop: '4px solid #f093fb' }}>
                        <div className="card-body">
                            <label className="form-label fw-semibold">Client B</label>
                            <select className="form-select" value={clientB} onChange={e => setClientB(e.target.value)}>
                                <option value="">-- Select --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {(dataA || dataB) && (
                <div className="row g-3 mb-4">
                    {kpis.map(kpi => (
                        <div key={kpi.key} className="col-md">
                            <div className="card text-center">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</p>
                                    <div className="d-flex justify-content-around">
                                        <div>
                                            <div className="fw-bold" style={{ color: '#667eea' }}>{kpi.format(dataA?.[kpi.key])}</div>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{dataA?.name || '—'}</small>
                                        </div>
                                        <div style={{ borderLeft: '1px solid #e2e8f0', margin: '0 8px' }} />
                                        <div>
                                            <div className="fw-bold" style={{ color: '#f093fb' }}>{kpi.format(dataB?.[kpi.key])}</div>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{dataB?.name || '—'}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bar Comparison Chart */}
            {dataA && dataB && (
                <div className="row g-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold">KPI Comparison</h6>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip formatter={v => v?.toLocaleString('en-IN')} />
                                        <Legend />
                                        <Bar dataKey={dataA.name} fill="#667eea" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey={dataB.name} fill="#f093fb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {timelineData.length > 0 && (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h6 className="mb-0 fw-bold">Spend Timeline Comparison</h6>
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={timelineData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip formatter={v => `₹${v?.toLocaleString('en-IN')}`} />
                                            <Legend />
                                            <Line type="monotone" dataKey={`${dataA.name} Spend`} stroke="#667eea" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey={`${dataB.name} Spend`} stroke="#f093fb" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {clients.length < 2 && (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <i className="feather-bar-chart-2" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                        <h5 className="mt-3 text-muted">Need at least 2 clients</h5>
                        <p className="text-muted">Add more clients to enable side-by-side comparison.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
