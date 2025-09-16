"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "./post-card";
import { PostComposer } from "./post-composer";
import { TrendingUp, Hash, Users, RefreshCw } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface PostsFeedProps {
  currentUserId?: Id<"users"> | null;
  className?: string;
}

export function PostsFeed({ currentUserId, className = "" }: PostsFeedProps) {
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "following">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const posts = useQuery(api.posts.getPosts, { limit: 20 });
  const trendingTags = useQuery(api.posts.getTrendingTags, { limit: 10 });
  
  // Mutations
  const deletePost = useMutation(api.posts.deletePost);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The query will automatically refetch
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePostDeleted = (postId: Id<"posts">) => {
    // The query will automatically update
  };

  const handlePostCreated = () => {
    // The query will automatically update
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">📝</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Ani Posts</h2>
            <p className="text-xs text-muted-foreground">
              Share what&apos;s on your mind
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Refresh feed"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setActiveTab("trending")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "trending"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "following"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Following
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Post Composer */}
        {currentUserId && (
          <div className="p-4 border-b border-border/30">
            <PostComposer
              currentUserId={currentUserId}
              onPostCreated={handlePostCreated}
              placeholder="What&apos;s happening in the hangout?"
            />
          </div>
        )}

        {/* Trending Tags */}
        {activeTab === "trending" && trendingTags && trendingTags.length > 0 && (
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="font-medium text-foreground text-sm">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(({ tag, count }, index) => (
                <button
                  key={index}
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

        {/* Posts List */}
        <div className="p-4 space-y-4">
          {posts === undefined ? (
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
                  <div className="flex gap-6 mt-4">
                    <div className="h-4 bg-muted rounded w-12" />
                    <div className="h-4 bg-muted rounded w-12" />
                    <div className="h-4 bg-muted rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No posts yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Be the first to share something with the hangout!
              </p>
            </div>
          ) : (
            // Posts
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                onDelete={handlePostDeleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
