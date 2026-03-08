'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function interpolateColor(value, max) {
    if (max === 0) return '#f7fafc';
    const intensity = value / max;
    // Purple gradient from light to deep
    const r = Math.round(247 - intensity * (247 - 102));
    const g = Math.round(250 - intensity * (250 - 126));
    const b = Math.round(252 - intensity * (252 - 234));
    return `rgb(${r},${g},${b})`;
}

function getTextColor(value, max) {
    if (max === 0) return '#a0aec0';
    const intensity = value / max;
    return intensity > 0.5 ? '#fff' : '#2d3748';
}

export default function HeatmapPage() {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('all');
    const [metric, setMetric] = useState('spend');
    const [loading, setLoading] = useState(true);
    const [heatmapData, setHeatmapData] = useState({});
    const [maxVal, setMaxVal] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetch('/api/analytics/clients')
            .then(r => r.json())
            .then(d => {
                setClients(d.clients || []);
                buildHeatmap(d.clients || [], 'all', 'spend');
            })
            .finally(() => setLoading(false));
    }, []);

    const buildHeatmap = (clientsData, clientId, selectedMetric) => {
        const data = clientId === 'all' ? clientsData : clientsData.filter(c => c.id === clientId);

        // Build a day-of-week heatmap from timeline data
        // Since we don't have hour data, distribute spend by day of week
        const dayMap = {};
        DAYS.forEach(d => dayMap[d] = 0);

        data.forEach(client => {
            (client.timeline || []).forEach(t => {
                const date = new Date(t.date);
                if (isNaN(date.getTime())) return;
                const dayIdx = (date.getDay() + 6) % 7; // 0=Mon
                const day = DAYS[dayIdx];
                const val = selectedMetric === 'spend' ? t.spend : selectedMetric === 'impressions' ? t.impressions : t.clicks;
                dayMap[day] = (dayMap[day] || 0) + (val || 0);
            });
        });

        // Simulate hour distribution using a bell curve pattern (9am-6pm peak)
        const hourWeights = HOURS.map((_, h) => {
            if (h >= 9 && h <= 18) return 0.5 + 0.5 * Math.sin((h - 9) / 9 * Math.PI);
            if (h >= 19 && h <= 21) return 0.2;
            return 0.05;
        });
        const weightSum = hourWeights.reduce((a, b) => a + b, 0);

        const grid = {};
        let mx = 0;
        DAYS.forEach(day => {
            grid[day] = {};
            HOURS.forEach((hour, h) => {
                const val = (dayMap[day] * (hourWeights[h] / weightSum));
                grid[day][hour] = val;
                if (val > mx) mx = val;
            });
        });

        setHeatmapData(grid);
        setMaxVal(mx);
    };

    const handleChange = (newClientId, newMetric) => {
        buildHeatmap(clients, newClientId, newMetric);
    };

    const formatVal = (v) => {
        if (!v) return '';
        if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
        return v.toFixed(0);
    };

    return (
        <div className="main-content">
            <PageHeader
                title="Performance Heatmap"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Analytics', path: '/analytics/dashboard' }, { label: 'Heatmap' }]}
            />

            {/* Controls */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body py-3">
                            <label className="form-label fw-semibold mb-1">Client</label>
                            <select
                                className="form-select"
                                value={selectedClientId}
                                onChange={e => { setSelectedClientId(e.target.value); handleChange(e.target.value, metric); }}
                            >
                                <option value="all">All Clients</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body py-3">
                            <label className="form-label fw-semibold mb-1">Metric</label>
                            <select
                                className="form-select"
                                value={metric}
                                onChange={e => { setMetric(e.target.value); handleChange(selectedClientId, e.target.value); }}
                            >
                                <option value="spend">Spend (₹)</option>
                                <option value="impressions">Impressions</option>
                                <option value="clicks">Clicks</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">Day × Hour Heatmap — {metric.charAt(0).toUpperCase() + metric.slice(1)}</h6>
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
                            <span>Low</span>
                            <div style={{ width: 100, height: 12, borderRadius: 6, background: 'linear-gradient(to right, #f7fafc, #667eea)' }} />
                            <span>High</span>
                        </div>
                    </div>
                    <div className="card-body" style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 700 }}>
                            {/* Hour labels */}
                            <div style={{ display: 'flex', marginLeft: 48, marginBottom: 4 }}>
                                {HOURS.filter((_, i) => i % 3 === 0).map(h => (
                                    <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#718096' }}>
                                        {h}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            {DAYS.map(day => (
                                <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                                    <div style={{ width: 40, fontSize: '0.75rem', fontWeight: 600, color: '#4a5568', textAlign: 'right', paddingRight: 8, flexShrink: 0 }}>
                                        {day}
                                    </div>
                                    {HOURS.map(hour => {
                                        const val = heatmapData[day]?.[hour] || 0;
                                        const bg = interpolateColor(val, maxVal);
                                        const textColor = getTextColor(val, maxVal);
                                        return (
                                            <div
                                                key={hour}
                                                title={`${day} ${hour}: ${metric === 'spend' ? '₹' : ''}${val.toFixed(0)}`}
                                                style={{
                                                    flex: 1, height: 28, background: bg,
                                                    borderRadius: 3, margin: '0 1px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.55rem', color: textColor, cursor: 'default',
                                                    transition: 'opacity 0.2s',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.opacity = 0.8)}
                                                onMouseLeave={e => (e.currentTarget.style.opacity = 1)}
                                            >
                                                {formatVal(val)}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-footer">
                        <small className="text-muted">
                            ⚠️ Hour distribution is estimated from daily totals using typical advertising traffic patterns (9 AM–6 PM peak). Upload time-stamped data for precise hour-level heatmaps.
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}
