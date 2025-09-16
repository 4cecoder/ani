"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Id } from "@/convex/_generated/dataModel";

interface MessageInteractionOptions {
  onReaction?: (messageId: Id<"messages">, reactionKey: string) => void;
  onReply?: (messageId: Id<"messages">) => void;
  onDelete?: (messageId: Id<"messages">) => void;
  onCopy?: (content: string) => void;
  isOwnMessage?: boolean;
  disabled?: boolean;
}

interface MessageInteractionReturn {
  // State
  isContextMenuOpen: boolean;
  contextMenuPosition: { x: number; y: number };
  isHovering: boolean;
  copied: boolean;
  
  // Actions
  handleContextMenu: (event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleReaction: (reactionKey: string) => void;
  handleReply: () => void;
  handleDelete: () => void;
  handleCopy: () => void;
  closeContextMenu: () => void;
  
  // Refs
  messageRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Unified hook for managing message interactions across desktop and mobile
 * Simplifies complex interaction patterns into a single, consistent API
 */
export function useMessageInteractions(
  messageId: Id<"messages">,
  content: string,
  options: MessageInteractionOptions = {}
): MessageInteractionReturn {
  const {
    onReaction,
    onReply,
    onDelete,
    onCopy,
    isOwnMessage = false,
    disabled = false
  } = options;

  // Unified state management
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Refs for DOM access and cleanup
  const messageRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isContextMenuOpen &&
        messageRef.current &&
        !messageRef.current.contains(event.target as Node)
      ) {
        closeContextMenu();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isContextMenuOpen && event.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (isContextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isContextMenuOpen]);

  // Close context menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isContextMenuOpen) {
        closeContextMenu();
      }
    };

    if (isContextMenuOpen) {
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isContextMenuOpen]);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Calculate adjusted position to keep menu in viewport
  const calculateAdjustedPosition = useCallback((x: number, y: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 16;
    
    // Estimated menu dimensions
    const estimatedMenuWidth = 240;
    const estimatedMenuHeight = 280;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + estimatedMenuWidth + margin > viewportWidth) {
      adjustedX = Math.max(margin, x - estimatedMenuWidth);
    }

    // Adjust vertical position - prefer above the message
    if (y - estimatedMenuHeight - margin < 0) {
      // Not enough space above, position below
      adjustedY = y + margin;
    } else {
      // Position above the message
      adjustedY = y - estimatedMenuHeight - margin;
    }

    // Final boundary check
    if (adjustedY + estimatedMenuHeight > viewportHeight) {
      adjustedY = Math.max(margin, viewportHeight - estimatedMenuHeight - margin);
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  // Context menu handlers
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    const adjustedPosition = calculateAdjustedPosition(event.clientX, event.clientY);
    setContextMenuPosition(adjustedPosition);
    setIsContextMenuOpen(true);
  }, [disabled, calculateAdjustedPosition]);

  // Touch handlers for mobile long-press
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    // Set up long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        const adjustedPosition = calculateAdjustedPosition(
          touchStartRef.current.x,
          touchStartRef.current.y
        );
        setContextMenuPosition(adjustedPosition);
        setIsContextMenuOpen(true);
      }
    }, 500); // 500ms long press
  }, [disabled, calculateAdjustedPosition]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Reset touch start position
    touchStartRef.current = null;
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    // Cancel long press if user moves finger too much
    if (touchStartRef.current && longPressTimerRef.current) {
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  // Mouse hover handlers
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovering(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Don't close context menu on hover leave
  }, []);

  // Action handlers
  const handleReaction = useCallback((reactionKey: string) => {
    if (onReaction && !disabled) {
      onReaction(messageId, reactionKey);
      closeContextMenu();
      
      // Add visual feedback
      if (messageRef.current) {
        messageRef.current.classList.add('animate-heart-beat');
        setTimeout(() => {
          messageRef.current?.classList.remove('animate-heart-beat');
        }, 1500);
      }
    }
  }, [onReaction, messageId, disabled]);

  const handleReply = useCallback(() => {
    if (onReply && !disabled) {
      onReply(messageId);
      closeContextMenu();
    }
  }, [onReply, messageId, disabled]);

  const handleDelete = useCallback(() => {
    if (onDelete && isOwnMessage && !disabled) {
      onDelete(messageId);
      closeContextMenu();
    }
  }, [onDelete, messageId, isOwnMessage, disabled]);

  const handleCopy = useCallback(async () => {
    if (!disabled) {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        closeContextMenu();
      } catch (error) {
        console.error('Failed to copy message:', error);
      }
    }
  }, [content, disabled]);

  const closeContextMenu = useCallback(() => {
    setIsContextMenuOpen(false);
    setIsHovering(false);
  }, []);

  return {
    // State
    isContextMenuOpen,
    contextMenuPosition,
    isHovering,
    copied,
    
    // Actions
    handleContextMenu,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleMouseEnter,
    handleMouseLeave,
    handleReaction,
    handleReply,
    handleDelete,
    handleCopy,
    closeContextMenu,
    
    // Refs
    messageRef
  };
}