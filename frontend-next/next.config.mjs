/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  turbopack: {},
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: [],
  async rewrites() {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
      { source: '/realtime/:path*', destination: `${apiUrl}/realtime/:path*` },
    ];
  },
  images: { unoptimized: true },
};
export default nextConfig;
