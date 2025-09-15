# Architecture Overview

This document describes the system architecture of the Ani Hangout Site, a social platform with an OS-like interface featuring real-time chat, social posts, and draggable modules.

## System Overview

Ani is built as a modern web application using the following technologies:

- **Frontend**: Next.js 14 with React 18
- **Authentication**: Clerk.js
- **Database**: ConvexDB (real-time database)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript
- **Package Manager**: Bun

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │     Clerk.js     │    │    ConvexDB     │
│                 │    │                 │    │                 │
│  ┌────────────┐ │    │  ┌────────────┐ │    │  ┌────────────┐ │
│  │ Components │ │◄──►│  │ Auth Flow  │ │◄──►│  │ Mutations  │ │
│  └────────────┘ │    │  └────────────┘ │    │  └────────────┘ │
│                 │    │                 │    │                 │
│  ┌────────────┐ │    │  ┌────────────┐ │    │  ┌────────────┐ │
│  │   Pages    │ │    │  │ User Mgmt  │ │    │  │   Queries   │ │
│  └────────────┘ │    │  └────────────┘ │    │  └────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Web Browser   │
                    │                 │
                    │  ┌────────────┐ │
                    │  │ OS-like UI │ │
                    │  │  Draggable │ │
                    │  │  Modules   │ │
                    │  └────────────┘ │
                    └─────────────────┘
```

## Core Components

### Frontend Architecture

#### Next.js Application Structure

```
app/
├── layout.tsx          # Root layout with Clerk provider
├── page.tsx           # Home page
├── globals.css        # Global styles
├── sign-in/           # Authentication pages
│   └── page.tsx
└── sign-up/
    └── page.tsx

components/
├── ui/                # Reusable UI components (shadcn/ui)
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── chat/              # Chat-related components
│   ├── ChatWindow.tsx
│   ├── MessageList.tsx
│   └── MessageInput.tsx
├── posts/             # Post-related components
│   ├── PostFeed.tsx
│   ├── PostCard.tsx
│   └── CreatePost.tsx
├── layout/            # Layout components
│   ├── Window.tsx     # Draggable window component
│   ├── Desktop.tsx    # Main desktop area
│   └── Taskbar.tsx    # Bottom taskbar
└── providers/         # Context providers
    ├── ThemeProvider.tsx
    └── WindowManager.tsx
```

#### Component Hierarchy

```
App (layout.tsx)
├── ClerkProvider
│   └── Desktop (page.tsx)
│       ├── WindowManager
│       │   ├── ChatWindow (draggable)
│       │   ├── PostFeed (draggable)
│       │   ├── UserProfile (draggable)
│       │   └── Settings (draggable)
│       └── Taskbar
│           ├── StartMenu
│           ├── OpenWindows
│           └── SystemTray
```

### Window Management System

The OS-like interface is implemented using a sophisticated window management system:

#### Window Component

```typescript
interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
  zIndex: number;
}

function Window({ id, title, children, ...props }: WindowProps) {
  // Window state management
  // Drag handling
  // Resize handling
  // Z-index management
}
```

#### Window Manager

```typescript
interface WindowState {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

class WindowManager {
  private windows: Map<string, WindowState> = new Map();

  createWindow(config: WindowConfig): string {
    // Create new window instance
  }

  minimizeWindow(id: string): void {
    // Minimize window
  }

  maximizeWindow(id: string): void {
    // Maximize window
  }

  focusWindow(id: string): void {
    // Bring window to front
  }
}
```

### Real-Time Data Flow

#### ConvexDB Integration

```
Client Request ──► Convex Function ──► Database Operation
                        │
                        ▼
                Real-time Subscription ──► Client Update
```

#### Data Flow Example

```typescript
// Client-side mutation
const sendMessage = useMutation(api.messages.sendMessage);

// Convex function
export const sendMessage = mutation({
  args: { content: v.string(), channelId: v.id("channels") },
  handler: async (ctx, args) => {
    // Validate user
    // Insert message
    // Return result
  },
});

// Client-side subscription
const messages = useQuery(api.messages.getMessages, { channelId });
```

### Authentication Flow

#### Clerk.js Integration

```
User Action ──► Clerk.js ──► JWT Token ──► Convex Function
     │              │             │             │
     │              │             │             │
     ▼              ▼             ▼             ▼
Sign In/Up ──► Auth State ──► User Identity ──► Database Access
```

#### Authentication Guards

```typescript
// In Convex functions
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

// In React components
import { useAuth } from "@clerk/nextjs";

function ProtectedComponent() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <div>Please sign in</div>;

  return <div>Protected content</div>;
}
```

## Database Schema

### Core Tables

#### Users Table
```typescript
users: defineTable({
  clerkId: v.string(),           // Clerk user ID
  username: v.string(),          // Unique username
  email: v.string(),             // User email
  avatar: v.optional(v.string()), // Profile picture URL
  bio: v.optional(v.string()),    // User biography
  createdAt: v.number(),         // Creation timestamp
  updatedAt: v.number(),         // Last update timestamp
})
.index("by_clerk_id", ["clerkId"])
.index("by_username", ["username"])
```

#### Messages Table
```typescript
messages: defineTable({
  content: v.string(),           // Message content
  authorId: v.id("users"),       // Message author
  channelId: v.id("channels"),   // Target channel
  type: v.union(                 // Message type
    v.literal("text"),
    v.literal("image"),
    v.literal("file")
  ),
  metadata: v.optional(v.any()), // Additional data
  createdAt: v.number(),         // Creation timestamp
  editedAt: v.optional(v.number()), // Edit timestamp
})
.index("by_channel", ["channelId"])
.index("by_author", ["authorId"])
```

#### Channels Table
```typescript
channels: defineTable({
  name: v.string(),              // Channel name
  description: v.optional(v.string()), // Channel description
  type: v.union(                 // Channel type
    v.literal("public"),
    v.literal("private"),
    v.literal("dm")
  ),
  members: v.array(v.id("users")), // Channel members
  createdBy: v.id("users"),      // Channel creator
  createdAt: v.number(),         // Creation timestamp
})
.index("by_type", ["type"])
.index("by_member", ["members"])
```

#### Posts Table
```typescript
posts: defineTable({
  content: v.string(),           // Post content
  authorId: v.id("users"),       // Post author
  images: v.optional(v.array(v.string())), // Image URLs
  likes: v.array(v.id("users")), // Users who liked
  comments: v.array(v.id("comments")), // Post comments
  hashtags: v.array(v.string()), // Post hashtags
  createdAt: v.number(),         // Creation timestamp
  updatedAt: v.number(),         // Last update timestamp
})
.index("by_author", ["authorId"])
.index("by_hashtag", ["hashtags"])
.index("by_created_at", ["createdAt"])
```

## State Management

### Client-Side State

#### React State
- Component-level state using `useState`
- Form state management
- UI state (modals, dropdowns, etc.)

#### Convex State
- Server state using Convex queries
- Real-time subscriptions
- Optimistic updates

#### Context Providers
```typescript
// WindowManager Context
const WindowManagerContext = createContext<WindowManager | null>(null);

// Theme Context
const ThemeContext = createContext<ThemeConfig | null>(null);

// User Preferences Context
const PreferencesContext = createContext<UserPreferences | null>(null);
```

### Server-Side State

#### Convex Functions
- Database mutations
- Query handlers
- Authentication checks
- Business logic

## Performance Optimizations

### Frontend Optimizations

#### Code Splitting
```typescript
// Dynamic imports for large components
const ChatWindow = dynamic(() => import('../components/ChatWindow'), {
  loading: () => <div>Loading chat...</div>,
});
```

#### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={post.image}
  alt={post.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

#### Memoization
```typescript
const MessageList = memo(function MessageList({ messages }) {
  return (
    <div>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
});
```

### Database Optimizations

#### Indexing Strategy
- Primary indexes on frequently queried fields
- Composite indexes for complex queries
- Partial indexes for filtered queries

#### Query Optimization
```typescript
// Efficient pagination
export const getPosts = query({
  args: { limit: v.number(), cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .paginate({
        numItems: args.limit,
        cursor: args.cursor,
      });
  },
});
```

## Security Considerations

### Authentication Security
- JWT token validation
- Secure session management
- Password hashing (handled by Clerk)
- Rate limiting on authentication endpoints

### Data Security
- Input validation and sanitization
- SQL injection prevention (ORM protection)
- XSS protection
- CSRF protection

### API Security
- Authentication required for mutations
- Authorization checks in Convex functions
- Rate limiting on API endpoints
- CORS configuration

## Deployment Architecture

### Development Environment
```
Local Development
├── Next.js Dev Server (localhost:3000)
├── Convex Dev Server (localhost:3210)
└── Hot Reload Enabled
```

### Production Environment
```
Vercel Deployment
├── Next.js App (vercel.app)
├── Convex Database (convex.cloud)
├── CDN (Vercel Edge Network)
└── SSL/TLS Encryption
```

### CI/CD Pipeline
```
Git Push ──► GitHub Actions ──► Tests ──► Build ──► Deploy
     │              │              │              │
     │              │              │              │
     ▼              ▼              ▼              ▼
Code Quality ──► Security Scan ──► E2E Tests ──► Production
```

## Monitoring and Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Real user monitoring (RUM)
- Error tracking and alerting
- Database performance metrics

### User Analytics
- User engagement metrics
- Feature usage analytics
- Conversion funnel analysis
- A/B testing framework

### Business Metrics
- Daily active users (DAU)
- Monthly active users (MAU)
- Message volume
- Post engagement rates

## Scalability Considerations

### Horizontal Scaling
- Stateless Next.js application
- ConvexDB automatic scaling
- CDN for static assets
- Load balancer configuration

### Database Scaling
- ConvexDB handles scaling automatically
- Query optimization for performance
- Caching strategies
- Database indexing

### Real-Time Scaling
- WebSocket connections for real-time features
- Connection pooling
- Message queuing for high-volume channels
- Rate limiting and throttling

## Future Architecture Evolution

### Planned Improvements
- Microservices architecture for larger scale
- GraphQL API for flexible data fetching
- Advanced caching with Redis
- Message queue system (RabbitMQ/Kafka)
- Advanced analytics and ML features

### Technology Migration Path
- React Server Components adoption
- Next.js 15 features utilization
- Advanced ConvexDB features
- Performance optimizations
- Enhanced security measures