"use client";

import { useHangout } from "@/lib/hooks/useHangout";
import { Circle, Users } from "lucide-react";
import Image from "next/image";

export function OnlineUsers() {
  const { onlineUsers, isConnected } = useHangout();

  const getAvatarComponent = (username: string, avatar?: string) => {
    if (avatar) {
      return (
        <Image
          src={avatar}
          alt={username}
          width={32}
          height={32}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users size={16} />
          <span className="text-sm font-medium">Online Users</span>
        </div>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <Users size={16} />
          <span className="text-sm font-medium">Online Users</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle
            size={8}
            className={`${isConnected ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`}
          />
          <span className="text-xs text-muted-foreground">{onlineUsers.length}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No one else is online right now</p>
          </div>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full ring-2 ring-background">
                  {getAvatarComponent(user.username, user.avatar)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.status === "online" ? "Active now" : "Away"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}