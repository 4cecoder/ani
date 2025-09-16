import { GradientTheme, GradientPreset } from './gradient-types';

/**
 * Predefined gradient presets that match the app's purple/blue theme
 */

const purpleBlueTheme: GradientTheme = {
  id: 'purple-blue',
  name: 'Purple Blue',
  primary: {
    id: 'purple-blue-primary',
    name: 'Primary Purple Blue',
    type: 'linear',
    direction: '135deg',
    stops: [
      { color: '#8B5CF6', position: 0 },    // Purple 500
      { color: '#3B82F6', position: 100 }   // Blue 500
    ],
    css: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
  },
  secondary: {
    id: 'purple-blue-secondary',
    name: 'Secondary Purple Blue',
    type: 'linear',
    direction: '90deg',
    stops: [
      { color: '#A78BFA', position: 0 },    // Purple 400
      { color: '#60A5FA', position: 100 }   // Blue 400
    ],
    css: 'linear-gradient(90deg, #A78BFA 0%, #60A5FA 100%)'
  },
  accent: {
    id: 'purple-blue-accent',
    name: 'Accent Purple Blue',
    type: 'radial',
    stops: [
      { color: '#C4B5FD', position: 0 },    // Purple 300
      { color: '#93C5FD', position: 100 }   // Blue 300
    ],
    css: 'radial-gradient(circle, #C4B5FD 0%, #93C5FD 100%)'
  },
  background: {
    id: 'purple-blue-background',
    name: 'Background Purple Blue',
    type: 'linear',
    direction: '180deg',
    stops: [
      { color: '#1E1B4B', position: 0 },    // Dark purple
      { color: '#1E3A8A', position: 100 }   // Dark blue
    ],
    css: 'linear-gradient(180deg, #1E1B4B 0%, #1E3A8A 100%)'
  }
};

const sunsetTheme: GradientTheme = {
  id: 'sunset',
  name: 'Sunset',
  primary: {
    id: 'sunset-primary',
    name: 'Primary Sunset',
    type: 'linear',
    direction: '45deg',
    stops: [
      { color: '#F97316', position: 0 },    // Orange 500
      { color: '#EF4444', position: 100 }   // Red 500
    ],
    css: 'linear-gradient(45deg, #F97316 0%, #EF4444 100%)'
  },
  secondary: {
    id: 'sunset-secondary',
    name: 'Secondary Sunset',
    type: 'linear',
    direction: '135deg',
    stops: [
      { color: '#FB923C', position: 0 },    // Orange 400
      { color: '#F87171', position: 100 }   // Red 400
    ],
    css: 'linear-gradient(135deg, #FB923C 0%, #F87171 100%)'
  },
  accent: {
    id: 'sunset-accent',
    name: 'Accent Sunset',
    type: 'radial',
    stops: [
      { color: '#FED7AA', position: 0 },    // Orange 200
      { color: '#FECACA', position: 100 }   // Red 200
    ],
    css: 'radial-gradient(circle, #FED7AA 0%, #FECACA 100%)'
  },
  background: {
    id: 'sunset-background',
    name: 'Background Sunset',
    type: 'linear',
    direction: '180deg',
    stops: [
      { color: '#7C2D12', position: 0 },    // Dark orange
      { color: '#991B1B', position: 100 }   // Dark red
    ],
    css: 'linear-gradient(180deg, #7C2D12 0%, #991B1B 100%)'
  }
};

const oceanTheme: GradientTheme = {
  id: 'ocean',
  name: 'Ocean',
  primary: {
    id: 'ocean-primary',
    name: 'Primary Ocean',
    type: 'linear',
    direction: '90deg',
    stops: [
      { color: '#06B6D4', position: 0 },    // Cyan 500
      { color: '#0EA5E9', position: 100 }   // Sky 500
    ],
    css: 'linear-gradient(90deg, #06B6D4 0%, #0EA5E9 100%)'
  },
  secondary: {
    id: 'ocean-secondary',
    name: 'Secondary Ocean',
    type: 'linear',
    direction: '45deg',
    stops: [
      { color: '#22D3EE', position: 0 },    // Cyan 400
      { color: '#38BDF8', position: 100 }   // Sky 400
    ],
    css: 'linear-gradient(45deg, #22D3EE 0%, #38BDF8 100%)'
  },
  accent: {
    id: 'ocean-accent',
    name: 'Accent Ocean',
    type: 'radial',
    stops: [
      { color: '#67E8F9', position: 0 },    // Cyan 300
      { color: '#7DD3FC', position: 100 }   // Sky 300
    ],
    css: 'radial-gradient(circle, #67E8F9 0%, #7DD3FC 100%)'
  },
  background: {
    id: 'ocean-background',
    name: 'Background Ocean',
    type: 'linear',
    direction: '180deg',
    stops: [
      { color: '#164E63', position: 0 },    // Dark cyan
      { color: '#1E3A8A', position: 100 }   // Dark sky
    ],
    css: 'linear-gradient(180deg, #164E63 0%, #1E3A8A 100%)'
  }
};

const forestTheme: GradientTheme = {
  id: 'forest',
  name: 'Forest',
  primary: {
    id: 'forest-primary',
    name: 'Primary Forest',
    type: 'linear',
    direction: '135deg',
    stops: [
      { color: '#10B981', position: 0 },    // Emerald 500
      { color: '#059669', position: 100 }   // Emerald 600
    ],
    css: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  },
  secondary: {
    id: 'forest-secondary',
    name: 'Secondary Forest',
    type: 'linear',
    direction: '90deg',
    stops: [
      { color: '#34D399', position: 0 },    // Emerald 400
      { color: '#10B981', position: 100 }   // Emerald 500
    ],
    css: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)'
  },
  accent: {
    id: 'forest-accent',
    name: 'Accent Forest',
    type: 'radial',
    stops: [
      { color: '#6EE7B7', position: 0 },    // Emerald 300
      { color: '#34D399', position: 100 }   // Emerald 400
    ],
    css: 'radial-gradient(circle, #6EE7B7 0%, #34D399 100%)'
  },
  background: {
    id: 'forest-background',
    name: 'Background Forest',
    type: 'linear',
    direction: '180deg',
    stops: [
      { color: '#064E3B', position: 0 },    // Dark emerald
      { color: '#065F46', position: 100 }   // Dark emerald
    ],
    css: 'linear-gradient(180deg, #064E3B 0%, #065F46 100%)'
  }
};

const cosmicTheme: GradientTheme = {
  id: 'cosmic',
  name: 'Cosmic',
  primary: {
    id: 'cosmic-primary',
    name: 'Primary Cosmic',
    type: 'linear',
    direction: '225deg',
    stops: [
      { color: '#8B5CF6', position: 0 },    // Purple 500
      { color: '#EC4899', position: 100 }   // Pink 500
    ],
    css: 'linear-gradient(225deg, #8B5CF6 0%, #EC4899 100%)'
  },
  secondary: {
    id: 'cosmic-secondary',
    name: 'Secondary Cosmic',
    type: 'linear',
    direction: '315deg',
    stops: [
      { color: '#A78BFA', position: 0 },    // Purple 400
      { color: '#F472B6', position: 100 }   // Pink 400
    ],
    css: 'linear-gradient(315deg, #A78BFA 0%, #F472B6 100%)'
  },
  accent: {
    id: 'cosmic-accent',
    name: 'Accent Cosmic',
    type: 'radial',
    stops: [
      { color: '#C4B5FD', position: 0 },    // Purple 300
      { color: '#FBCFE8', position: 100 }   // Pink 300
    ],
    css: 'radial-gradient(circle, #C4B5FD 0%, #FBCFE8 100%)'
  },
  background: {
    id: 'cosmic-background',
    name: 'Background Cosmic',
    type: 'linear',
    direction: '180deg',
    stops: [
      { color: '#4C1D95', position: 0 },    // Dark purple
      { color: '#831843', position: 100 }   // Dark pink
    ],
    css: 'linear-gradient(180deg, #4C1D95 0%, #831843 100%)'
  }
};

const auroraTheme: GradientTheme = {
  id: 'aurora',
  name: 'Aurora',
  primary: {
    id: 'aurora-primary',
    name: 'Primary Aurora',
    type: 'linear',
    direction: '90deg',
    stops: [
      { color: '#10B981', position: 0 },    // Emerald 500
      { color: '#3B82F6', position: 50 },   // Blue 500
      { color: '#8B5CF6', position: 100 }   // Purple 500
    ],
    css: 'linear-gradient(90deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%)'
  },
  secondary: {
    id: 'aurora-secondary',
    name: 'Secondary Aurora',
    type: 'linear',
    direction: '45deg',
    stops: [
      { color: '#34D399', position: 0 },    // Emerald 400
      { color: '#60A5FA', position: 50 },   // Blue 400
      { color: '#A78BFA', position: 100 }   // Purple 400
    ],
    css: 'linear-gradient(45deg, #34D399 0%, #60A5FA 50%, #A78BFA 100%)'
  },
  accent: {
    id: 'aurora-accent',
    name: 'Accent Aurora',
    type: 'radial',
    stops: [
      { color: '#6EE7B7', position: 0 },    // Emerald 300
      { color: '#93C5FD', position: 50 },   // Blue 300
      { color: '#C4B5FD', position: 100 }   // Purple 300
    ],
    css: 'radial-gradient(circle, #6EE7B7 0%, #93C5FD 50%, #C4B5FD 100%)'
  },
  background: {
    id: 'aurora-background',
    name: 'Background Aurora',
    type: 'linear',
    direction: '180deg',
    stops: [
      { color: '#064E3B', position: 0 },    // Dark emerald
      { color: '#1E3A8A', position: 50 },   // Dark blue
      { color: '#4C1D95', position: 100 }   // Dark purple
    ],
    css: 'linear-gradient(180deg, #064E3B 0%, #1E3A8A 50%, #4C1D95 100%)'
  }
};

/**
 * Map of all available gradient presets
 */
export const gradientPresets: Record<GradientPreset, GradientTheme> = {
  'purple-blue': purpleBlueTheme,
  'sunset': sunsetTheme,
  'ocean': oceanTheme,
  'forest': forestTheme,
  'cosmic': cosmicTheme,
  'aurora': auroraTheme,
};

/**
 * Get a gradient preset by name
 */
export function getGradientPreset(preset: GradientPreset): GradientTheme {
  return gradientPresets[preset];
}

/**
 * Get all available gradient presets
 */
export function getAllGradientPresets(): GradientTheme[] {
  return Object.values(gradientPresets);
}

/**
 * Get the default gradient preset (purple-blue to match app theme)
 */
export function getDefaultGradientPreset(): GradientTheme {
  return gradientPresets['purple-blue'];
}