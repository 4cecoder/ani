import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Initialize default UI modules
 */
export const initializeUIModules = mutation({
  handler: async (ctx) => {
    const modules = [
      {
        name: "Chat",
        type: "chat",
        defaultPosition: { x: 50, y: 50 },
        defaultSize: { width: 400, height: 600 },
        minSize: { width: 300, height: 400 },
        isDraggable: true,
        isResizable: true,
        isMinimizable: true,
        isClosable: false,
        zIndex: 1,
      },
      {
        name: "Posts",
        type: "posts",
        defaultPosition: { x: 500, y: 50 },
        defaultSize: { width: 500, height: 700 },
        minSize: { width: 400, height: 500 },
        isDraggable: true,
        isResizable: true,
        isMinimizable: true,
        isClosable: false,
        zIndex: 2,
      },
      {
        name: "Notifications",
        type: "notifications",
        defaultPosition: { x: 1050, y: 50 },
        defaultSize: { width: 350, height: 400 },
        minSize: { width: 300, height: 300 },
        isDraggable: true,
        isResizable: true,
        isMinimizable: true,
        isClosable: true,
        zIndex: 3,
      },
      {
        name: "Profile",
        type: "profile",
        defaultPosition: { x: 50, y: 700 },
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 350, height: 400 },
        isDraggable: true,
        isResizable: true,
        isMinimizable: true,
        isClosable: true,
        zIndex: 4,
      },
    ];

    const now = Date.now();

    for (const uiModule of modules) {
      await ctx.db.insert("uiModules", {
        ...uiModule,
        createdAt: now,
      });
    }
  },
});

/**
 * Update user module state
 */
export const updateModuleState = mutation({
  args: {
    moduleId: v.id("uiModules"),
    position: v.optional(v.object({
      x: v.number(),
      y: v.number(),
    })),
    size: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    isMinimized: v.optional(v.boolean()),
    isMaximized: v.optional(v.boolean()),
    isVisible: v.optional(v.boolean()),
    zIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user module state exists
    const existingState = await ctx.db
      .query("userModuleStates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("moduleId"), args.moduleId))
      .first();

    const now = Date.now();

    if (existingState) {
      // Update existing state
      return await ctx.db.patch(existingState._id, {
        position: args.position || existingState.position,
        size: args.size || existingState.size,
        isMinimized: args.isMinimized !== undefined ? args.isMinimized : existingState.isMinimized,
        isMaximized: args.isMaximized !== undefined ? args.isMaximized : existingState.isMaximized,
        isVisible: args.isVisible !== undefined ? args.isVisible : existingState.isVisible,
        zIndex: args.zIndex || existingState.zIndex,
        lastInteraction: now,
        updatedAt: now,
      });
    } else {
      // Create new state with defaults
      const uiModule = await ctx.db.get(args.moduleId);
      if (!uiModule) throw new Error("Module not found");

      return await ctx.db.insert("userModuleStates", {
        userId: user._id,
        moduleId: args.moduleId,
        position: args.position || uiModule.defaultPosition,
        size: args.size || uiModule.defaultSize,
        isMinimized: args.isMinimized || false,
        isMaximized: args.isMaximized || false,
        isVisible: args.isVisible !== false, // Default to visible
        zIndex: args.zIndex || uiModule.zIndex,
        lastInteraction: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Get user's UI module states
 */
export const getUserModuleStates = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("userModuleStates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Get all available UI modules
 */
export const getUIModules = query({
  handler: async (ctx) => {
    return await ctx.db.query("uiModules").collect();
  },
});

/**
 * Reset user module states to defaults
 */
export const resetModuleStates = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Delete all existing states
    const existingStates = await ctx.db
      .query("userModuleStates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const state of existingStates) {
      await ctx.db.delete(state._id);
    }

    // This will trigger recreation of states with defaults when modules are accessed
    return { success: true };
  },
});

/**
 * Update user preferences
 */
export const updateUserPreferences = mutation({
  args: {
    theme: v.optional(v.string()),
    notifications: v.optional(v.object({
      chat: v.boolean(),
      posts: v.boolean(),
      mentions: v.boolean(),
      follows: v.boolean(),
    })),
    privacy: v.optional(v.object({
      profileVisibility: v.string(),
      showOnlineStatus: v.boolean(),
      allowDirectMessages: v.string(),
    })),
    ui: v.optional(v.object({
      showAnimations: v.boolean(),
      compactMode: v.boolean(),
      fontSize: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if preferences exist
    const existingPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingPrefs) {
      // Update existing preferences
      return await ctx.db.patch(existingPrefs._id, {
        theme: args.theme || existingPrefs.theme,
        notifications: args.notifications || existingPrefs.notifications,
        privacy: args.privacy || existingPrefs.privacy,
        ui: args.ui || existingPrefs.ui,
        updatedAt: now,
      });
    } else {
      // Create new preferences with defaults
      return await ctx.db.insert("userPreferences", {
        userId: user._id,
        theme: args.theme || "light",
        notifications: args.notifications || {
          chat: true,
          posts: true,
          mentions: true,
          follows: true,
        },
        privacy: args.privacy || {
          profileVisibility: "public",
          showOnlineStatus: true,
          allowDirectMessages: "everyone",
        },
        ui: args.ui || {
          showAnimations: true,
          compactMode: false,
          fontSize: "medium",
        },
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Get user preferences
 */
export const getUserPreferences = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});