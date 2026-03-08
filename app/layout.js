import Navigation from '../components/Navigation'
import Header from '../components/Header'
import LayoutClient from './layout-client'
import LayoutWrapper from '../components/LayoutWrapper'
import Script from 'next/script'
import { ThemeProvider } from '../contexts/ThemeContext'
import '../styles/index.css'
import '../styles/layout-fix.css'
import '../styles/dark-mode.css'

export const metadata = {
  title: 'Sociapa Ads Dashboard',
  description: 'Multi-client advertising analytics dashboard by Sociapa',
  manifest: '/manifest.json',
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
        <ThemeProvider>
          <LayoutWrapper>
            <Navigation />
            <Header />
            <main className="nxl-container">
              <div className="nxl-content">
                <LayoutClient>{children}</LayoutClient>
              </div>
            </main>
          </LayoutWrapper>
        </ThemeProvider>

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

