// Posts Module Types
import type { Id } from "@/convex/_generated/dataModel";

export interface Post {
  _id: Id<"posts">;
  content: string;
  authorId: Id<"users">;
  author?: {
    _id: Id<"users">;
    username: string;
    avatar?: string;
  } | null;
  type: "text" | "image" | "link" | "poll";
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

export interface User {
  _id: Id<"users">;
  username: string;
  bio?: string;
  avatar?: string;
}

export interface PostComposerProps {
  currentUserId: Id<"users">;
  onPostCreated?: () => void;
  placeholder?: string;
  className?: string;
}

export interface PostCardProps {
  post: Post;
  currentUserId?: Id<"users"> | null;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: Id<"posts">) => void;
}

export interface PostsFeedProps {
  currentUserId?: Id<"users"> | null;
  className?: string;
}

export interface SearchPostsProps {
  currentUserId?: Id<"users"> | null;
  onPostSelect?: (post: Post) => void;
  className?: string;
}

export interface TrendingTag {
  tag: string;
  count: number;
}

export interface PostFilters {
  tags?: string[];
  authorId?: Id<"users">;
  type?: Post["type"];
  isPublic?: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface PostSearchResult {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
}

export interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  trendingTags: TrendingTag[];
  activeUsers: number;
}