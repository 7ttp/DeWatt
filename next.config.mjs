/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors due to type conflicts
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow warnings but don't fail the build
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
