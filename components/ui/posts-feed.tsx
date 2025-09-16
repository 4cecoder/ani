"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "./post-card";
import { PostComposer } from "./post-composer";
import { SearchPosts } from "./search-posts";
import { TrendingUp, Hash, RefreshCw, Search, Filter, ArrowUpDown, Clock, Zap, BarChart3 } from "lucide-react";
import { MemoIcon, StarIcon, FireIcon, PeopleIcon, SearchIcon } from "./icons";
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

interface PostsFeedProps {
  currentUserId?: Id<"users"> | null;
  className?: string;
}

export function PostsFeed({ currentUserId, className = "" }: PostsFeedProps) {
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "following" | "search">("all");

  type TabId = "all" | "trending" | "following" | "search";
  type SortOption = "recent" | "popular" | "engagement" | "oldest";

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

  // Queries
  const posts = useQuery(api.posts.getPosts, { limit: 20 });
  const followingPosts = useQuery(
    api.posts.getFollowingPosts,
    currentUserId ? { userId: currentUserId, limit: 20 } : "skip"
  );
  const trendingTags = useQuery(api.posts.getTrendingTags, { limit: 10 });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The query will automatically refetch
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePostDeleted = () => {
    // The query will automatically update
  };

  const handlePostCreated = () => {
    // The query will automatically update
  };

  const handlePostSelect = (post: Post) => {
    // Handle post selection from search results
    console.log("Selected post:", post);
  };

  // Get and sort posts based on filters and sort options
  const currentPosts = useMemo(() => {
    let basePosts: typeof posts;

    switch (activeTab) {
      case "following":
        basePosts = followingPosts;
        break;
      case "trending":
        basePosts = posts;
        break;
      case "search":
        return [];
      default:
        basePosts = posts;
        break;
    }

    if (!basePosts) return undefined;

    let filteredPosts = [...basePosts];

    // Apply tag filter
    if (tagFilter) {
      filteredPosts = filteredPosts.filter(post =>
        post.tags.includes(tagFilter)
      );
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const timeThresholds = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };
      const threshold = timeThresholds[timeFilter];
      filteredPosts = filteredPosts.filter(post =>
        now - post.createdAt <= threshold
      );
    }

    // Sort posts
    filteredPosts.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.likes.length - a.likes.length;
        case "engagement":
          // Mock engagement score: likes + comment count (we'll assume 0 for now) + recency bonus
          const aEngagement = a.likes.length + (Date.now() - a.createdAt) / (1000 * 60 * 60 * 24) * 0.1;
          const bEngagement = b.likes.length + (Date.now() - b.createdAt) / (1000 * 60 * 60 * 24) * 0.1;
          return bEngagement - aEngagement;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "recent":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filteredPosts;
  }, [posts, followingPosts, activeTab, tagFilter, timeFilter, sortBy]);

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-background to-background/95 ${className}`}>
      {/* Enhanced Header */}
      <header className="relative p-6 border-b border-border/40 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MemoIcon size={20} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Ani Posts
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Share what&apos;s on your mind with the community
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`group p-3 hover:bg-muted/60 rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary/20 ${
                showFilters ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
              }`}
              title="Show filters"
              aria-label="Show filters"
            >
              <Filter size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`group p-3 rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary/20 ${
                activeTab === "search"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary hover:bg-muted/60"
              }`}
              title="Search posts"
              aria-label="Search posts"
            >
              <Search size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="group p-3 hover:bg-muted/60 rounded-xl transition-all duration-200 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 focus:ring-2 focus:ring-primary/20"
              title="Refresh feed"
              aria-label="Refresh feed"
            >
              <RefreshCw size={18} className={`transition-all duration-200 ${isRefreshing ? 'animate-spin text-primary' : 'group-hover:rotate-180'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Tabs with Advanced Gradients */}
      <nav className="relative px-4 py-2 border-b border-border/40 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50" />
        
        <div className="relative flex gap-1 p-0.5 bg-gradient-to-r from-background/80 to-background/60 rounded-xl backdrop-blur-sm border border-border/30 shadow-inner">
          {[
            { 
              id: "all", 
              label: "All Posts", 
              icon: StarIcon,
              gradient: "from-blue-500 via-purple-500 to-pink-500",
              hoverGradient: "from-blue-400 via-purple-400 to-pink-400"
            },
            { 
              id: "trending", 
              label: "Trending", 
              icon: FireIcon,
              gradient: "from-orange-500 via-red-500 to-pink-500",
              hoverGradient: "from-orange-400 via-red-400 to-pink-400"
            },
            { 
              id: "following", 
              label: "Following", 
              icon: PeopleIcon,
              gradient: "from-green-500 via-emerald-500 to-teal-500",
              hoverGradient: "from-green-400 via-emerald-400 to-teal-400"
            },
            { 
              id: "search", 
              label: "Search", 
              icon: SearchIcon,
              gradient: "from-indigo-500 via-purple-500 to-violet-500",
              hoverGradient: "from-indigo-400 via-purple-400 to-violet-400"
            }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`group relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-500 ease-out ${
                  isActive
                    ? `text-white bg-gradient-to-r ${tab.gradient} shadow-lg shadow-primary/30 transform scale-105 border border-white/20`
                    : `text-muted-foreground hover:text-foreground hover:bg-gradient-to-r ${tab.hoverGradient} hover:text-white hover:shadow-md hover:shadow-primary/20 hover:scale-102 border border-transparent hover:border-white/10`
                }`}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.gradient} opacity-0 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'group-hover:opacity-100'
                }`} />
                
                {/* Shimmer effect for active tab */}
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-1.5">
                  <IconComponent 
                    size={14} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-sm' 
                        : 'group-hover:scale-110 group-hover:text-white'
                    }`} 
                  />
                  <span className={`hidden sm:inline transition-all duration-300 ${
                    isActive ? 'text-white font-bold' : 'group-hover:text-white'
                  }`}>
                    {tab.label}
                  </span>
                  <span className={`sm:hidden transition-all duration-300 ${
                    isActive ? 'text-white font-bold' : 'group-hover:text-white'
                  }`}>
                    {tab.label.split(' ')[0]}
                  </span>
                </div>

                {/* Active indicator with gradient */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-white via-white/80 to-white rounded-full animate-fade-in shadow-lg" />
                )}

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.gradient} opacity-0 blur-sm transition-all duration-300 ${
                  isActive ? 'opacity-30' : 'group-hover:opacity-20'
                }`} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Advanced Filters Panel */}
      {showFilters && activeTab !== 'search' && (
        <div className="px-6 py-4 border-b border-border/40 bg-gradient-to-r from-muted/30 to-muted/20 animate-slide-down">
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                {[
                  { id: 'recent', label: 'Recent', icon: Clock },
                  { id: 'popular', label: 'Popular', icon: TrendingUp },
                  { id: 'engagement', label: 'Engagement', icon: BarChart3 },
                  { id: 'oldest', label: 'Oldest', icon: Zap }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSortBy(id as SortOption)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
                      sortBy === id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time filter */}
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Time:</span>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'All time' },
                  { id: 'day', label: 'Today' },
                  { id: 'week', label: 'This week' },
                  { id: 'month', label: 'This month' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setTimeFilter(id as 'all' | 'day' | 'week' | 'month')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
                      timeFilter === id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {(tagFilter || timeFilter !== 'all' || sortBy !== 'recent') && (
              <button
                onClick={() => {
                  setTagFilter(null);
                  setTimeFilter('all');
                  setSortBy('recent');
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Tab */}
        {activeTab === "search" ? (
          <SearchPosts
            currentUserId={currentUserId}
            onPostSelect={handlePostSelect}
            className="h-full"
          />
        ) : (
          <>
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
              {currentPosts === undefined ? (
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
              ) : currentPosts.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MemoIcon size={24} className="text-muted-foreground" />
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
                currentPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={handlePostDeleted}
                    onReply={(post) => {
                      // TODO: Implement reply modal
                      console.log('Reply to:', post);
                    }}
                    showEngagement={true}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
