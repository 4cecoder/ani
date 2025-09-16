"use client";

import { useState, useEffect, useCallback } from 'react';
import type { GradientTheme, GradientPreset, GradientContext } from '../gradients/gradient-types';
import { getDefaultGradientPreset, getGradientPreset } from '../gradients/preset-gradients';
import { generateGradientCSS } from '../gradients/gradient-utils';

/**
 * Custom hook for managing gradient themes
 */
export function useGradientTheme(initialPreset?: GradientPreset): GradientContext {
  const [currentTheme, setCurrentTheme] = useState<GradientTheme>(
    initialPreset ? getGradientPreset(initialPreset) : getDefaultGradientPreset()
  );

  // Load saved theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('gradient-theme');
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme);
          setCurrentTheme(parsedTheme);
        }
      } catch (error) {
        console.warn('Failed to load saved gradient theme:', error);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gradient-theme', JSON.stringify(currentTheme));
      } catch (error) {
        console.warn('Failed to save gradient theme:', error);
      }
    }
  }, [currentTheme]);

  const setTheme = useCallback((theme: GradientTheme) => {
    setCurrentTheme(theme);
  }, []);

  const getPreset = useCallback((preset: GradientPreset) => {
    return getGradientPreset(preset);
  }, []);

  const generateCSS = useCallback((gradient: typeof currentTheme.primary) => {
    return generateGradientCSS(gradient);
  }, [currentTheme]);

  // Apply theme CSS variables to document root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Apply CSS custom properties for the current theme
      root.style.setProperty('--gradient-primary', generateCSS(currentTheme.primary));
      root.style.setProperty('--gradient-secondary', generateCSS(currentTheme.secondary));
      root.style.setProperty('--gradient-accent', generateCSS(currentTheme.accent));
      root.style.setProperty('--gradient-background', generateCSS(currentTheme.background));
      
      // Apply individual color stops for more granular control
      currentTheme.primary.stops.forEach((stop, index) => {
        root.style.setProperty(`--gradient-primary-stop-${index}`, stop.color);
        root.style.setProperty(`--gradient-primary-stop-${index}-position`, `${stop.position}%`);
      });
      
      currentTheme.secondary.stops.forEach((stop, index) => {
        root.style.setProperty(`--gradient-secondary-stop-${index}`, stop.color);
        root.style.setProperty(`--gradient-secondary-stop-${index}-position`, `${stop.position}%`);
      });
      
      currentTheme.accent.stops.forEach((stop, index) => {
        root.style.setProperty(`--gradient-accent-stop-${index}`, stop.color);
        root.style.setProperty(`--gradient-accent-stop-${index}-position`, `${stop.position}%`);
      });
      
      currentTheme.background.stops.forEach((stop, index) => {
        root.style.setProperty(`--gradient-background-stop-${index}`, stop.color);
        root.style.setProperty(`--gradient-background-stop-${index}-position`, `${stop.position}%`);
      });
    }
  }, [currentTheme, generateCSS]);

  return {
    currentTheme,
    setTheme,
    getPreset,
    generateCSS,
  };
}

/**
 * Hook for managing gradient animations
 */
export function useGradientAnimation(
  gradient: import('../gradients/gradient-types').GradientConfig,
  enabled: boolean = true,
  duration: string = '3s'
) {
  const [isAnimating, setIsAnimating] = useState(enabled);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const styleId = 'gradient-animation-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    if (isAnimating) {
      const animationCSS = generateGradientAnimationCSS(gradient, duration);
      styleElement.textContent = animationCSS;
    } else {
      styleElement.textContent = '';
    }

    return () => {
      if (styleElement) {
        styleElement.textContent = '';
      }
    };
  }, [gradient, isAnimating, duration]);

  const toggleAnimation = useCallback(() => {
    setIsAnimating(prev => !prev);
  }, []);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  return {
    isAnimating,
    toggleAnimation,
    startAnimation,
    stopAnimation,
  };
}

/**
 * Hook for responsive gradient themes
 */
export function useResponsiveGradientTheme(
  lightPreset: GradientPreset = 'purple-blue',
  darkPreset: GradientPreset = 'cosmic'
) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check for manual theme toggle
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  const gradientTheme = useGradientTheme(isDarkMode ? darkPreset : lightPreset);

  return {
    ...gradientTheme,
    isDarkMode,
  };
}

/**
 * Generate CSS for gradient animation
 */
function generateGradientAnimationCSS(
  gradient: import('../gradients/gradient-types').GradientConfig,
  duration: string
): string {
  const keyframeName = `gradient-animation-${gradient.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const stops = gradient.stops.map((stop: import('../gradients/gradient-types').GradientStop) => `${stop.color} ${stop.position}%`).join(', ');

  return `
    @keyframes ${keyframeName} {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .gradient-animated {
      background: linear-gradient(${gradient.direction || '45deg'}, ${stops});
      background-size: 200% 200%;
      animation: ${keyframeName} ${duration} ease infinite;
    }
  `;
}