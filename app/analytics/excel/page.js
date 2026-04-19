'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/* ── colour palette ─────────────────────────────────────────── */
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
const fmt = (n, dec = 0) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: dec }).format(n);
const fmtINR = (n) => '₹' + fmt(n);

/* ── KPI card ───────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color = '#6366f1', icon }) {
    return (
        <div className="card shadow-sm h-100" style={{ borderTop: `3px solid ${color}` }}>
            <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48, background: color + '18' }}>
                    <i className={icon} style={{ fontSize: 22, color }} />
                </div>
                <div>
                    <div className="text-muted small">{label}</div>
                    <div className="fw-bold fs-5">{value}</div>
                    {sub && <div className="text-muted" style={{ fontSize: 11 }}>{sub}</div>}
                </div>
            </div>
        </div>
    );
}

/* ── Custom tooltip ─────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="card shadow-sm p-2" style={{ fontSize: 12, minWidth: 140 }}>
            {label && <div className="fw-semibold mb-1">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}
                </div>
            ))}
        </div>
    );
}

export default function ExcelAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all' | period id

    useEffect(() => {
        fetch('/api/excel-data')
            .then(r => r.json())
            .then(d => {
                if (d.error) setError(d.error);
                else setData(d);
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    /* ── derive active periods to show ─────────────────────────── */
    const activePeriods = useMemo(() => {
        if (!data) return [];
        return selectedPeriod === 'all'
            ? data.periods
            : data.periods.filter(p => p.id === selectedPeriod);
    }, [data, selectedPeriod]);

    /* ── merge totals across selected periods ──────────────────── */
    const merged = useMemo(() => {
        if (!activePeriods.length) return null;
        const t = activePeriods.reduce((acc, p) => {
            acc.spend += p.totals.spend;
            acc.impressions += p.totals.impressions;
            acc.clicks += p.totals.clicks;
            acc.linkClicks += p.totals.linkClicks;
            acc.reach += p.totals.reach;
            return acc;
        }, { spend: 0, impressions: 0, clicks: 0, linkClicks: 0, reach: 0 });
        t.cpm = t.impressions ? (t.spend / t.impressions) * 1000 : 0;
        t.cpc = t.linkClicks ? t.spend / t.linkClicks : 0;
        t.ctr = t.impressions ? (t.linkClicks / t.impressions) * 100 : 0;

        // merge campaigns
        const byCamp = {};
        activePeriods.forEach(p => p.campaigns.forEach(c => {
            if (!byCamp[c.name]) byCamp[c.name] = { name: c.name, spend: 0, impressions: 0, clicks: 0 };
            byCamp[c.name].spend += c.spend;
            byCamp[c.name].impressions += c.impressions;
            byCamp[c.name].clicks += c.clicks;
        }));

        // merge platforms
        const byPlat = {};
        activePeriods.forEach(p => p.platforms.forEach(pl => {
            if (!byPlat[pl.name]) byPlat[pl.name] = { name: pl.name, spend: 0, impressions: 0, clicks: 0 };
            byPlat[pl.name].spend += pl.spend;
            byPlat[pl.name].impressions += pl.impressions;
            byPlat[pl.name].clicks += pl.clicks;
        }));

        return {
            totals: t,
            campaigns: Object.values(byCamp).sort((a, b) => b.spend - a.spend).slice(0, 10),
            platforms: Object.values(byPlat),
        };
    }, [activePeriods]);

    /* ── period-over-period comparison bar data ─────────────────── */
    const comparisonData = useMemo(() => {
        if (!data?.periods) return [];
        return data.periods.map(p => ({
            period: p.label,
            'Ad Spend': Math.round(p.totals.spend),
            Impressions: Math.round(p.totals.impressions / 1000), // '000s
            Clicks: Math.round(p.totals.clicks),
            CPM: Math.round(p.totals.cpm * 10) / 10,
            CPC: Math.round(p.totals.cpc * 100) / 100,
        }));
    }, [data]);

    /* ── loading / error ───────────────────────────────────────── */
    if (loading) {
        return (
            <div className="main-content">
                <div className="d-flex align-items-center gap-3 p-5">
                    <div className="spinner-border text-primary" />
                    <span>Loading Excel data…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <div className="alert alert-danger m-4">
                    <strong>Error loading data:</strong> {error}
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────────────────────── */
    return (
        <div className="main-content">

            {/* ── Page header ─────────────────────────────────────── */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-1">
                        <i className="feather-bar-chart-2 me-2" style={{ color: '#6366f1' }} />
                        Excel Analytics — {data.client.name}
                    </h4>
                    <div className="text-muted small">{data.client.industry} · imported from Excel</div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Period selector */}
                    <div className="btn-group" role="group">
                        <button
                            className={`btn btn-sm ${selectedPeriod === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setSelectedPeriod('all')}
                        >All Periods</button>
                        {data.periods.map(p => (
                            <button
                                key={p.id}
                                className={`btn btn-sm ${selectedPeriod === p.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setSelectedPeriod(p.id)}
                            >{p.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            {merged && (
                <>
                    {/* ── KPI Cards ─────────────────────────────────────── */}
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-md-4 col-xl-2">
                            <KpiCard label="Total Ad Spend" value={fmtINR(merged.totals.spend)} color="#6366f1" icon="feather-dollar-sign" />
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <KpiCard label="Impressions" value={fmt(merged.totals.impressions)} color="#8b5cf6" icon="feather-eye" />
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <KpiCard label="Link Clicks" value={fmt(merged.totals.linkClicks)} color="#14b8a6" icon="feather-mouse-pointer" />
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <KpiCard label="Total Clicks" value={fmt(merged.totals.clicks)} color="#ec4899" icon="feather-activity" />
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <KpiCard label="CPM" value={fmtINR(merged.totals.cpm)}
                                sub="per 1,000 impressions" color="#f59e0b" icon="feather-trending-up" />
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <KpiCard label="CPC" value={fmtINR(merged.totals.cpc)}
                                sub="per link click" color="#10b981" icon="feather-zap" />
                        </div>
                    </div>

                    {/* ── Month-over-month comparison ────────────────────── */}
                    {comparisonData.length > 1 && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-header fw-semibold">
                                <i className="feather-bar-chart me-2" style={{ color: '#6366f1' }} />
                                Month-over-Month: Ad Spend
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={comparisonData} barCategoryGap="30%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={v => '₹' + fmt(v)} tick={{ fontSize: 11 }} />
                                        <Tooltip content={<ChartTooltip />} formatter={(v) => fmtINR(v)} />
                                        <Bar dataKey="Ad Spend" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── Clicks & CPM comparison ───────────────────────── */}
                    {comparisonData.length > 1 && (
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="card shadow-sm h-100">
                                    <div className="card-header fw-semibold">
                                        <i className="feather-mouse-pointer me-2" style={{ color: '#14b8a6' }} />
                                        Clicks — Month Comparison
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={comparisonData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                                <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Bar dataKey="Clicks" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card shadow-sm h-100">
                                    <div className="card-header fw-semibold">
                                        <i className="feather-trending-up me-2" style={{ color: '#f59e0b' }} />
                                        CPM — Month Comparison
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <LineChart data={comparisonData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                                <YAxis tickFormatter={v => '₹' + v} tick={{ fontSize: 11 }} />
                                                <Tooltip content={<ChartTooltip />} formatter={v => fmtINR(v)} />
                                                <Line type="monotone" dataKey="CPM" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Top Campaigns (Spend) ─────────────────────────── */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header fw-semibold">
                            <i className="feather-award me-2" style={{ color: '#ec4899' }} />
                            Top Campaigns by Spend
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={merged.campaigns} layout="vertical" barCategoryGap="25%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" tickFormatter={v => '₹' + fmt(v)} tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                                    <Tooltip content={<ChartTooltip />} formatter={v => fmtINR(v)} />
                                    <Bar dataKey="spend" name="Ad Spend" radius={[0, 6, 6, 0]}>
                                        {merged.campaigns.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Campaign Impressions bar ──────────────────────── */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header fw-semibold">
                            <i className="feather-eye me-2" style={{ color: '#8b5cf6' }} />
                            Campaign Impressions
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={merged.campaigns} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                                    <Tooltip content={<ChartTooltip />} formatter={v => fmt(v)} />
                                    <Bar dataKey="impressions" name="Impressions" radius={[0, 6, 6, 0]}>
                                        {merged.campaigns.map((_, i) => (
                                            <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Spend breakdown table ─────────────────────────── */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header fw-semibold">
                            <i className="feather-list me-2" style={{ color: '#6366f1' }} />
                            Campaign Performance Table
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Campaign</th>
                                            <th className="text-end">Ad Spend</th>
                                            <th className="text-end">Impressions</th>
                                            <th className="text-end">Clicks</th>
                                            <th className="text-end">Link Clicks</th>
                                            <th className="text-end">CPM</th>
                                            <th className="text-end">CPC</th>
                                            <th className="text-end">Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {merged.campaigns.map((c, i) => {
                                            const cpm = c.impressions ? (c.spend / c.impressions) * 1000 : 0;
                                            const cpc = c.linkClicks ? c.spend / c.linkClicks : 0;
                                            const pct = merged.totals.spend ? (c.spend / merged.totals.spend) * 100 : 0;
                                            return (
                                                <tr key={c.name}>
                                                    <td className="text-muted">{i + 1}</td>
                                                    <td>
                                                        <span className="me-2" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                                                        {c.name}
                                                    </td>
                                                    <td className="text-end fw-semibold">{fmtINR(c.spend)}</td>
                                                    <td className="text-end">{fmt(c.impressions)}</td>
                                                    <td className="text-end">{fmt(c.clicks)}</td>
                                                    <td className="text-end">{fmt(c.linkClicks)}</td>
                                                    <td className="text-end">{fmtINR(cpm)}</td>
                                                    <td className="text-end">{fmtINR(cpc)}</td>
                                                    <td className="text-end">
                                                        <div className="d-flex align-items-center gap-1 justify-content-end">
                                                            <div style={{ width: 50, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                                                                <div style={{ width: pct + '%', height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                                                            </div>
                                                            <span style={{ fontSize: 11, minWidth: 32 }}>{pct.toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="table-light fw-semibold">
                                        <tr>
                                            <td colSpan={2}>Total</td>
                                            <td className="text-end">{fmtINR(merged.totals.spend)}</td>
                                            <td className="text-end">{fmt(merged.totals.impressions)}</td>
                                            <td className="text-end">{fmt(merged.totals.clicks)}</td>
                                            <td className="text-end">{fmt(merged.totals.linkClicks)}</td>
                                            <td className="text-end">{fmtINR(merged.totals.cpm)}</td>
                                            <td className="text-end">{fmtINR(merged.totals.cpc)}</td>
                                            <td className="text-end">100%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ── Platform-level pie ────────────────────────────── */}
                    {merged.platforms.length > 1 && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-header fw-semibold">
                                <i className="feather-pie-chart me-2" style={{ color: '#10b981' }} />
                                Spend by Platform
                            </div>
                            <div className="card-body d-flex flex-wrap align-items-center gap-4">
                                <ResponsiveContainer width={260} height={220}>
                                    <PieChart>
                                        <Pie data={merged.platforms} dataKey="spend" nameKey="name" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {merged.platforms.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={v => fmtINR(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <ul className="list-unstyled mb-0">
                                    {merged.platforms.map((pl, i) => (
                                        <li key={pl.name} className="d-flex align-items-center gap-2 mb-2">
                                            <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                            <span className="fw-semibold">{pl.name}</span>
                                            <span className="text-muted">{fmtINR(pl.spend)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── footer note ─────────────────────────────────────── */}
            <div className="text-muted text-center small pb-4">
                Data source: Gyan Meta Ads Excel reports (Sep–Oct 2025) · No database required
            </div>
        </div>
    );
}
