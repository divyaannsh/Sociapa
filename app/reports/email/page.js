'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';

export default function EmailReportsPage() {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [email, setEmail] = useState('');
    const [period, setPeriod] = useState('weekly');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const sendReport = async (e) => {
        e.preventDefault();
        setSending(true);
        setResult(null);
        const r = await fetch('/api/reports/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: selectedClientId, email, period }),
        });
        const d = await r.json();
        setResult({ ok: r.ok, message: d.message, preview: d.preview });
        setSending(false);
    };

    return (
        <div className="main-content">
            <PageHeader
                title="Email Reports"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Reports', path: '/reports/email' }]}
            />

            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <i className="feather-mail text-primary" />
                                Send Performance Report
                            </h6>
                        </div>
                        <div className="card-body">
                            {result && (
                                <div className={`alert alert-${result.ok ? 'success' : 'danger'} mb-3`}>
                                    <i className={`me-2 ${result.ok ? 'feather-check-circle' : 'feather-alert-circle'}`} />
                                    {result.message}
                                    {result.preview && (
                                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '0.8rem' }}>
                                            <strong>Preview:</strong>{' '}
                                            Spend: ₹{result.preview.totalSpend?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ·{' '}
                                            Clicks: {result.preview.totalClicks?.toLocaleString()} ·{' '}
                                            CTR: {result.preview.ctr}%
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={sendReport}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Client *</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={selectedClientId}
                                        onChange={e => setSelectedClientId(e.target.value)}
                                    >
                                        <option value="">-- Select Client --</option>
                                        {clients.map(c => (
                                            <option key={c._id} value={c._id}>{c.companyName || c.username}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Recipient Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="client@example.com"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Report Period</label>
                                    <div className="d-flex gap-2">
                                        {['weekly', 'monthly', 'custom'].map(p => (
                                            <label key={p} className="d-flex align-items-center gap-2 p-2 rounded cursor-pointer" style={{ border: `2px solid ${period === p ? '#667eea' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                                                <input type="radio" name="period" value={p} checked={period === p} onChange={() => setPeriod(p)} style={{ display: 'none' }} />
                                                <span style={{ fontWeight: period === p ? 700 : 400, color: period === p ? '#667eea' : '#4a5568', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                                                    {p}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100" disabled={sending}>
                                    {sending ? (
                                        <><span className="spinner-border spinner-border-sm me-2" />Generating Report...</>
                                    ) : (
                                        <><i className="feather-send me-2" />Send Report</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Setup Info */}
                    <div className="card mt-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">📧 Email Setup</h6>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                To enable actual email delivery, add these to your <code>.env</code> file:
                            </p>
                            <pre style={{ background: '#f7fafc', padding: 12, borderRadius: 8, fontSize: '0.8rem' }}>
                                {`EMAIL_USER=your.email@gmail.com\nEMAIL_PASS=your_app_password`}
                            </pre>
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                                For Gmail, generate an App Password at{' '}
                                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">
                                    myaccount.google.com/apppasswords
                                </a>. In dev mode, report data is logged to the console instead of being sent.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
