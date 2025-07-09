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
    // Enable partial prerendering for faster builds
    ppr: false,
    // Optimize CSS - disabled due to critters issue
    optimizeCss: false,
  },
  // Disable image optimization for faster builds
  images: {
    unoptimized: true,
  },
  // Enable webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Aggressive module resolution for smaller bundles
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    
    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      
      // Faster compilation in dev
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
  // Enable output file tracing for smaller bundles
  output: 'standalone',
  // Optimize static generation
  trailingSlash: false,
  generateEtags: false,
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
};

module.exports = nextConfig; 