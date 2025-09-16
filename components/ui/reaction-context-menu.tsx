"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Id } from "@/convex/_generated/dataModel";
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
  ClapIcon,
  ReplyIcon,
  TrashIcon
} from "./icons";

interface ReactionContextMenuProps {
  messageId: Id<"messages">;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReaction: (messageId: Id<"messages">, reactionKey: string) => void;
  onReply?: (messageId: Id<"messages">) => void;
  onDelete?: (messageId: Id<"messages">) => void;
  isOwnMessage?: boolean;
}

const COMMON_REACTIONS = [
  { icon: ThumbsUpIcon, label: 'thumbs up', key: 'thumbs-up' },
  { icon: HeartIcon, label: 'heart', key: 'heart' },
  { icon: LaughingIcon, label: 'laughing', key: 'laughing' },
  { icon: SurprisedIcon, label: 'surprised', key: 'surprised' },
  { icon: CryingIcon, label: 'crying', key: 'crying' },
  { icon: AngryIcon, label: 'angry', key: 'angry' },
  { icon: PartyIcon, label: 'party', key: 'party' },
  { icon: FireIcon, label: 'fire', key: 'fire' },
  { icon: OneHundredIcon, label: '100', key: '100' },
  { icon: ClapIcon, label: 'clap', key: 'clap' }
];

export function ReactionContextMenu({
  messageId,
  isOpen,
  position,
  onClose,
  onReaction,
  onReply,
  onDelete,
  isOwnMessage = false
}: ReactionContextMenuProps) {
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position to keep menu in viewport
  const calculatePosition = useCallback((x: number, y: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 10;
    
    // Use estimated menu dimensions since we can't get actual dimensions yet
    const estimatedMenuWidth = 200; // min-w-[200px] from className
    const estimatedMenuHeight = 120; // Approximate height for the menu

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + estimatedMenuWidth + margin > viewportWidth) {
      adjustedX = Math.max(margin, x - estimatedMenuWidth);
    }

    // Adjust vertical position - prefer above the message
    if (y - estimatedMenuHeight - margin < 0) {
      // If not enough space above, position below
      adjustedY = y + margin;
    } else {
      // Position above the message
      adjustedY = y - estimatedMenuHeight - margin;
    }

    // Final check to ensure it's within viewport
    if (adjustedY + estimatedMenuHeight > viewportHeight) {
      adjustedY = Math.max(margin, viewportHeight - estimatedMenuHeight - margin);
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  // Update position when menu opens or position changes
  useEffect(() => {
    if (isOpen) {
      console.log('Context menu opening at position:', position); // Debug log
      const newPosition = calculatePosition(position.x, position.y);
      console.log('Adjusted position:', newPosition); // Debug log
      setAdjustedPosition(newPosition);
    }
  }, [isOpen, position, calculatePosition]);

  // Fine-tune position after menu is rendered
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 10;

      let needsAdjustment = false;
      let newX = adjustedPosition.x;
      let newY = adjustedPosition.y;

      // Check if menu is outside viewport and adjust
      if (menuRect.right > viewportWidth - margin) {
        newX = Math.max(margin, viewportWidth - menuRect.width - margin);
        needsAdjustment = true;
      }
      
      if (menuRect.left < margin) {
        newX = margin;
        needsAdjustment = true;
      }

      if (menuRect.bottom > viewportHeight - margin) {
        newY = Math.max(margin, viewportHeight - menuRect.height - margin);
        needsAdjustment = true;
      }

      if (menuRect.top < margin) {
        newY = margin;
        needsAdjustment = true;
      }

      if (needsAdjustment) {
        setAdjustedPosition({ x: newX, y: newY });
      }
    }
  }, [isOpen, adjustedPosition.x, adjustedPosition.y]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Close menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  const handleReaction = (reactionKey: string) => {
    console.log('handleReaction called with:', reactionKey); // Debug log
    onReaction(messageId, reactionKey);
    onClose();
  };

  const handleReply = () => {
    if (onReply) {
      onReply(messageId);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(messageId);
      onClose();
    }
  };

  if (!isOpen) {
    console.log('Context menu not open, not rendering'); // Debug log
    return null;
  }

  console.log('Rendering context menu at:', adjustedPosition); // Debug log

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl p-3 min-w-[200px] animate-slide-up"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translateY(-4px)',
      }}
    >
      {/* Reaction Icons */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {COMMON_REACTIONS.map((reaction) => {
          const IconComponent = reaction.icon;
          return (
            <button
              key={reaction.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reaction clicked:', reaction.key); // Debug log
                handleReaction(reaction.key);
              }}
              className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 hover:scale-110 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-95 group"
              title={`React with ${reaction.label}`}
              aria-label={`React with ${reaction.label}`}
            >
              <IconComponent size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border/40 pt-3 space-y-2">
        {onReply && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleReply();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent/60 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
          >
            <ReplyIcon size={14} className="text-blue-500" />
            <span>Reply</span>
          </button>
        )}

        {isOwnMessage && onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 font-medium"
          >
            <TrashIcon size={14} className="text-red-500" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
