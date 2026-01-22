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
  experimental: {
    optimizeCss: true,
  },
  // Webpack config for production builds
  webpack: (config, { isServer }) => {
    // Handle native modules for dockerode
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('ssh2', 'cpu-features')
    }

    // Ignore native bindings
    config.resolve.alias = {
      ...config.resolve.alias,
      'ssh2': false,
      'cpu-features': false,
    }

    return config
  },
  // Server external packages for native modules
  serverExternalPackages: ['ssh2', 'dockerode', 'cpu-features'],
}

export default nextConfig