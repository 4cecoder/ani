# Ani Hangout Site - Data Architecture Design

## Overview

This document outlines the comprehensive data architecture for the Ani social hangout platform, designed to support real-time chat, social posts, and an OS-like interface with movable/minimizable modules. The architecture is built on ConvexDB for real-time capabilities and Clerk for authentication.

## Core Principles

- **Real-time First**: All social interactions happen in real-time
- **Scalable Design**: Support for growing user base and data volume
- **Modular UI**: OS-like interface with persistent user module states
- **Privacy-Aware**: Granular privacy controls and relationship management
- **Performance Optimized**: Efficient queries with proper indexing

## Database Schema

### 1. Users Table
```typescript
users: defineTable({
  clerkId: v.string(), // Clerk authentication ID
  username: v.string(),
  email: v.string(),
  avatar: v.optional(v.string()),
  bio: v.optional(v.string()),
  status: v.string(), // "online", "away", "offline"
  lastSeen: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Purpose**: User profiles and authentication state
**Indexes**: `by_clerk_id`, `by_username`, `by_status`
**Relationships**: Referenced by posts, messages, comments, relationships

### 2. Channels Table
```typescript
channels: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  type: v.string(), // "public", "private", "direct"
  createdBy: v.id("users"),
  members: v.array(v.id("users")),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Purpose**: Chat rooms and conversation channels
**Indexes**: `by_type`, `by_created_by`, `by_members`
**Relationships**: Contains messages, has members from users table

### 3. Messages Table
```typescript
messages: defineTable({
  content: v.string(),
  authorId: v.id("users"),
  channelId: v.id("channels"),
  type: v.string(), // "text", "image", "file", "system"
  metadata: v.optional(v.object({
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    replyTo: v.optional(v.id("messages")),
  })),
  edited: v.boolean(),
  editedAt: v.optional(v.number()),
  createdAt: v.number(),
})
```

**Purpose**: Chat messages with rich content support
**Indexes**: `by_channel`, `by_author`, `by_created_at`
**Relationships**: Belongs to channel and user, can reply to other messages

### 4. Posts Table
```typescript
posts: defineTable({
  content: v.string(),
  authorId: v.id("users"),
  type: v.string(), // "text", "image", "link", "poll"
  metadata: v.optional(v.object({
    imageUrls: v.optional(v.array(v.string())),
    linkUrl: v.optional(v.string()),
    linkTitle: v.optional(v.string()),
    pollOptions: v.optional(v.array(v.string())),
    pollVotes: v.optional(v.array(v.number())),
  })),
  likes: v.array(v.id("users")),
  tags: v.array(v.string()),
  isPublic: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Purpose**: Social media posts with rich content
**Indexes**: `by_author`, `by_created_at`, `by_tags`, `by_type`
**Relationships**: Has comments, liked by users

### 5. Comments Table
```typescript
comments: defineTable({
  content: v.string(),
  authorId: v.id("users"),
  postId: v.id("posts"),
  parentCommentId: v.optional(v.id("comments")),
  likes: v.array(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Purpose**: Threaded comments on posts
**Indexes**: `by_post`, `by_author`, `by_parent`
**Relationships**: Belongs to post, can have parent comments

### 6. User Relationships Table
```typescript
userRelationships: defineTable({
  followerId: v.id("users"),
  followingId: v.id("users"),
  type: v.string(), // "follow", "block", "mute"
  createdAt: v.number(),
})
```

**Purpose**: Social relationships between users
**Indexes**: `by_follower`, `by_following`, `by_type`
**Relationships**: Connects users for follows, blocks, mutes

### 7. UI Modules Table
```typescript
uiModules: defineTable({
  name: v.string(),
  type: v.string(), // "chat", "posts", "profile", "notifications"
  defaultPosition: v.object({ x: v.number(), y: v.number() }),
  defaultSize: v.object({ width: v.number(), height: v.number() }),
  minSize: v.optional(v.object({ width: v.number(), height: v.number() })),
  maxSize: v.optional(v.object({ width: v.number(), height: v.number() })),
  isDraggable: v.boolean(),
  isResizable: v.boolean(),
  isMinimizable: v.boolean(),
  isClosable: v.boolean(),
  zIndex: v.number(),
  createdAt: v.number(),
})
```

**Purpose**: Defines available UI modules and their default properties
**Indexes**: `by_type`
**Relationships**: Referenced by user module states

### 8. User Module States Table
```typescript
userModuleStates: defineTable({
  userId: v.id("users"),
  moduleId: v.id("uiModules"),
  position: v.object({ x: v.number(), y: v.number() }),
  size: v.object({ width: v.number(), height: v.number() }),
  isMinimized: v.boolean(),
  isMaximized: v.boolean(),
  isVisible: v.boolean(),
  zIndex: v.number(),
  lastInteraction: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Purpose**: Stores per-user UI module states for OS-like interface
**Indexes**: `by_user`, `by_module`
**Relationships**: Links users to their module configurations

### 9. User Preferences Table
```typescript
userPreferences: defineTable({
  userId: v.id("users"),
  theme: v.string(), // "light", "dark", "auto"
  notifications: v.object({
    chat: v.boolean(),
    posts: v.boolean(),
    mentions: v.boolean(),
    follows: v.boolean(),
  }),
  privacy: v.object({
    profileVisibility: v.string(), // "public", "friends", "private"
    showOnlineStatus: v.boolean(),
    allowDirectMessages: v.string(), // "everyone", "friends", "none"
  }),
  ui: v.object({
    showAnimations: v.boolean(),
    compactMode: v.boolean(),
    fontSize: v.string(), // "small", "medium", "large"
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Purpose**: User preferences and settings
**Indexes**: `by_user`
**Relationships**: Belongs to user

### 10. Notifications Table
```typescript
notifications: defineTable({
  userId: v.id("users"),
  type: v.string(), // "message", "like", "comment", "follow", "mention"
  title: v.string(),
  content: v.string(),
  isRead: v.boolean(),
  metadata: v.optional(v.object({
    messageId: v.optional(v.id("messages")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    senderId: v.optional(v.id("users")),
  })),
  createdAt: v.number(),
})
```

**Purpose**: User notifications for social interactions
**Indexes**: `by_user`, `by_type`, `by_created_at`, `by_read_status`
**Relationships**: References various entities based on type

### 11. Files Table
```typescript
files: defineTable({
  name: v.string(),
  type: v.string(), // "image", "video", "document", "audio"
  size: v.number(),
  url: v.string(),
  uploadedBy: v.id("users"),
  associatedWith: v.optional(v.object({
    postId: v.optional(v.id("posts")),
    messageId: v.optional(v.id("messages")),
    commentId: v.optional(v.id("comments")),
  })),
  createdAt: v.number(),
})
```

**Purpose**: File uploads and media storage
**Indexes**: `by_uploader`, `by_type`
**Relationships**: Can be associated with posts, messages, or comments

### 12. Activity Logs Table
```typescript
activityLogs: defineTable({
  userId: v.id("users"),
  action: v.string(), // "login", "logout", "post_created", "message_sent"
  metadata: v.optional(v.object({
    postId: v.optional(v.id("posts")),
    messageId: v.optional(v.id("messages")),
    channelId: v.optional(v.id("channels")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })),
  timestamp: v.number(),
})
```

**Purpose**: Analytics and audit logging
**Indexes**: `by_user`, `by_action`, `by_timestamp`
**Relationships**: References users and various entities

## Key Features & Capabilities

### Real-Time Chat System
- **Multi-channel Support**: Public, private, and direct message channels
- **Rich Messages**: Text, images, files with metadata
- **Message Threads**: Reply to specific messages
- **Real-time Updates**: Instant message delivery via Convex subscriptions
- **Message History**: Persistent storage with efficient pagination
- **Search**: Full-text search within channels

### Social Posts & Interactions
- **Rich Content**: Text, images, links, polls
- **Social Features**: Likes, comments, hashtags
- **Privacy Controls**: Public/private posts
- **Timeline**: Personalized feed based on follows
- **Threaded Comments**: Nested comment system

### OS-Like Interface Management
- **Draggable Modules**: Persistent positioning
- **Resizable Windows**: Size constraints and preferences
- **Minimize/Maximize**: State persistence
- **Z-Index Management**: Proper layering
- **Responsive Design**: Adapts to screen size
- **User Preferences**: Theme, animations, layout options

### User Management & Privacy
- **Authentication**: Clerk integration with Convex
- **Profile Management**: Avatars, bios, status
- **Relationships**: Follow/block/mute system
- **Privacy Settings**: Granular control over visibility
- **Online Status**: Real-time presence indicators

### Notifications & Activity
- **Real-time Notifications**: Instant alerts for interactions
- **Notification Types**: Messages, likes, comments, follows, mentions
- **Read Status**: Track notification state
- **Activity Logging**: Analytics and audit trails

## Performance Optimizations

### Indexing Strategy
- **Primary Indexes**: Optimized for common query patterns
- **Composite Indexes**: Multi-field indexes for complex queries
- **Time-based Indexes**: Efficient pagination for chronological data
- **User-specific Indexes**: Fast user-centric queries

### Query Patterns
- **Pagination**: Cursor-based pagination for large datasets
- **Filtering**: Efficient filters for privacy and relationships
- **Real-time Subscriptions**: Optimized for live updates
- **Batch Operations**: Efficient bulk operations where needed

### Data Relationships
- **Foreign Keys**: Proper referential integrity
- **Denormalization**: Strategic denormalization for performance
- **Array Fields**: Efficient storage for likes, tags, members
- **Metadata Objects**: Flexible storage for rich content

## Security Considerations

### Authentication & Authorization
- **Clerk Integration**: Secure authentication flow
- **User Verification**: Validate user identity for all operations
- **Permission Checks**: Verify access rights for channels and content
- **Privacy Enforcement**: Respect user privacy settings

### Data Protection
- **Input Validation**: Sanitize all user inputs
- **Access Control**: Row-level security for user data
- **Audit Logging**: Track all data modifications
- **Rate Limiting**: Prevent abuse and spam

## Scalability Design

### Horizontal Scaling
- **Database Sharding**: Support for database partitioning
- **Read Replicas**: Separate read and write workloads
- **Caching Layer**: Redis for frequently accessed data
- **CDN Integration**: Static asset delivery

### Real-time Performance
- **WebSocket Optimization**: Efficient connection management
- **Subscription Filtering**: Targeted real-time updates
- **Connection Pooling**: Optimized database connections
- **Message Batching**: Reduce network overhead

## Implementation Notes

### Convex Functions Structure
- **Mutations**: Data modification operations
- **Queries**: Data retrieval operations
- **Real-time**: Subscription-based live updates
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript integration

### Frontend Integration
- **React Hooks**: Convex React integration
- **Real-time Subscriptions**: Live data binding
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

### Deployment Considerations
- **Environment Variables**: Secure configuration
- **Database Migrations**: Schema evolution support
- **Backup Strategy**: Data durability and recovery
- **Monitoring**: Performance and error tracking

## Future Enhancements

### Advanced Features
- **Message Encryption**: End-to-end encryption for private chats
- **File Sharing**: Enhanced file upload and sharing
- **Voice/Video Chat**: Real-time audio/video integration
- **Advanced Search**: Full-text search with filters
- **Analytics Dashboard**: User and platform analytics

### Performance Improvements
- **Query Optimization**: Advanced query planning
- **Caching Strategies**: Multi-level caching
- **Compression**: Data compression for storage
- **Edge Computing**: Global content delivery

This architecture provides a solid foundation for a scalable, real-time social platform with an innovative OS-like interface, ensuring excellent user experience and maintainable codebase.