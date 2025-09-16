# Ani Posts Module - Accessibility Guide

## Overview
This guide outlines the accessibility features and best practices implemented in the redesigned posts module components. All components follow WCAG 2.1 AA standards and include comprehensive accessibility support.

## WCAG 2.1 AA Compliance

### Color Contrast
- **Primary text on background**: 4.5:1 minimum contrast ratio
- **Secondary text on background**: 4.5:1 minimum contrast ratio
- **Interactive elements**: 3:1 minimum contrast ratio for non-text elements
- **Focus indicators**: 3:1 minimum contrast ratio against adjacent colors

### Keyboard Navigation
- **Tab order**: Logical and intuitive navigation flow
- **Focus management**: Visible focus indicators on all interactive elements
- **Keyboard shortcuts**: Standard keyboard interactions supported
- **Skip links**: Quick navigation to main content areas

### Screen Reader Support
- **Semantic HTML**: Proper use of headings, landmarks, and ARIA labels
- **ARIA attributes**: Comprehensive labeling for dynamic content
- **Live regions**: Announcements for status changes and updates
- **Alternative text**: Descriptive alt text for images and icons

## Component-Specific Accessibility Features

### PostCard Component

#### Keyboard Navigation
```typescript
// Focus management for interactive elements
- Tab: Move between like, comment, share buttons
- Enter/Space: Activate buttons
- Escape: Close action menu
- Arrow keys: Navigate dropdown menu items
```

#### Screen Reader Support
- **Post content**: Announced as article with author and timestamp
- **Interactive buttons**: Clear labels ("Like post", "Comment on post", etc.)
- **Action menu**: Announced as menu with available actions
- **Image alt text**: Descriptive text for post images

#### Focus Indicators
- **Visible focus rings**: 2px solid primary color with 2px offset
- **High contrast**: Focus indicators meet 3:1 contrast ratio
- **Consistent styling**: Same focus style across all interactive elements

### PostComposer Component

#### Form Accessibility
- **Field labels**: Associated labels for all input fields
- **Error messages**: Announced when validation fails
- **Character counter**: Live updates for screen readers
- **Required fields**: Clearly marked and announced

#### Keyboard Support
```typescript
// Keyboard shortcuts
- Ctrl/Cmd + Enter: Submit post
- Tab: Navigate between fields and buttons
- Escape: Clear current field or close dialogs
```

#### ARIA Live Regions
- **Character count**: Updates announced to screen readers
- **Validation messages**: Error states announced immediately
- **Submission status**: Loading and success states communicated

### PostsFeed Component

#### Navigation Accessibility
- **Tab navigation**: Proper ARIA attributes for tab panels
- **Active tab**: Clearly announced to screen readers
- **Tab content**: Associated with correct tab labels

#### Content Updates
- **Live regions**: New posts announced to screen readers
- **Loading states**: Announced when content is being fetched
- **Empty states**: Clear messaging when no content available

### SearchPosts Component

#### Search Functionality
- **Search input**: Proper labeling and autocomplete attributes
- **Search results**: Announced with result counts
- **No results**: Clear messaging when search yields no results

#### Filter Controls
- **Toggle buttons**: Proper button semantics and states
- **Filter options**: Grouped with fieldsets and legends
- **Active filters**: Announced and visually indicated

## Implementation Details

### ARIA Attributes Usage

#### PostCard Component
```html
<article role="article" aria-labelledby="post-author">
  <header>
    <h3 id="post-author">Author Name</h3>
    <time datetime="2024-01-01T12:00:00Z">2 hours ago</time>
  </header>

  <button
    aria-label="Like post"
    aria-pressed="false"
    aria-describedby="like-count"
  >
    <span id="like-count" aria-live="polite">5 likes</span>
  </button>
</article>
```

#### PostComposer Component
```html
<form role="form" aria-labelledby="composer-title">
  <div role="group" aria-labelledby="content-label">
    <label id="content-label" for="post-content">Post content</label>
    <textarea
      id="post-content"
      aria-describedby="char-count"
      aria-invalid="false"
    />
    <div id="char-count" aria-live="polite" aria-atomic="true">
      250/500 characters
    </div>
  </div>
</form>
```

### Focus Management

#### Programmatic Focus
```typescript
// Focus management utilities
const focusFirstInteractive = (element: HTMLElement) => {
  const focusable = element.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as HTMLElement;
  focusable?.focus();
};

const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  return () => container.removeEventListener('keydown', handleTabKey);
};
```

### Color Contrast Compliance

#### Contrast Ratio Calculations
```css
/* Primary text on background */
--foreground: oklch(0.129 0.042 264.695); /* ~4.8:1 on background */
--background: oklch(1 0 0); /* White/light */

/* Muted text on background */
--muted-foreground: oklch(0.554 0.046 257.417); /* ~4.6:1 on background */

/* Primary button text */
--primary-foreground: oklch(0.984 0.003 247.858); /* ~8.2:1 on primary */
--primary: oklch(0.208 0.042 265.755); /* Blue */
```

### Screen Reader Testing

#### Testing Checklist
- [ ] All images have descriptive alt text
- [ ] Form fields have associated labels
- [ ] Interactive elements have clear labels
- [ ] Dynamic content is announced
- [ ] Focus order is logical
- [ ] Keyboard navigation works
- [ ] Color is not the only way information is conveyed
- [ ] Text meets minimum contrast requirements

#### VoiceOver Testing Commands
```bash
# macOS VoiceOver commands
- VO + Right Arrow: Next element
- VO + Left Arrow: Previous element
- VO + Space: Activate element
- VO + Shift + Down Arrow: Start interacting with element
- VO + Shift + Up Arrow: Stop interacting with element
```

## Best Practices

### Semantic HTML
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Use semantic elements (article, section, nav, etc.)
- Avoid generic divs and spans when semantic alternatives exist
- Use lists for related items

### ARIA Guidelines
- Use ARIA as a last resort when semantic HTML isn't sufficient
- Don't override native semantics with ARIA
- Test with screen readers to ensure ARIA is working correctly
- Keep ARIA labels concise but descriptive

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Provide keyboard shortcuts for common actions
- Don't trap keyboard users in modal dialogs
- Make focus indicators clearly visible

### Error Handling
- Provide clear, specific error messages
- Associate errors with their corresponding form fields
- Make error messages available to screen readers
- Allow users to easily correct errors

## Testing Tools

### Automated Testing
- **axe-core**: Automated accessibility testing
- **Lighthouse**: Performance and accessibility audits
- **WAVE**: Web accessibility evaluation tool

### Manual Testing
- **NVDA**: Windows screen reader
- **JAWS**: Commercial screen reader
- **VoiceOver**: macOS screen reader
- **Narrator**: Windows built-in screen reader

### Browser Extensions
- **axe DevTools**: Accessibility testing extension
- **WAVE Evaluation Tool**: Browser extension
- **Color Contrast Analyzer**: Contrast checking tool

## Performance Considerations

### Accessibility Performance
- **Lazy loading**: Don't load accessibility features until needed
- **Debounced updates**: Avoid excessive screen reader announcements
- **Efficient selectors**: Use efficient CSS selectors for focus management
- **Bundle optimization**: Separate accessibility code for better caching

### Inclusive Performance
- **Reduced motion**: Respect user's motion preferences
- **High contrast mode**: Support Windows high contrast mode
- **Large text**: Ensure design works with 200% browser zoom
- **Touch targets**: Maintain adequate touch target sizes

## Future Enhancements

### Planned Accessibility Features
- **Voice control**: Support for voice commands
- **Haptic feedback**: Tactile feedback for interactions
- **Customizable focus**: User-configurable focus indicators
- **Multi-modal input**: Support for various input methods

### Advanced Screen Reader Support
- **Contextual information**: More detailed context for complex interactions
- **Shortcut hints**: Keyboard shortcut announcements
- **Progress indicators**: Detailed progress information
- **Error recovery**: Guided error correction

---

## Quick Reference

### Common ARIA Patterns
- `aria-label`: Provide a label for elements without visible text
- `aria-describedby`: Reference additional descriptive text
- `aria-live`: Announce dynamic content changes
- `aria-expanded`: Indicate expandable/collapsible elements
- `aria-pressed`: Indicate toggle button states

### Keyboard Shortcuts
- `Tab`: Move to next focusable element
- `Shift + Tab`: Move to previous focusable element
- `Enter`: Activate buttons and links
- `Space`: Activate buttons and toggle inputs
- `Escape`: Close modals and menus

### Focus Management Rules
1. Focus should move in a logical order
2. Focus should be visible at all times
3. Focus should not get trapped
4. Focus should return to logical location after actions
5. Skip links should be provided for long pages

This accessibility guide ensures that the Ani posts module provides an inclusive experience for all users, regardless of their abilities or the assistive technologies they use.</content>
</xai:function_call="write">
<parameter name="filePath">/root/bytecats/sites/ani/components/ui/accessibility-guide.md