'use client'

import { useEffect } from "react";
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    // Initialize Bootstrap dropdowns and other interactive elements
    // This will be handled by the theme's JavaScript files when they load
  }, []);

  if (pathname === '/login') return null;

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        {/* Header Left */}
        <div className="header-left d-flex align-items-center gap-4">
          {/* Mobile Toggler */}
          <a href="#!" className="nxl-head-mobile-toggler" id="mobile-collapse">
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>
        </div>

        {/* Header Right */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center">
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

