import { ReactNode } from 'react';
import { X, Minimize2, Maximize2, GripVertical } from 'lucide-react';

interface WindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
  variant?: 'default' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  draggable?: boolean;
  resizable?: boolean;
}

export function Window({
  title,
  children,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
  variant = 'glass',
  size = 'md',
  draggable = false,
  resizable = false
}: WindowProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const variantClasses = {
    default: 'bg-background border border-border/50',
    glass: 'bg-background/80 backdrop-blur-xl border border-border/30',
    solid: 'bg-card border border-border'
  };

  return (
    <div className={`
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      rounded-xl shadow-2xl 
      overflow-hidden
      transition-all duration-300
      hover:shadow-3xl
      ${className}
    `}>
      {/* Window Header */}
      <div className={`
        flex items-center justify-between 
        px-4 py-3 
        bg-muted/30 backdrop-blur-sm 
        border-b border-border/20
        transition-all duration-200
        ${draggable ? 'cursor-move hover:bg-muted/40' : ''}
      `}>
        <div className="flex items-center gap-3">
          {draggable && (
            <GripVertical 
              size={14} 
              className="text-muted-foreground/50" 
            />
          )}
          <h4 className="text-foreground font-medium text-sm truncate">
            {title}
          </h4>
        </div>
        
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className={`
                p-1.5 rounded-md 
                transition-all duration-200
                text-muted-foreground hover:text-foreground
                hover:bg-accent/50 active:scale-95
              `}
              aria-label="Minimize"
            >
              <Minimize2 size={14} />
            </button>
          )}
          {onMaximize && (
            <button
              onClick={onMaximize}
              className={`
                p-1.5 rounded-md 
                transition-all duration-200
                text-muted-foreground hover:text-foreground
                hover:bg-accent/50 active:scale-95
              `}
              aria-label="Maximize"
            >
              <Maximize2 size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`
                p-1.5 rounded-md 
                transition-all duration-200
                text-muted-foreground hover:text-destructive
                hover:bg-destructive/10 active:scale-95
              `}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Window Content */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Resize Handle */}
      {resizable && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-full h-full border-r-2 border-b-2 border-border/30 rounded-bl-lg" />
        </div>
      )}
    </div>
  );
}