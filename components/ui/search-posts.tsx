"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, X, User, Hash, UserPlus, UserMinus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface Post {
  _id: Id<"posts">;
  content: string;
  authorId: Id<"users">;
  author?: {
    _id: Id<"users">;
    username: string;
    avatar?: string;
  } | null;
  type: string;
  metadata?: {
    imageUrls?: string[];
    linkUrl?: string;
    linkTitle?: string;
    pollOptions?: string[];
    pollVotes?: number[];
  };
  likes: Id<"users">[];
  tags: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

interface User {
  _id: Id<"users">;
  username: string;
  bio?: string;
}

interface SearchPostsProps {
  currentUserId?: Id<"users"> | null;
  onPostSelect?: (post: Post) => void;
  className?: string;
}

export function SearchPosts({ currentUserId, onPostSelect, className = "" }: SearchPostsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"posts" | "users">("posts");

  type SearchType = "posts" | "users";
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  // Queries
  const searchResults = useQuery(
    api.posts.searchPosts,
    searchQuery.trim() ? { query: searchQuery, limit: 20 } : "skip"
  );
  
  const userResults = useQuery(
    api.posts.searchUsers,
    searchQuery.trim() && searchType === "users" ? { query: searchQuery, limit: 20 } : "skip"
  );

  const trendingTags = useQuery(api.posts.getTrendingTags, { limit: 10 });

  // Mutations
  const followUser = useMutation(api.posts.followUser);
  const unfollowUser = useMutation(api.posts.unfollowUser);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSearchType("posts");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };

  const handleFollowUser = async (userId: Id<"users">) => {
    if (!currentUserId) return;
    
    try {
      if (followingUsers.has(userId)) {
        await unfollowUser({
          followerId: currentUserId,
          followingId: userId,
        });
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await followUser({
          followerId: currentUserId,
          followingId: userId,
        });
        setFollowingUsers(prev => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    
    if (selectedTag) {
      return searchResults.filter(post => 
        post.tags.includes(selectedTag)
      );
    }
    
    return searchResults;
  }, [searchResults, selectedTag]);

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-background to-background/95 ${className}`}>
      {/* Enhanced Search Header */}
      <header className="relative p-6 border-b border-border/40 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5" />

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Search size={20} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Search & Discover
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Find posts, users, and trending topics
              </p>
            </div>
          </div>

          {/* Enhanced Search Input */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search posts, users, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-background/80 border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 text-foreground placeholder-muted-foreground font-medium shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted/60 rounded-lg"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Enhanced Search Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted/30 rounded-2xl">
            {[
              { id: "posts", label: "Posts", icon: Hash },
              { id: "users", label: "Users", icon: User }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id as SearchType)}
                className={`group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  searchType === type.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 transform scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:scale-102"
                }`}
              >
                <type.icon size={16} className="group-hover:scale-110 transition-transform duration-200" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Trending Tags */}
      {!searchQuery && trendingTags && trendingTags.length > 0 && (
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Hash size={16} className="text-primary" />
            <h3 className="font-medium text-foreground text-sm">Trending Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(({ tag, count }, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs hover:bg-primary/20 transition-colors"
              >
                <Hash size={12} />
                {tag}
                <span className="text-primary/60">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          <div className="p-4">
            {searchType === "posts" ? (
              <div className="space-y-4">
                {filteredResults === undefined ? (
                  // Loading state
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-background/95 border border-border/50 rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-muted rounded-full" />
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-3 bg-muted rounded w-16" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredResults.length === 0 ? (
                  // No results
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No posts found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Try searching with different keywords or check trending tags
                    </p>
                  </div>
                ) : (
                  // Results
                  filteredResults.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => onPostSelect?.(post)}
                      className="bg-background/95 border border-border/50 rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {post.author?.username?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {post.author?.username || "Unknown User"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-foreground text-sm leading-relaxed">
                          {post.content}
                        </p>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // User results
              <div className="space-y-3">
                {userResults === undefined ? (
                  // Loading state
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-background/95 border border-border/50 rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userResults.length === 0 ? (
                  // No results
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No users found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Try searching with a different username
                    </p>
                  </div>
                ) : (
                  // User results
                  userResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 bg-background/95 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {user.username}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {user.bio || "No bio available"}
                        </p>
                      </div>
                      {currentUserId && currentUserId !== user._id && (
                        <button
                          onClick={() => handleFollowUser(user._id)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1 ${
                            followingUsers.has(user._id)
                              ? "bg-muted text-muted-foreground hover:bg-muted/80"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          {followingUsers.has(user._id) ? (
                            <>
                              <UserMinus size={12} />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          // Empty state when no search
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start searching
            </h3>
            <p className="text-muted-foreground text-sm">
              Search for posts, users, or browse trending tags
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
