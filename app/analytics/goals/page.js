'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';

export default function GoalsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState({});  // clientId -> { spendTarget, clicksTarget }
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        setLoading(true);
        // Load stored goals from localStorage
        const storedGoals = JSON.parse(localStorage.getItem('sociapa-goals') || '{}');
        setGoals(storedGoals);

        fetch('/api/analytics/clients')
            .then(r => r.json())
            .then(d => setClients(d.clients || []))
            .finally(() => setLoading(false));
    }, []);

    const saveGoal = (clientId, newGoal) => {
        const updated = { ...goals, [clientId]: newGoal };
        setGoals(updated);
        localStorage.setItem('sociapa-goals', JSON.stringify(updated));
        setEditing(null);
    };

    const getProgress = (current, target) => {
        if (!target || target === 0) return null;
        return Math.min((current / target) * 100, 100);
    };

    const getProgressColor = (pct) => {
        if (pct >= 90) return '#e53e3e'; // red = over/near limit
        if (pct >= 70) return '#f6ad55'; // orange = getting close
        if (pct >= 40) return '#667eea'; // blue = on track
        return '#43e97b'; // green = early
    };

    return (
        <div className="main-content">
            <PageHeader
                title="Campaign Goal Tracking"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Analytics', path: '/analytics/dashboard' }, { label: 'Goals' }]}
            />

            <div className="row mb-3">
                <div className="col-12">
                    <div className="alert alert-primary d-flex align-items-center gap-2">
                        <i className="feather-target" />
                        <span>Set spend and clicks targets per client. Progress is tracked live against actual campaign data. Goals are saved in your browser.</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : clients.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <i className="feather-target" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                        <h5 className="mt-3 text-muted">No clients found</h5>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {clients.map(client => {
                        const goal = goals[client.id] || {};
                        const spendProgress = getProgress(client.spend, goal.spendTarget);
                        const clicksProgress = getProgress(client.clicks, goal.clicksTarget);
                        const roas = goal.revenueTarget && client.spend > 0
                            ? (goal.revenueTarget / client.spend).toFixed(2)
                            : null;

                        const isEditing = editing === client.id;

                        return (
                            <div key={client.id} className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 700, fontSize: '0.85rem'
                                            }}>
                                                {client.name?.[0]?.toUpperCase() || 'C'}
                                            </div>
                                            <h6 className="mb-0 fw-bold">{client.name}</h6>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setEditing(isEditing ? null : client.id)}
                                        >
                                            <i className={`feather-${isEditing ? 'x' : 'edit-2'}`} />
                                        </button>
                                    </div>

                                    <div className="card-body">
                                        {/* Goal Edit Form */}
                                        {isEditing && (
                                            <GoalEditForm
                                                clientId={client.id}
                                                current={goal}
                                                onSave={saveGoal}
                                                onCancel={() => setEditing(null)}
                                            />
                                        )}

                                        {/* Spend Progress */}
                                        {spendProgress !== null && (
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Spend</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                                                        ₹{client.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} of ₹{goal.spendTarget?.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                                <div className="progress" style={{ height: 10, borderRadius: 5 }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${spendProgress}%`,
                                                            background: getProgressColor(spendProgress),
                                                            borderRadius: 5, transition: 'width 0.8s ease',
                                                        }}
                                                    />
                                                </div>
                                                <div className="d-flex justify-content-between mt-1">
                                                    <small style={{ fontSize: '0.7rem', color: '#718096' }}>{spendProgress.toFixed(1)}% used</small>
                                                    <small style={{ fontSize: '0.7rem', color: '#718096' }}>
                                                        ₹{Math.max(0, (goal.spendTarget || 0) - client.spend).toLocaleString('en-IN', { maximumFractionDigits: 0 })} remaining
                                                    </small>
                                                </div>
                                            </div>
                                        )}

                                        {/* Clicks Progress */}
                                        {clicksProgress !== null && (
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Clicks</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                                                        {client.clicks.toLocaleString()} of {goal.clicksTarget?.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                                <div className="progress" style={{ height: 10, borderRadius: 5 }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${clicksProgress}%`,
                                                            background: getProgressColor(clicksProgress),
                                                            borderRadius: 5, transition: 'width 0.8s ease',
                                                        }}
                                                    />
                                                </div>
                                                <small style={{ fontSize: '0.7rem', color: '#718096' }}>{clicksProgress.toFixed(1)}% of target</small>
                                            </div>
                                        )}

                                        {/* ROAS */}
                                        {roas && (
                                            <div className="d-flex align-items-center gap-2 mt-2 p-2 rounded" style={{ background: 'rgba(102,126,234,0.08)' }}>
                                                <i className="feather-trending-up text-primary" />
                                                <span style={{ fontSize: '0.85rem' }}>Target ROAS: <strong>{roas}x</strong></span>
                                            </div>
                                        )}

                                        {/* No Goals Set */}
                                        {!goal.spendTarget && !goal.clicksTarget && !isEditing && (
                                            <div className="text-center py-3 text-muted">
                                                <p style={{ fontSize: '0.85rem' }}>No goals set yet.</p>
                                                <button className="btn btn-sm btn-primary" onClick={() => setEditing(client.id)}>
                                                    <i className="feather-plus me-1" />Set Goal
                                                </button>
                                            </div>
                                        )}

                                        {/* Actual Metrics */}
                                        <div className="row g-2 mt-2">
                                            {[
                                                { label: 'Spend', value: `₹${client.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                                                { label: 'Impressions', value: client.impressions.toLocaleString() },
                                                { label: 'Clicks', value: client.clicks.toLocaleString() },
                                                { label: 'CPC', value: `₹${client.cpc}` },
                                            ].map(m => (
                                                <div key={m.label} className="col-6">
                                                    <div className="p-2 rounded text-center" style={{ background: '#f7fafc' }}>
                                                        <div style={{ fontSize: '0.65rem', color: '#718096', textTransform: 'uppercase' }}>{m.label}</div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.value}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function GoalEditForm({ clientId, current, onSave, onCancel }) {
    const [form, setForm] = useState({
        spendTarget: current.spendTarget || '',
        clicksTarget: current.clicksTarget || '',
        revenueTarget: current.revenueTarget || '',
    });

    return (
        <div className="mb-3 p-3 rounded" style={{ background: '#f7fafc', border: '1px solid #e2e8f0' }}>
            <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem' }}>Set Goals</h6>
            <div className="row g-2">
                <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Spend Target (₹)</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 50000"
                        value={form.spendTarget}
                        onChange={e => setForm(p => ({ ...p, spendTarget: e.target.value }))}
                    />
                </div>
                <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Clicks Target</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 1000"
                        value={form.clicksTarget}
                        onChange={e => setForm(p => ({ ...p, clicksTarget: e.target.value }))}
                    />
                </div>
                <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Expected Revenue (₹) for ROAS</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 200000"
                        value={form.revenueTarget}
                        onChange={e => setForm(p => ({ ...p, revenueTarget: e.target.value }))}
                    />
                </div>
                <div className="col-12 d-flex gap-2 mt-1">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onSave(clientId, {
                            spendTarget: parseFloat(form.spendTarget) || 0,
                            clicksTarget: parseFloat(form.clicksTarget) || 0,
                            revenueTarget: parseFloat(form.revenueTarget) || 0,
                        })}
                    >
                        Save Goals
                    </button>
                    <button className="btn btn-sm btn-light" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
