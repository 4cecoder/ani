import { GradientConfig, GradientStop } from './gradient-types';

/**
 * Utility functions for working with gradients
 */

/**
 * Generate CSS string from gradient configuration
 */
export function generateGradientCSS(gradient: GradientConfig): string {
  if (gradient.css) {
    return gradient.css;
  }

  const stops = gradient.stops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  switch (gradient.type) {
    case 'linear':
      return `linear-gradient(${gradient.direction || 'to right'}, ${stops})`;
    case 'radial':
      return `radial-gradient(circle, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${gradient.direction || '0deg'}, ${stops})`;
    default:
      return `linear-gradient(to right, ${stops})`;
  }
}

/**
 * Create a gradient configuration from stops
 */
export function createGradient(
  type: 'linear' | 'radial' | 'conic',
  stops: GradientStop[],
  direction?: string
): GradientConfig {
  return {
    id: `gradient-${Date.now()}`,
    name: 'Custom Gradient',
    type,
    stops,
    direction,
    css: generateGradientCSS({ type, stops, direction } as GradientConfig)
  };
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  // Simple color interpolation (works with hex colors)
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a gradient with animated stops
 */
export function generateAnimatedGradient(
  baseGradient: GradientConfig,
  animationDuration: string = '3s'
): string {
  const keyframeName = `gradient-${baseGradient.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  return `
    @keyframes ${keyframeName} {
      0% { background: ${generateGradientCSS({ ...baseGradient, stops: baseGradient.stops })}; }
      50% { background: ${generateGradientCSS({ ...baseGradient, stops: baseGradient.stops.map(s => ({ ...s, position: (s.position + 20) % 100 })) })}; }
      100% { background: ${generateGradientCSS({ ...baseGradient, stops: baseGradient.stops })}; }
    }
    
    animation: ${keyframeName} ${animationDuration} ease infinite;
  `;
}

/**
 * Convert gradient to Tailwind CSS custom property
 */
export function gradientToCSSVariable(gradient: GradientConfig, prefix: string = 'gradient'): string {
  const css = generateGradientCSS(gradient);
  return `--${prefix}-${gradient.id}: ${css};`;
}

/**
 * Validate gradient configuration
 */
export function validateGradient(gradient: Partial<GradientConfig>): boolean {
  if (!gradient.type || !['linear', 'radial', 'conic'].includes(gradient.type)) {
    return false;
  }
  
  if (!gradient.stops || gradient.stops.length < 2) {
    return false;
  }
  
  for (const stop of gradient.stops) {
    if (!stop.color || typeof stop.position !== 'number' || stop.position < 0 || stop.position > 100) {
      return false;
    }
  }
  
  return true;
}

/**
 * Optimize gradient for performance
 */
export function optimizeGradient(gradient: GradientConfig): GradientConfig {
  // Remove duplicate stops
  const uniqueStops = gradient.stops.filter((stop, index, self) =>
    index === self.findIndex(s => s.color === stop.color && s.position === stop.position)
  );
  
  // Sort stops by position
  const sortedStops = uniqueStops.sort((a, b) => a.position - b.position);
  
  // Ensure first and last stops are at 0% and 100%
  if (sortedStops[0].position !== 0) {
    sortedStops.unshift({ ...sortedStops[0], position: 0 });
  }
  
  if (sortedStops[sortedStops.length - 1].position !== 100) {
    sortedStops.push({ ...sortedStops[sortedStops.length - 1], position: 100 });
  }
  
  return {
    ...gradient,
    stops: sortedStops,
    css: generateGradientCSS({ ...gradient, stops: sortedStops })
  };
}

/**
 * Generate gradient variants for different states
 */
export function generateGradientVariants(
  baseGradient: GradientConfig,
  variants: { hover?: number; active?: number; disabled?: number } = {}
): {
  normal: GradientConfig;
  hover?: GradientConfig;
  active?: GradientConfig;
  disabled?: GradientConfig;
} {
  const result: {
    normal: GradientConfig;
    hover?: GradientConfig;
    active?: GradientConfig;
    disabled?: GradientConfig;
  } = {
    normal: baseGradient
  };
  
  if (variants.hover) {
    result.hover = {
      ...baseGradient,
      id: `${baseGradient.id}-hover`,
      name: `${baseGradient.name} (Hover)`,
      stops: baseGradient.stops.map(stop => ({
        ...stop,
        color: adjustColorBrightness(stop.color, variants.hover!)
      }))
    };
  }
  
  if (variants.active) {
    result.active = {
      ...baseGradient,
      id: `${baseGradient.id}-active`,
      name: `${baseGradient.name} (Active)`,
      stops: baseGradient.stops.map(stop => ({
        ...stop,
        color: adjustColorBrightness(stop.color, variants.active!)
      }))
    };
  }
  
  if (variants.disabled) {
    result.disabled = {
      ...baseGradient,
      id: `${baseGradient.id}-disabled`,
      name: `${baseGradient.name} (Disabled)`,
      stops: baseGradient.stops.map(stop => ({
        ...stop,
        color: adjustColorOpacity(stop.color, variants.disabled!)
      }))
    };
  }
  
  return result;
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Adjust color opacity
 */
function adjustColorOpacity(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
}