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
    
    // Get all posts and filter by tag since the index expects an array
    const allPosts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();

    // Filter posts that contain the tag
    const filteredPosts = allPosts
      .filter(post => post.tags.includes(args.tag))
      .slice(0, limit);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      filteredPosts.map(async (post) => {
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

    const updates: {
      updatedAt: number;
      content?: string;
      tags?: string[];
    } = {
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

// Follow/Unfollow system functions
export const followUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already following
    const existingRelationship = await ctx.db
      .query("userRelationships")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .filter((q) => q.eq(q.field("type"), "follow"))
      .first();

    if (existingRelationship) {
      throw new Error("Already following this user");
    }

    // Prevent self-following
    if (args.followerId === args.followingId) {
      throw new Error("Cannot follow yourself");
    }

    await ctx.db.insert("userRelationships", {
      followerId: args.followerId,
      followingId: args.followingId,
      type: "follow",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const unfollowUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const relationship = await ctx.db
      .query("userRelationships")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .filter((q) => q.eq(q.field("type"), "follow"))
      .first();

    if (!relationship) {
      throw new Error("Not following this user");
    }

    await ctx.db.delete(relationship._id);
    return { success: true };
  },
});

export const getFollowStatus = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const relationship = await ctx.db
      .query("userRelationships")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .filter((q) => q.eq(q.field("type"), "follow"))
      .first();

    return !!relationship;
  },
});

export const getFollowers = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const relationships = await ctx.db
      .query("userRelationships")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .filter((q) => q.eq(q.field("type"), "follow"))
      .order("desc")
      .take(limit);

    const followers = await Promise.all(
      relationships.map(async (rel) => {
        const user = await ctx.db.get(rel.followerId);
        return user;
      })
    );

    return followers.filter(Boolean);
  },
});

export const getFollowing = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const relationships = await ctx.db
      .query("userRelationships")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .filter((q) => q.eq(q.field("type"), "follow"))
      .order("desc")
      .take(limit);

    const following = await Promise.all(
      relationships.map(async (rel) => {
        const user = await ctx.db.get(rel.followingId);
        return user;
      })
    );

    return following.filter(Boolean);
  },
});

// Get posts from users that the current user follows
export const getFollowingPosts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Get users that the current user follows
    const followingRelationships = await ctx.db
      .query("userRelationships")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .filter((q) => q.eq(q.field("type"), "follow"))
      .collect();

    const followingIds = followingRelationships.map(rel => rel.followingId);
    
    if (followingIds.length === 0) {
      return [];
    }

    // Get posts from followed users
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .filter((q) => q.or(...followingIds.map(id => q.eq(q.field("authorId"), id))))
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

// Search posts by content, author, or tags
export const searchPosts = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.query.toLowerCase();
    
    // Get all public posts
    const allPosts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();

    // Filter posts by search query
    const filteredPosts = allPosts.filter(post => {
      // Search in content
      if (post.content.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // Search in tags
      if (post.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
        return true;
      }
      
      return false;
    }).slice(0, limit);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      filteredPosts.map(async (post) => {
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

// Search users by username
export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.query.toLowerCase();
    
    // Get all users
    const allUsers = await ctx.db
      .query("users")
      .collect();

    // Filter users by username
    const filteredUsers = allUsers.filter(user => 
      user.username.toLowerCase().includes(searchQuery)
    ).slice(0, limit);

    return filteredUsers;
  },
});
