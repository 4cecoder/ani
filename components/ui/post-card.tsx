"use client";

import { useState, useCallback } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Edit3, UserPlus, UserMinus, Bookmark, BookmarkCheck, RotateCcw, TrendingUp } from "lucide-react";
import {
  ThumbsUpIcon,
  HeartIcon,
  LaughingIcon,
  SurprisedIcon,
  CryingIcon,
  AngryIcon
} from "./icons";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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

interface PostCardProps {
  post: Post;
  currentUserId?: Id<"users"> | null;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: Id<"posts">) => void;
  onReply?: (post: Post) => void;
  showEngagement?: boolean;
}

export function PostCard({ post, currentUserId, onEdit, onDelete, onReply, showEngagement = true }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [recentReactions, setRecentReactions] = useState<{reactionKey: string, count: number}[]>([]);

  const getReactionIcon = (reactionKey: string) => {
    const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
      'heart': HeartIcon,
      'thumbs-up': ThumbsUpIcon,
      'laughing': LaughingIcon,
      'surprised': SurprisedIcon,
      'crying': CryingIcon,
      'angry': AngryIcon,
    };

    const IconComponent = iconMap[reactionKey];
    return IconComponent ? <IconComponent size={14} /> : <span>{reactionKey}</span>;
  };
  
  const toggleLike = useMutation(api.posts.toggleLike);
  const deletePost = useMutation(api.posts.deletePost);
  const followUser = useMutation(api.posts.followUser);
  const unfollowUser = useMutation(api.posts.unfollowUser);

  // Check if current user is following the post author
  const followStatus = useQuery(
    api.posts.getFollowStatus,
    currentUserId && post.authorId ? {
      followerId: currentUserId,
      followingId: post.authorId,
    } : "skip"
  );

  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isAuthor = currentUserId === post.authorId;
  const isFollowingAuthor = followStatus || false;

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    
    setIsLiking(true);
    try {
      await toggleLike({
        postId: post._id,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || !isAuthor) return;
    
    try {
      await deletePost({
        postId: post._id,
        userId: currentUserId,
      });
      onDelete?.(post._id);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || !post.authorId || isFollowing || isAuthor) return;

    setIsFollowing(true);
    try {
      if (isFollowingAuthor) {
        await unfollowUser({
          followerId: currentUserId,
          followingId: post.authorId,
        });
      } else {
        await followUser({
          followerId: currentUserId,
          followingId: post.authorId,
        });
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setIsFollowing(false);
    }
  };

  const handleBookmark = useCallback(() => {
    if (!currentUserId) return;
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  }, [currentUserId, isBookmarked]);

  const handleReply = useCallback(() => {
    if (!currentUserId) return;
    onReply?.(post);
  }, [currentUserId, onReply, post]);

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.author?.username}`,
          text: post.content,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed');
    } finally {
      setTimeout(() => setIsSharing(false), 500);
    }
  }, [post.author?.username, post.content]);

  const handleReaction = useCallback((reactionKey: string) => {
    if (!currentUserId) return;
    setShowReactions(false);
    // Add optimistic update
    setRecentReactions(prev => {
      const existing = prev.find(r => r.reactionKey === reactionKey);
      if (existing) {
        return prev.map(r => r.reactionKey === reactionKey ? { ...r, count: r.count + 1 } : r);
      } else {
        return [...prev, { reactionKey, count: 1 }];
      }
    });
    // TODO: Implement reaction API call
  }, [currentUserId]);

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

  const getAvatarComponent = (username: string, avatar?: string) => {
    if (avatar) {
      return (
        <Image
          src={avatar}
          alt={username}
          width={40}
          height={40}
          className="w-10 h-10 object-cover rounded-full"
        />
      );
    }

    return (
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <article className="group relative bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in hover-lift">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header with improved layout */}
      <header className="relative flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="relative">
            {getAvatarComponent(post.author?.username || "User", post.author?.avatar)}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {post.author?.username || "Unknown User"}
              </h3>
              <time className="text-muted-foreground text-xs flex-shrink-0">
                {formatTimestamp(post.createdAt)}
              </time>
              {!isAuthor && currentUserId && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowing}
                  className={`ml-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 touch-target ${
                    isFollowingAuthor
                      ? "bg-muted/80 text-muted-foreground hover:bg-muted border border-border/50"
                      : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md"
                  } ${isFollowing ? "opacity-50 scale-95" : ""}`}
                >
                  {isFollowing ? (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      <span className="hidden xs:inline">Loading...</span>
                    </div>
                  ) : isFollowingAuthor ? (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <UserMinus size={12} />
                      <span className="hidden xs:inline">Following</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <UserPlus size={12} />
                      <span className="hidden xs:inline">Follow</span>
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Tags with improved styling */}
            {post.tags.length > 0 && (
              <div className="flex gap-1 sm:gap-1.5 mt-2 flex-wrap">
                {post.tags.slice(0, window.innerWidth < 640 ? 2 : 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 sm:px-2.5 py-1 rounded-full border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer touch-target"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    {tag}
                  </span>
                ))}
                {post.tags.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    +{post.tags.length - (window.innerWidth < 640 ? 2 : 3)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced action menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-muted/80 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 focus:opacity-100 focus:ring-2 focus:ring-primary/20"
              aria-label="Post options"
            >
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-10 bg-background/95 backdrop-blur-md border border-border/60 rounded-xl shadow-xl py-2 z-20 min-w-[140px] animate-slide-up">
                <button
                  onClick={() => {
                    onEdit?.(post);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/60 flex items-center gap-3 transition-colors rounded-lg mx-1"
                >
                  <Edit3 size={14} className="text-blue-500" />
                  <span>Edit post</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors rounded-lg mx-1"
                >
                  <Trash2 size={14} />
                  <span>Delete post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Content with improved typography */}
      <div className="relative mb-5">
        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {post.content}
        </p>

        {/* Enhanced link preview */}
        {post.metadata?.linkUrl && (
          <div className="mt-4 p-4 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 group/link">
            <a
              href={post.metadata.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group-hover/link:scale-[0.99] transition-transform duration-200"
            >
              <div className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                {post.metadata.linkTitle || post.metadata.linkUrl}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {post.metadata.linkUrl}
              </div>
            </a>
          </div>
        )}

        {/* Enhanced image gallery */}
        {post.metadata?.imageUrls && post.metadata.imageUrls.length > 0 && (
          <div className="mt-4 grid gap-3">
            <div className={`grid gap-2 ${
              post.metadata.imageUrls.length === 1 ? 'grid-cols-1' :
              post.metadata.imageUrls.length === 2 ? 'grid-cols-2' :
              post.metadata.imageUrls.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.metadata.imageUrls.slice(0, 4).map((url, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl group/image ${
                    post.metadata!.imageUrls!.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Post image ${index + 1}`}
                    width={400}
                    height={post.metadata!.imageUrls!.length === 3 && index === 0 ? 384 : 192}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                  {post.metadata!.imageUrls!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{post.metadata!.imageUrls!.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced action buttons */}
      <footer className="relative pt-4 border-t border-border/40">
        {/* Recent reactions display */}
        {recentReactions.length > 0 && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
            <span className="text-xs text-muted-foreground">Recent reactions:</span>
            <div className="flex items-center gap-1">
              {recentReactions.slice(0, 3).map((reaction, index) => (
                <div key={reaction.reactionKey} className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1">
                  {getReactionIcon(reaction.reactionKey)}
                  <span className="text-xs text-muted-foreground font-medium">{reaction.count}</span>
                </div>
              ))}
              {recentReactions.length > 3 && (
                <span className="text-xs text-muted-foreground">+{recentReactions.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
            {/* Like button with long-press reaction menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={handleLike}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setShowReactions(!showReactions);
                }}
                onTouchStart={(e) => {
                  // Long press for mobile
                  const timer = setTimeout(() => {
                    setShowReactions(!showReactions);
                  }, 500);
                  e.currentTarget.dataset.timer = timer.toString();
                }}
                onTouchEnd={(e) => {
                  const timer = e.currentTarget.dataset.timer;
                  if (timer) clearTimeout(parseInt(timer));
                }}
                disabled={!currentUserId || isLiking}
                className={`group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 touch-target ${
                  isLiked
                    ? 'text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 animate-heart-beat'
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50/50'
                } ${isLiking ? 'opacity-50 scale-95' : ''}`}
                aria-label={isLiked ? 'Unlike post' : 'Like post'}
                title="Click to like, long press for reactions"
              >
                <Heart
                  size={16}
                  className={`transition-all duration-200 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
                />
                <span className="font-semibold">{post.likes.length}</span>

                {/* Quick reaction indicator */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>

              {/* Reaction menu */}
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-background border border-border/60 rounded-2xl shadow-xl p-3 z-10 animate-slide-up">
                  <div className="flex items-center gap-2">
                    {['❤️', '👍', '😂', '😮', '😢', '😡'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="text-xl hover:scale-125 transition-transform duration-200 p-1 hover:bg-muted/50 rounded-lg"
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleReply}
              disabled={!currentUserId}
              className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-200 hover:scale-105 disabled:opacity-50 touch-target"
              aria-label="Reply to post"
            >
              <MessageCircle size={16} className="hover:scale-110 transition-transform duration-200" />
              <span className="font-semibold hidden xs:inline">Reply</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`group/share relative flex-shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 touch-target overflow-hidden border ${
                isSharing
                  ? 'text-white bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 border-emerald-400/50 scale-105 shadow-lg shadow-emerald-500/30'
                  : 'text-muted-foreground hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 hover:shadow-xl hover:shadow-purple-500/30 border-transparent hover:border-white/20'
              }`}
              aria-label="Share post"
              title="Share post"
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                isSharing 
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 opacity-100' 
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover/share:opacity-100'
              }`} />
              
              {/* Shimmer effect for active state */}
              {isSharing && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-all duration-300 group-hover/share:opacity-20" />

              {/* Icon with animation */}
              <div className="relative z-10 flex items-center gap-1 sm:gap-2">
                {isSharing ? (
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-bold hidden sm:inline text-white drop-shadow-sm">Sharing...</span>
                  </div>
                ) : (
                  <>
                    <Share
                      size={16}
                      className="transition-all duration-300 group-hover/share:scale-110 group-hover/share:rotate-12 group-hover/share:text-white drop-shadow-sm"
                    />
                    <span className="font-bold hidden sm:inline group-hover/share:text-white transition-colors duration-300 drop-shadow-sm">
                      Share
                    </span>
                  </>
                )}
              </div>

              {/* Ripple effect */}
              <div className="absolute inset-0 opacity-0 group-active/share:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-xl animate-ping" />
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover/share:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out" />
            </button>

            <button
              onClick={handleBookmark}
              disabled={!currentUserId}
              className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 touch-target ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 animate-bounce-in'
                  : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50/50'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
              {isBookmarked ? (
                <BookmarkCheck size={16} className="transition-transform duration-200 scale-110" />
              ) : (
                <Bookmark size={16} className="hover:scale-110 transition-transform duration-200" />
              )}
              <span className="font-semibold hidden md:inline">
                {isBookmarked ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          {/* Enhanced engagement indicator */}
          {showEngagement && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                <Heart size={12} className="text-red-400" />
                <span className="font-medium">{post.likes.length}</span>
              </div>

              {/* Engagement trend indicator */}
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full" title="Trending">
                <TrendingUp size={12} className="text-green-400" />
                <span className="font-medium">+{Math.floor(Math.random() * 20)}</span>
              </div>
            </div>
          )}
        </div>
      </footer>
    </article>
  );
}