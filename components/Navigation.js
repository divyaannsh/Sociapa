"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Navigation = () => {
  const pathname = usePathname();
  const { user, isSuperAdmin, isManager } = useAuth();
  const [openMenu, setOpenMenu] = useState({});

  useEffect(() => {
    setOpenMenu({
      dashboards: false,
      customers: false,
      campaigns: false,
      analytics: false,
      admin: false,
      settings: false,
    });
  }, []);

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  if (pathname === '/login' || pathname?.startsWith('/client-portal')) return null;

  return (
    <nav className="nxl-navigation">
      <div className="navbar-wrapper">
        <div className="m-header">
          <Link href="/" className="b-brand">
            <img src="/assets/images/logo-abbr.png" className="logo logo-sm" alt="" />
          </Link>
        </div>

        <div className="navbar-content">
          <ul className="nxl-navbar">
            <li className="nxl-item nxl-caption"><label>Navigation</label></li>

            {/* Home */}
            <li className={`nxl-item ${isActive('/') && pathname === '/' ? 'active' : ''}`}>
              <Link href="/" className={`nxl-link ${pathname === '/' ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-home" /></span>
                <span className="nxl-mtext">Home</span>
              </Link>
            </li>

            {/* Analytics */}
            <li
              className={`nxl-item nxl-hasmenu ${openMenu.analytics ? 'open' : ''}`}
              onMouseEnter={() => setOpenMenu(p => ({ ...p, analytics: true }))}
              onMouseLeave={() => setOpenMenu(p => ({ ...p, analytics: false }))}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon"><i className="feather-airplay" /></span>
                <span className="nxl-mtext">Analytics</span>
                <span className="nxl-arrow"><i className="feather-chevron-right" /></span>
              </a>
              {openMenu.analytics && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/analytics/dashboard" className={`nxl-link ${isActive('/analytics/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/roas" className={`nxl-link ${isActive('/analytics/roas') ? 'active' : ''}`}>💰 ROAS & ROI</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/budget-pacing" className={`nxl-link ${isActive('/analytics/budget-pacing') ? 'active' : ''}`}>🚦 Budget Pacing</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/cross-platform" className={`nxl-link ${isActive('/analytics/cross-platform') ? 'active' : ''}`}>📊 Cross-Platform Grid</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/excel" className={`nxl-link ${isActive('/analytics/excel') ? 'active' : ''}`}>📂 Excel Analytics (Gyan)</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/annotations" className={`nxl-link ${isActive('/analytics/annotations') ? 'active' : ''}`}>✏️ Chart Annotations</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/comparison" className={`nxl-link ${isActive('/analytics/comparison') ? 'active' : ''}`}>Comparison Mode</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/analytics/goals" className={`nxl-link ${isActive('/analytics/goals') ? 'active' : ''}`}>Goal Tracking</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Clients */}
            <li
              className={`nxl-item nxl-hasmenu ${openMenu.customers ? 'open' : ''}`}
              onMouseEnter={() => setOpenMenu(p => ({ ...p, customers: true }))}
              onMouseLeave={() => setOpenMenu(p => ({ ...p, customers: false }))}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon"><i className="feather-users" /></span>
                <span className="nxl-mtext">Clients</span>
                <span className="nxl-arrow"><i className="feather-chevron-right" /></span>
              </a>
              {openMenu.customers && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/clients/create" className="nxl-link">New Client</Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/clients/all" className="nxl-link">View / Manage</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Campaigns */}
            <li
              className={`nxl-item nxl-hasmenu ${openMenu.campaigns ? 'open' : ''}`}
              onMouseEnter={() => setOpenMenu(p => ({ ...p, campaigns: true }))}
              onMouseLeave={() => setOpenMenu(p => ({ ...p, campaigns: false }))}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon"><i className="feather-cast" /></span>
                <span className="nxl-mtext">Campaigns</span>
                <span className="nxl-arrow"><i className="feather-chevron-right" /></span>
              </a>
              {openMenu.campaigns && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/campaigns/create" className={`nxl-link ${isActive('/campaigns/create') ? 'active' : ''}`}>
                      Upload Excel
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/campaigns/manual-entry" className={`nxl-link ${isActive('/campaigns/manual-entry') ? 'active' : ''}`}>
                      Manual Entry
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/campaigns/all" className={`nxl-link ${isActive('/campaigns/all') ? 'active' : ''}`}>
                      View / Delete
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Notifications */}
            <li className="nxl-item">
              <Link href="/notifications" className={`nxl-link ${isActive('/notifications') ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-bell" /></span>
                <span className="nxl-mtext">Notifications</span>
              </Link>
            </li>

            {/* Search */}
            <li className="nxl-item">
              <Link href="/search" className={`nxl-link ${isActive('/search') ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-search" /></span>
                <span className="nxl-mtext">Global Search</span>
              </Link>
            </li>



            {/* Roadmap */}
            <li className="nxl-item">
              <Link href="/roadmap" className={`nxl-link ${isActive('/roadmap') ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-map" /></span>
                <span className="nxl-mtext">Sprint Roadmap</span>
              </Link>
            </li>

            {/* Reports */}
            <li className="nxl-item nxl-caption"><label>Reports</label></li>
            <li className="nxl-item">
              <Link href="/reports/email" className={`nxl-link ${isActive('/reports/email') ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-mail" /></span>
                <span className="nxl-mtext">Email Reports</span>
              </Link>
            </li>
            <li className="nxl-item">
              <Link href="/reports/scheduled" className={`nxl-link ${isActive('/reports/scheduled') ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-calendar" /></span>
                <span className="nxl-mtext">Scheduled Reports</span>
              </Link>
            </li>
            <li className="nxl-item">
              <Link href="/reports/pdf" className={`nxl-link ${isActive('/reports/pdf') ? 'active' : ''}`}>
                <span className="nxl-micon"><i className="feather-file-text" /></span>
                <span className="nxl-mtext">📄 PDF Builder</span>
              </Link>
            </li>

            {/* Admin section — Managers + Super Admins only */}
            {(isSuperAdmin?.() || isManager?.()) && (
              <>
                <li className="nxl-item nxl-caption"><label>Admin</label></li>

                <li className="nxl-item">
                  <Link href="/audit-log" className={`nxl-link ${isActive('/audit-log') ? 'active' : ''}`}>
                    <span className="nxl-micon"><i className="feather-activity" /></span>
                    <span className="nxl-mtext">Audit Log</span>
                  </Link>
                </li>
              </>
            )}

            {/* Super Admin only */}
            {isSuperAdmin?.() && (
              <>
                <li className="nxl-item">
                  <Link href="/users" className={`nxl-link ${isActive('/users') ? 'active' : ''}`}>
                    <span className="nxl-micon"><i className="feather-user-check" /></span>
                    <span className="nxl-mtext">User Management</span>
                  </Link>
                </li>
                <li className="nxl-item">
                  <Link href="/settings/integrations" className={`nxl-link ${isActive('/settings/integrations') ? 'active' : ''}`}>
                    <span className="nxl-micon"><i className="feather-zap" /></span>
                    <span className="nxl-mtext">⚡ Integrations</span>
                  </Link>
                </li>
              </>
            )}

            {/* Client Portal Link */}
            <li className="nxl-item nxl-caption"><label>Portal</label></li>
            <li className="nxl-item">
              <Link href="/client-portal/login" className="nxl-link" target="_blank">
                <span className="nxl-micon"><i className="feather-external-link" /></span>
                <span className="nxl-mtext">Client Portal</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
