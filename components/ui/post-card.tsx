import { ReactNode } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface PostCardProps {
  avatar: ReactNode;
  username: string;
  timestamp: string;
  content: string;
  likes: number;
  comments: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function PostCard({
  avatar,
  username,
  timestamp,
  content,
  likes,
  comments,
  onLike,
  onComment,
  onShare
}: PostCardProps) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full flex-shrink-0">
          {avatar}
        </div>
        <span className="text-white/80 text-sm font-medium">{username}</span>
        <span className="text-white/40 text-xs ml-auto">{timestamp}</span>
      </div>
      <p className="text-white/70 text-sm mb-3">{content}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-white/60 hover:text-red-400 text-xs transition-colors"
          >
            <Heart size={12} />
            {likes}
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-1 text-white/60 hover:text-blue-400 text-xs transition-colors"
          >
            <MessageCircle size={12} />
            {comments}
          </button>
          <button
            onClick={onShare}
            className="text-white/60 hover:text-green-400 transition-colors"
          >
            <Share2 size={12} />
          </button>
        </div>
        <button className="text-white/60 hover:text-white transition-colors">
          <MoreHorizontal size={12} />
        </button>
      </div>
    </div>
  );
}