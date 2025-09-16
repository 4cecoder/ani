/** @type {import('next').NextConfig} */
const nextConfig = {
  // Posts-specific optimizations
  experimental: {
    appOnly: true,
    turbo: {
      rules: {
        '*.tsx': {
          loaders: ['@swc/loader'],
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              transform: {
                react: {
                  runtime: 'automatic'
                }
              }
            }
          }
        }
      }
    }
  },

  // Bundle analysis for posts
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        posts: {
          test: /[\\/]components[\\/]ui[\\/]post-.*\.tsx$/,
          name: 'posts',
          chunks: 'all',
          enforce: true
        }
      };
    }

    // Add bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Optimize images for posts
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable SWC minification
  swcMinify: true,

  // Optimize fonts
  optimizeFonts: true,
};

module.exports = nextConfig;