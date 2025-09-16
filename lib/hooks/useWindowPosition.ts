"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

interface UseWindowPositionOptions {
  windowId: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

const STORAGE_KEY_PREFIX = "ani_window_";

export function useWindowPosition({
  windowId,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 500 },
  minSize = { width: 300, height: 200 },
  maxSize = { width: 1200, height: 800 },
}: UseWindowPositionOptions) {
  // Memoize default values to prevent unnecessary re-renders
  const memoizedDefaultPosition = useMemo(() => defaultPosition, [defaultPosition.x, defaultPosition.y]);
  const memoizedDefaultSize = useMemo(() => defaultSize, [defaultSize.width, defaultSize.height]);

  // Always start with default values to prevent hydration mismatch
  const [position, setPosition] = useState<WindowPosition>({
    x: memoizedDefaultPosition.x,
    y: memoizedDefaultPosition.y,
    width: memoizedDefaultSize.width,
    height: memoizedDefaultSize.height,
    isMaximized: false,
    isMinimized: false,
    zIndex: 100,
  });

  // Load from localStorage after hydration
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration effect - only run once when component mounts
  useEffect(() => {
    setIsHydrated(true);
    
    // Load position from localStorage after hydration
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${windowId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPosition({
          x: parsed.x ?? memoizedDefaultPosition.x,
          y: parsed.y ?? memoizedDefaultPosition.y,
          width: parsed.width ?? memoizedDefaultSize.width,
          height: parsed.height ?? memoizedDefaultSize.height,
          isMaximized: parsed.isMaximized ?? false,
          isMinimized: parsed.isMinimized ?? false,
          zIndex: parsed.zIndex ?? 100,
        });
      } else {
        // Center window on first load if no saved position
        const centerX = Math.max(20, window.innerWidth / 2 - memoizedDefaultSize.width / 2);
        const centerY = Math.max(80, window.innerHeight / 2 - memoizedDefaultSize.height / 2);
        
        setPosition(prev => ({
          ...prev,
          x: centerX,
          y: centerY,
        }));
      }
    } catch (error) {
      console.warn(`Failed to load window position for ${windowId}:`, error);
    }
  }, [windowId, memoizedDefaultPosition.x, memoizedDefaultPosition.y, memoizedDefaultSize.width, memoizedDefaultSize.height]);

  // Save to localStorage whenever position changes
  const savePosition = useCallback((newPosition: Partial<WindowPosition>) => {
    if (typeof window === "undefined" || !isHydrated) return;

    const updatedPosition = { ...position, ...newPosition };
    setPosition(updatedPosition);

    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${windowId}`,
        JSON.stringify(updatedPosition)
      );
    } catch (error) {
      console.warn(`Failed to save window position for ${windowId}:`, error);
    }
  }, [windowId, position, isHydrated]);

  // Update position with validation
  const updatePosition = useCallback((updates: Partial<WindowPosition>) => {
    const newPosition = { ...position, ...updates };
    
    // Validate position is within viewport bounds
    if (typeof window !== "undefined" && !newPosition.isMaximized) {
      const maxX = window.innerWidth - newPosition.width;
      const maxY = window.innerHeight - newPosition.height;
      
      newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
    }

    // Validate size constraints
    if (!newPosition.isMaximized) {
      newPosition.width = Math.max(
        minSize.width,
        Math.min(newPosition.width, maxSize.width)
      );
      newPosition.height = Math.max(
        minSize.height,
        Math.min(newPosition.height, maxSize.height)
      );
    }

    savePosition(newPosition);
  }, [position, minSize, maxSize, savePosition]);

  // Handle window resize to keep positions valid
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (position.isMaximized) return;

      const maxX = window.innerWidth - position.width;
      const maxY = window.innerHeight - position.height;
      
      const newX = Math.max(0, Math.min(position.x, maxX));
      const newY = Math.max(0, Math.min(position.y, maxY));
      
      if (newX !== position.x || newY !== position.y) {
        updatePosition({ x: newX, y: newY });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, updatePosition]);


  return {
    position,
    updatePosition,
    savePosition,
  };
}
