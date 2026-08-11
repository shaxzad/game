/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run separately (`npm run lint`). Keep builds deterministic.
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
