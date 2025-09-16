#!/usr/bin/env node

/**
 * Posts Module Development Utilities
 * Provides optimized development workflow for posts-related components
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const POSTS_FILES = [
  'components/ui/post-card.tsx',
  'components/ui/post-composer.tsx',
  'components/ui/posts-feed.tsx',
  'components/ui/search-posts.tsx',
  'convex/posts.ts'
];

class PostsDevUtils {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
  }

  // Check if posts files exist
  checkFiles() {
    console.log('🔍 Checking posts files...');
    const missing = POSTS_FILES.filter(file => {
      const filePath = path.join(this.rootDir, file);
      return !fs.existsSync(filePath);
    });

    if (missing.length > 0) {
      console.error('❌ Missing files:', missing);
      return false;
    }

    console.log('✅ All posts files found');
    return true;
  }

  // Run type checking for posts
  typeCheck() {
    console.log('🔧 Running TypeScript check for posts...');
    try {
      execSync('npx tsc --noEmit --project tsconfig.posts.json', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      console.log('✅ TypeScript check passed');
      return true;
    } catch (error) {
      console.error('❌ TypeScript check failed');
      return false;
    }
  }

  // Run linting for posts
  lint() {
    console.log('🧹 Running ESLint for posts...');
    try {
      execSync('npx eslint components/ui/post-*.tsx convex/posts.ts --fix', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      console.log('✅ ESLint check passed');
      return true;
    } catch (error) {
      console.error('❌ ESLint check failed');
      return false;
    }
  }

  // Build posts components
  build() {
    console.log('🏗️ Building posts components...');
    try {
      execSync('npm run build:posts', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      console.log('✅ Build successful');
      return true;
    } catch (error) {
      console.error('❌ Build failed');
      return false;
    }
  }

  // Start development server with posts focus
  dev() {
    console.log('🚀 Starting posts-focused development server...');
    const child = spawn('npm', ['run', 'dev:posts'], {
      cwd: this.rootDir,
      stdio: 'inherit',
      env: { ...process.env, POSTS_DEV: 'true' }
    });

    child.on('close', (code) => {
      console.log(`Development server exited with code ${code}`);
    });

    return child;
  }

  // Watch posts files and run checks
  watch() {
    console.log('👀 Watching posts files for changes...');
    const chokidar = require('chokidar');

    const watcher = chokidar.watch(POSTS_FILES, {
      cwd: this.rootDir,
      ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 ${filePath} changed, running checks...`);
      this.lint();
      this.typeCheck();
    });

    return watcher;
  }

  // Analyze bundle size for posts
  analyze() {
    console.log('📊 Analyzing posts bundle size...');
    try {
      execSync('npm run posts:analyze', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
    } catch (error) {
      console.error('❌ Bundle analysis failed');
    }
  }

  // Run all checks
  check() {
    console.log('🔍 Running all posts checks...');
    const results = {
      files: this.checkFiles(),
      lint: this.lint(),
      types: this.typeCheck(),
      build: this.build()
    };

    const passed = Object.values(results).every(Boolean);
    console.log(passed ? '✅ All checks passed' : '❌ Some checks failed');
    return results;
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

const utils = new PostsDevUtils();

switch (command) {
  case 'check':
    utils.check();
    break;
  case 'lint':
    utils.lint();
    break;
  case 'type-check':
    utils.typeCheck();
    break;
  case 'build':
    utils.build();
    break;
  case 'dev':
    utils.dev();
    break;
  case 'watch':
    utils.watch();
    break;
  case 'analyze':
    utils.analyze();
    break;
  default:
    console.log(`
Posts Development Utilities

Usage: node scripts/posts-dev.js <command>

Commands:
  check      - Run all checks (files, lint, types, build)
  lint       - Run ESLint on posts files
  type-check - Run TypeScript check on posts files
  build      - Build posts components
  dev        - Start posts-focused development server
  watch      - Watch posts files and run checks on change
  analyze    - Analyze bundle size for posts

Examples:
  node scripts/posts-dev.js check
  node scripts/posts-dev.js lint
  node scripts/posts-dev.js dev
`);
    break;
}