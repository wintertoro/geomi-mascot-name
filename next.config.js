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
    optimizePackageImports: ['lucide-react', '@aptos-labs/wallet-adapter-react'],
    // Optimize server components
    serverComponentsExternalPackages: ['@aptos-labs/ts-sdk'],
  },
  // Enable build caching
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Optimize images
  images: {
    unoptimized: true, // Disable image optimization for faster builds
  },
  // Enable webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    // Reduce bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      'lucide-react': require.resolve('lucide-react'),
    };
    
    return config;
  },
  // Enable output file tracing for smaller bundles
  output: 'standalone',
  // Optimize static generation
  trailingSlash: false,
  generateEtags: false,
  // Compress static assets
  compress: true,
};

module.exports = nextConfig; 