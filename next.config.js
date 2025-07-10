/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize builds
  swcMinify: true,
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Enable modern JS compilation
    esmExternals: true,
    // Reduce compilation time
    optimizePackageImports: ['@aptos-labs/wallet-adapter-react'],
    // Optimize server components
    serverComponentsExternalPackages: ['@aptos-labs/ts-sdk'],
    // Disable partial prerendering to prevent SSR issues
    ppr: false,
    // Optimize CSS - disabled due to critters issue
    optimizeCss: false,
    // Force dynamic rendering
    forceSwcTransforms: false,
  },
  // Disable image optimization for faster builds
  images: {
    unoptimized: true,
  },
  // Disable static optimization to prevent SSR issues with wallet components
  generateEtags: false,
  // Disable static optimization
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Compress static assets
  compress: true,
  // Optimize dev builds
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Skip type checking during build for speed
  typescript: {
    ignoreBuildErrors: false,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Optimize page data
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Force dynamic rendering for all pages
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig; 