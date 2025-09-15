# Development Commands for Ani Hangout Site

## Package Management
```bash
# Install dependencies (Bun recommended)
bun install

# Install dependencies (npm)
npm install

# Install dependencies (yarn)
yarn install
```

## Development Servers
```bash
# Start Next.js development server
bun run dev
# or
npm run dev
# or
yarn dev

# Start Convex development server (separate terminal)
npx convex dev

# Start both servers simultaneously
bun run dev & npx convex dev
```

## Building and Deployment
```bash
# Build for production
bun run build
# or
npm run build

# Start production server
bun run start
# or
npm run start

# Deploy Convex functions
npx convex deploy
```

## Code Quality
```bash
# Run ESLint
bun run lint
# or
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if prettier configured)
npx prettier --write .
```

## Convex Database
```bash
# Initialize Convex project
npx convex dev --once

# View Convex dashboard
npx convex dashboard

# Generate types
npx convex typegen

# Run Convex functions locally
npx convex run <function-name>
```

## Environment Setup
```bash
# Create environment file
touch .env.local

# Edit environment variables
nano .env.local
# or
code .env.local
```

## Git Operations
```bash
# Clone repository
git clone <repository-url>
cd ani

# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push changes
git push origin feature/new-feature
```

## Testing
```bash
# Run unit tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e

# Test Clerk authentication
# Visit http://localhost:3000 and try sign-in/sign-up
```

## Utility Commands
```bash
# Clear node_modules and reinstall
rm -rf node_modules && bun install

# Clear Next.js cache
rm -rf .next

# Clear Convex cache
npx convex clear-cache

# Check Node.js version
node --version

# Check Bun version
bun --version

# List all available scripts
npm run
```

## Debugging
```bash
# Debug Next.js
NODE_OPTIONS='--inspect' npm run dev

# Debug Convex functions
npx convex run --debug <function-name>

# View Convex logs
npx convex logs
```

## Environment Variables Setup
```bash
# Clerk setup
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key" >> .env.local
echo "CLERK_SECRET_KEY=sk_test_your_key" >> .env.local

# Convex setup
echo "NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud" >> .env.local
```

## Common Development Workflow
```bash
# 1. Start development
bun install
bun run dev &

# 2. Start Convex (new terminal)
npx convex dev

# 3. Make changes and test
# Edit files in app/ directory

# 4. Check code quality
bun run lint

# 5. Build and test production
bun run build
bun run start

# 6. Deploy
npx convex deploy
# Then deploy to Vercel/Netlify
```