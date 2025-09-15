import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles and authentication
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    username: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    status: v.string(), // "online", "away", "offline"
    lastSeen: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_status", ["status"]),

  // Chat channels/rooms
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
    .index("by_type", ["type"])
    .index("by_created_by", ["createdBy"])
    .index("by_members", ["members"]),

  // Chat messages
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
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      users: v.array(v.id("users")),
      count: v.number(),
    }))),
    edited: v.boolean(),
    editedAt: v.optional(v.number()),
    readBy: v.optional(v.array(v.object({
      userId: v.id("users"),
      readAt: v.number(),
    }))),
    createdAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_author", ["authorId"])
    .index("by_created_at", ["createdAt"]),

  // Social posts
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
    .index("by_author", ["authorId"])
    .index("by_created_at", ["createdAt"])
    .index("by_tags", ["tags"])
    .index("by_type", ["type"]),

  // Comments on posts
  comments: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    postId: v.id("posts"),
    parentCommentId: v.optional(v.id("comments")), // For nested replies
    likes: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentCommentId"]),

  // User relationships (follows, blocks)
  userRelationships: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    type: v.string(), // "follow", "block", "mute"
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_type", ["type"]),

  // UI Modules for OS-like interface
  uiModules: defineTable({
    name: v.string(),
    type: v.string(), // "chat", "posts", "profile", "notifications", etc.
    defaultPosition: v.object({
      x: v.number(),
      y: v.number(),
    }),
    defaultSize: v.object({
      width: v.number(),
      height: v.number(),
    }),
    minSize: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    maxSize: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    isDraggable: v.boolean(),
    isResizable: v.boolean(),
    isMinimizable: v.boolean(),
    isClosable: v.boolean(),
    zIndex: v.number(),
    createdAt: v.number(),
  })
    .index("by_type", ["type"]),

  // User-specific module states
  userModuleStates: defineTable({
    userId: v.id("users"),
    moduleId: v.id("uiModules"),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    size: v.object({
      width: v.number(),
      height: v.number(),
    }),
    isMinimized: v.boolean(),
    isMaximized: v.boolean(),
    isVisible: v.boolean(),
    zIndex: v.number(),
    lastInteraction: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_module", ["moduleId"]),

  // User preferences and settings
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
    .index("by_user", ["userId"]),

  // Notifications
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
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"])
    .index("by_read_status", ["isRead"]),

  // File uploads and media
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
    .index("by_uploader", ["uploadedBy"])
    .index("by_type", ["type"]),

  // Typing indicators
  typingIndicators: defineTable({
    userId: v.id("users"),
    channelId: v.id("channels"),
    isTyping: v.boolean(),
    lastTypingAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),

  // Activity logs for analytics
  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(), // "login", "logout", "post_created", "message_sent", etc.
    metadata: v.optional(v.object({
      postId: v.optional(v.id("posts")),
      messageId: v.optional(v.id("messages")),
      channelId: v.optional(v.id("channels")),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),
});