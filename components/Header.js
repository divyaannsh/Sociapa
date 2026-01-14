'use client'

import { useEffect } from "react";
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

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
            {/* Global search removed per request; page-level search will be used instead */}
          </div>
        </div>
      </div>
    </header>
  );
}

