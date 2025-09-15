import { ReactNode } from 'react';

interface ChatMessageProps {
  avatar: ReactNode;
  username: string;
  timestamp: string | Date;
  content: string;
  isOwn?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Array<{ emoji: string; count: number; userReacted?: boolean }>;
}

export function ChatMessage({
  avatar,
  username,
  timestamp,
  content,
  isOwn = false,
  status = 'sent',
  reactions = []
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
    
    const icons = {
      sent: '✓',
      delivered: '✓✓',
      read: '✓✓'
    };
    
    const colors = {
      sent: 'text-muted-foreground',
      delivered: 'text-muted-foreground',
      read: 'text-blue-500'
    };
    
    return (
      <span className={`text-xs ${colors[status]} ml-1`}>
        {icons[status]}
      </span>
    );
  };

  return (
    <div className={`
      flex gap-3 px-4 py-2 
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
        flex-1 min-w-0 
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
        
        {/* Reactions */}
        {reactions.length > 0 && (
          <div className={`
            flex gap-1 mt-2 
            ${isOwn ? 'justify-end' : 'justify-start'}
          `}>
            {reactions.map((reaction, index) => (
              <button
                key={index}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full
                  text-xs border transition-all duration-200
                  hover:scale-105 active:scale-95
                  ${reaction.userReacted 
                    ? 'bg-accent text-accent-foreground border-accent/50' 
                    : 'bg-background text-muted-foreground border-border/50 hover:border-border'
                  }
                `}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}