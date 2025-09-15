# Contributing to Ani Hangout Site

Thank you for your interest in contributing to Ani! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Bun**: Latest version (recommended package manager)
- **Git**: Version 2.30 or higher
- **VS Code**: With TypeScript and React extensions

### Local Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/ani.git
   cd ani
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Set up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Initialize Convex**
   ```bash
   npx convex dev --once
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Next.js
   bun run dev

   # Terminal 2: Convex
   npx convex dev
   ```

6. **Open Browser**
   - Frontend: http://localhost:3000
   - Convex Dashboard: Check terminal output

## Development Workflow

### 1. Choose an Issue

- Check the [Issues](https://github.com/your-org/ani/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Follow the [Development Guidelines](./DEVELOPMENT.md)
- Write clear, concise commit messages
- Test your changes thoroughly

### 4. Test Your Changes

```bash
# Run all tests
bun run test

# Run linting
bun run lint

# Run type checking
bun run type-check

# Run E2E tests (if applicable)
bun run test:e2e
```

### 5. Update Documentation

- Update relevant documentation if your changes affect the API or user-facing features
- Add JSDoc comments to new functions
- Update the changelog if it's a user-facing change

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper type definitions
- Use interfaces for object shapes
- Use union types for constrained values

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

// ❌ Bad
function processUser(user: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Use TypeScript for props
- Follow the component naming conventions
- Use custom hooks for reusable logic

```typescript
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Commit Messages

Follow conventional commit format:

```bash
# Features
feat: add dark mode toggle
feat: implement file upload for posts

# Bug fixes
fix: resolve chat message duplication
fix: fix window resize on mobile devices

# Documentation
docs: update API documentation
docs: add setup instructions for Windows

# Refactoring
refactor: optimize message rendering performance
refactor: simplify authentication flow

# Testing
test: add unit tests for chat components
test: add E2E test for user registration
```

## Testing

### Unit Tests

- Write unit tests for utility functions
- Test React components with React Testing Library
- Mock external dependencies
- Aim for 80%+ code coverage

```typescript
// __tests__/utils.test.ts
import { formatMessageTime } from '../utils';

describe('formatMessageTime', () => {
  it('formats recent messages correctly', () => {
    const recentTime = Date.now() - 1000 * 60 * 5; // 5 minutes ago
    expect(formatMessageTime(recentTime)).toBe('5m ago');
  });

  it('formats old messages with date', () => {
    const oldTime = Date.now() - 1000 * 60 * 60 * 24 * 7; // 1 week ago
    const result = formatMessageTime(oldTime);
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
```

### Integration Tests

- Test Convex functions
- Test API integrations
- Use test databases for integration tests

```typescript
// convex/__tests__/messages.test.ts
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';

describe('messages', () => {
  it('should create a message', async () => {
    const mockAuth = {
      getUserIdentity: () => ({ subject: 'user123' })
    };

    const result = await api.messages.sendMessage.handler(
      { auth: mockAuth, db: mockDb },
      { content: 'Test message', channelId: 'channel123' }
    );

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
```

### E2E Tests

- Test complete user workflows
- Use Playwright for browser automation
- Test critical user journeys

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up and sign in', async ({ page }) => {
  // Test sign up flow
  await page.goto('/sign-up');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');

  // Verify redirect to home
  await expect(page).toHaveURL('/');

  // Test sign out
  await page.click('[data-testid="sign-out-button"]');
  await expect(page).toHaveURL('/sign-in');
});
```

## Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run final checks**
   ```bash
   bun run test
   bun run lint
   bun run type-check
   bun run build
   ```

3. **Create a Pull Request**
   - Use a descriptive title
   - Fill out the PR template
   - Reference related issues
   - Add screenshots for UI changes

4. **PR Template**
   ```markdown
   ## Description
   Brief description of the changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] E2E tests added/updated
   - [ ] Manual testing completed

   ## Screenshots (if applicable)
   Add screenshots of UI changes

   ## Checklist
   - [ ] Code follows project standards
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No linting errors
   - [ ] Commit messages follow conventions
   ```

5. **Address Review Feedback**
   - Respond to all reviewer comments
   - Make requested changes
   - Re-request review when ready

6. **Merge**
   - PR will be merged by maintainers once approved
   - Delete your branch after merge

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (OS, browser, Node version)
- **Screenshots or videos** if applicable
- **Console errors** or logs

### Feature Requests

For feature requests, include:

- **Clear description** of the proposed feature
- **Use case** and why it's needed
- **Mockups or examples** if applicable
- **Potential implementation** ideas

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Suitable for first-time contributors
- `help wanted`: Community contribution welcome
- `question`: Further information needed

## Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Give constructive feedback**
- **Accept responsibility** for mistakes
- **Show empathy** towards other community members

### Communication

- Use clear and concise language
- Be patient with new contributors
- Provide helpful context in discussions
- Respect different opinions and approaches

### Getting Help

- **Documentation**: Check the [docs](./README.md) first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord for real-time help

## Recognition

Contributors are recognized through:

- **GitHub Contributors**: Listed in repository contributors
- **Changelog**: Mentioned in release notes
- **Discord Roles**: Special roles for active contributors
- **Hall of Fame**: Featured contributors page

## License

By contributing to Ani, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Ani! Your help makes this project better for everyone. 🚀