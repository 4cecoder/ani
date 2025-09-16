# Ani Posts SVG Icon System

This directory contains optimized SVG icon components designed specifically for the Ani posts module. These icons replace emoji usage throughout the application for better accessibility, consistency, and performance.

## Available Icons

### MemoIcon
- **Usage**: Represents posts, writing, or content creation
- **Size**: 24x24px (default, customizable)
- **Props**: `size?: number`, `className?: string`

### StarIcon
- **Usage**: Represents "All Posts" or featured content
- **Size**: 24x24px (default, customizable)
- **Props**: `size?: number`, `className?: string`

### FireIcon
- **Usage**: Represents trending or popular content
- **Size**: 24x24px (default, customizable)
- **Props**: `size?: number`, `className?: string`

### PeopleIcon
- **Usage**: Represents following or social connections
- **Size**: 24x24px (default, customizable)
- **Props**: `size?: number`, `className?: string`

### SearchIcon
- **Usage**: Represents search functionality
- **Size**: 24x24px (default, customizable)
- **Props**: `size?: number`, `className?: string`

## Usage

```tsx
import { MemoIcon, StarIcon, FireIcon, PeopleIcon, SearchIcon } from './icons';

// Basic usage
<MemoIcon />

// With custom size
<StarIcon size={16} />

// With custom styling
<FireIcon className="text-red-500 hover:text-red-600" />
```

## Design Principles

- **Optimized SVGs**: All icons are optimized for web use with minimal path data
- **Consistent Sizing**: Default 24x24px viewport for consistent scaling
- **Accessibility**: All icons include `aria-hidden="true"` by default
- **Styling**: Use `currentColor` for stroke/fill to inherit text color
- **Responsive**: Icons scale properly with custom size props

## Integration

Icons integrate seamlessly with the existing component styling and animations:
- Support for CSS transitions and transforms
- Compatible with Tailwind CSS classes
- Follow the same API pattern as Lucide React icons
- Optimized for the gradient themes used throughout the app

## Adding New Icons

When adding new icons:

1. Create a new `.tsx` file in this directory
2. Follow the existing component pattern with TypeScript interfaces
3. Use `currentColor` for stroke/fill colors
4. Include `aria-hidden="true"` for decorative icons
5. Export from `index.ts`
6. Update this README

## Performance Benefits

- **Small Bundle Size**: SVG components tree-shake unused icons
- **No Font Loading**: No external font dependencies
- **Scalable**: Perfect rendering at any size
- **Consistent**: Same appearance across all browsers and devices</content>
</xai:function_call/>
</xai:function_call name="bash">
<parameter name="command">cd /root/bytecats/sites/ani && npm run build