/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 1. ESLint configuration (Moved outside of images) */
  eslint: {
    // This fixes the 'Unknown options: useEslintrc' error during Vercel build
    ignoreDuringBuilds: true, 
  },

  /* 2. Image configuration */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "files.convex.dev",
      },
    ],
  },

  /* 3. Server Actions are now stable in Next 15, so no experimental flag needed! */
};

module.exports = nextConfig;