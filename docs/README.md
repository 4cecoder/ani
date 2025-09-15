# Ani Hangout Site Documentation

## Overview

Ani is a social hangout platform featuring an OS-like interface with draggable, minimizable modules for chat, posts, and other social interactions. Built with Next.js, Clerk.js for authentication, and ConvexDB for real-time data management.

## Features

### 🖥️ OS-Like Interface
- **Draggable Modules**: Move chat windows, post feeds, and other components around the screen
- **Minimizable Windows**: Minimize modules to keep your workspace organized
- **Responsive Design**: Adapts to different screen sizes while maintaining the desktop-like experience
- **Multi-Window Management**: Handle multiple conversations and activities simultaneously

### 💬 Real-Time Chat
- **Instant Messaging**: Send and receive messages in real-time
- **Group Chats**: Create and participate in group conversations
- **Private Messages**: Direct messaging with other users
- **Message History**: Persistent chat history across sessions
- **Typing Indicators**: See when others are typing
- **Online Status**: View who's currently online

### 📝 Social Posts
- **Post Creation**: Share text, images, and links with the community
- **Like & Comment**: Interact with posts through likes and comments
- **Timeline Feed**: Scroll through posts from friends and followed users
- **Hashtags & Mentions**: Use hashtags for discoverability and @mentions for notifications
- **Media Upload**: Share photos and videos in posts

### 🔐 Authentication & Security
- **Clerk.js Integration**: Secure authentication with social login options
- **User Profiles**: Customizable user profiles with avatars and bios
- **Privacy Controls**: Manage who can see your posts and contact you
- **Session Management**: Secure session handling and automatic logout

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Git

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ani
bun install  # or npm install / yarn install
```

### 2. Clerk.js Setup

1. **Create a Clerk Application**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Choose your authentication providers (Google, GitHub, etc.)

2. **Environment Variables**
   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

3. **Configure Clerk Provider**
   The Clerk provider is already configured in `app/layout.tsx`. Make sure it's properly set up:

   ```tsx
   import { ClerkProvider } from '@clerk/nextjs'

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body>{children}</body>
         </html>
       </ClerkProvider>
     )
   }
   ```

### 3. ConvexDB Setup

1. **Install Convex CLI**
   ```bash
   npm install -g convex
   # or
   bun add -g convex
   ```

2. **Initialize Convex**
   ```bash
   npx convex dev --once
   ```

3. **Configure Environment**
   Add to your `.env.local`:

   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
   ```

4. **Database Schema**
   Create `convex/schema.ts`:

   ```typescript
   import { defineSchema, defineTable } from "convex/server";
   import { v } from "convex/values";

   export default defineSchema({
     users: defineTable({
       clerkId: v.string(),
       username: v.string(),
       avatar: v.optional(v.string()),
       bio: v.optional(v.string()),
       createdAt: v.number(),
     }),

     messages: defineTable({
       content: v.string(),
       authorId: v.id("users"),
       channelId: v.id("channels"),
       createdAt: v.number(),
     }).index("by_channel", ["channelId"]),

     posts: defineTable({
       content: v.string(),
       authorId: v.id("users"),
       likes: v.number(),
       createdAt: v.number(),
     }).index("by_author", ["authorId"]),

     channels: defineTable({
       name: v.string(),
       description: v.optional(v.string()),
       isPrivate: v.boolean(),
       createdAt: v.number(),
     }),
   });
   ```

### 4. Development Setup

1. **Start Development Server**
   ```bash
   bun run dev  # or npm run dev / yarn dev
   ```

2. **Start Convex Development**
   ```bash
   npx convex dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Development Guidelines

### Code Style

- **TypeScript**: All components and utilities must be written in TypeScript
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **Component Naming**: Use PascalCase for components, camelCase for utilities

### Project Structure

```
ani/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Clerk provider
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── chat/             # Chat-related components
│   ├── posts/            # Post-related components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
├── convex/               # Convex backend functions
├── docs/                 # Documentation
└── public/               # Static assets
```

### Component Guidelines

#### Window Management
- Use `react-draggable` for draggable functionality
- Implement minimize/maximize states
- Maintain z-index for proper layering
- Handle window focus/blur events

#### Real-Time Updates
- Use Convex subscriptions for real-time data
- Implement optimistic updates for better UX
- Handle connection states and error recovery

#### Authentication
- Always check authentication state before rendering protected content
- Use Clerk hooks for user data
- Handle loading states during authentication

### State Management

- **Convex**: Use for server state and real-time data
- **React State**: Use for local component state
- **Context**: Use sparingly for global app state

### API Design

#### Convex Functions
- Keep functions focused and single-purpose
- Use proper TypeScript types
- Implement proper error handling
- Add JSDoc comments for documentation

Example:
```typescript
// convex/messages.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send a message to a channel
 */
export const sendMessage = mutation({
  args: {
    content: v.string(),
    channelId: v.id("channels"),
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
      createdAt: Date.now(),
    });
  },
});
```

### Testing

- Write unit tests for utility functions
- Integration tests for Convex functions
- E2E tests for critical user flows
- Test authentication flows thoroughly

### Deployment

1. **Build the Application**
   ```bash
   bun run build
   ```

2. **Deploy Convex**
   ```bash
   npx convex deploy
   ```

3. **Deploy to Vercel/Netlify**
   - Connect your repository
   - Set environment variables
   - Deploy

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Support

- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check this docs folder for detailed guides

## Roadmap

- [ ] Mobile app development
- [ ] Voice chat integration
- [ ] File sharing system
- [ ] Advanced moderation tools
- [ ] Custom themes and skins
- [ ] Integration with external services

---

Built with ❤️ using Next.js, Clerk.js, and ConvexDB