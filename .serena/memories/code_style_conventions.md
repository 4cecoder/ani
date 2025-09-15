# Code Style and Conventions for Ani

## TypeScript & JavaScript
- **Strict TypeScript**: All code must be written in TypeScript
- **Type Annotations**: Use explicit types for function parameters and return values
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions/aliases
- **Optional Properties**: Use `?:` for optional properties
- **Null vs Undefined**: Prefer `undefined` for optional values

## Naming Conventions
- **Components**: PascalCase (e.g., `ChatWindow`, `PostFeed`)
- **Functions/Variables**: camelCase (e.g., `sendMessage`, `userProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MESSAGE_LENGTH`)
- **Files**: kebab-case for components (e.g., `chat-window.tsx`), camelCase for utilities
- **Directories**: kebab-case (e.g., `user-profile`, `chat-system`)

## Component Structure
- **Functional Components**: Use function declarations with arrow functions
- **Props Interface**: Define props interface above component
- **Default Props**: Use default parameters instead of `defaultProps`
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`)

## React Patterns
- **Hooks**: Use built-in hooks, custom hooks for reusable logic
- **Context**: Use sparingly, prefer prop drilling for simple cases
- **State Management**: Convex for server state, React state for local UI state
- **Optimistic Updates**: Implement for better UX with Convex mutations

## ConvexDB Patterns
- **Functions**: Keep focused and single-purpose
- **Error Handling**: Proper try/catch with meaningful error messages
- **Authentication**: Always check `ctx.auth.getUserIdentity()`
- **Indexes**: Add appropriate indexes for query performance
- **JSDoc**: Add documentation comments for all functions

## Styling
- **Tailwind Classes**: Use utility-first approach
- **Component Variants**: Use `class-variance-authority` for variants
- **Responsive Design**: Mobile-first approach with `sm:`, `md:`, `lg:` prefixes
- **Dark Mode**: Support dark mode with `dark:` prefix

## File Organization
- **Components**: Group by feature (e.g., `components/chat/`, `components/posts/`)
- **Utilities**: Place in `lib/` directory
- **Types**: Define in separate `.types.ts` files or with components
- **Constants**: Group related constants in separate files

## Code Quality
- **ESLint**: Follow all configured rules
- **Imports**: Group imports (React, third-party, local), sort alphabetically
- **Console Logs**: Remove all console.log statements before commit
- **Unused Code**: Remove unused imports, variables, and functions
- **Accessibility**: Use semantic HTML and ARIA attributes where needed

## Git Practices
- **Commit Messages**: Use imperative mood, descriptive but concise
- **Branch Naming**: `feature/`, `bugfix/`, `hotfix/` prefixes
- **Pull Requests**: Provide clear description and link to issues

## Testing Guidelines
- **Unit Tests**: For utility functions and hooks
- **Integration Tests**: For Convex functions
- **E2E Tests**: For critical user flows
- **Test Naming**: `describe("ComponentName", () => { it("should do something", ...) })`