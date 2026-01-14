import Navigation from '../components/Navigation'
import Header from '../components/Header'
import LayoutClient from './layout-client'
import Script from 'next/script'
import '../styles/index.css'

export const metadata = {
  title: 'Sociapa Ads Dashboard',
  description: 'Admin Dashboard for Sociapa',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/x-icon"
          href="/assets/images/logoSociapa.png"
        />
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
        <link
          rel="stylesheet"
          type="text/css"
          href="/assets/vendors/css/daterangepicker.min.css"
        />
        <link rel="stylesheet" type="text/css" href="/assets/css/theme.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body>
        <Navigation />
        <Header />
        <main className="nxl-container">
          <div className="nxl-content">
            <LayoutClient>{children}</LayoutClient>
          </div>
        </main>

        {/* Vendors JS */}
        <Script src="/assets/vendors/js/vendors.min.js" strategy="beforeInteractive" />
        <Script src="/assets/vendors/js/daterangepicker.min.js" strategy="lazyOnload" />
        <Script src="/assets/vendors/js/apexcharts.min.js" strategy="lazyOnload" />
        <Script src="/assets/vendors/js/circle-progress.min.js" strategy="lazyOnload" />
        
        {/* Common Init */}
        <Script src="/assets/js/common-init.min.js" strategy="lazyOnload" />
        
        {/* Page-specific scripts will be loaded by client components */}
      </body>
    </html>
  )
}

