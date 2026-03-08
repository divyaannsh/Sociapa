import Script from 'next/script'
import { ThemeProvider } from '../../contexts/ThemeContext'

export const metadata = {
  title: 'Admin Login - Sociapa Ads Dashboard',
  description: 'Login to access Sociapa Ads Dashboard',
}

export default function LoginLayout({ children }) {
  return (
    <>
      {/* Additional head elements for login page */}
      <link
        rel="stylesheet"
        type="text/css"
        href="/assets/css/bootstrap.min.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="/assets/vendors/css/vendors.min.css"
      />

      <ThemeProvider>
        {children}
      </ThemeProvider>

      {/* Vendors JS */}
      <Script src="/assets/vendors/js/vendors.min.js" strategy="beforeInteractive" />
    </>
  )
}
