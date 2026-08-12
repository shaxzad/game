/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run separately (`npm run lint`). Keep builds deterministic.
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  // Keep the native MongoDB driver out of the bundler so it runs as a plain
  // Node dependency in Server Components and Route Handlers.
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
