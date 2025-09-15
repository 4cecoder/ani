# Development Guidelines

This document outlines the development standards, best practices, and workflows for the Ani Hangout Site project.

## Table of Contents

- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Component Development](#component-development)
- [State Management](#state-management)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Performance](#performance)
- [Security](#security)

## Code Style

### TypeScript Standards

#### Type Definitions
```typescript
// ✅ Good: Explicit types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ✅ Good: Union types for constrained values
type MessageType = 'text' | 'image' | 'file';

// ❌ Bad: Using 'any'
function processData(data: any) { ... }

// ✅ Good: Generic constraints
function processList<T extends { id: string }>(items: T[]) { ... }
```

#### Naming Conventions
```typescript
// Components: PascalCase
function ChatWindow() { ... }
function UserProfile() { ... }

// Functions: camelCase
function sendMessage() { ... }
function getUserById() { ... }

// Variables: camelCase
const userName = 'john';
const isLoading = false;

// Constants: UPPER_SNAKE_CASE
const MAX_MESSAGE_LENGTH = 1000;
const API_BASE_URL = '/api';

// Types: PascalCase
type UserRole = 'admin' | 'user' | 'moderator';
interface ChatMessage { ... }
```

### React Best Practices

#### Component Structure
```typescript
// ✅ Good: Functional component with proper typing
interface ChatWindowProps {
  channelId: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

function ChatWindow({
  channelId,
  isMinimized = false,
  onMinimize
}: ChatWindowProps) {
  // Component logic here
  return (
    <div className="chat-window">
      {/* JSX here */}
    </div>
  );
}

// ✅ Good: Custom hooks for reusable logic
function useChatMessages(channelId: string) {
  const messages = useQuery(api.messages.getMessages, { channelId });
  const sendMessage = useMutation(api.messages.sendMessage);

  return { messages, sendMessage };
}
```

#### Props and State
```typescript
// ✅ Good: Destructure props
function MessageList({ messages, loading }: MessageListProps) {
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
}

// ✅ Good: Use useState for local state
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### CSS and Styling

#### Tailwind CSS
```typescript
// ✅ Good: Utility-first approach
function Button({ variant = 'primary', children }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}

// ✅ Good: Responsive design
function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
```

## Project Structure

### Directory Organization

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── utils/            # Helper functions
│   ├── constants/        # App constants
│   ├── types/            # TypeScript type definitions
│   └── validations/      # Validation schemas
├── hooks/                # Custom React hooks
├── stores/               # State management (Zustand)
├── styles/               # Global styles and themes
└── tests/                # Test files
```

### File Naming

```typescript
// Components
components/
├── Button.tsx
├── Button.stories.tsx    # Storybook stories
├── Button.test.tsx       # Unit tests
└── index.ts             # Barrel exports

// Utilities
lib/
├── date-utils.ts
├── string-utils.ts
└── api-client.ts

// Types
lib/types/
├── user.ts
├── message.ts
└── api.ts
```

## Component Development

### Component Patterns

#### Container/Presentational Pattern
```typescript
// Presentational Component
interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

function MessageList({ messages, loading }: MessageListProps) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="message-list">
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

// Container Component
function ChatWindow({ channelId }: { channelId: string }) {
  const { messages, loading } = useChatMessages(channelId);

  return <MessageList messages={messages} loading={loading} />;
}
```

#### Compound Components
```typescript
// Modal compound component
const Modal = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

Modal.Trigger = function Trigger({ children }: { children: React.ReactNode }) {
  const { setIsOpen } = useModal();

  return (
    <button onClick={() => setIsOpen(true)}>
      {children}
    </button>
  );
};

Modal.Content = function Content({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useModal();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={() => setIsOpen(false)}>×</button>
        {children}
      </div>
    </div>
  );
};

// Usage
<Modal>
  <Modal.Trigger>Open Modal</Modal.Trigger>
  <Modal.Content>
    <h2>Modal Title</h2>
    <p>Modal content...</p>
  </Modal.Content>
</Modal>
```

### Window Management Components

#### Draggable Window Component
```typescript
interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
}

function Window({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 400, height: 300 },
  minWidth = 200,
  minHeight = 150,
  isMinimized = false,
  isMaximized = false,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Implement drag logic
  };

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    // Implement resize logic
  };

  if (isMinimized) {
    return (
      <div className="minimized-window">
        <button onClick={() => {/* restore window */}}>
          {title}
        </button>
      </div>
    );
  }

  return (
    <div
      className="window"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: /* window z-index */,
      }}
    >
      <div
        className="window-header"
        onMouseDown={handleMouseDown}
      >
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button onClick={() => {/* minimize */}}>−</button>
          <button onClick={() => {/* maximize */}}>□</button>
          <button onClick={() => {/* close */}}>×</button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
      <div
        className="window-resize-handle"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}
```

## State Management

### Convex State Management

#### Queries and Mutations
```typescript
// ✅ Good: Use descriptive names
const messages = useQuery(api.messages.getChannelMessages, {
  channelId,
  limit: 50,
});

const sendMessage = useMutation(api.messages.sendMessage);

// ✅ Good: Handle loading and error states
function ChatInput({ channelId }: { channelId: string }) {
  const sendMessage = useMutation(api.messages.sendMessage);
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await sendMessage({ channelId, content });
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error toast
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

#### Optimistic Updates
```typescript
function MessageList({ channelId }: { channelId: string }) {
  const messages = useQuery(api.messages.getMessages, { channelId });
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSendMessage = async (content: string) => {
    // Optimistic update
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content,
      authorId: currentUserId,
      channelId,
      createdAt: Date.now(),
      isOptimistic: true,
    };

    // Add optimistic message to local state
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await sendMessage({ channelId, content });
      // Convex will update the real data
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
    }
  };
}
```

### Local State Management

#### useState for Simple State
```typescript
function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const searchResults = await searchAPI(searchQuery);
      setResults(searchResults);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
      />
      {isLoading && <div>Searching...</div>}
      {results.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}
```

#### useReducer for Complex State
```typescript
type WindowState = {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
};

type WindowAction =
  | { type: 'MOVE'; position: { x: number; y: number } }
  | { type: 'RESIZE'; size: { width: number; height: number } }
  | { type: 'MINIMIZE' }
  | { type: 'MAXIMIZE' }
  | { type: 'RESTORE' }
  | { type: 'FOCUS'; zIndex: number };

function windowReducer(state: WindowState, action: WindowAction): WindowState {
  switch (action.type) {
    case 'MOVE':
      return { ...state, position: action.position };
    case 'RESIZE':
      return { ...state, size: action.size };
    case 'MINIMIZE':
      return { ...state, isMinimized: true };
    case 'MAXIMIZE':
      return { ...state, isMaximized: true, isMinimized: false };
    case 'RESTORE':
      return { ...state, isMaximized: false, isMinimized: false };
    case 'FOCUS':
      return { ...state, zIndex: action.zIndex };
    default:
      return state;
  }
}

function Window({ id }: { id: string }) {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  return (
    <div
      className="window"
      style={{
        left: state.position.x,
        top: state.position.y,
        width: state.size.width,
        height: state.size.height,
        zIndex: state.zIndex,
      }}
    >
      {/* Window content */}
    </div>
  );
}
```

## Testing

### Unit Testing

#### Component Testing
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Button</Button>);
    const button = screen.getByText('Button');

    expect(button).toHaveClass('bg-blue-500');
  });
});
```

#### Convex Function Testing
```typescript
// convex/__tests__/messages.test.ts
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';

describe('messages', () => {
  it('should send a message', async () => {
    // Mock authentication
    const mockAuth = { getUserIdentity: () => ({ subject: 'user1' }) };

    // Test the mutation
    const result = await api.messages.sendMessage.handler(
      { auth: mockAuth, db: mockDb },
      { content: 'Hello', channelId: 'channel1' }
    );

    expect(result).toBeDefined();
  });
});
```

### Integration Testing

#### E2E Testing with Playwright
```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('user can send a message', async ({ page }) => {
  // Sign in
  await page.goto('/sign-in');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('[type="submit"]');

  // Navigate to chat
  await page.goto('/chat/channel1');

  // Send a message
  await page.fill('[data-testid="message-input"]', 'Hello, world!');
  await page.click('[data-testid="send-button"]');

  // Verify message appears
  await expect(page.locator('[data-testid="message-content"]')).toContainText('Hello, world!');
});
```

## Git Workflow

### Branch Naming
```bash
# Feature branches
feature/add-chat-encryption
feature/implement-file-sharing
feature/user-profile-enhancement

# Bug fixes
fix/chat-message-not-sending
fix/window-drag-performance
fix/authentication-redirect

# Hotfixes
hotfix/critical-security-patch
hotfix/database-connection-issue
```

### Commit Messages
```bash
# Good commit messages
feat: add real-time message notifications
fix: resolve chat window resize bug
docs: update API documentation
refactor: optimize message rendering performance

# Bad commit messages
fixed bug
updated code
changes
```

### Pull Request Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Write code following guidelines
   - Add tests for new functionality
   - Update documentation

3. **Run Tests**
   ```bash
   bun run test
   bun run lint
   bun run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub
   ```

6. **Code Review**
   - Address reviewer feedback
   - Ensure CI passes
   - Get approval

7. **Merge**
   - Squash merge for feature branches
   - Rebase for hotfixes

## Performance

### React Performance

#### Memoization
```typescript
// ✅ Good: Memoize expensive components
const MessageItem = memo(function MessageItem({
  message,
  onLike
}: MessageItemProps) {
  return (
    <div className="message">
      <Avatar user={message.author} />
      <div className="content">{message.content}</div>
      <LikeButton onClick={() => onLike(message.id)} />
    </div>
  );
});

// ✅ Good: Memoize callbacks
const handleLike = useCallback((messageId: string) => {
  likeMessage({ messageId });
}, []);

// ✅ Good: Memoize computed values
const filteredMessages = useMemo(() => {
  return messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [messages, searchTerm]);
```

#### Code Splitting
```typescript
// ✅ Good: Lazy load heavy components
const ChatWindow = lazy(() => import('../components/ChatWindow'));
const PostEditor = lazy(() => import('../components/PostEditor'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/chat" element={<ChatWindow />} />
        <Route path="/posts/new" element={<PostEditor />} />
      </Routes>
    </Suspense>
  );
}
```

### Database Performance

#### Query Optimization
```typescript
// ✅ Good: Use appropriate indexes
export const getRecentPosts = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_created_at") // Uses index
      .order("desc")
      .take(args.limit);
  },
});

// ✅ Good: Paginate large result sets
export const getPostsPaginated = query({
  args: {
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .paginate({
        numItems: args.limit,
        cursor: args.cursor,
      });
  },
});
```

## Security

### Input Validation
```typescript
// ✅ Good: Validate user input
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long'),
  channelId: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid channel ID'),
});

export const sendMessage = mutation({
  args: messageSchema,
  handler: async (ctx, args) => {
    // Input is now validated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      ...args,
      authorId: await getUserId(ctx, identity.subject),
      createdAt: Date.now(),
    });
  },
});
```

### Authentication Checks
```typescript
// ✅ Good: Verify permissions
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const userId = await getUserId(ctx, identity.subject);

    // Check if user owns the message or is admin
    if (message.authorId !== userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== 'admin') {
        throw new Error("Not authorized");
      }
    }

    await ctx.db.delete(args.messageId);
  },
});
```

### XSS Prevention
```typescript
// ✅ Good: Sanitize user content
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}

// In component
function MessageContent({ content }: { content: string }) {
  const sanitizedContent = useMemo(() =>
    sanitizeHtml(content),
    [content]
  );

  return (
    <div
      className="message-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
```

### Rate Limiting
```typescript
// ✅ Good: Implement rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, action: string): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  const userLimit = rateLimit.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export const sendMessage = mutation({
  args: { content: v.string(), channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (!checkRateLimit(identity.subject, 'sendMessage')) {
      throw new Error("Rate limit exceeded");
    }

    // Continue with message sending...
  },
});
```

This comprehensive development guide ensures consistent, maintainable, and secure code across the Ani Hangout Site project. Follow these guidelines to contribute effectively and maintain high code quality.