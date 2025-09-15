import type { Id } from "@/convex/_generated/dataModel";
import type { GradientConfig } from "../gradients/gradient-types";

/**
 * Context menu item types and interfaces
 */

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  onClick?: () => void;
  href?: string;
  target?: string;
}

export interface ContextMenuGroup {
  id: string;
  title?: string;
  items: ContextMenuItem[];
}

export interface ContextMenuProps {
  id: string;
  items: ContextMenuItem[] | ContextMenuGroup[];
  position: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'right-click' | 'click' | 'hover';
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  gradient?: GradientConfig;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ContextMenuItemProps {
  item: ContextMenuItem;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  gradient?: GradientConfig;
  className?: string;
}

export interface ContextMenuSeparatorProps {
  className?: string;
}

export interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  activeItem: string | null;
  items: ContextMenuItem[] | ContextMenuGroup[];
}

export interface ContextMenuTriggerProps {
  children: React.ReactNode;
  menuId: string;
  items: ContextMenuItem[] | ContextMenuGroup[];
  trigger?: 'right-click' | 'click' | 'hover';
  disabled?: boolean;
  className?: string;
}

export interface UseContextMenuOptions {
  id: string;
  items: ContextMenuItem[] | ContextMenuGroup[];
  trigger?: 'right-click' | 'click' | 'hover';
  onClose?: () => void;
  onOpen?: () => void;
  disabled?: boolean;
}

export interface UseContextMenuReturn {
  isOpen: boolean;
  position: { x: number; y: number };
  activeItem: string | null;
  open: (event: React.MouseEvent | MouseEvent) => void;
  close: () => void;
  toggle: (event: React.MouseEvent | MouseEvent) => void;
  setItems: (items: ContextMenuItem[] | ContextMenuGroup[]) => void;
  triggerProps: {
    onContextMenu: (event: React.MouseEvent) => void;
    onClick: (event: React.MouseEvent) => void;
    onMouseEnter: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
  };
  menuProps: {
    isOpen: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    items: ContextMenuItem[] | ContextMenuGroup[];
  };
}

/**
 * Message-specific context menu types
 */
export interface MessageContextMenuItem extends ContextMenuItem {
  action: 'reply' | 'edit' | 'delete' | 'copy' | 'react' | 'forward' | 'pin' | 'report';
  messageId?: Id<"messages">;
  emoji?: string;
}

export interface MessageContextMenuProps extends Omit<ContextMenuProps, 'items'> {
  messageId: Id<"messages">;
  isOwnMessage: boolean;
  onReply?: (messageId: Id<"messages">) => void;
  onEdit?: (messageId: Id<"messages">) => void;
  onDelete?: (messageId: Id<"messages">) => void;
  onCopy?: (messageId: Id<"messages">) => void;
  onReact?: (messageId: Id<"messages">, emoji: string) => void;
  onForward?: (messageId: Id<"messages">) => void;
  onPin?: (messageId: Id<"messages">) => void;
  onReport?: (messageId: Id<"messages">) => void;
}

/**
 * Keyboard navigation types
 */
export interface KeyboardNavigationOptions {
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export interface KeyboardNavigationState {
  focusedIndex: number;
  isNavigating: boolean;
}

/**
 * Animation types
 */
export interface ContextMenuAnimation {
  enter: string;
  enterFrom: string;
  enterTo: string;
  leave: string;
  leaveFrom: string;
  leaveTo: string;
}

export const defaultContextMenuAnimation: ContextMenuAnimation = {
  enter: 'transition ease-out duration-200',
  enterFrom: 'transform opacity-0 scale-95',
  enterTo: 'transform opacity-100 scale-100',
  leave: 'transition ease-in duration-150',
  leaveFrom: 'transform opacity-100 scale-100',
  leaveTo: 'transform opacity-0 scale-95',
};

/**
 * Theme types
 */
export interface ContextMenuTheme {
  background: string;
  border: string;
  text: string;
  hover: string;
  active: string;
  disabled: string;
  separator: string;
  shadow: string;
  borderRadius: string;
  fontSize: string;
  padding: string;
  gap: string;
}

export const defaultContextMenuTheme: ContextMenuTheme = {
  background: 'bg-background',
  border: 'border border-border',
  text: 'text-foreground',
  hover: 'hover:bg-accent hover:text-accent-foreground',
  active: 'bg-accent text-accent-foreground',
  disabled: 'text-muted-foreground opacity-50',
  separator: 'border-border',
  shadow: 'shadow-lg',
  borderRadius: 'rounded-lg',
  fontSize: 'text-sm',
  padding: 'p-1',
  gap: 'gap-1',
};

/**
 * Event types
 */
export interface ContextMenuEvent {
  type: 'open' | 'close' | 'item-click' | 'item-hover' | 'keyboard-navigate';
  itemId?: string;
  position?: { x: number; y: number };
  timestamp: number;
}

export interface ContextMenuEventHandler {
  (event: ContextMenuEvent): void;
}