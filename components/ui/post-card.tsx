"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import Image from "next/image";
import { useMutation } from "convex/react";
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
}

export function PostCard({ post, currentUserId, onEdit, onDelete }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const toggleLike = useMutation(api.posts.toggleLike);
  const deletePost = useMutation(api.posts.deletePost);

  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isAuthor = currentUserId === post.authorId;

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
    <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-background/98 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getAvatarComponent(post.author?.username || "User", post.author?.avatar)}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                {post.author?.username || "Unknown User"}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatTimestamp(post.createdAt)}
              </span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-background border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit?.(post);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-red-500 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        
        {/* Link preview */}
        {post.metadata?.linkUrl && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <a
              href={post.metadata.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <div className="text-sm font-medium text-foreground">
                {post.metadata.linkTitle || post.metadata.linkUrl}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {post.metadata.linkUrl}
              </div>
            </a>
          </div>
        )}

        {/* Images */}
        {post.metadata?.imageUrls && post.metadata.imageUrls.length > 0 && (
          <div className="mt-3 grid gap-2">
            {post.metadata.imageUrls.slice(0, 4).map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Post image ${index + 1}`}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={!currentUserId || isLiking}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isLiked 
                ? 'text-red-500' 
                : 'text-muted-foreground hover:text-red-500'
            } ${isLiking ? 'opacity-50' : ''}`}
          >
            <Heart 
              size={16} 
              className={isLiked ? 'fill-current' : ''} 
            />
            <span>{post.likes.length}</span>
          </button>

          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
            <MessageCircle size={16} />
            <span>0</span>
          </button>

          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
            <Share size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}