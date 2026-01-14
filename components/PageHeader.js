'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function PageHeader({ title, breadcrumb }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Bootstrap dropdowns after component mounts
    if (typeof window !== 'undefined' && window.bootstrap) {
      const dropdownElementList = document.querySelectorAll('[data-bs-toggle="dropdown"]')
      dropdownElementList.forEach(dropdownToggleEl => {
        new window.bootstrap.Dropdown(dropdownToggleEl)
      })
    }
  }, []);

  // Generate title from path if not provided
  const pageTitle =
    title ||
    pathname
      .split("/")
      .pop()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  // Generate breadcrumb from path if not provided
  const breadcrumbItems = breadcrumb || [
    { label: "Home", path: "/" },
    { label: pageTitle, path: pathname },
  ];

  return (
    <div className="page-header">
      <div className="page-header-left d-flex align-items-center">
        <div className="page-header-title">
          <h5 className="m-b-10">{pageTitle}</h5>
        </div>
        <ul className="breadcrumb">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {index === breadcrumbItems.length - 1 ? (
                item.label
              ) : (
                <a href={item.path}>{item.label}</a>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="page-header-right ms-auto">
        <div className="page-header-right-items">
          <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
            <div
              id="reportrange"
              className="reportrange-picker d-flex align-items-center"
            >
              <span className="reportrange-picker-field"></span>
            </div>

            {/* Replace the Filter dropdown with a Search icon that opens a search input */}
            <div className="dropdown page-search-dropdown">
              <a
                href="#!"
                className="nxl-head-link btn btn-md btn-light"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                <i className="feather-search"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown">
                <div
                  className="input-group search-form p-2"
                  style={{ minWidth: "220px", maxWidth: "90vw" }}
                >
                  <span className="input-group-text">
                    <i className="feather-search fs-6 text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control search-input-field"
                    placeholder="Search..."
                    style={{ maxWidth: "100%" }}
                  />
                  <span className="input-group-text">
                    <button type="button" className="btn-close" onClick={(e) => {
                      e.stopPropagation();
                      const dropdown = e.target.closest('.dropdown');
                      if (dropdown) {
                        const dropdownInstance = window.bootstrap?.Dropdown?.getInstance(dropdown.querySelector('[data-bs-toggle="dropdown"]'));
                        if (dropdownInstance) {
                          dropdownInstance.hide();
                        }
                      }
                    }}></button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

