"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useHangout() {
  const { user, isLoaded } = useUser();
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convex mutations and queries
  const createOrGetUser = useMutation(api.hangout.createOrGetUser);
  const createMainHangout = useMutation(api.hangout.createMainHangout);
  const sendMessage = useMutation(api.hangout.sendHangoutMessage);
  const updateUserStatus = useMutation(api.hangout.updateUserStatus);
  const setTypingIndicator = useMutation(api.hangout.setTypingIndicator);
  const addReaction = useMutation(api.hangout.addReaction);
  const markMessageAsRead = useMutation(api.hangout.markMessageAsRead);
  const deleteMessage = useMutation(api.hangout.deleteMessage);

  // Queries
  const mainHangout = useQuery(api.hangout.getMainHangout);
  const messages = useQuery(api.hangout.getHangoutMessages, { limit: 100 });
  const onlineUsers = useQuery(api.hangout.getOnlineUsers);
  const typingUsers = useQuery(api.hangout.getTypingUsers) || [];

  // Initialize user and hangout when Clerk user is loaded
  useEffect(() => {
    if (isLoaded && user && !currentUserId) {
      const initializeUser = async () => {
        try {
          // Create or get user in Convex
          const userId = await createOrGetUser({
            clerkId: user.id,
            username: user.username || user.firstName || "Anonymous",
            email: user.primaryEmailAddress?.emailAddress || "",
            avatar: user.imageUrl,
          });

          setCurrentUserId(userId);

          // Ensure main hangout exists
          if (!mainHangout) {
            await createMainHangout();
          }
        } catch (error) {
          console.error("Failed to initialize user:", error);
        }
      };

      initializeUser();
    }
  }, [isLoaded, user, currentUserId, mainHangout, createOrGetUser, createMainHangout]);

  // Update user status to online when they join
  useEffect(() => {
    if (currentUserId) {
      updateUserStatus({
        userId: currentUserId,
        status: "online",
      });

      // Update status to offline when leaving
      const handleBeforeUnload = () => {
        updateUserStatus({
          userId: currentUserId,
          status: "offline",
        });
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [currentUserId, updateUserStatus]);

  // Keep user status updated (heartbeat)
  useEffect(() => {
    if (currentUserId) {
      const interval = setInterval(() => {
        updateUserStatus({
          userId: currentUserId,
          status: "online",
        });
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUserId, updateUserStatus]);

  // Typing indicator management
  const handleTyping = useCallback(async () => {
    if (!currentUserId) return;

    if (!isTyping) {
      setIsTyping(true);
      await setTypingIndicator({
        userId: currentUserId,
        isTyping: true,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      if (currentUserId) {
        await setTypingIndicator({
          userId: currentUserId,
          isTyping: false,
        });
      }
    }, 2000);
  }, [currentUserId, isTyping, setTypingIndicator]);

  const sendHangoutMessage = async (content: string, replyTo?: Id<"messages">) => {
    if (!currentUserId || !content.trim()) return;

    try {
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        await setTypingIndicator({
          userId: currentUserId,
          isTyping: false,
        });
      }

      await sendMessage({
        content: content.trim(),
        authorId: currentUserId,
        type: "text",
        replyTo,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const addMessageReaction = async (messageId: Id<"messages">, emoji: string) => {
    if (!currentUserId) return;

    try {
      await addReaction({
        messageId,
        userId: currentUserId,
        emoji,
      });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const markAsRead = async (messageId: Id<"messages">) => {
    if (!currentUserId) return;

    try {
      await markMessageAsRead({
        messageId,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const deleteMessageById = async (messageId: Id<"messages">) => {
    if (!currentUserId) return;

    try {
      await deleteMessage({
        messageId,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Auto-mark messages as read when they come into view
  useEffect(() => {
    if (currentUserId && messages) {
      const unreadMessages = messages.filter(
        msg => msg.authorId !== currentUserId &&
        !msg.readBy?.some(r => r.userId === currentUserId)
      );

      unreadMessages.forEach(msg => {
        markAsRead(msg._id);
      });
    }
  }, [messages, currentUserId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    user,
    currentUserId,
    isUserLoaded: isLoaded,
    mainHangout,
    messages: messages || [],
    onlineUsers: onlineUsers || [],
    typingUsers: typingUsers || [],
    sendMessage: sendHangoutMessage,
    addReaction: addMessageReaction,
    markAsRead,
    deleteMessage: deleteMessageById,
    handleTyping,
    isConnected: !!currentUserId && !!mainHangout,
  };
}