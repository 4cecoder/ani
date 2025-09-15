"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { DraggableWindow } from "@/components/ui/draggable-window";
import { HangoutChat } from "@/components/ui/hangout-chat";
import { OnlineUsers } from "@/components/ui/online-users";
import { useState } from "react";
import { MessageSquare, Users, Sparkles, UserPlus } from "lucide-react";

export default function Home() {
  const [showChat, setShowChat] = useState(true);
  const [showUsers, setShowUsers] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 dark:from-purple-950/95 dark:via-blue-950/95 dark:to-indigo-950/95 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 p-4 h-20 flex items-center justify-between bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 mx-4 mt-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Ani Hangout
            </h1>
            <p className="text-white/60 text-sm">Where everyone comes together</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Main Hangout</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Live Chat</span>
            </div>
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg transform hover:scale-105">
                Join the Hangout
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-white/20 shadow-lg",
                  userButtonPopoverCard: "backdrop-blur-xl bg-black/90 border border-white/20",
                }
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="relative z-10 text-center mt-12 mb-8 px-4">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          Welcome to the Hangout! 🎉
        </h2>
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Join our giant community chat where everyone hangs out together.
          Real-time conversations, awesome people, and endless fun!
        </p>

        <SignedOut>
          <div className="mt-8">
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 text-lg font-semibold shadow-2xl transform hover:scale-105 flex items-center gap-3 mx-auto">
                <MessageSquare className="w-6 h-6" />
                Start Chatting Now
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>

      {/* Floating Chat Window */}
      {showChat && (
        <DraggableWindow
          title="🎉 Main Hangout"
          width={450}
          height={600}
          onClose={() => setShowChat(false)}
          className="shadow-2xl"
        >
          <HangoutChat />
        </DraggableWindow>
      )}

      {/* Online Users Window */}
      <SignedIn>
        {showUsers && (
          <DraggableWindow
            title="👥 Who's Online"
            width={280}
            height={400}
            onClose={() => setShowUsers(false)}
            className="shadow-2xl"
          >
            <div className="h-full p-4">
              <OnlineUsers />
            </div>
          </DraggableWindow>
        )}
      </SignedIn>

      {/* Quick Actions (when windows are closed) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3"
            aria-label="Open chat"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="hidden sm:inline">Open Chat</span>
          </button>
        )}

        <SignedIn>
          {!showUsers && (
            <button
              onClick={() => setShowUsers(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3"
              aria-label="Show online users"
            >
              <UserPlus className="w-6 h-6" />
              <span className="hidden sm:inline">Users</span>
            </button>
          )}
        </SignedIn>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-white/40 text-sm">
          Built with ❤️ for bringing people together
        </p>
      </div>
    </div>
  );
}
