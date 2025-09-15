"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Users, Circle } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { useHangout } from "@/lib/hooks/useHangout";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function HangoutChat() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentUserId,
    isUserLoaded,
    messages,
    onlineUsers,
    sendMessage,
    isConnected
  } = useHangout();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    await sendMessage(message);
    setMessage("");
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatarComponent = (username: string, avatar?: string) => {
    if (avatar) {
      return (
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (!isUserLoaded) {
    return (
      <div className="flex flex-col h-full animate-pulse">
        <div className="h-12 bg-muted/50 rounded-t-lg" />
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-6 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">🎉</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Main Hangout</h2>
            <p className="text-xs text-muted-foreground">
              {isConnected ? `${onlineUsers.length} online` : 'Connecting...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{onlineUsers.length}</span>
          <Circle
            size={8}
            className={`${isConnected ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <SignedOut>
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">👋</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to the Main Hangout!
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign in to join the conversation with everyone else.
            </p>
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
                Sign In to Chat
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {!isConnected ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                <span>Connecting to hangout...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start the conversation!
              </h3>
              <p className="text-muted-foreground">
                Be the first to say hello in the main hangout.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg._id}
                  avatar={getAvatarComponent(msg.author?.username || "User", msg.author?.avatar)}
                  username={msg.author?.username || "Unknown User"}
                  timestamp={formatTimestamp(msg.createdAt)}
                  content={msg.content}
                  isOwn={msg.authorId === currentUserId}
                  status="delivered"
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </SignedIn>
      </div>

      {/* Input */}
      <SignedIn>
        <div className="p-4 border-t border-border/30 bg-muted/10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || !isConnected}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105 active:scale-95"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>

          {isConnected && (
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>
                {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
              </span>
              <span>{message.length}/1000</span>
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  );
}