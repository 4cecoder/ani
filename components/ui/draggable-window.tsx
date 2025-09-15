"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Maximize2, Minimize2, X, GripVertical } from "lucide-react";

interface DraggableWindowProps {
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width, height });
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [activeZIndex, setActiveZIndex] = useState(zIndex);

  // Bring window to front when clicked
  const handleBringToFront = useCallback(() => {
    setActiveZIndex(prev => Math.max(prev, zIndex + 10));
    bringToFront?.();
  }, [zIndex, bringToFront]);

  // Set initial position on client only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const centerX = window.innerWidth / 2 - width / 2;
      const centerY = window.innerHeight / 2 - height / 2;
      setPosition({
        x: Math.max(20, Math.min(centerX, window.innerWidth - width - 20)),
        y: Math.max(80, Math.min(centerY, window.innerHeight - height - 20)),
      });
    }
  }, [width, height]);

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

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && !isMaximized) {
      let newX = e.clientX - offset.x;
      let newY = e.clientY - offset.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      // Snap to edges if enabled
      if (snapToEdges) {
        const snapThreshold = 20;
        if (Math.abs(newX) < snapThreshold) newX = 0;
        if (Math.abs(newY) < snapThreshold) newY = 0;
        if (Math.abs(newX - maxX) < snapThreshold) newX = maxX;
        if (Math.abs(newY - maxY) < snapThreshold) newY = maxY;
      }
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
    
    if (resizing && resizable && !isMaximized) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
    handleBringToFront();
    document.body.style.cursor = "nwse-resize";
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setSize({ width, height });
      setPosition({
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight / 2 - height / 2,
      });
    } else {
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
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
    } else if (!isMaximized) {
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
      
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
      e.preventDefault();
    }
  }, [position, size, isMaximized, onClose, onMinimize, handleMaximize]);

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
  }, [dragging, resizing, offset, resizeStart]);

  return (
    <div
      ref={windowRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: activeZIndex,
        width: isMaximized ? "100vw" : size.width,
        height: isMaximized ? "100vh" : size.height,
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
            aria-label={isMaximized ? "Restore window" : "Maximize window"}
            title={isMaximized ? "Restore (Ctrl+X)" : "Maximize (Ctrl+X)"}
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
        {resizable && !isMaximized && (
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
