# API Reference

This document provides comprehensive API documentation for the Ani Hangout Site, including Convex database functions, authentication flows, and client-side integrations.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Messages](#messages)
- [Channels](#channels)
- [Posts](#posts)
- [Comments](#comments)
- [Real-time Subscriptions](#real-time-subscriptions)

## Authentication

### Clerk Integration

The application uses Clerk.js for authentication. All Convex functions automatically receive the authenticated user's identity through `ctx.auth`.

#### Getting Current User

```typescript
import { useUser } from "@clerk/nextjs";

function MyComponent() {
  const { user } = useUser();

  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.firstName}!</div>;
}
```

#### Authentication in Convex Functions

```typescript
// In any Convex function
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

// Get user from database
const user = await ctx.db
  .query("users")
  .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
  .first();
```

## Users

### Create User Profile

**Function:** `auth.createUser`

Creates a user profile when a new user signs up.

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const createUser = useMutation(api.auth.createUser);

// Usage
await createUser({
  clerkId: user.id,
  username: user.username,
  email: user.primaryEmailAddress?.emailAddress || "",
});
```

**Parameters:**
- `clerkId` (string): Clerk user ID
- `username` (string): Unique username
- `email` (string): User's email address

**Returns:** User ID

### Get User Profile

**Function:** `users.getUser`

Retrieves a user's profile information.

```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const user = useQuery(api.users.getUser, { userId });
```

**Parameters:**
- `userId` (Id<"users">): User ID

**Returns:**
```typescript
{
  _id: Id<"users">,
  clerkId: string,
  username: string,
  email: string,
  avatar?: string,
  bio?: string,
  createdAt: number,
  updatedAt: number,
}
```

### Update User Profile

**Function:** `users.updateUser`

Updates user profile information.

```typescript
const updateUser = useMutation(api.users.updateUser);

await updateUser({
  userId,
  bio: "New bio",
  avatar: "new-avatar-url",
});
```

**Parameters:**
- `userId` (Id<"users">): User ID
- `bio?` (string): User biography
- `avatar?` (string): Avatar image URL
- `username?` (string): New username

## Messages

### Send Message

**Function:** `messages.sendMessage`

Sends a message to a channel.

```typescript
const sendMessage = useMutation(api.messages.sendMessage);

await sendMessage({
  content: "Hello, world!",
  channelId: channelId,
  type: "text",
});
```

**Parameters:**
- `content` (string): Message content
- `channelId` (Id<"channels">): Target channel
- `type?` ("text" | "image" | "file"): Message type

**Returns:** Message ID

### Get Channel Messages

**Function:** `messages.getMessages`

Retrieves messages from a channel.

```typescript
const messages = useQuery(api.messages.getMessages, {
  channelId,
  limit: 50,
});
```

**Parameters:**
- `channelId` (Id<"channels">): Channel ID
- `limit?` (number): Maximum messages to return (default: 50)

**Returns:** Array of messages ordered by creation time (newest first)

### Edit Message

**Function:** `messages.editMessage`

Edits an existing message.

```typescript
const editMessage = useMutation(api.messages.editMessage);

await editMessage({
  messageId,
  content: "Updated message",
});
```

**Parameters:**
- `messageId` (Id<"messages">): Message ID
- `content` (string): New message content

### Delete Message

**Function:** `messages.deleteMessage`

Deletes a message.

```typescript
const deleteMessage = useMutation(api.messages.deleteMessage);

await deleteMessage({ messageId });
```

**Parameters:**
- `messageId` (Id<"messages">): Message ID to delete

## Channels

### Create Channel

**Function:** `channels.createChannel`

Creates a new chat channel.

```typescript
const createChannel = useMutation(api.channels.createChannel);

await createChannel({
  name: "general",
  description: "General discussion",
  type: "public",
});
```

**Parameters:**
- `name` (string): Channel name
- `description?` (string): Channel description
- `type` ("public" | "private" | "dm"): Channel type

**Returns:** Channel ID

### Get User Channels

**Function:** `channels.getUserChannels`

Retrieves all channels a user has access to.

```typescript
const channels = useQuery(api.channels.getUserChannels, { userId });
```

**Parameters:**
- `userId` (Id<"users">): User ID

**Returns:** Array of channels

### Join Channel

**Function:** `channels.joinChannel`

Adds a user to a channel.

```typescript
const joinChannel = useMutation(api.channels.joinChannel);

await joinChannel({ channelId });
```

**Parameters:**
- `channelId` (Id<"channels">): Channel to join

### Leave Channel

**Function:** `channels.leaveChannel`

Removes a user from a channel.

```typescript
const leaveChannel = useMutation(api.channels.leaveChannel);

await leaveChannel({ channelId });
```

**Parameters:**
- `channelId` (Id<"channels">): Channel to leave

## Posts

### Create Post

**Function:** `posts.createPost`

Creates a new social post.

```typescript
const createPost = useMutation(api.posts.createPost);

await createPost({
  content: "Hello, world!",
  images: ["image1.jpg", "image2.jpg"],
  hashtags: ["#hello", "#world"],
});
```

**Parameters:**
- `content` (string): Post content
- `images?` (string[]): Array of image URLs
- `hashtags?` (string[]): Array of hashtags

**Returns:** Post ID

### Get Posts Feed

**Function:** `posts.getPosts`

Retrieves posts for the user's feed.

```typescript
const posts = useQuery(api.posts.getPosts, {
  limit: 20,
  offset: 0,
});
```

**Parameters:**
- `limit?` (number): Number of posts to return
- `offset?` (number): Pagination offset

**Returns:** Array of posts with author information

### Like Post

**Function:** `posts.likePost`

Likes or unlikes a post.

```typescript
const likePost = useMutation(api.posts.likePost);

await likePost({ postId });
```

**Parameters:**
- `postId` (Id<"posts">): Post ID to like/unlike

### Get Post Details

**Function:** `posts.getPost`

Retrieves detailed information about a specific post.

```typescript
const post = useQuery(api.posts.getPost, { postId });
```

**Parameters:**
- `postId` (Id<"posts">): Post ID

**Returns:** Post with comments and author information

## Comments

### Add Comment

**Function:** `comments.addComment`

Adds a comment to a post.

```typescript
const addComment = useMutation(api.comments.addComment);

await addComment({
  postId,
  content: "Great post!",
  parentId: null, // null for top-level comment
});
```

**Parameters:**
- `postId` (Id<"posts">): Post ID
- `content` (string): Comment content
- `parentId?` (Id<"comments">): Parent comment ID for nested comments

**Returns:** Comment ID

### Get Post Comments

**Function:** `comments.getComments`

Retrieves comments for a post.

```typescript
const comments = useQuery(api.comments.getComments, { postId });
```

**Parameters:**
- `postId` (Id<"posts">): Post ID

**Returns:** Hierarchical array of comments

### Like Comment

**Function:** `comments.likeComment`

Likes or unlikes a comment.

```typescript
const likeComment = useMutation(api.comments.likeComment);

await likeComment({ commentId });
```

**Parameters:**
- `commentId` (Id<"comments">): Comment ID

## Real-time Subscriptions

### Message Subscriptions

Subscribe to new messages in a channel:

```typescript
import { useQuery } from "convex/react";

function ChatWindow({ channelId }) {
  const messages = useQuery(api.messages.getMessages, { channelId });

  // Messages will update automatically when new messages are sent
  return (
    <div>
      {messages?.map(message => (
        <div key={message._id}>{message.content}</div>
      ))}
    </div>
  );
}
```

### Post Feed Subscriptions

Subscribe to new posts in the feed:

```typescript
function PostFeed() {
  const posts = useQuery(api.posts.getPosts, { limit: 20 });

  // Feed updates automatically when new posts are created
  return (
    <div>
      {posts?.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}
```

### Online Status

Subscribe to user online status:

```typescript
function OnlineUsers() {
  const onlineUsers = useQuery(api.users.getOnlineUsers);

  return (
    <div>
      {onlineUsers?.map(user => (
        <div key={user._id}>
          {user.username} {user.isOnline ? "🟢" : "⚪"}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

All API functions may throw errors. Handle them appropriately:

```typescript
try {
  await sendMessage({ content: "Hello", channelId });
} catch (error) {
  console.error("Failed to send message:", error);
  // Show user-friendly error message
}
```

### Common Error Types

- **AuthenticationError**: User is not authenticated
- **PermissionError**: User doesn't have permission for the action
- **ValidationError**: Input data is invalid
- **NotFoundError**: Requested resource doesn't exist
- **RateLimitError**: Too many requests

## Rate Limiting

The API includes rate limiting to prevent abuse:

- **Messages**: 10 messages per minute per user
- **Posts**: 5 posts per hour per user
- **Comments**: 20 comments per hour per user
- **Likes**: 100 likes per hour per user

## Data Types

### User
```typescript
type User = {
  _id: Id<"users">;
  clerkId: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: number;
  updatedAt: number;
};
```

### Message
```typescript
type Message = {
  _id: Id<"messages">;
  content: string;
  authorId: Id<"users">;
  channelId: Id<"channels">;
  type: "text" | "image" | "file";
  metadata?: any;
  createdAt: number;
  editedAt?: number;
};
```

### Channel
```typescript
type Channel = {
  _id: Id<"channels">;
  name: string;
  description?: string;
  type: "public" | "private" | "dm";
  members: Id<"users">[];
  createdBy: Id<"users">;
  createdAt: number;
};
```

### Post
```typescript
type Post = {
  _id: Id<"posts">;
  content: string;
  authorId: Id<"users">;
  images?: string[];
  likes: Id<"users">[];
  comments: Id<"comments">[];
  hashtags: string[];
  createdAt: number;
  updatedAt: number;
};
```

### Comment
```typescript
type Comment = {
  _id: Id<"comments">;
  content: string;
  authorId: Id<"users">;
  postId: Id<"posts">;
  parentId?: Id<"comments">;
  likes: Id<"users">[];
  createdAt: number;
};
```