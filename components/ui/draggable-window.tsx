"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Maximize2, Minimize2, X, GripVertical } from "lucide-react";
import { useWindowPosition } from "@/lib/hooks/useWindowPosition";

interface DraggableWindowProps {
  windowId: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  width?: number;
  height?: number;
  resizable?: boolean;
  snapToEdges?: boolean;
  zIndex?: number;
  bringToFront?: () => void;
}

export function DraggableWindow({ 
  windowId,
  title, 
  children, 
  className = "",
  onClose,
  onMinimize,
  onMaximize,
  width = 420,
  height = 500,
  resizable = true,
  snapToEdges = true,
  zIndex = 100,
  bringToFront
}: DraggableWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Use the window position hook
  const { position, updatePosition } = useWindowPosition({
    windowId,
    defaultPosition: { x: 100, y: 100 },
    defaultSize: { width, height },
    minSize: { width: 300, height: 200 },
    maxSize: { width: 1200, height: 800 },
  });

  // Bring window to front when clicked
  const handleBringToFront = useCallback(() => {
    const newZIndex = Math.max(position.zIndex, zIndex + 10);
    updatePosition({ zIndex: newZIndex });
    bringToFront?.();
  }, [position.zIndex, zIndex, bringToFront, updatePosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) return;
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    handleBringToFront();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging && !position.isMaximized) {
      let newX = e.clientX - offset.x;
      let newY = e.clientY - offset.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - position.width;
      const maxY = window.innerHeight - position.height;
      
      // Snap to edges if enabled
      if (snapToEdges) {
        const snapThreshold = 20;
        if (Math.abs(newX) < snapThreshold) newX = 0;
        if (Math.abs(newY) < snapThreshold) newY = 0;
        if (Math.abs(newX - maxX) < snapThreshold) newX = maxX;
        if (Math.abs(newY - maxY) < snapThreshold) newY = maxY;
      }
      
      updatePosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
    
    if (resizing && resizable && !position.isMaximized) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
      updatePosition({ width: newWidth, height: newHeight });
    }
  }, [dragging, position.isMaximized, position.width, position.height, offset.x, offset.y, snapToEdges, updatePosition, resizing, resizable, resizeStart.width, resizeStart.height, resizeStart.x, resizeStart.y]);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: position.width,
      height: position.height,
    });
    handleBringToFront();
    document.body.style.cursor = "nwse-resize";
  };

  const handleMaximize = () => {
    if (position.isMaximized) {
      updatePosition({
        isMaximized: false,
        width: width,
        height: height,
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight / 2 - height / 2,
      });
    } else {
      updatePosition({
        isMaximized: true,
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleBringToFront();
    onMaximize?.();
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape" && onClose) {
      onClose();
    } else if (e.ctrlKey && e.key === "m" && onMinimize) {
      onMinimize();
    } else if (e.ctrlKey && e.key === "x") {
      handleMaximize();
    } else if (!position.isMaximized) {
      const moveStep = e.shiftKey ? 50 : 10;
      let newX = position.x;
      let newY = position.y;
      
      switch (e.key) {
        case "ArrowUp":
          newY -= moveStep;
          break;
        case "ArrowDown":
          newY += moveStep;
          break;
        case "ArrowLeft":
          newX -= moveStep;
          break;
        case "ArrowRight":
          newX += moveStep;
          break;
        default:
          return;
      }
      
      const maxX = window.innerWidth - position.width;
      const maxY = window.innerHeight - position.height;
      
      updatePosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
      e.preventDefault();
    }
  }, [position, onClose, onMinimize, handleMaximize]);

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, handleMouseMove, updatePosition]);

  return (
    <div
      ref={windowRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: position.zIndex,
        width: position.isMaximized ? "100vw" : position.width,
        height: position.isMaximized ? "100vh" : position.height,
        transition: dragging || resizing ? "none" : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className={`
        bg-background/95 backdrop-blur-xl 
        border border-border/50 
        rounded-xl shadow-2xl 
        overflow-hidden 
        ${dragging ? 'shadow-purple-500/20 scale-[1.02]' : 'shadow-lg'}
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Chat Window"}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleBringToFront}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          flex items-center justify-between 
          px-4 py-3 
          bg-gradient-to-r from-purple-600/20 to-blue-600/20 
          border-b border-white/10 
          cursor-grab active:cursor-grabbing
          select-none
          transition-all duration-200
          hover:from-purple-600/30 hover:to-blue-600/30
          ${dragging ? 'from-purple-600/40 to-blue-600/40' : ''}
        `}
        aria-label="Window header - drag to move"
      >
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-white/60" />
          <h3 className="text-white font-medium text-sm truncate">
            {title || "Chat"}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              className="text-white/60 hover:text-white p-1.5 rounded transition-colors"
              aria-label="Minimize window"
              title="Minimize (Ctrl+M)"
            >
              <Minimize2 size={14} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
            className="text-white/60 hover:text-white p-1.5 rounded transition-colors"
            aria-label={position.isMaximized ? "Restore window" : "Maximize window"}
            title={position.isMaximized ? "Restore (Ctrl+X)" : "Maximize (Ctrl+X)"}
          >
            <Maximize2 size={14} />
          </button>
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-white/60 hover:text-red-400 p-1.5 rounded transition-colors"
              aria-label="Close window"
              title="Close (Esc)"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex flex-col h-[calc(100%-48px)]">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Resize Handle */}
        {resizable && !position.isMaximized && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Resize handle"
          >
            <div className="w-full h-full border-r-2 border-b-2 border-white/40 rounded-bl-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
