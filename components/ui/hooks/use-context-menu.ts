"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  UseContextMenuOptions, 
  UseContextMenuReturn, 
  ContextMenuItem, 
  ContextMenuGroup,
  ContextMenuEvent 
} from '../context-menu/types';

/**
 * Custom hook for managing context menu state and behavior
 */
export function useContextMenu(options: UseContextMenuOptions): UseContextMenuReturn {
  const {
    id,
    items: initialItems,
    trigger = 'right-click',
    onClose,
    onOpen,
    disabled = false,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [items, setItems] = useState<ContextMenuItem[] | ContextMenuGroup[]>(initialItems);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveItem(null);
        onClose?.();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
        setActiveItem(null);
        onClose?.();
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
        setIsOpen(false);
        setActiveItem(null);
        onClose?.();
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu in viewport
  // Event emitter for debugging and external handling
  const emitEvent = useCallback((event: ContextMenuEvent) => {
    // For now, just log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`ContextMenu Event [${id}]:`, event);
    }
  }, [id]);

  const adjustPosition = useCallback((x: number, y: number) => {
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      adjustedX = Math.max(0, x - menuRect.width);
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      adjustedY = Math.max(0, y - menuRect.height);
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  const open = useCallback((event: React.MouseEvent | MouseEvent) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    const clientX = 'clientX' in event ? event.clientX : (event as MouseEvent).pageX;
    const clientY = 'clientY' in event ? event.clientY : (event as MouseEvent).pageY;

    const adjustedPosition = adjustPosition(clientX, clientY);
    
    setPosition(adjustedPosition);
    setIsOpen(true);
    setActiveItem(null);
    
    onOpen?.();
    
    // Emit event
    const menuEvent: ContextMenuEvent = {
      type: 'open',
      position: adjustedPosition,
      timestamp: Date.now(),
    };
    emitEvent(menuEvent);
  }, [disabled, adjustPosition, onOpen, emitEvent]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveItem(null);
    onClose?.();
    
    // Emit event
    const menuEvent: ContextMenuEvent = {
      type: 'close',
      timestamp: Date.now(),
    };
    emitEvent(menuEvent);
  }, [onClose, emitEvent]);

  const toggle = useCallback((event: React.MouseEvent | MouseEvent) => {
    if (isOpen) {
      close();
    } else {
      open(event);
    }
  }, [isOpen, open, close]);

  const handleTriggerContextMenu = useCallback((event: React.MouseEvent) => {
    if (trigger === 'right-click') {
      open(event);
    }
  }, [trigger, open]);

  const handleTriggerClick = useCallback((event: React.MouseEvent) => {
    if (trigger === 'click') {
      toggle(event);
    }
  }, [trigger, toggle]);

  const handleTriggerMouseEnter = useCallback((event: React.MouseEvent) => {
    if (trigger === 'hover') {
      open(event);
    }
  }, [trigger, open]);

  const handleTriggerMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      // Add a small delay before closing to prevent flickering
      setTimeout(() => {
        if (isOpen && !menuRef.current?.matches(':hover')) {
          close();
        }
      }, 200);
    }
  }, [trigger, isOpen, close]);

  const setItemsCallback = useCallback((newItems: ContextMenuItem[] | ContextMenuGroup[]) => {
    setItems(newItems);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const flatItems = items.flatMap(group => 
      'items' in group ? group.items : group
    ).filter(item => !item.separator && !item.disabled);

    const currentIndex = flatItems.findIndex(item => item.id === activeItem);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % flatItems.length;
        setActiveItem(flatItems[nextIndex]?.id || null);
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? flatItems.length - 1 : currentIndex - 1;
        setActiveItem(flatItems[prevIndex]?.id || null);
        break;
      
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeItem) {
          const activeItemObj = flatItems.find(item => item.id === activeItem);
          if (activeItemObj?.onClick) {
            activeItemObj.onClick();
            close();
          }
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        close();
        break;
    }
  }, [isOpen, items, activeItem, close]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const triggerProps = {
    onContextMenu: handleTriggerContextMenu,
    onClick: handleTriggerClick,
    onMouseEnter: handleTriggerMouseEnter,
    onMouseLeave: handleTriggerMouseLeave,
  };

  const menuProps = {
    isOpen,
    position,
    onClose: close,
    items,
  };

  return {
    isOpen,
    position,
    activeItem,
    open,
    close,
    toggle,
    setItems: setItemsCallback,
    triggerProps,
    menuProps,
  };
}