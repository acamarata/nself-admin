/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,
  reactStrictMode: true,
  env: {
    PROJECT_PATH: process.env.PROJECT_PATH || '.backend',
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Enable HMR optimizations
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // Handle native modules for dockerode
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('ssh2')
    }
    
    // Ignore native bindings
    config.resolve.alias = {
      ...config.resolve.alias,
      'ssh2': false,
    }
    
    return config
  },
}

export default nextConfig