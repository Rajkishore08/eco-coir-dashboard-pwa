/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  // Enable React Compiler for automatic optimization
  experimental: {
    reactCompiler: true,
  },
  // Optimize production builds
  compress: true,
  swcMinify: true,
  // Reduce client-side bundle
  optimization: {
    minimize: true,
  },
  // Enable streaming for better perceived performance
  serverActions: {
    bodySizeLimit: '2mb',
  },
}

export default nextConfig
