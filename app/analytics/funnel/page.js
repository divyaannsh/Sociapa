'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell } from 'recharts';

const COLORS = ['#667eea', '#43e97b', '#f093fb', '#4facfe'];

export default function FunnelAnalysisPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClientId, setSelectedClientId] = useState('all');

    useEffect(() => {
        setLoading(true);
        fetch('/api/analytics/clients')
            .then(r => r.json())
            .then(d => {
                setClients(d.clients || []);
                if (d.clients?.length > 0) setSelectedClientId('all');
            })
            .finally(() => setLoading(false));
    }, []);

    // Aggregate data for selected client(s)
    const getMetrics = () => {
        const data = selectedClientId === 'all' ? clients : clients.filter(c => c.id === selectedClientId);
        return data.reduce((acc, c) => ({
            impressions: acc.impressions + (c.impressions || 0),
            clicks: acc.clicks + (c.clicks || 0),
            spend: acc.spend + (c.spend || 0),
        }), { impressions: 0, clicks: 0, spend: 0 });
    };

    const metrics = getMetrics();
    const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : 0;

    const funnelData = [
        { name: 'Impressions', value: metrics.impressions, fill: '#667eea' },
        { name: 'Clicks', value: metrics.clicks, fill: '#43e97b' },
        { name: 'CTR%', value: parseFloat(ctr), fill: '#f093fb' },
    ];

    const barData = clients.map((c, i) => ({
        name: c.name?.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
        Impressions: c.impressions || 0,
        Clicks: c.clicks || 0,
        Spend: c.spend || 0,
    }));

    return (
        <div className="main-content">
            <PageHeader
                title="Funnel Analysis"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Analytics', path: '/analytics/dashboard' }, { label: 'Funnel' }]}
            />

            {/* Client Select */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body py-3">
                            <label className="form-label fw-semibold mb-1">Client</label>
                            <select className="form-select" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                                <option value="all">All Clients</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
                <div className="row g-4">
                    {/* KPI Row */}
                    <div className="col-12">
                        <div className="row g-3">
                            {[
                                { label: 'Impressions', value: metrics.impressions.toLocaleString(), color: '#667eea', icon: 'feather-eye' },
                                { label: 'Clicks', value: metrics.clicks.toLocaleString(), color: '#43e97b', icon: 'feather-mouse-pointer' },
                                { label: 'CTR', value: `${ctr}%`, color: '#f093fb', icon: 'feather-trending-up' },
                                { label: 'Total Spend', value: `₹${metrics.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#4facfe', icon: 'feather-dollar-sign' },
                            ].map(kpi => (
                                <div key={kpi.label} className="col-md-3 col-6">
                                    <div className="card" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                                        <div className="card-body py-3 d-flex align-items-center gap-3">
                                            <div style={{ width: 40, height: 40, borderRadius: 8, background: `${kpi.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className={kpi.icon} style={{ color: kpi.color }} />
                                            </div>
                                            <div>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{kpi.label}</p>
                                                <h6 className="mb-0 fw-bold">{kpi.value}</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Funnel Chart */}
                    <div className="col-md-5">
                        <div className="card h-100">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold">Funnel: Impressions → Clicks → CTR</h6>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <FunnelChart>
                                        <Tooltip formatter={v => v?.toLocaleString()} />
                                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                            {funnelData.map((entry, index) => (
                                                <Cell key={index} fill={entry.fill} />
                                            ))}
                                            <LabelList position="center" dataKey="name" fill="#fff" style={{ fontWeight: 600 }} />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart per client */}
                    <div className="col-md-7">
                        <div className="card h-100">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold">Per-Client Performance</h6>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData} margin={{ right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip formatter={v => v?.toLocaleString()} />
                                        <Legend />
                                        <Bar dataKey="Impressions" fill="#667eea" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Clicks" fill="#43e97b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Drop-off table */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold">Stage Drop-off Analysis</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Stage</th>
                                            <th>Count</th>
                                            <th>Drop-off from Previous</th>
                                            <th>Conversion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="badge" style={{ background: '#667eea' }}>Impressions</span></td>
                                            <td>{metrics.impressions.toLocaleString()}</td>
                                            <td>—</td>
                                            <td>100%</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge" style={{ background: '#43e97b', color: '#000' }}>Clicks</span></td>
                                            <td>{metrics.clicks.toLocaleString()}</td>
                                            <td>{metrics.impressions > 0 ? `${((1 - metrics.clicks / metrics.impressions) * 100).toFixed(1)}% dropped` : '—'}</td>
                                            <td>{ctr}% CTR</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
