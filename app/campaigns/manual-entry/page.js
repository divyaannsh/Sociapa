'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';
import ClientSelector from '../../../components/ClientSelector';
import { useRouter } from 'next/navigation';

const PLATFORMS = ['Google', 'Facebook', 'Meta', 'LinkedIn', 'Twitter', 'YouTube', 'Snapchat', 'Other'];

export default function ManualCampaignEntry() {
    const router = useRouter();
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [rows, setRows] = useState([createEmptyRow()]);

    function createEmptyRow() {
        return {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            platform: 'Google',
            spend: '',
            impressions: '',
            clicks: '',
            cpm: '',
            cpc: '',
            results: '',
        };
    }

    useEffect(() => {
        fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const addRow = () => setRows(prev => [...prev, createEmptyRow()]);
    const removeRow = (id) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter(r => r.id !== id));
    };
    const updateRow = (id, field, value) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    // Auto-calculate CPM and CPC
    const handleMetricChange = (id, field, value) => {
        setRows(prev => prev.map(r => {
            if (r.id !== id) return r;
            const updated = { ...r, [field]: value };
            const spend = parseFloat(updated.spend) || 0;
            const impressions = parseFloat(updated.impressions) || 0;
            const clicks = parseFloat(updated.clicks) || 0;
            if (impressions > 0) updated.cpm = ((spend * 1000) / impressions).toFixed(2);
            if (clicks > 0) updated.cpc = (spend / clicks).toFixed(2);
            return updated;
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedClientId || !campaignName.trim()) {
            setError('Please select a client and enter a campaign name');
            return;
        }

        const apiRows = rows.map(r => ({
            'Day': r.date,
            'Platform': r.platform,
            'Amount spent (INR)': parseFloat(r.spend) || 0,
            'Impressions': parseFloat(r.impressions) || 0,
            'Clicks (all)': parseFloat(r.clicks) || 0,
            'CPM (cost per 1,000 impressions)': parseFloat(r.cpm) || 0,
            'CPC (all)': parseFloat(r.cpc) || 0,
            'Results': parseFloat(r.results) || 0,
        }));

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: selectedClientId,
                    fileName: campaignName.trim(),
                    rows: apiRows,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');
            setSuccess(`Campaign "${campaignName}" saved with ${rows.length} row(s)!`);
            setRows([createEmptyRow()]);
            setCampaignName('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Totals
    const totals = rows.reduce((acc, r) => ({
        spend: acc.spend + (parseFloat(r.spend) || 0),
        impressions: acc.impressions + (parseFloat(r.impressions) || 0),
        clicks: acc.clicks + (parseFloat(r.clicks) || 0),
        results: acc.results + (parseFloat(r.results) || 0),
    }), { spend: 0, impressions: 0, clicks: 0, results: 0 });

    return (
        <div className="main-content">
            <PageHeader
                title="Manual Campaign Entry"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Campaigns', path: '/campaigns/create' }, { label: 'Manual Entry' }]}
            />

            <form onSubmit={handleSave}>
                {/* Client + Name selection */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <label className="form-label fw-semibold">Select Client *</label>
                                <select
                                    className="form-select"
                                    value={selectedClientId}
                                    onChange={e => setSelectedClientId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Client --</option>
                                    {clients.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.companyName || c.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <label className="form-label fw-semibold">Campaign Name *</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. Google Jan 2024"
                                    value={campaignName}
                                    onChange={e => setCampaignName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats summary */}
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Spend', value: `₹${totals.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#667eea' },
                        { label: 'Total Impressions', value: totals.impressions.toLocaleString(), color: '#43e97b' },
                        { label: 'Total Clicks', value: totals.clicks.toLocaleString(), color: '#f093fb' },
                        { label: 'Total Results', value: totals.results.toLocaleString(), color: '#4facfe' },
                    ].map(stat => (
                        <div key={stat.label} className="col-md-3 col-6">
                            <div className="card h-100" style={{ borderLeft: `4px solid ${stat.color}` }}>
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                    <h5 className="mb-0 fw-bold">{stat.value}</h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rows Table */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">{rows.length} Row{rows.length !== 1 ? 's' : ''}</h6>
                        <button type="button" className="btn btn-sm btn-primary" onClick={addRow}>
                            <i className="feather-plus me-1" />
                            Add Row
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={{ minWidth: 900 }}>
                            <thead>
                                <tr>
                                    <th style={{ minWidth: 130 }}>Date</th>
                                    <th style={{ minWidth: 120 }}>Platform</th>
                                    <th style={{ minWidth: 110 }}>Spend (₹)</th>
                                    <th style={{ minWidth: 110 }}>Impressions</th>
                                    <th style={{ minWidth: 90 }}>Clicks</th>
                                    <th style={{ minWidth: 90 }}>CPM</th>
                                    <th style={{ minWidth: 90 }}>CPC</th>
                                    <th style={{ minWidth: 90 }}>Results</th>
                                    <th style={{ width: 50 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row.id}>
                                        <td>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={row.date}
                                                onChange={e => updateRow(row.id, 'date', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={row.platform}
                                                onChange={e => updateRow(row.id, 'platform', e.target.value)}
                                            >
                                                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min="0"
                                                step="0.01"
                                                value={row.spend}
                                                onChange={e => handleMetricChange(row.id, 'spend', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min="0"
                                                value={row.impressions}
                                                onChange={e => handleMetricChange(row.id, 'impressions', e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min="0"
                                                value={row.clicks}
                                                onChange={e => handleMetricChange(row.id, 'clicks', e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={row.cpm}
                                                readOnly
                                                style={{ background: '#f7fafc' }}
                                                placeholder="Auto"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={row.cpc}
                                                readOnly
                                                style={{ background: '#f7fafc' }}
                                                placeholder="Auto"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min="0"
                                                value={row.results}
                                                onChange={e => updateRow(row.id, 'results', e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger"
                                                onClick={() => removeRow(row.id)}
                                                disabled={rows.length === 1}
                                            >
                                                <i className="feather-trash-2" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Actions */}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? (
                            <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        ) : (
                            <><i className="feather-save me-2" />Save Campaign</>
                        )}
                    </button>
                    <button type="button" className="btn btn-light" onClick={() => router.back()}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
