"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useHangout() {
  const { user, isLoaded } = useUser();
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);

  // Convex mutations and queries
  const createOrGetUser = useMutation(api.hangout.createOrGetUser);
  const createMainHangout = useMutation(api.hangout.createMainHangout);
  const sendMessage = useMutation(api.hangout.sendHangoutMessage);
  const updateUserStatus = useMutation(api.hangout.updateUserStatus);

  // Queries
  const mainHangout = useQuery(api.hangout.getMainHangout);
  const messages = useQuery(api.hangout.getHangoutMessages, { limit: 100 });
  const onlineUsers = useQuery(api.hangout.getOnlineUsers);

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

  const sendHangoutMessage = async (content: string) => {
    if (!currentUserId || !content.trim()) return;

    try {
      await sendMessage({
        content: content.trim(),
        authorId: currentUserId,
        type: "text",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    user,
    currentUserId,
    isUserLoaded: isLoaded,
    mainHangout,
    messages: messages || [],
    onlineUsers: onlineUsers || [],
    sendMessage: sendHangoutMessage,
    isConnected: !!currentUserId && !!mainHangout,
  };
}