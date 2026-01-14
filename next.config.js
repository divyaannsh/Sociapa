/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure asset prefix if needed
  assetPrefix: undefined,
  // Enable static files from public directory
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

