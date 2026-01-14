'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, loading, requireAuth } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading) {
      requireAuth();
    }
  }, [loading, requireAuth]);

  useEffect(() => {
    // Initialize dashboard-specific scripts
    // This will be handled by dashboard-init.min.js when it loads
    if (typeof window !== 'undefined' && window.initDashboard) {
      window.initDashboard();
    }
  }, []);

  // Show loading or redirect to login
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, the requireAuth() will redirect to login
  // If authenticated, show the dashboard
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
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
                  <button 
                    onClick={() => router.push('/analytics/dashboard')}
                    className="btn btn-primary btn-lg"
                  >
                    Go to Analytics Dashboard
                  </button>
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

