# What to Do When a Task is Completed

## Code Quality Checks
Before marking a task as complete, ensure:

### 1. Linting and Type Checking
```bash
# Run ESLint to check code quality
bun run lint

# Run TypeScript type checking
npx tsc --noEmit
```

### 2. Build Verification
```bash
# Ensure the project builds successfully
bun run build
```

### 3. Test Execution (when applicable)
```bash
# Run unit tests if implemented
npm run test

# Run integration tests if implemented
npm run test:integration
```

## Convex Database
If the task involves database changes:

### 1. Schema Validation
```bash
# Deploy schema changes to Convex
npx convex deploy
```

### 2. Function Testing
```bash
# Test Convex functions locally
npx convex run <function-name>
```

### 3. Data Migration
- Ensure any data migrations are properly tested
- Verify backward compatibility
- Update API documentation if needed

## Authentication & Security
If the task involves authentication:

### 1. Clerk Integration Testing
- Test sign-in/sign-up flows
- Verify protected routes work correctly
- Check user profile updates
- Test session management

### 2. Permission Validation
- Ensure proper authorization checks
- Test role-based access control
- Verify data privacy settings

## UI/UX Validation
For UI-related tasks:

### 1. Cross-Browser Testing
- Test in Chrome, Firefox, Safari
- Verify mobile responsiveness
- Check accessibility with screen readers

### 2. Performance Check
- Monitor bundle size changes
- Test loading performance
- Verify smooth animations and transitions

### 3. User Experience
- Test keyboard navigation
- Verify focus management
- Check error states and loading indicators

## Real-time Features
For chat and live features:

### 1. Subscription Testing
- Test real-time updates work correctly
- Verify connection handling
- Check offline/online state management

### 2. Performance Monitoring
- Monitor memory usage
- Test with multiple concurrent users
- Verify message delivery reliability

## Documentation Updates
Always update relevant documentation:

### 1. Code Comments
- Add JSDoc comments for new functions
- Update inline comments for complex logic
- Document prop interfaces and types

### 2. API Documentation
- Update API.md for new endpoints
- Document Convex function parameters
- Add examples for new features

### 3. README Updates
- Update feature lists
- Add setup instructions for new dependencies
- Document configuration changes

## Deployment Preparation
Before deployment:

### 1. Environment Variables
- Verify all required env vars are documented
- Test with production-like environment
- Check API key configurations

### 2. Database Backup
- Ensure database schema is backed up
- Test data migration scripts
- Verify rollback procedures

### 3. Feature Flags
- Implement feature flags for gradual rollout
- Test feature flag logic
- Prepare rollback plan

## Testing Checklist
Complete these tests before marking complete:

### Functional Testing
- [ ] All user stories implemented
- [ ] Edge cases handled
- [ ] Error scenarios tested
- [ ] Loading states implemented
- [ ] Offline functionality works

### Integration Testing
- [ ] API calls work correctly
- [ ] Database operations successful
- [ ] Authentication flows complete
- [ ] Real-time updates functioning

### Performance Testing
- [ ] Page load times acceptable
- [ ] Bundle size not increased significantly
- [ ] Memory leaks absent
- [ ] Smooth scrolling and animations

### Security Testing
- [ ] Input validation implemented
- [ ] XSS prevention in place
- [ ] CSRF protection active
- [ ] Authentication required for protected routes

### Accessibility Testing
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

## Commit and Push
When ready to commit:

### 1. Git Best Practices
```bash
# Stage relevant files only
git add <specific-files>

# Write descriptive commit message
git commit -m "feat: add user profile editing
- Add profile picture upload
- Implement bio editing
- Add form validation
- Update user settings page"

# Push to appropriate branch
git push origin feature/user-profile
```

### 2. Pull Request Preparation
- Create descriptive PR title
- Add detailed description
- Link related issues
- Request appropriate reviewers
- Add testing instructions

## Communication
Notify relevant team members:

### 1. Team Updates
- Post completion status in team chat
- Share screenshots/videos for UI changes
- Highlight any breaking changes
- Mention testing requirements

### 2. Documentation
- Update project documentation
- Add to changelog if applicable
- Share knowledge with team members

## Monitoring and Follow-up
After deployment:

### 1. Error Monitoring
- Check application logs
- Monitor error rates
- Watch performance metrics
- Set up alerts for critical issues

### 2. User Feedback
- Monitor user feedback channels
- Check support tickets
- Review analytics for usage patterns
- Plan follow-up improvements

### 3. Retrospective
- Document lessons learned
- Identify improvement opportunities
- Update development processes
- Share insights with team

## Rollback Plan
Always have a rollback strategy:

### 1. Quick Rollback
- Know how to revert the changes
- Have backup of previous version
- Test rollback procedure
- Document rollback steps

### 2. Gradual Rollback
- Use feature flags for controlled rollback
- Monitor impact of changes
- Prepare communication plan
- Have support team ready

This checklist ensures high-quality, well-tested code that integrates smoothly with the existing Ani Hangout Site architecture.