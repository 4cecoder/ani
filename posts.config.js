// Posts Module Development Configuration
export const postsConfig = {
  // Files to watch for posts development
  watchFiles: [
    'components/ui/post-card.tsx',
    'components/ui/post-composer.tsx',
    'components/ui/posts-feed.tsx',
    'components/ui/search-posts.tsx',
    'convex/posts.ts',
    'lib/hooks/useHangout.ts'
  ],

  // Build optimization settings
  build: {
    turbopack: true,
    experimental: {
      appOnly: true
    },
    optimizeFonts: true,
    optimizeImages: true,
    swcMinify: true
  },

  // Development server settings
  dev: {
    port: 3000,
    host: 'localhost',
    hmr: {
      overlay: true,
      reload: true
    }
  },

  // TypeScript settings for posts
  typescript: {
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    exactOptionalPropertyTypes: true
  },

  // ESLint settings for posts
  eslint: {
    fix: true,
    cache: true,
    errorOnUnmatchedPattern: false
  }
};

export default postsConfig;