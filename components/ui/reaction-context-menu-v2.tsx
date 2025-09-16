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
import { Copy } from "lucide-react";

interface ReactionContextMenuV2Props {
  messageId: Id<"messages">;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReaction: (messageId: Id<"messages">, reactionKey: string) => void;
  onReply?: (messageId: Id<"messages">) => void;
  onDelete?: (messageId: Id<"messages">) => void;
  onCopy?: (content: string) => void;
  isOwnMessage?: boolean;
  messageContent?: string;
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

/**
 * Improved Reaction Context Menu with simplified positioning and better event handling
 */
export function ReactionContextMenuV2({
  messageId,
  isOpen,
  position,
  onClose,
  onReaction,
  onReply,
  onDelete,
  onCopy,
  isOwnMessage = false,
  messageContent = ""
}: ReactionContextMenuV2Props) {
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const menuRef = useRef<HTMLDivElement>(null);

  // Simplified position calculation with single useEffect
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const calculateOptimalPosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 16;
      
      // Get actual menu dimensions after render
      if (!menuRef.current) return position;
      const menuRect = menuRef.current.getBoundingClientRect();
      const menuWidth = menuRect.width || 240;
      const menuHeight = menuRect.height || 280;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Horizontal adjustment
      if (position.x + menuWidth + margin > viewportWidth) {
        adjustedX = Math.max(margin, position.x - menuWidth);
      }

      // Vertical adjustment - prefer above but check space
      const spaceAbove = position.y - margin;
      const spaceBelow = viewportHeight - position.y - margin;

      if (spaceAbove >= menuHeight) {
        // Position above
        adjustedY = position.y - menuHeight - margin;
      } else if (spaceBelow >= menuHeight) {
        // Position below
        adjustedY = position.y + margin;
      } else {
        // Not enough space either way, center vertically
        adjustedY = Math.max(margin, (viewportHeight - menuHeight) / 2);
      }

      // Final boundary check
      adjustedX = Math.max(margin, Math.min(adjustedX, viewportWidth - menuWidth - margin));
      adjustedY = Math.max(margin, Math.min(adjustedY, viewportHeight - menuHeight - margin));

      return { x: adjustedX, y: adjustedY };
    };

    // Calculate position and set state
    const newPosition = calculateOptimalPosition();
    setAdjustedPosition(newPosition);

    // Optional: Fine-tune after a short delay to ensure proper rendering
    const fineTuneTimer = setTimeout(() => {
      if (menuRef.current) {
        const finalPosition = calculateOptimalPosition();
        setAdjustedPosition(finalPosition);
      }
    }, 50);

    return () => clearTimeout(fineTuneTimer);
  }, [isOpen, position]);

  // Unified event handling for outside clicks and escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalEvents = (event: MouseEvent | KeyboardEvent) => {
      const isMouseEvent = event.type === 'mousedown';
      const isEscapeKey = event.type === 'keydown' && (event as KeyboardEvent).key === 'Escape';
      
      if (isMouseEvent) {
        const mouseEvent = event as MouseEvent;
        // Close if clicking outside menu
        if (menuRef.current && !menuRef.current.contains(mouseEvent.target as Node)) {
          onClose();
        }
      } else if (isEscapeKey) {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleGlobalEvents);
    document.addEventListener('keydown', handleGlobalEvents);

    return () => {
      document.removeEventListener('mousedown', handleGlobalEvents);
      document.removeEventListener('keydown', handleGlobalEvents);
    };
  }, [isOpen, onClose]);

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Focus first interactive element for keyboard navigation
      const firstButton = menuRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [isOpen]);

  // Action handlers with proper event management
  const handleReaction = useCallback((reactionKey: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onReaction(messageId, reactionKey);
    onClose();
  }, [onReaction, messageId, onClose]);

  const handleReply = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onReply) {
      onReply(messageId);
      onClose();
    }
  }, [onReply, messageId, onClose]);

  const handleDelete = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDelete && isOwnMessage) {
      onDelete(messageId);
      onClose();
    }
  }, [onDelete, messageId, isOwnMessage, onClose]);

  const handleCopy = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onCopy && messageContent) {
      onCopy(messageContent);
      onClose();
    }
  }, [onCopy, messageContent, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const buttons = Array.from(menuRef.current?.querySelectorAll('button') || []);
    const currentIndex = buttons.findIndex(btn => btn === document.activeElement);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
        break;
      
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl p-3 min-w-[240px] animate-slide-up"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translateY(-4px)',
      }}
      onKeyDown={handleKeyDown}
      role="menu"
      aria-label="Message actions"
    >
      {/* Reaction Icons Grid */}
      <div className="grid grid-cols-5 gap-2 mb-3" role="group" aria-label="Quick reactions">
        {COMMON_REACTIONS.map((reaction) => {
          const IconComponent = reaction.icon;
          return (
            <button
              key={reaction.key}
              onClick={(e) => handleReaction(reaction.key, e)}
              className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 hover:scale-110 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-95 group"
              title={`React with ${reaction.label}`}
              aria-label={`React with ${reaction.label}`}
              role="menuitem"
            >
              <IconComponent size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border/40 pt-3 space-y-1" role="group" aria-label="Message actions">
        {onReply && (
          <button
            onClick={handleReply}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent/60 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            role="menuitem"
          >
            <ReplyIcon size={14} className="text-blue-500" />
            <span>Reply</span>
          </button>
        )}

        {onCopy && (
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent/60 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            role="menuitem"
          >
            <Copy size={14} className="text-green-500" />
            <span>Copy Message</span>
          </button>
        )}

        {isOwnMessage && onDelete && (
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 font-medium"
            role="menuitem"
          >
            <TrashIcon size={14} className="text-red-500" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}