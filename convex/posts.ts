import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all public posts with pagination
export const getPosts = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(limit);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author,
        };
      })
    );

    return postsWithAuthors;
  },
});

// Get posts by a specific user
export const getPostsByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(limit);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author,
        };
      })
    );

    return postsWithAuthors;
  },
});

// Get posts by tag
export const getPostsByTag = query({
  args: {
    tag: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_tags", (q) => q.eq("tags", args.tag))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(limit);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author,
        };
      })
    );

    return postsWithAuthors;
  },
});

// Create a new post
export const createPost = mutation({
  args: {
    content: v.string(),
    authorId: v.id("users"),
    type: v.optional(v.string()),
    metadata: v.optional(v.object({
      imageUrls: v.optional(v.array(v.string())),
      linkUrl: v.optional(v.string()),
      linkTitle: v.optional(v.string()),
      pollOptions: v.optional(v.array(v.string())),
      pollVotes: v.optional(v.array(v.number())),
    })),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const postId = await ctx.db.insert("posts", {
      content: args.content,
      authorId: args.authorId,
      type: args.type || "text",
      metadata: args.metadata,
      likes: [],
      tags: args.tags || [],
      isPublic: args.isPublic !== false, // Default to public
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Like or unlike a post
export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const likes = post.likes || [];
    const isLiked = likes.includes(args.userId);
    
    let newLikes;
    if (isLiked) {
      // Remove like
      newLikes = likes.filter(id => id !== args.userId);
    } else {
      // Add like
      newLikes = [...likes, args.userId];
    }

    await ctx.db.patch(args.postId, {
      likes: newLikes,
      updatedAt: Date.now(),
    });

    return { isLiked: !isLiked, likeCount: newLikes.length };
  },
});

// Delete a post (only by author)
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== args.userId) {
      throw new Error("You can only delete your own posts");
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// Get trending tags
export const getTrendingTags = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get all posts from the last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const recentPosts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    recentPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count and return top tags
    const trendingTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));

    return trendingTags;
  },
});

// Get post by ID
export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }

    const author = await ctx.db.get(post.authorId);
    return {
      ...post,
      author,
    };
  },
});

// Update post (only by author)
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== args.userId) {
      throw new Error("You can only edit your own posts");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.content !== undefined) {
      updates.content = args.content;
    }

    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }

    await ctx.db.patch(args.postId, updates);
    return { success: true };
  },
});
