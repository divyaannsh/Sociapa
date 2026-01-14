'use client'

import { useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Link from "next/link";

export default function Dashboard() {
  useEffect(() => {
    // Initialize dashboard-specific scripts
    // This will be handled by dashboard-init.min.js when it loads
    if (typeof window !== 'undefined' && window.initDashboard) {
      window.initDashboard();
    }
  }, []);

  return (
    <>
      <PageHeader
        title="Dashboard"
        breadcrumb={[
          { label: "Home", path: "/" },
          { label: "Dashboard", path: "/" },
        ]}
      />

      <div className="main-content">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 text-center mb-3">
            <img
              src="/assets/images/logo-full.png"
              alt="Sociapa Logo"
              className="img-fluid"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card text-center py-5">
              <div className="card-body">
                <h1 className="display-6 fw-bold mb-3" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  Welcome to Ads Dashboard!
                </h1>
                <p className="lead text-muted mb-4" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  A clean place to start managing your accounts and clients.
                </p>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  <Link href="/clients/create" className="btn btn-primary btn-lg">
                    Create account for clients
                  </Link>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-muted" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                Explore options below the heading to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

