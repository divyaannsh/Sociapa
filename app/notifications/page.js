'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';

const TYPE_COLORS = {
    info: { bg: '#667eea', icon: 'feather-info', label: 'Info' },
    warning: { bg: '#f6e05e', icon: 'feather-alert-triangle', label: 'Warning' },
    alert: { bg: '#e53e3e', icon: 'feather-alert-circle', label: 'Alert' },
    success: { bg: '#43e97b', icon: 'feather-check-circle', label: 'Success' },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'info' });
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetchNotifications();
        fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const r = await fetch('/api/notifications');
        const d = await r.json();
        setNotifications(d.notifications || []);
        setLoading(false);
    };

    const markAllRead = async () => {
        await fetch('/api/notifications?all=true', { method: 'PATCH' });
        fetchNotifications();
    };

    const markRead = async (id) => {
        await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' });
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    };

    const createNotification = async (e) => {
        e.preventDefault();
        setCreating(true);
        await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setForm({ title: '', message: '', type: 'info' });
        setShowForm(false);
        setCreating(false);
        fetchNotifications();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="main-content">
            <PageHeader
                title="Notifications"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Notifications', path: '/notifications' }]}
            />

            <div className="row g-4">
                {/* Header Actions */}
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            {unreadCount > 0 && (
                                <span className="badge bg-danger me-2">{unreadCount} unread</span>
                            )}
                            <span className="text-muted">{notifications.length} total notifications</span>
                        </div>
                        <div className="d-flex gap-2">
                            {unreadCount > 0 && (
                                <button className="btn btn-outline-primary btn-sm" onClick={markAllRead}>
                                    <i className="feather-check-square me-1" />
                                    Mark All Read
                                </button>
                            )}
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowForm(!showForm)}
                            >
                                <i className="feather-plus me-1" />
                                New Notification
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold">Create Notification</h6>
                            </div>
                            <div className="card-body">
                                <form onSubmit={createNotification}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Title *</label>
                                            <input
                                                className="form-control"
                                                value={form.title}
                                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                                required
                                                placeholder="e.g. Budget Threshold Exceeded"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={form.type}
                                                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                            >
                                                <option value="info">Info</option>
                                                <option value="warning">Warning</option>
                                                <option value="alert">Alert</option>
                                                <option value="success">Success</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Message *</label>
                                            <textarea
                                                className="form-control"
                                                rows={2}
                                                value={form.message}
                                                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                                required
                                                placeholder="Notification details..."
                                            />
                                        </div>
                                        <div className="col-12 d-flex gap-2">
                                            <button className="btn btn-primary" type="submit" disabled={creating}>
                                                {creating ? 'Creating...' : 'Create'}
                                            </button>
                                            <button
                                                className="btn btn-light"
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                <div className="col-12">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="feather-bell" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                                <h5 className="mt-3 text-muted">No notifications yet</h5>
                                <p className="text-muted">Create a notification using the button above.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="list-group list-group-flush">
                                {notifications.map((notif) => {
                                    const typeConfig = TYPE_COLORS[notif.type] || TYPE_COLORS.info;
                                    return (
                                        <div
                                            key={notif._id}
                                            className={`list-group-item d-flex align-items-start gap-3 py-3 ${!notif.read ? 'border-start border-3 border-primary' : ''}`}
                                            style={{ opacity: notif.read ? 0.7 : 1 }}
                                        >
                                            <div
                                                style={{
                                                    width: 38, height: 38, borderRadius: '50%',
                                                    background: typeConfig.bg,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, color: notif.type === 'warning' ? '#000' : '#fff'
                                                }}
                                            >
                                                <i className={typeConfig.icon} style={{ fontSize: '1rem' }} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{notif.title}</strong>
                                                        {!notif.read && (
                                                            <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>NEW</span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">
                                                        {new Date(notif.createdAt).toLocaleString('en-IN', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </small>
                                                </div>
                                                <p className="mb-0 mt-1 text-muted" style={{ fontSize: '0.9rem' }}>
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <button
                                                    className="btn btn-sm btn-light flex-shrink-0"
                                                    onClick={() => markRead(notif._id)}
                                                >
                                                    <i className="feather-check" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
