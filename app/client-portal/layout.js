export const metadata = {
  title: 'Client Portal — Sociapa',
  description: 'View your campaign performance',
}

/**
 * Standalone layout for the client-facing portal.
 * Bypasses the full admin shell (sidebar + header) that wraps all other pages.
 * Overrides apply via 'client-portal-page' class added in layout-client.js and matching CSS in layout-fix.css
 */
export default function ClientPortalLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}
