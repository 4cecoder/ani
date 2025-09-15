"use client";

import { useEffect, useState } from "react";

interface TypingUser {
  _id: string;
  username: string;
  avatar?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const [dots, setDots] = useState("");

  // Animate the dots
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) return null;

  const formatTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
      {/* Animated dots indicator */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Typing text */}
      <span className="text-sm italic">
        {formatTypingText()}{dots}
      </span>

      {/* User avatars */}
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <div
            key={user._id}
            className="w-6 h-6 rounded-full ring-2 ring-background overflow-hidden"
            title={user.username}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        ))}
        {typingUsers.length > 3 && (
          <div className="w-6 h-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">+{typingUsers.length - 3}</span>
          </div>
        )}
      </div>
    </div>
  );
}