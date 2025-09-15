# Task Completion Checklist for Ani

## Before Committing Code
- [ ] Run `bun run lint` or `npm run lint` to check for ESLint errors
- [ ] Ensure all TypeScript errors are resolved
- [ ] Remove any `console.log` statements
- [ ] Check that all imports are used and properly sorted
- [ ] Verify responsive design works on different screen sizes
- [ ] Test authentication flows if modified
- [ ] Ensure real-time subscriptions work correctly

## Before Pushing to Remote
- [ ] Run build command to ensure production build succeeds
- [ ] Test critical user flows manually
- [ ] Verify Convex functions deploy without errors
- [ ] Check that environment variables are properly configured
- [ ] Review code for security best practices
- [ ] Ensure no sensitive data is committed

## After Major Changes
- [ ] Update documentation if APIs or components changed
- [ ] Test integration with Clerk authentication
- [ ] Verify Convex real-time updates work
- [ ] Check performance impact of changes
- [ ] Update README or docs if setup instructions changed

## Deployment Checklist
- [ ] Set up production environment variables
- [ ] Deploy Convex functions with `npx convex deploy`
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Test deployed application thoroughly
- [ ] Monitor error logs and performance metrics
- [ ] Verify real-time features work in production

## Code Review Checklist
- [ ] Code follows established conventions and style
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Security considerations are addressed
- [ ] Performance optimizations are considered
- [ ] Accessibility requirements are met
- [ ] Tests are written/updated if applicable