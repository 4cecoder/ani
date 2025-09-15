/**
 * Gradient type definitions for the context menu system
 */

export interface GradientStop {
  color: string;
  position: number; // 0-100 percentage
}

export interface GradientConfig {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  direction?: string; // For linear gradients (e.g., 'to right', '45deg')
  stops: GradientStop[];
  css?: string; // Pre-computed CSS for performance
}

export interface GradientTheme {
  id: string;
  name: string;
  primary: GradientConfig;
  secondary: GradientConfig;
  accent: GradientConfig;
  background: GradientConfig;
}

export type GradientPreset = 'purple-blue' | 'sunset' | 'ocean' | 'forest' | 'cosmic' | 'aurora';

export interface GradientContext {
  currentTheme: GradientTheme;
  setTheme: (theme: GradientTheme) => void;
  getPreset: (preset: GradientPreset) => GradientTheme;
  generateCSS: (gradient: GradientConfig) => string;
}