# Ani Hangout Site - Project Overview

## Purpose
Ani is a social hangout platform featuring an OS-like interface with draggable, minimizable modules for chat, posts, and other social interactions. It aims to provide a desktop-like experience for social networking, allowing users to multitask across different social activities simultaneously.

## Tech Stack
- **Frontend**: Next.js 15.5.3 with React 19.1.0
- **Styling**: Tailwind CSS v4 with custom design system
- **Authentication**: Clerk.js for secure user authentication
- **Backend**: ConvexDB for real-time database and serverless functions
- **Language**: TypeScript throughout
- **Package Manager**: Bun (recommended), npm/yarn supported
- **UI Components**: Custom components with shadcn/ui patterns

## Key Features
### 🖥️ OS-Like Interface
- Draggable and minimizable windows/modules
- Multi-window management
- Responsive desktop-like experience
- Z-index management for proper layering

### 💬 Real-Time Chat
- Instant messaging with ConvexDB subscriptions
- Group chats and private messages
- Message history persistence
- Typing indicators and online status
- File and image sharing

### 📝 Social Posts
- Post creation with text, images, and hashtags
- Like and comment system
- Timeline feed with infinite scroll
- Hashtag-based discovery
- @mentions for notifications

### 🔐 Authentication & Security
- Clerk.js integration with social login
- Secure session management
- User profiles with avatars and bios
- Privacy controls and permissions

## Architecture
- **Database Schema**: Users, Messages, Channels, Posts, Comments
- **Real-time**: Convex subscriptions for live updates
- **State Management**: Convex for server state, React for local state
- **File Structure**: App router with organized component directories
- **API**: Convex functions for all backend operations

## Development Environment
- Node.js 18+
- Bun package manager
- ESLint for code quality
- TypeScript for type safety
- Tailwind CSS for styling

## Target Users
- Gamers and gaming communities
- Remote teams and collaborators
- Social groups wanting desktop-like chat experience
- Users who multitask across social activities

## Business Goals
- Provide unique desktop-like social experience
- Enable real-time collaboration and communication
- Foster community engagement through modular interface
- Scale with growing user base using ConvexDB

## Current Status
- Project structure established
- Documentation complete
- Ready for development with Clerk.js and ConvexDB integration
- Fresh Next.js setup with modern tooling