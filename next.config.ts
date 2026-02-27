import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  
  // This tells Vercel to completely ignore formatting and ESLint errors during deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // This tells Vercel to completely ignore strict TypeScript errors during deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;