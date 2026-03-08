'use client'

import { useEffect, useState } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Fetch unread notifications count
    fetch('/api/notifications?unread=true')
      .then(r => r.json())
      .then(d => setNotifCount(d.count || 0))
      .catch(() => { });
  }, [pathname]);

  if (pathname === '/login' || pathname?.startsWith('/client-portal')) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'super_admin': return 'super-admin';
      case 'manager': return 'manager';
      case 'viewer': return 'viewer';
      case 'client': return 'client';
      default: return 'super-admin';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'manager': return 'Manager';
      case 'viewer': return 'Viewer';
      case 'client': return 'Client';
      default: return 'Admin';
    }
  };

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        {/* Header Left */}
        <div className="header-left d-flex align-items-center gap-4">
          <a href="#!" className="nxl-head-mobile-toggler" id="mobile-collapse">
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>

          {/* Global Search */}
          {showSearch ? (
            <form onSubmit={handleSearch} className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search clients, campaigns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                style={{ width: '220px', borderRadius: '20px' }}
              />
              <button type="submit" className="btn btn-sm btn-primary" style={{ borderRadius: '20px' }}>
                <i className="feather-search" style={{ fontSize: '0.8rem' }} />
              </button>
              <button type="button" className="btn btn-sm btn-light" onClick={() => setShowSearch(false)} style={{ borderRadius: '20px' }}>
                <i className="feather-x" style={{ fontSize: '0.8rem' }} />
              </button>
            </form>
          ) : (
            <button
              className="dark-mode-toggle"
              onClick={() => setShowSearch(true)}
              title="Search"
            >
              <i className="feather-search" />
            </button>
          )}
        </div>

        {/* Header Right */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              className="dark-mode-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={isDark ? 'feather-sun' : 'feather-moon'} />
            </button>

            {/* Notifications */}
            <Link href="/notifications" style={{ position: 'relative', display: 'inline-flex' }}>
              <button className="dark-mode-toggle" title="Notifications">
                <i className="feather-bell" />
                {notifCount > 0 && (
                  <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                )}
              </button>
            </Link>

            {/* User Badge */}
            {user && (
              <div className="d-flex align-items-center gap-2 ms-1 me-1">
                <div className="d-none d-md-flex flex-column align-items-end">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>
                    {user.username}
                  </span>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`} style={{ marginTop: '2px' }}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {user.username?.[0]?.toUpperCase() || 'A'}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              className="btn btn-light text-danger fw-bold"
              onClick={logout}
              style={{ borderRadius: '8px' }}
              title="Logout"
            >
              <i className="feather-log-out"></i>
              <span className="d-none d-md-inline ms-2">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
