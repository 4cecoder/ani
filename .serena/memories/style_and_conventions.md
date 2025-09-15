# Code Style and Conventions for Ani Hangout Site

## TypeScript Standards
- **Strict Mode**: All TypeScript files use strict type checking
- **Type Annotations**: Explicit types for function parameters and return values
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions
- **Generic Types**: Use generics for reusable components and functions
- **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)

## Naming Conventions
- **Components**: PascalCase (e.g., `ChatWindow`, `UserProfile`)
- **Utilities**: camelCase (e.g., `formatMessage`, `validateEmail`)
- **Files**: kebab-case for components (e.g., `chat-window.tsx`)
- **Directories**: kebab-case (e.g., `user-profile/`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MESSAGE_LENGTH`)
- **Enums**: PascalCase (e.g., `MessageType`)

## File Organization
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── globals.css        # Global styles
├── (auth)/            # Authentication routes
├── dashboard/         # Main app routes
└── api/              # API routes

components/
├── ui/               # Reusable UI components
├── chat/            # Chat-related components
├── posts/           # Post-related components
└── layout/          # Layout components

lib/
├── utils.ts         # Utility functions
├── constants.ts     # App constants
└── types.ts         # TypeScript types

convex/
├── schema.ts        # Database schema
├── auth.ts          # Authentication functions
├── messages.ts      # Message functions
└── posts.ts         # Post functions
```

## Component Patterns
- **Functional Components**: Use function declarations over arrow functions
- **Props Interface**: Define props interface above component
- **Default Props**: Use default parameters instead of defaultProps
- **Children**: Use `React.ReactNode` for children prop
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`)

## React Best Practices
```typescript
// ✅ Good: Explicit types and functional component
interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div onClick={onClick}>
      <h3>{user.name}</h3>
    </div>
  );
}

// ❌ Bad: Implicit any, arrow function
export const UserCard = ({ user, onClick }) => {
  return (
    <div onClick={onClick}>
      <h3>{user.name}</h3>
    </div>
  );
};
```

## Styling Conventions
- **Tailwind Classes**: Use utility-first approach
- **Custom Classes**: Use `cn()` utility for conditional classes
- **CSS Variables**: Use CSS custom properties for theme values
- **Dark Mode**: Support both light and dark themes
- **Responsive**: Mobile-first responsive design

```typescript
// ✅ Good: Using cn utility for conditional classes
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({ variant = "primary", size = "md", className }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md font-medium transition-colors",
        {
          "bg-blue-500 text-white hover:bg-blue-600": variant === "primary",
          "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
          "px-2 py-1 text-sm": size === "sm",
          "px-4 py-2": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
    >
      Button
    </button>
  );
}
```

## Convex Function Conventions
- **Function Naming**: Use descriptive names (e.g., `sendMessage`, `getUserPosts`)
- **Error Handling**: Always handle authentication and validation errors
- **Type Safety**: Use Convex's `v` validation library
- **Indexes**: Define appropriate database indexes
- **Documentation**: Add JSDoc comments for complex functions

```typescript
// ✅ Good: Proper Convex function with validation and error handling
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send a message to a channel
 */
export const sendMessage = mutation({
  args: {
    content: v.string(),
    channelId: v.id("channels"),
    type: v.optional(v.union(v.literal("text"), v.literal("image"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("messages", {
      content: args.content,
      authorId: user._id,
      channelId: args.channelId,
      type: args.type || "text",
      createdAt: Date.now(),
    });
  },
});
```

## Import Organization
- **React Imports**: Always first
- **Third-party Libraries**: Group together
- **Internal Imports**: Group by type (components, utils, types)
- **Relative Imports**: Use `@/` alias for absolute imports
- **Type Imports**: Use `import type` for type-only imports

```typescript
// ✅ Good: Organized imports
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { User } from "@/lib/types";
import { api } from "../convex/_generated/api";
```

## Error Handling
- **Try-Catch**: Use try-catch for async operations
- **User-Friendly Messages**: Provide meaningful error messages
- **Logging**: Log errors for debugging
- **Fallback UI**: Show appropriate fallback states

```typescript
// ✅ Good: Proper error handling
export function MessageList({ channelId }: { channelId: string }) {
  const messages = useQuery(api.messages.getMessages, { channelId });

  if (messages === undefined) {
    return <div>Loading messages...</div>;
  }

  if (messages instanceof Error) {
    console.error("Failed to load messages:", messages);
    return <div>Failed to load messages. Please try again.</div>;
  }

  return (
    <div>
      {messages.map(message => (
        <Message key={message._id} message={message} />
      ))}
    </div>
  );
}
```

## Performance Considerations
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Lazy Loading**: Use dynamic imports for large components
- **Image Optimization**: Use Next.js Image component
- **Bundle Splitting**: Split code for better loading performance

## Accessibility
- **Semantic HTML**: Use appropriate HTML elements
- **ARIA Labels**: Add aria-labels where needed
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Color Contrast**: Maintain proper contrast ratios
- **Screen Readers**: Test with screen readers

## Testing Guidelines
- **Unit Tests**: Test utility functions and hooks
- **Integration Tests**: Test Convex functions
- **E2E Tests**: Test critical user flows
- **Test Naming**: Use descriptive test names
- **Mock Data**: Use realistic test data