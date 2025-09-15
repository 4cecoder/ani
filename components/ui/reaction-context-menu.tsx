"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Id } from "@/convex/_generated/dataModel";

interface ReactionContextMenuProps {
  messageId: Id<"messages">;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReaction: (messageId: Id<"messages">, emoji: string) => void;
  onReply?: (messageId: Id<"messages">) => void;
  onDelete?: (messageId: Id<"messages">) => void;
  isOwnMessage?: boolean;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😠', '🎉', '🔥', '💯', '👏'];

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
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 10;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuRect.width + margin > viewportWidth) {
      adjustedX = Math.max(margin, x - menuRect.width);
    }

    // Adjust vertical position - prefer above the message
    if (y - menuRect.height - margin < 0) {
      // If not enough space above, position below
      adjustedY = y + margin;
    } else {
      // Position above the message
      adjustedY = y - menuRect.height - margin;
    }

    // Final check to ensure it's within viewport
    if (adjustedY + menuRect.height > viewportHeight) {
      adjustedY = Math.max(margin, viewportHeight - menuRect.height - margin);
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  // Update position when menu opens or position changes
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const newPosition = calculatePosition(position.x, position.y);
      setAdjustedPosition(newPosition);
    }
  }, [isOpen, position, calculatePosition]);

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

  const handleReaction = (emoji: string) => {
    onReaction(messageId, emoji);
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

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Reaction Emojis */}
      <div className="grid grid-cols-5 gap-1 mb-2">
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="
              w-8 h-8 flex items-center justify-center
              hover:bg-accent hover:scale-110 rounded text-lg
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-accent/50
              active:scale-95
            "
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border pt-2 space-y-1">
        {onReply && (
          <button
            onClick={handleReply}
            className="
              w-full flex items-center gap-2 px-3 py-2 text-sm
              hover:bg-accent rounded transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-accent/50
            "
          >
            <span>↩️</span>
            <span>Reply</span>
          </button>
        )}
        
        {isOwnMessage && onDelete && (
          <button
            onClick={handleDelete}
            className="
              w-full flex items-center gap-2 px-3 py-2 text-sm
              hover:bg-destructive/20 hover:text-destructive rounded
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-destructive/50
            "
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
