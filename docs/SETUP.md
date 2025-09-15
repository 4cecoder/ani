# Setup Guide

This guide provides detailed instructions for setting up the Ani Hangout Site development environment.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **Package Manager**: Bun (recommended), npm, or yarn
- **Git**: Version 2.30 or higher
- **Operating System**: macOS, Linux, or Windows (WSL recommended)

### Development Tools
- **Code Editor**: VS Code with TypeScript and React extensions
- **Terminal**: Modern terminal with git support
- **Browser**: Chrome or Firefox for development

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ani
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

# Optional: Development
NODE_ENV=development
```

## Clerk.js Configuration

### Creating a Clerk Application

1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Create application"
3. Choose "Create your own application"
4. Enter application name: "Ani Hangout"
5. Select authentication providers:
   - Email/Password (required)
   - Google (recommended)
   - GitHub (optional)
6. Configure sign-in/sign-up URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

### Getting API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy the "Publishable key" and "Secret key"
3. Add them to your `.env.local` file

### Clerk Provider Setup

The Clerk provider is configured in `app/layout.tsx`:

```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

## ConvexDB Configuration

### Installing Convex CLI

```bash
npm install -g convex
# or
bun add -g convex
```

### Initializing Convex

```bash
npx convex dev --once
```

This will:
- Create a `convex/` directory
- Set up your Convex project
- Generate deployment URL

### Database Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_clerk_id", ["clerkId"])
  .index("by_username", ["username"]),

  // Chat messages
  messages: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    channelId: v.id("channels"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
  })
  .index("by_channel", ["channelId"])
  .index("by_author", ["authorId"]),

  // Chat channels
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("public"), v.literal("private"), v.literal("dm")),
    members: v.array(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
  .index("by_type", ["type"])
  .index("by_member", ["members"]),

  // Social posts
  posts: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    images: v.optional(v.array(v.string())),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
    hashtags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_author", ["authorId"])
  .index("by_hashtag", ["hashtags"])
  .index("by_created_at", ["createdAt"]),

  // Comments on posts
  comments: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")), // For nested comments
    likes: v.array(v.id("users")),
    createdAt: v.number(),
  })
  .index("by_post", ["postId"])
  .index("by_author", ["authorId"]),
});
```

### Convex Functions

Create essential Convex functions in `convex/` directory:

#### Authentication (`convex/auth.ts`)
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

#### Messages (`convex/messages.ts`)
```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    content: v.string(),
    channelId: v.id("channels"),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("file"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("messages", {
      content: args.content,
      authorId: user._id,
      channelId: args.channelId,
      type: args.type || "text",
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(50);
  },
});
```

## Development Workflow

### Starting Development Servers

1. **Start Next.js Development Server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

2. **Start Convex Development Server** (in another terminal)
   ```bash
   npx convex dev
   ```

3. **Open Browser**
   - Frontend: http://localhost:3000
   - Convex Dashboard: Check terminal output for dashboard URL

### Testing the Setup

1. **Check Environment Variables**
   ```bash
   # Verify .env.local exists and has correct values
   cat .env.local
   ```

2. **Test Clerk Integration**
   - Visit http://localhost:3000
   - Try signing up/in
   - Check browser console for errors

3. **Test Convex Integration**
   - Open Convex dashboard
   - Check if schema is deployed
   - Test a simple query/mutation

### Troubleshooting

#### Common Issues

**Clerk: "Invalid API key"**
- Check that API keys are correctly copied from Clerk dashboard
- Ensure no extra spaces or characters in `.env.local`

**Convex: "Connection failed"**
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Check that Convex dev server is running
- Ensure firewall allows connections to Convex

**Build Errors**
- Clear node_modules: `rm -rf node_modules && bun install`
- Check TypeScript errors: `bun run type-check`
- Verify all dependencies are installed

#### Getting Help

- Check the [Clerk Documentation](https://docs.clerk.com/)
- Visit [Convex Documentation](https://docs.convex.dev/)
- Join our Discord community for support

## Next Steps

Once setup is complete:
1. Read the [Architecture Guide](./ARCHITECTURE.md)
2. Follow the [Development Guidelines](./DEVELOPMENT.md)
3. Start building features using the [API Reference](./API.md)