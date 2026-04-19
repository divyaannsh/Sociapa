'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, loading, requireAuth, user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, campaigns: 0, totalSpend: 0, topPlatform: '-' });
  const [recentClients, setRecentClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) requireAuth();
  }, [loading, requireAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [clientsRes, analyticsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/analytics/clients'),
        ]);
        const clientsData = await clientsRes.json();
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : { clients: [] };

        const clients = clientsData.clients || [];
        setRecentClients(clients.slice(0, 5));

        let totalSpend = 0;
        const platformSpend = {};
        (analyticsData.clients || []).forEach(c => {
          (c.campaigns || []).forEach(camp => {
            const s = parseFloat(camp.totalSpend || 0);
            totalSpend += s;
            const pl = camp.platform || 'Other';
            platformSpend[pl] = (platformSpend[pl] || 0) + s;
          });
        });
        const topPlatform = Object.entries(platformSpend).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
          clients: clients.length,
          campaigns: (analyticsData.clients || []).reduce((s, c) => s + (c.campaigns?.length || 0), 0),
          totalSpend,
          topPlatform,
        });
      } catch (err) {
        console.error('Home dashboard fetch error:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const fmt = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const kpis = [
    {
      label: 'Total Clients',
      value: loadingData ? '—' : stats.clients,
      icon: 'feather-users',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      href: '/clients/all',
    },
    {
      label: 'Total Campaigns',
      value: loadingData ? '—' : stats.campaigns,
      icon: 'feather-cast',
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      href: '/campaigns/all',
    },
    {
      label: 'Total Ad Spend',
      value: loadingData ? '—' : fmt(stats.totalSpend),
      icon: 'feather-dollar-sign',
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      href: '/analytics/roas',
    },
    {
      label: 'Top Platform',
      value: loadingData ? '—' : stats.topPlatform,
      icon: 'feather-award',
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      href: '/analytics/cross-platform',
    },
  ];

  const quickLinks = [
    { href: '/analytics/dashboard', icon: 'feather-activity', label: 'Analytics Dashboard', desc: 'Impressions, clicks, CPM & CPC' },
    { href: '/analytics/roas', icon: 'feather-trending-up', label: 'ROAS & ROI', desc: 'Return on ad spend' },
    { href: '/analytics/budget-pacing', icon: 'feather-sliders', label: 'Budget Pacing', desc: 'Live spend vs budget' },
    { href: '/analytics/cross-platform', icon: 'feather-grid', label: 'Cross-Platform Grid', desc: 'Side-by-side comparison' },
    { href: '/reports/email', icon: 'feather-mail', label: 'Email Reports', desc: 'Send weekly / monthly reports' },
    { href: '/reports/pdf', icon: 'feather-file-text', label: 'PDF Builder', desc: 'Branded report exports' },
    { href: '/campaigns/create', icon: 'feather-upload', label: 'Upload Campaign', desc: 'Import Excel data' },
    { href: '/clients/all', icon: 'feather-users', label: 'Manage Clients', desc: 'View and edit clients' },
  ];

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-color, #f0f0f0)' }}>
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>
            👋 Welcome back, {user?.username || 'Admin'}
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Here&apos;s what&apos;s happening across your ad accounts today.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link href="/campaigns/create" className="btn btn-primary">
            <i className="feather-upload me-2" />Upload Campaign
          </Link>
          <Link href="/clients/create" className="btn btn-outline-secondary">
            <i className="feather-user-plus me-2" />New Client
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="col-6 col-lg-3">
            <Link href={kpi.href} style={{ textDecoration: 'none' }}>
              <div className="card border-0 h-100 kpi-card-hover" style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ height: 4, background: kpi.gradient }} />
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {kpi.label}
                      </p>
                      <h3 className="fw-bold mb-0" style={{ fontSize: '1.4rem', color: kpi.color }}>
                        {loadingData ? <span className="placeholder col-6" style={{ height: 28, display: 'block', borderRadius: 6 }} /> : kpi.value}
                      </h3>
                    </div>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${kpi.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <i className={kpi.icon} style={{ color: kpi.color, fontSize: '1.1rem' }} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Links + Recent Clients */}
      <div className="row g-3">
        {/* Quick Links */}
        <div className="col-lg-7">
          <div className="card border-0 h-100" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>Quick Access</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-2">
                {quickLinks.map((link, i) => (
                  <div key={i} className="col-6">
                    <Link href={link.href} style={{ textDecoration: 'none' }}>
                      <div className="p-3 rounded-3 quick-link-item" style={{
                        border: '1px solid var(--card-border, #e2e8f0)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}>
                        <i className={link.icon} style={{ color: '#667eea', fontSize: '1rem', marginBottom: 6, display: 'block' }} />
                        <p className="fw-semibold mb-0" style={{ fontSize: '0.82rem', color: 'var(--text-primary, #2d3748)' }}>{link.label}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{link.desc}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="col-lg-5">
          <div className="card border-0 h-100" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>Recent Clients</h5>
              <Link href="/clients/all" className="btn btn-sm btn-light" style={{ fontSize: '0.75rem' }}>View All</Link>
            </div>
            <div className="card-body p-4 pt-3">
              {loadingData ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="d-flex align-items-center gap-3 mb-3">
                    <div className="placeholder" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="placeholder col-8 mb-1" style={{ height: 12, borderRadius: 4, display: 'block' }} />
                      <div className="placeholder col-5" style={{ height: 10, borderRadius: 4, display: 'block' }} />
                    </div>
                  </div>
                ))
              ) : recentClients.length === 0 ? (
                <div className="text-center py-4">
                  <i className="feather-users" style={{ fontSize: '2rem', color: '#cbd5e0' }} />
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>No clients yet.</p>
                  <Link href="/clients/create" className="btn btn-sm btn-primary mt-2">Add First Client</Link>
                </div>
              ) : (
                recentClients.map((client, i) => (
                  <Link key={client._id || i} href={`/analytics/dashboard`} style={{ textDecoration: 'none' }}>
                    <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded-2 client-row-hover" style={{ cursor: 'pointer', transition: 'background 0.15s' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, #667eea, #764ba2)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.85rem',
                      }}>
                        {(client.companyName || client.username || 'C')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.875rem', color: 'var(--text-primary, #2d3748)' }}>
                          {client.companyName || client.username}
                        </p>
                        <p className="text-muted mb-0 text-truncate" style={{ fontSize: '0.75rem' }}>
                          {client.industry || 'Advertising Client'}
                        </p>
                      </div>
                      <i className="feather-chevron-right text-muted" style={{ fontSize: '0.8rem', flexShrink: 0 }} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .kpi-card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(102,126,234,0.15) !important; }
        .quick-link-item:hover { background: var(--hover-bg, #f8f9ff); border-color: #667eea !important; }
        .client-row-hover:hover { background: var(--hover-bg, #f8f9ff); }
        .placeholder { background: linear-gradient(90deg, var(--card-border, #e2e8f0) 25%, var(--hover-bg, #f8f9ff) 50%, var(--card-border, #e2e8f0) 75%); animation: shimmer 1.5s infinite; background-size: 200% 100%; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
