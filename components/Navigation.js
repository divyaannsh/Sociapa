"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState({});

  useEffect(() => {
    // Keep all menus closed on page load
    setOpenMenu({
      dashboards: false,
      customers: false,
      reports: false,
      apps: false,
      proposal: false,
      payment: false,
      leads: false,
      projects: false,
      widgets: false,
      settings: false,
      help: false,
    });
  }, []);

  const handleMouseEnter = (key) => {
    setOpenMenu((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleMouseLeave = (key) => {
    setOpenMenu((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path);

  if (pathname === '/login') return null;

  return (
    <nav className="nxl-navigation">
      <div className="navbar-wrapper">
        <div className="m-header">
          <Link href="/" className="b-brand">
            <img
              src="/assets/images/logo-abbr.png"
              className="logo logo-sm"
              alt=""
            />
          </Link>
        </div>

        <div className="navbar-content">
          <ul className="nxl-navbar">
            <li className="nxl-item nxl-caption">
              <label>Navigation</label>
            </li>

            {/* Dashboards */}
            <li
              className={`nxl-item nxl-hasmenu ${
                openMenu.dashboards ? "open" : ""
              }`}
              onMouseEnter={() => handleMouseEnter("dashboards")}
              onMouseLeave={() => handleMouseLeave("dashboards")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-airplay" />
                </span>
                <span className="nxl-mtext">Dashboards</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.dashboards && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link
                      href="/"
                      className={`nxl-link ${isActive("/") ? "active" : ""}`}
                    >
                      Home
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link
                      href="/analytics"
                      className={`nxl-link ${
                        isActive("/analytics") ? "active" : ""
                      }`}
                    >
                      Analytics
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Clients */}
            <li
              className={`nxl-item nxl-hasmenu ${
                openMenu.customers ? "open" : ""
              }`}
              onMouseEnter={() => handleMouseEnter("customers")}
              onMouseLeave={() => handleMouseLeave("customers")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-users" />
                </span>
                <span className="nxl-mtext">Clients</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.customers && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/clients/create" className="nxl-link">
                      New Client ID
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/clients/all" className="nxl-link">
                      View/Edit/Delete IDs
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Campaigns */}
            <li
              className={`nxl-item nxl-hasmenu ${
                openMenu.reports ? "open" : ""
              }`}
              onMouseEnter={() => handleMouseEnter("reports")}
              onMouseLeave={() => handleMouseLeave("reports")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-cast" />
                </span>
                <span className="nxl-mtext">Campaigns</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.reports && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/campaigns/create" className="nxl-link">
                      New Campaign
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/campaigns/all" className="nxl-link">
                      View/Edit/Delete Campaigns
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Platform */}
            {/* <li
              className={`nxl-item nxl-hasmenu ${
                openMenu.reports ? "open" : ""
              }`}
              onMouseEnter={() => handleMouseEnter("reports")}
              onMouseLeave={() => handleMouseLeave("reports")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-cast" />
                </span>
                <span className="nxl-mtext">Platform</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.reports && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/reports/sales" className="nxl-link">
                      Campaigns
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/reports/leads" className="nxl-link">
                      Ads Sets
                    </Link>
                  </li>
                </ul>
              )}
            </li> */}

            {/* Analysis */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("apps")}
              onMouseLeave={() => handleMouseLeave("apps")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-send" />
                </span>
                <span className="nxl-mtext">Analysis</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.apps && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/apps/chat" className="nxl-link">
                      Chat
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/apps/email" className="nxl-link">
                      Email
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/apps/tasks" className="nxl-link">
                      Tasks
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/apps/notes" className="nxl-link">
                      Notes
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/apps/storage" className="nxl-link">
                      Storage
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/apps/calendar" className="nxl-link">
                      Calendar
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Demography */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("proposal")}
              onMouseLeave={() => handleMouseLeave("proposal")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-at-sign" />
                </span>
                <span className="nxl-mtext">Demography</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.proposal && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/proposal" className="nxl-link">
                      Proposal
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/proposal/view/1" className="nxl-link">
                      Proposal View
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/proposal/edit/1" className="nxl-link">
                      Proposal Edit
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/proposal/create" className="nxl-link">
                      Proposal Create
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Geography */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("payment")}
              onMouseLeave={() => handleMouseLeave("payment")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-dollar-sign" />
                </span>
                <span className="nxl-mtext">Geography</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.payment && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/payment" className="nxl-link">
                      Payment
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/invoice/view/1" className="nxl-link">
                      Invoice View
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/invoice/create" className="nxl-link">
                      Invoice Create
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Placements */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("leads")}
              onMouseLeave={() => handleMouseLeave("leads")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-alert-circle" />
                </span>
                <span className="nxl-mtext">Placements</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.leads && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/leads" className="nxl-link">
                      Leads
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/leads/view/1" className="nxl-link">
                      Leads View
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/leads/create" className="nxl-link">
                      Leads Create
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Projects */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("projects")}
              onMouseLeave={() => handleMouseLeave("projects")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-briefcase" />
                </span>
                <span className="nxl-mtext">Leads</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.projects && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/projects" className="nxl-link">
                      Projects
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/projects/view/1" className="nxl-link">
                      Projects View
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/projects/create" className="nxl-link">
                      Projects Create
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Widgets */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("widgets")}
              onMouseLeave={() => handleMouseLeave("widgets")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-layout" />
                </span>
                <span className="nxl-mtext">Widgets</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.widgets && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <Link href="/widgets/lists" className="nxl-link">
                      Lists
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/widgets/tables" className="nxl-link">
                      Tables
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/widgets/charts" className="nxl-link">
                      Charts
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/widgets/statistics" className="nxl-link">
                      Statistics
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <Link href="/widgets/miscellaneous" className="nxl-link">
                      Miscellaneous
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Settings */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("settings")}
              onMouseLeave={() => handleMouseLeave("settings")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-settings" />
                </span>
                <span className="nxl-mtext">Settings</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.settings && (
                <ul className="nxl-submenu">
                  {[
                    "general",
                    "seo",
                    "tags",
                    "email",
                    "tasks",
                    "leads",
                    "support",
                    "finance",
                    "gateways",
                    "customers",
                    "localization",
                    "recaptcha",
                    "miscellaneous",
                  ].map((item) => (
                    <li className="nxl-item" key={item}>
                      <Link
                        href={`/settings/${item}`}
                        className={`nxl-link ${
                          pathname === `/settings/${item}` ? "active" : ""
                        }`}
                      >
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Help */}
            <li
              className="d-none"
              onMouseEnter={() => handleMouseEnter("help")}
              onMouseLeave={() => handleMouseLeave("help")}
            >
              <a href="#!" className="nxl-link">
                <span className="nxl-micon">
                  <i className="feather-life-buoy" />
                </span>
                <span className="nxl-mtext">Help Center</span>
                <span className="nxl-arrow">
                  <i className="feather-chevron-right" />
                </span>
              </a>

              {openMenu.help && (
                <ul className="nxl-submenu">
                  <li className="nxl-item">
                    <a
                      href="https://themeforest.net/user/flexilecode"
                      target="_blank"
                      className="nxl-link"
                    >
                      Support
                    </a>
                  </li>
                  <li className="nxl-item">
                    <Link href="/help/knowledgebase" className="nxl-link">
                      KnowledgeBase
                    </Link>
                  </li>
                  <li className="nxl-item">
                    <a href="#!" className="nxl-link">
                      Documentations
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>

          <div className="card text-center">
            <div className="card-body">
              <i className="feather-sunrise fs-4 text-dark"></i>
              <h6 className="mt-4 text-dark fw-bolder">Downloading Center</h6>
              <p className="fs-11 my-3 text-dark">
                Duralux is a production ready CRM to get started up and running
                easily.
              </p>
              <a href="#!" className="btn btn-primary text-dark w-100">
                Download Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
