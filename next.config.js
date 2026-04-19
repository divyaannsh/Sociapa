/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // only active in production
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sociapa-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: undefined,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Protect cron routes — only Vercel internal calls allowed
        source: '/api/cron/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
