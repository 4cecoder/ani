import { ReactNode } from 'react';
import type { Id } from "@/convex/_generated/dataModel";

interface Reaction {
  emoji: string;
  users: Id<"users">[];
  count: number;
}

interface ChatMessageProps {
  messageId: Id<"messages">;
  avatar: ReactNode;
  username: string;
  timestamp: string | Date;
  content: string;
  isOwn?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Reaction[];
  currentUserId?: Id<"users"> | null;
  onReaction?: (messageId: Id<"messages">, emoji: string) => void;
  onReply?: (messageId: Id<"messages">) => void;
  replyTo?: {
    username: string;
    content: string;
  };
  readBy?: Array<{ userId: Id<"users">; readAt: number }>;
}

export function ChatMessage({
  messageId,
  avatar,
  username,
  timestamp,
  content,
  isOwn = false,
  status = 'sent',
  reactions = [],
  currentUserId,
  onReaction,
  onReply,
  replyTo,
  readBy = []
}: ChatMessageProps) {
  const formatTimestamp = (ts: string | Date) => {
    try {
      const date = typeof ts === 'string' ? new Date(ts) : ts;
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
    } catch {
      return typeof ts === 'string' ? ts : 'just now';
    }
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;

    // Determine status based on readBy array
    const readByCount = readBy.length;
    let actualStatus = status;

    if (readByCount > 0) {
      actualStatus = 'read';
    } else if (Date.now() - new Date(timestamp).getTime() > 1000) {
      actualStatus = 'delivered';
    }

    const icons = {
      sent: '✓',
      delivered: '✓✓',
      read: '✓✓'
    };

    const colors = {
      sent: 'text-muted-foreground/60',
      delivered: 'text-muted-foreground',
      read: 'text-blue-500'
    };

    return (
      <span className={`text-xs ${colors[actualStatus]} ml-1`} title={`${actualStatus}${readByCount > 0 ? ` • Read by ${readByCount}` : ''}`}>
        {icons[actualStatus]}
      </span>
    );
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😠'];

  const handleEmojiClick = (emoji: string) => {
    if (onReaction) {
      onReaction(messageId, emoji);
    }
  };

  return (
    <div className={`
      relative flex gap-3 px-4 py-2
      hover:bg-accent/5 transition-colors duration-200
      group/message
      ${isOwn ? 'flex-row-reverse' : ''}
    `}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full flex-shrink-0
        ring-2 ring-background
        transition-all duration-200
        group-hover/message:ring-accent/30
        ${isOwn ? 'order-2' : ''}
      `}>
        {avatar}
      </div>

      {/* Message Content */}
      <div className={`
        relative flex-1 min-w-0
        ${isOwn ? 'text-right' : ''}
      `}>
        {/* Header */}
        <div className={`
          flex items-center gap-2 mb-1.5 
          ${isOwn ? 'flex-row-reverse justify-end' : ''}
        `}>
          <span className={`
            font-medium text-sm 
            ${isOwn ? 'text-primary' : 'text-foreground'}
            transition-colors duration-200
          `}>
            {username}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatTimestamp(timestamp)}
          </span>
          {getStatusIcon()}
        </div>
        
        {/* Message Bubble */}
        <div className={`
          inline-block max-w-[85%] 
          rounded-2xl px-4 py-2.5 
          transition-all duration-200
          group-hover/message:shadow-sm
          ${isOwn 
            ? 'bg-primary text-primary-foreground rounded-br-sm' 
            : 'bg-muted text-muted-foreground rounded-bl-sm'
          }
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
        
        {/* Reply Preview */}
        {replyTo && (
          <div className="mb-2 p-2 border-l-2 border-accent/50 bg-muted/20 rounded-r text-xs">
            <div className="font-medium text-accent">{replyTo.username}</div>
            <div className="text-muted-foreground truncate">{replyTo.content}</div>
          </div>
        )}

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className={`
            flex gap-1 mt-2
            ${isOwn ? 'justify-end' : 'justify-start'}
          `}>
            {reactions.map((reaction, index) => {
              const userReacted = currentUserId && reaction.users.includes(currentUserId);
              return (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(reaction.emoji)}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full
                    text-xs border transition-all duration-200
                    hover:scale-105 active:scale-95
                    ${userReacted
                      ? 'bg-accent text-accent-foreground border-accent/50'
                      : 'bg-background text-muted-foreground border-border/50 hover:border-border'
                    }
                  `}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Reaction Bar (shows on hover) */}
        <div className={`
          opacity-0 group-hover/message:opacity-100
          transition-opacity duration-200
          absolute -top-1 z-10
          flex gap-1
          bg-background border border-border rounded-lg shadow-lg p-1
          ${isOwn ? 'left-0' : 'right-0'}
        `}>
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="
                w-6 h-6 flex items-center justify-center
                hover:bg-accent rounded text-sm
                transition-colors duration-150
              "
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          {onReply && (
            <button
              onClick={() => onReply(messageId)}
              className="
                w-6 h-6 flex items-center justify-center
                hover:bg-accent rounded text-xs
                transition-colors duration-150
              "
              title="Reply to message"
            >
              ↩️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}