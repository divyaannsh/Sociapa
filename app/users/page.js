'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

const ROLES = [
    { value: 'super_admin', label: 'Super Admin', color: '#667eea' },
    { value: 'manager', label: 'Manager', color: '#43e97b' },
    { value: 'viewer', label: 'Viewer', color: '#4facfe' },
    { value: 'client', label: 'Client', color: '#fa709a' },
];

export default function UserManagementPage() {
    const { user, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [form, setForm] = useState({
        username: '', password: '', role: 'viewer', displayName: '', clientId: '',
    });

    useEffect(() => {
        fetchUsers();
        fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const r = await fetch('/api/users');
        const d = await r.json();
        setUsers(d.users || []);
        setLoading(false);
    };

    const createUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ type: '', text: '' });
        const r = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const d = await r.json();
        if (r.ok) {
            setMsg({ type: 'success', text: `User "${form.username}" created successfully!` });
            setForm({ username: '', password: '', role: 'viewer', displayName: '', clientId: '' });
            setShowForm(false);
            fetchUsers();
        } else {
            setMsg({ type: 'danger', text: d.message || 'Failed to create user' });
        }
        setSaving(false);
    };

    const deleteUser = async (id, username) => {
        if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
        setDeleting(id);
        await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        setUsers(prev => prev.filter(u => u._id !== id));
        setDeleting(null);
    };

    const getRoleConfig = (role) => ROLES.find(r => r.value === role) || ROLES[2];

    if (!isSuperAdmin()) {
        return (
            <div className="main-content">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <i className="feather-lock" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                        <h5 className="mt-3 text-muted">Super Admin Access Required</h5>
                        <p className="text-muted">Only Super Admins can manage users.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <PageHeader
                title="User Management"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Users', path: '/users' }]}
            />

            {msg.text && (
                <div className={`alert alert-${msg.type} d-flex align-items-center gap-2 mb-4`}>
                    <i className={msg.type === 'success' ? 'feather-check-circle' : 'feather-alert-circle'} />
                    {msg.text}
                </div>
            )}

            <div className="row g-4">
                {/* Action Bar */}
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <span className="text-muted">{users.length} user{users.length !== 1 ? 's' : ''}</span>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <i className="feather-user-plus me-1" />
                        New User
                    </button>
                </div>

                {/* Create User Form */}
                {showForm && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold">Create New User</h6>
                            </div>
                            <div className="card-body">
                                <form onSubmit={createUser}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Username *</label>
                                            <input
                                                className="form-control"
                                                value={form.username}
                                                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                                required
                                                placeholder="johndoe"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Display Name</label>
                                            <input
                                                className="form-control"
                                                value={form.displayName}
                                                onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Password *</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={form.password}
                                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                                required
                                                placeholder="Min 8 characters"
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Role *</label>
                                            <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                            </select>
                                        </div>
                                        {form.role === 'client' && (
                                            <div className="col-md-6">
                                                <label className="form-label">Link to Client (for portal access)</label>
                                                <select className="form-select" value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}>
                                                    <option value="">-- Select Client --</option>
                                                    {clients.map(c => <option key={c._id} value={c._id}>{c.companyName || c.username}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="col-12 d-flex gap-2">
                                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                                {saving ? 'Creating...' : 'Create User'}
                                            </button>
                                            <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="col-12">
                    <div className="card">
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
                        ) : users.length === 0 ? (
                            <div className="card-body text-center py-5">
                                <i className="feather-users" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                                <h5 className="mt-3 text-muted">No DB users yet</h5>
                                <p className="text-muted">The legacy admin/sociapa login still works. Create additional users here.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => {
                                            const roleConfig = getRoleConfig(u.role);
                                            return (
                                                <tr key={u._id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: '50%',
                                                                background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}aa)`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: 'white', fontWeight: 700, fontSize: '0.8rem',
                                                            }}>
                                                                {u.displayName?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <span className="fw-semibold">{u.displayName || u.username}</span>
                                                        </div>
                                                    </td>
                                                    <td><code>@{u.username}</code></td>
                                                    <td>
                                                        <span className="badge" style={{ background: roleConfig.color, color: u.role === 'manager' || u.role === 'viewer' ? '#000' : '#fff' }}>
                                                            {roleConfig.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: '#718096' }}>
                                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteUser(u._id, u.username)}
                                                            disabled={deleting === u._id}
                                                        >
                                                            {deleting === u._id ? (
                                                                <span className="spinner-border spinner-border-sm" />
                                                            ) : (
                                                                <i className="feather-trash-2" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
