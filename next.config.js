/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production even in dev
  reactStrictMode: true,

  // Optimize images
  images: {
    domains: [],
  },

  // Production optimizations
  output: 'standalone',

  // Code splitting and optimization
  experimental: {
    // Optimize CSS
    optimizeCss: true,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Module transpilation for optimization
  transpilePackages: ['lucide-react'],

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Handle native modules and external dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        child_process: false,
      }
    }

    // Ignore native modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    })

    return config
  },
}

module.exports = nextConfig
