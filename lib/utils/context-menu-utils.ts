import type { ContextMenuItem, ContextMenuGroup, MessageContextMenuItem } from '@/components/ui/context-menu/types';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Utility functions for context menu operations
 */

/**
 * Flatten context menu items from groups into a single array
 */
export function flattenMenuItems(items: ContextMenuItem[] | ContextMenuGroup[]): ContextMenuItem[] {
  return items.flatMap(item => 
    'items' in item ? item.items : item
  ).filter(item => !item.separator);
}

/**
 * Find a menu item by its ID
 */
export function findMenuItemById(
  items: ContextMenuItem[] | ContextMenuGroup[],
  id: string
): ContextMenuItem | null {
  const flatItems = flattenMenuItems(items);
  return flatItems.find(item => item.id === id) || null;
}

/**
 * Check if a menu item should be disabled based on conditions
 */
export function shouldDisableMenuItem(item: ContextMenuItem, conditions: {
  isOwnMessage?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReact?: boolean;
}): boolean {
  if (item.disabled) return true;

  // Check message-specific conditions
  if ('action' in item) {
    const messageItem = item as MessageContextMenuItem;
    
    switch (messageItem.action) {
      case 'edit':
        return conditions.isOwnMessage !== true || conditions.canEdit === false;
      case 'delete':
        return conditions.isOwnMessage !== true || conditions.canDelete === false;
      case 'react':
        return conditions.canReact === false;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Generate default message context menu items
 */
export function generateMessageContextMenuItems(
  messageId: Id<"messages">,
  isOwnMessage: boolean,
  options: {
    enableEdit?: boolean;
    enableDelete?: boolean;
    enableReact?: boolean;
    enableCopy?: boolean;
    enableForward?: boolean;
    enablePin?: boolean;
    enableReport?: boolean;
  } = {}
): MessageContextMenuItem[] {
  const {
    enableEdit = true,
    enableDelete = true,
    enableReact = true,
    enableCopy = true,
    enableForward = true,
    enablePin = false,
    enableReport = true,
  } = options;

  const items: MessageContextMenuItem[] = [];

  // Reply action
  items.push({
    id: `reply-${messageId}`,
    label: 'Reply',
    icon: '↩️',
    shortcut: 'R',
    action: 'reply',
    messageId,
  } as MessageContextMenuItem);

  // Edit action (only for own messages)
  if (isOwnMessage && enableEdit) {
    items.push({
      id: `edit-${messageId}`,
      label: 'Edit',
      icon: '✏️',
      shortcut: 'E',
      action: 'edit',
      messageId,
    } as MessageContextMenuItem);
  }

  // Delete action (only for own messages)
  if (isOwnMessage && enableDelete) {
    items.push({
      id: `delete-${messageId}`,
      label: 'Delete',
      icon: '🗑️',
      shortcut: 'Delete',
      danger: true,
      action: 'delete',
      messageId,
    });
  }

  // Separator
  if (items.length > 0 && (enableCopy || enableReact)) {
    items.push({ 
      id: `sep1-${messageId}`, 
      label: '', 
      separator: true 
    } as MessageContextMenuItem);
  }

  // Copy action
  if (enableCopy) {
    items.push({
      id: `copy-${messageId}`,
      label: 'Copy',
      icon: '📋',
      shortcut: 'Ctrl+C',
      action: 'copy',
      messageId,
    });
  }

  // React submenu
  if (enableReact) {
    const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😠'];
    
    items.push({
      id: `react-${messageId}`,
      label: 'React',
      icon: '😊',
      action: 'react',
      submenu: commonEmojis.map(emoji => ({
        id: `react-${emoji}-${messageId}`,
        label: emoji,
        action: 'react',
        messageId,
        emoji,
      } as MessageContextMenuItem)),
    } as MessageContextMenuItem);
  }

  // Separator
  if ((enableForward || enablePin) && items.length > 0) {
    items.push({ 
      id: `sep2-${messageId}`, 
      label: '', 
      separator: true 
    } as MessageContextMenuItem);
  }

  // Forward action
  if (enableForward) {
    items.push({
      id: `forward-${messageId}`,
      label: 'Forward',
      icon: '↪️',
      action: 'forward',
      messageId,
    });
  }

  // Pin action
  if (enablePin) {
    items.push({
      id: `pin-${messageId}`,
      label: 'Pin',
      icon: '📌',
      action: 'pin',
      messageId,
    });
  }

  // Separator
  if (enableReport && items.length > 0) {
    items.push({ 
      id: `sep3-${messageId}`, 
      label: '', 
      separator: true 
    } as MessageContextMenuItem);
  }

  // Report action
  if (enableReport) {
    items.push({
      id: `report-${messageId}`,
      label: 'Report',
      icon: '🚨',
      danger: true,
      action: 'report',
      messageId,
    });
  }

  return items;
}

/**
 * Handle keyboard shortcuts for context menu
 */
export function handleContextMenuShortcut(
  event: KeyboardEvent,
  items: ContextMenuItem[] | ContextMenuGroup[]
): boolean {
  const flatItems = flattenMenuItems(items);
  
  // Find item with matching shortcut
  const matchingItem = flatItems.find(item => {
    if (!item.shortcut) return false;
    
    // Normalize shortcut comparison
    const eventShortcut = normalizeShortcut(event);
    const itemShortcut = normalizeShortcutString(item.shortcut);
    
    return eventShortcut === itemShortcut;
  });

  if (matchingItem && !matchingItem.disabled && matchingItem.onClick) {
    matchingItem.onClick();
    return true;
  }

  return false;
}

/**
 * Normalize keyboard event to shortcut string
 */
function normalizeShortcut(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    parts.push('Ctrl');
  }
  
  if (event.altKey) {
    parts.push('Alt');
  }
  
  if (event.shiftKey) {
    parts.push('Shift');
  }

  // Handle special keys
  const keyMap: Record<string, string> = {
    'Delete': 'Delete',
    'Backspace': 'Backspace',
    'Enter': 'Enter',
    'Escape': 'Escape',
    'Tab': 'Tab',
    'Space': 'Space',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
    'PageUp': 'PageUp',
    'PageDown': 'PageDown',
    'Home': 'Home',
    'End': 'End',
  };

  const key = keyMap[event.key] || event.key.toUpperCase();
  parts.push(key);

  return parts.join('+');
}

/**
 * Normalize shortcut string for comparison
 */
function normalizeShortcutString(shortcut: string): string {
  return shortcut
    .split('+')
    .map(part => part.trim().toUpperCase())
    .sort()
    .join('+');
}

/**
 * Calculate optimal position for context menu
 */
export function calculateMenuPosition(
  x: number,
  y: number,
  menuWidth: number = 200,
  menuHeight: number = 300
): { x: number; y: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 10;

  let adjustedX = x;
  let adjustedY = y;

  // Adjust horizontal position
  if (x + menuWidth + margin > viewportWidth) {
    adjustedX = Math.max(margin, x - menuWidth);
  }

  // Adjust vertical position
  if (y + menuHeight + margin > viewportHeight) {
    adjustedY = Math.max(margin, y - menuHeight);
  }

  return { x: adjustedX, y: adjustedY };
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

/**
 * Debounce function for rapid events
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for rapid events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if an element is visible in the viewport
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Scroll element into view if not visible
 */
export function scrollIntoViewIfNeeded(element: HTMLElement): void {
  if (!isElementVisible(element)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }
}