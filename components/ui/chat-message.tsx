import { ReactNode, useState, useRef, useEffect } from 'react';
import type { Id } from "@/convex/_generated/dataModel";
import { ReactionContextMenu } from './reaction-context-menu';
import { Copy, Reply, MoreHorizontal, Smile } from 'lucide-react';
import {
  ThumbsUpIcon,
  HeartIcon,
  LaughingIcon,
  SurprisedIcon,
  CryingIcon,
  AngryIcon,
  PartyIcon,
  FireIcon,
  OneHundredIcon,
  ClapIcon
} from "./icons";

interface Reaction {
  reactionKey: string;
  users: Id<"users">[];
  count: number;
}

interface ChatMessageProps {
  messageId: Id<"messages">;
  avatar: ReactNode;
  username: string;
  timestamp: string | Date | number;
  content: string;
  isOwn?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Reaction[];
  currentUserId?: Id<"users"> | null;
  onReaction?: (messageId: Id<"messages">, reactionKey: string) => void;
  onReply?: (messageId: Id<"messages">) => void;
  onDelete?: (messageId: Id<"messages">) => void;
  replyTo?: {
    username: string;
    content: string;
  };
  readBy?: Array<{ userId: Id<"users">; readAt: number }>;
  deleted?: boolean;
}

const getReactionIcon = (reactionKey: string) => {
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    'thumbs-up': ThumbsUpIcon,
    'heart': HeartIcon,
    'laughing': LaughingIcon,
    'surprised': SurprisedIcon,
    'crying': CryingIcon,
    'angry': AngryIcon,
    'party': PartyIcon,
    'fire': FireIcon,
    '100': OneHundredIcon,
    'clap': ClapIcon,
  };

  const IconComponent = iconMap[reactionKey];
  return IconComponent ? <IconComponent size={14} /> : <span>{reactionKey}</span>;
};

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
  onDelete,
  replyTo,
  readBy = [],
  deleted = false
}: ChatMessageProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showActions, setShowActions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Animate message on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);
  const formatTimestamp = (ts: string | Date | number) => {
    try {
      let date: Date;

      if (typeof ts === 'number') {
        date = new Date(ts);
      } else if (typeof ts === 'string') {
        date = new Date(ts);
      } else {
        date = ts;
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'just now';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', error, ts);
      return 'just now';
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

  const handleReactionClick = (reactionKey: string) => {
    if (onReaction) {
      onReaction(messageId, reactionKey);
      // Add animation feedback
      if (messageRef.current) {
        messageRef.current.classList.add('animate-heart-beat');
        setTimeout(() => {
          messageRef.current?.classList.remove('animate-heart-beat');
        }, 1500);
      }
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleDoubleClick = () => {
    if (onReply) {
      onReply(messageId);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log('Context menu triggered at:', event.clientX, event.clientY); // Debug log
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuOpen(true);
  };

  const handleQuickReaction = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setContextMenuOpen(true);
  };

  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
  };

  // Don't render deleted messages
  if (deleted) {
    return null;
  }

  return (
    <>
      <div
        ref={messageRef}
        className={`
          relative px-3 sm:px-4 py-2
          hover:bg-accent/5 transition-all duration-200
          group/message cursor-context-menu
          ${isOwn ? 'flex justify-end' : 'flex justify-start'}
          ${isAnimating ? 'animate-slide-up' : ''}
          hover-lift
        `}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          // Don't hide if context menu is open
          if (!contextMenuOpen) {
            setShowActions(false);
          }
        }}
        onTouchStart={(e) => {
          // Long press for mobile reactions
          const timer = setTimeout(() => {
            const touch = e.touches[0];
            if (touch) {
              setContextMenuPosition({ x: touch.clientX, y: touch.clientY });
              setContextMenuOpen(true);
            }
          }, 500);
          e.currentTarget.dataset.timer = timer.toString();
        }}
        onTouchEnd={(e) => {
          const timer = e.currentTarget.dataset.timer;
          if (timer) clearTimeout(parseInt(timer));
        }}
        onTouchMove={(e) => {
          const timer = e.currentTarget.dataset.timer;
          if (timer) clearTimeout(parseInt(timer));
        }}
        title="Double-click to reply, right-click or long-press for reactions"
      >
      {/* Message Container - Groups avatar, header, and bubble together */}
      <div className={`
        flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%] relative
        ${isOwn ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Avatar */}
        <div className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0
          ring-2 ring-background
          transition-all duration-200
          group-hover/message:ring-accent/30
          group-hover/message:scale-105
          cursor-pointer
        `} title={`View ${username}'s profile`}>
          {avatar}
        </div>

        {/* Message Content */}
        <div className="relative flex-1 min-w-0">
          {/* Header */}
          <div className={`
            flex items-center gap-2 mb-1.5
            ${isOwn ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}
          `}>
            <span className={`
              font-medium text-sm
              ${isOwn ? 'text-primary' : 'text-foreground'}
              transition-colors duration-200
              hover:underline cursor-pointer
            `} title={`View ${username}'s profile`}>
              {username}
            </span>
            <span className="text-muted-foreground text-xs hover:text-foreground transition-colors">
              {formatTimestamp(timestamp)}
            </span>
            {getStatusIcon()}
          </div>

          {/* Reply Preview */}
          {replyTo && (
            <div className="mb-2 p-2 border-l-2 border-accent/50 bg-muted/20 rounded-r text-xs hover:bg-muted/30 transition-colors">
              <div className="font-medium text-accent flex items-center gap-1">
                <Reply size={12} />
                {replyTo.username}
              </div>
              <div className="text-muted-foreground truncate">{replyTo.content}</div>
            </div>
          )}
          
          {/* Message Bubble */}
          <div className={`
            relative inline-block
            rounded-2xl px-3 sm:px-4 py-2.5
            transition-all duration-200
            group-hover/message:shadow-md
            group-hover/message:scale-[1.02]
            ${isOwn
              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-sm shadow-lg'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground rounded-bl-sm border border-border/50 hover:border-border'
            }
          `}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words responsive-text">
              {content}
            </p>

            {/* Quick actions on hover */}
            {showActions && (
              <div className={`absolute top-0 ${isOwn ? '-left-20' : '-right-20'} flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onReply) onReply(messageId);
                  }}
                  className="p-1.5 hover:bg-accent/20 rounded-lg transition-colors touch-target"
                  title="Reply"
                >
                  <Reply size={14} className="text-muted-foreground hover:text-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyMessage();
                  }}
                  className="p-1.5 hover:bg-accent/20 rounded-lg transition-colors touch-target"
                  title={copied ? 'Copied!' : 'Copy message'}
                >
                  {copied ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : (
                    <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickReaction(e);
                  }}
                  className="p-1.5 hover:bg-accent/20 rounded-lg transition-colors touch-target"
                  title="More actions"
                >
                  <MoreHorizontal size={14} className="text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}
          </div>

          {/* Reactions */}
          {reactions && reactions.length > 0 && (
            <div className={`
              flex flex-wrap gap-1 mt-2
              ${isOwn ? 'justify-end' : 'justify-start'}
            `}>
              {reactions.map((reaction, index) => {
                const userReacted = currentUserId && reaction.users.includes(currentUserId);
                return (
                  <button
                    key={index}
                    onClick={() => handleReactionClick(reaction.reactionKey)}
                    className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full
                      text-xs border transition-all duration-200
                      hover:scale-110 active:scale-95 touch-target
                      ${userReacted
                        ? 'bg-accent text-accent-foreground border-accent/50 animate-heart-beat'
                        : 'bg-background text-muted-foreground border-border/50 hover:border-border hover:bg-accent/10'
                      }
                    `}
                    title={`${reaction.users.length} user${reaction.users.length > 1 ? 's' : ''} reacted with ${reaction.reactionKey}`}
                  >
                     <span>{getReactionIcon(reaction.reactionKey)}</span>
                    <span className="font-medium">{reaction.count}</span>
                  </button>
                );
              })}

              {/* Quick reaction button */}
              {showActions && (
                <button
                  onClick={handleQuickReaction}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 opacity-0 group-hover/message:opacity-100 hover:scale-110"
                  title="Add reaction"
                >
                  <span className="text-sm text-muted-foreground hover:text-primary font-bold">+</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mobile touch actions */}
      <div className="sm:hidden">
        {showActions && (
          <div className={`absolute top-2 ${isOwn ? 'left-2' : 'right-2'} flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg animate-slide-up z-10`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onReply) onReply(messageId);
                setShowActions(false);
              }}
              className="p-2 hover:bg-accent/20 rounded-md transition-colors touch-target"
            >
              <Reply size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyMessage();
                setShowActions(false);
              }}
              className="p-2 hover:bg-accent/20 rounded-md transition-colors touch-target"
            >
              <Copy size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickReaction(e);
                setShowActions(false);
              }}
              className="p-2 hover:bg-accent/20 rounded-md transition-colors touch-target"
              title="Add reaction"
            >
              <Smile size={16} className="text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Reaction Context Menu */}
      {contextMenuOpen && (
        <ReactionContextMenu
          messageId={messageId}
          isOpen={contextMenuOpen}
          position={contextMenuPosition}
          onClose={() => {
            handleContextMenuClose();
            setShowActions(false);
          }}
          onReaction={(messageId, reactionKey) => {
            console.log('Reaction selected:', reactionKey); // Debug log
            if (onReaction) {
              onReaction(messageId, reactionKey);
            }
            handleContextMenuClose();
            setShowActions(false);
          }}
          onReply={onReply}
          onDelete={onDelete}
          isOwnMessage={isOwn}
        />
      )}
    </>
  );
}