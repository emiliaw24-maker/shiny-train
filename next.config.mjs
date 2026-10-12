/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:7861/api/:path*",
      },
      {
        source: "/health",
        destination: "http://127.0.0.1:7861/health",
      },
    ];
  },
};

export default nextConfig;
