import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create the main hangout session
export const getMainHangout = query({
  args: {},
  handler: async (ctx) => {
    // Look for the main hangout channel
    const mainChannel = await ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("name"), "Main Hangout"))
      .filter((q) => q.eq(q.field("type"), "public"))
      .first();

    // If it doesn't exist, we'll need to create it (but queries can't mutate)
    if (!mainChannel) {
      return null;
    }

    return mainChannel;
  },
});

// Create the main hangout session (only needs to be called once)
export const createMainHangout = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if it already exists
    const existing = await ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("name"), "Main Hangout"))
      .filter((q) => q.eq(q.field("type"), "public"))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create a system user for the main hangout
    let systemUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), "System"))
      .first();

    if (!systemUser) {
      const systemUserId = await ctx.db.insert("users", {
        clerkId: "system",
        username: "System",
        email: "system@ani.social",
        status: "online",
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Fetch the newly created user
      systemUser = await ctx.db.get(systemUserId);
    }

    if (!systemUser) {
      throw new Error("Failed to create system user");
    }

    // Create the main hangout channel
    const channelId = await ctx.db.insert("channels", {
      name: "Main Hangout",
      description: "The main hangout space where everyone comes together!",
      type: "public",
      createdBy: systemUser._id,
      members: [],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return channelId;
  },
});

// Get messages from the main hangout
export const getHangoutMessages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Find the main hangout channel
    const mainChannel = await ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("name"), "Main Hangout"))
      .filter((q) => q.eq(q.field("type"), "public"))
      .first();

    if (!mainChannel) {
      return [];
    }

    // Get messages from the channel with user information
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("channelId"), mainChannel._id))
      .order("desc")
      .take(limit);

    // Get user info for each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.authorId);
        return {
          ...message,
          author: user,
        };
      })
    );

    return messagesWithUsers.reverse(); // Show oldest first
  },
});

// Send a message to the main hangout
export const sendHangoutMessage = mutation({
  args: {
    content: v.string(),
    authorId: v.id("users"),
    type: v.optional(v.string()),
    replyTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    // Find the main hangout channel
    const mainChannel = await ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("name"), "Main Hangout"))
      .filter((q) => q.eq(q.field("type"), "public"))
      .first();

    if (!mainChannel) {
      throw new Error("Main hangout not found");
    }

    // Add user to channel members if not already there
    if (!mainChannel.members.includes(args.authorId)) {
      await ctx.db.patch(mainChannel._id, {
        members: [...mainChannel.members, args.authorId],
        updatedAt: Date.now(),
      });
    }

    // Clear typing indicator when sending message
    await ctx.db
      .query("typingIndicators")
      .filter((q) => q.eq(q.field("userId"), args.authorId))
      .filter((q) => q.eq(q.field("channelId"), mainChannel._id))
      .collect()
      .then(indicators =>
        Promise.all(indicators.map(indicator => ctx.db.delete(indicator._id)))
      );

    // Insert the message
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      authorId: args.authorId,
      channelId: mainChannel._id,
      type: args.type || "text",
      metadata: args.replyTo ? { replyTo: args.replyTo } : undefined,
      edited: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get online users in the hangout
export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get users who have been active in the last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const onlineUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("status"), "online"))
      .filter((q) => q.gte(q.field("lastSeen"), fiveMinutesAgo))
      .collect();

    return onlineUsers;
  },
});

// Update user's online status
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: args.status,
      lastSeen: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Set typing indicator
export const setTypingIndicator = mutation({
  args: {
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Find the main hangout channel
    const mainChannel = await ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("name"), "Main Hangout"))
      .filter((q) => q.eq(q.field("type"), "public"))
      .first();

    if (!mainChannel) {
      return;
    }

    // Find existing typing indicator
    const existing = await ctx.db
      .query("typingIndicators")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("channelId"), mainChannel._id))
      .first();

    const now = Date.now();
    const expiresAt = now + 5000; // 5 seconds

    if (existing) {
      if (args.isTyping) {
        // Update existing indicator
        await ctx.db.patch(existing._id, {
          isTyping: true,
          lastTypingAt: now,
          expiresAt,
        });
      } else {
        // Remove typing indicator
        await ctx.db.delete(existing._id);
      }
    } else if (args.isTyping) {
      // Create new typing indicator
      await ctx.db.insert("typingIndicators", {
        userId: args.userId,
        channelId: mainChannel._id,
        isTyping: true,
        lastTypingAt: now,
        expiresAt,
      });
    }
  },
});

// Get typing users
export const getTypingUsers = query({
  args: {},
  handler: async (ctx) => {
    // Find the main hangout channel
    const mainChannel = await ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("name"), "Main Hangout"))
      .filter((q) => q.eq(q.field("type"), "public"))
      .first();

    if (!mainChannel) {
      return [];
    }

    const now = Date.now();

    // Get active typing indicators
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .filter((q) => q.eq(q.field("channelId"), mainChannel._id))
      .filter((q) => q.eq(q.field("isTyping"), true))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();

    // Get user info for each typing user
    const typingUsers = await Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.userId);
        return user;
      })
    );

    return typingUsers.filter(user => user !== null);
  },
});

// Add reaction to message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const reactions = message.reactions || [];
    const existingReactionIndex = reactions.findIndex(r => r.emoji === args.emoji);

    if (existingReactionIndex >= 0) {
      const reaction = reactions[existingReactionIndex];
      if (reaction.users.includes(args.userId)) {
        // Remove user's reaction
        reaction.users = reaction.users.filter(id => id !== args.userId);
        reaction.count = reaction.users.length;

        if (reaction.count === 0) {
          // Remove empty reaction
          reactions.splice(existingReactionIndex, 1);
        }
      } else {
        // Add user's reaction
        reaction.users.push(args.userId);
        reaction.count = reaction.users.length;
      }
    } else {
      // Add new reaction
      reactions.push({
        emoji: args.emoji,
        users: [args.userId],
        count: 1,
      });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});

// Mark message as read
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return;
    }

    const readBy = message.readBy || [];
    const alreadyRead = readBy.some(r => r.userId === args.userId);

    if (!alreadyRead) {
      readBy.push({
        userId: args.userId,
        readAt: Date.now(),
      });

      await ctx.db.patch(args.messageId, { readBy });
    }
  },
});

// Create or get user from Clerk ID
export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      // Update last seen and status
      await ctx.db.patch(existingUser._id, {
        status: "online",
        lastSeen: Date.now(),
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      email: args.email,
      avatar: args.avatar,
      status: "online",
      lastSeen: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});