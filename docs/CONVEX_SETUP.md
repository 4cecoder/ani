# ConvexDB Setup Guide

## Prerequisites
1. Install Convex CLI: `npm install -g convex`
2. Create a Convex account at https://www.convex.dev/

## Setup Steps

### 1. Initialize ConvexDB
```bash
cd /root/bytecats/sites/ani
npx convex dev --once
```

### 2. Configure Environment Variables
Update `.env.local` with your actual keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Deploy Schema
```bash
npx convex deploy
```

### 4. Create Mutations and Queries
After initialization, Convex will generate the `_generated` files. Then you can create:

- `convex/users.ts` - User management
- `convex/messages.ts` - Chat messages
- `convex/posts.ts` - Social posts
- `convex/interfaceState.ts` - OS-like interface state

## Database Schema

The schema includes:
- **Users**: Clerk authentication integration
- **Chat Rooms**: Public, private, and DM channels
- **Messages**: Chat messages with threading support
- **Posts**: Social media style posts with likes/comments
- **User Interface State**: Window positions, preferences, etc.
- **Files**: File uploads and attachments

## Features Implemented

✅ Next.js 15 with App Router
✅ Clerk authentication with custom UI
✅ ConvexDB schema for chat, posts, and interface state
✅ OS-like desktop interface with draggable windows
✅ Responsive design with Tailwind CSS
✅ Real-time capabilities ready for ConvexDB integration

## Next Steps

1. Complete ConvexDB initialization
2. Implement real-time subscriptions for chat
3. Add file upload functionality
4. Implement drag-and-drop for windows
5. Add more interactive features

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`