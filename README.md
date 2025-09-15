# Ani Social - Wireframe

A modern social hangout platform with an OS-like interface, inspired by Discord but with a vibrant, customizable design.

## Features

- **OS-like Interface**: Draggable, minimizable windows and panels
- **Real-time Chat**: Channel-based messaging system
- **Social Posts**: Feed-style content sharing
- **Friends List**: Online status and friend management
- **Voice Chat**: Integrated voice communication
- **Notifications**: Real-time notification system
- **Dark/Light Mode**: Built-in theme switching
- **Responsive Design**: Works across all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Clerk.js
- **Backend**: ConvexDB
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system

## Wireframe Overview

The current implementation shows a desktop-style interface with:

### Main Components
1. **Top Navigation Bar**: App branding and window controls
2. **Left Sidebar**: Friends list and channel navigation
3. **Main Chat Area**: Message display and input
4. **Right Sidebar**: Posts feed with interactions
5. **Floating Windows**: Draggable voice chat and notifications

### Design Features
- **Gradient Backgrounds**: Purple-to-blue gradient with subtle patterns
- **Glassmorphism**: Backdrop blur effects for modern look
- **Interactive Elements**: Hover states and smooth transitions
- **Color Scheme**: Vibrant accent colors with good contrast
- **Typography**: Clean, readable fonts with proper hierarchy

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3002](http://localhost:3002) to view the wireframe

## Next Steps

1. **Integrate Clerk Authentication**:
   - Set up Clerk providers in layout
   - Add sign-in/sign-up flows
   - Protect routes with authentication

2. **Connect ConvexDB**:
   - Configure Convex client
   - Set up database schema for messages, posts, users
   - Implement real-time subscriptions

3. **Add Interactivity**:
   - Implement drag-and-drop for windows
   - Add minimize/maximize functionality
   - Create modal dialogs for settings

4. **Enhance Components**:
   - Build reusable UI components
   - Add loading states and animations
   - Implement error handling

## Design System

The wireframe uses a comprehensive design system with:
- **Colors**: OKLCH-based palette with light/dark variants
- **Spacing**: Consistent 4px grid system
- **Typography**: Geist font family with proper scale
- **Components**: Modular, reusable design elements
- **Animations**: Smooth transitions and micro-interactions

## Accessibility

- WCAG 2.1 AA compliant color contrasts
- Keyboard navigation support
- Screen reader friendly markup
- Focus indicators and states
- Semantic HTML structure
