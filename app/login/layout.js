import Script from 'next/script'

export const metadata = {
  title: 'Admin Login - Sociapa Ads Dashboard',
  description: 'Login to access Sociapa Ads Dashboard',
}

export default function LoginLayout({ children }) {
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body>
        {children}

        {/* Vendors JS */}
        <Script src="/assets/vendors/js/vendors.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
