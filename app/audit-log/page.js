'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';

const ACTION_COLORS = {
    LOGIN: 'success', LOGOUT: 'secondary', USER_CREATE: 'primary',
    USER_DELETE: 'danger', CAMPAIGN_UPLOAD: 'info', CLIENT_CREATE: 'primary',
    CLIENT_DELETE: 'danger',
};

const ACTION_ICONS = {
    LOGIN: 'feather-log-in', LOGOUT: 'feather-log-out', USER_CREATE: 'feather-user-plus',
    USER_DELETE: 'feather-user-minus', CAMPAIGN_UPLOAD: 'feather-upload', CLIENT_CREATE: 'feather-plus',
    CLIENT_DELETE: 'feather-trash-2',
};

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [action, setAction] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    useEffect(() => {
        fetchLogs();
    }, [action, page]);

    const fetchLogs = async () => {
        setLoading(true);
        const params = new URLSearchParams({ limit: LIMIT, page });
        if (action) params.append('action', action);
        const r = await fetch(`/api/audit-log?${params}`);
        const d = await r.json();
        setLogs(d.logs || []);
        setTotal(d.total || 0);
        setLoading(false);
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="main-content">
            <PageHeader
                title="Audit Log"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Audit Log', path: '/audit-log' }]}
            />

            <div className="row g-4">
                {/* Filters */}
                <div className="col-12">
                    <div className="card">
                        <div className="card-body d-flex flex-wrap gap-3 align-items-center">
                            <div>
                                <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>Filter by Action</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={action}
                                    onChange={e => { setAction(e.target.value); setPage(1); }}
                                    style={{ minWidth: '160px' }}
                                >
                                    <option value="">All Actions</option>
                                    <option value="LOGIN">Login</option>
                                    <option value="LOGOUT">Logout</option>
                                    <option value="USER_CREATE">User Create</option>
                                    <option value="USER_DELETE">User Delete</option>
                                    <option value="CAMPAIGN_UPLOAD">Campaign Upload</option>
                                    <option value="CLIENT_CREATE">Client Create</option>
                                    <option value="CLIENT_DELETE">Client Delete</option>
                                </select>
                            </div>

                            <div className="ms-auto">
                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                    {total} total events
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="col-12">
                    <div className="card">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="card-body text-center py-5">
                                <i className="feather-activity" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                                <h5 className="mt-3 text-muted">No audit events yet</h5>
                                <p className="text-muted">Logins, campaign uploads, and user changes will appear here.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '180px' }}>Timestamp</th>
                                            <th style={{ width: '120px' }}>User</th>
                                            <th style={{ width: '160px' }}>Action</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log._id}>
                                                <td style={{ fontSize: '0.85rem' }}>
                                                    {new Date(log.timestamp).toLocaleString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                    })}
                                                </td>
                                                <td>
                                                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                                                        {log.username || 'system'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${ACTION_COLORS[log.action] || 'secondary'} d-inline-flex align-items-center gap-1`}>
                                                        <i className={ACTION_ICONS[log.action] || 'feather-activity'} style={{ fontSize: '0.7rem' }} />
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                                                    {log.details}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="card-footer d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Page {page} of {totalPages} · {total} events
                                </small>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        <i className="feather-chevron-left" />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        <i className="feather-chevron-right" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
