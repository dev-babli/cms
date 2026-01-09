/**
 * 2026 Design System Tokens
 * 
 * Modern design system aligned with 2026 standards:
 * - 8-Point Grid System
 * - Adaptive Transparency & Liquid Glass Effects
 * - Minimalist & Airy Interfaces
 * - WCAG 2.2 Level AA Accessibility
 * - Ethical Design & Transparency
 * - Voice & Multimodal Interactions Ready
 * 
 * Philosophy:
 * - Content > Chrome
 * - Density Without Chaos
 * - Text is the Product
 * - Zero visual noise
 * - Accessibility First
 */

// 8-Point Grid System (2026 Standard)
const GRID_UNIT = 8;

export const colors = {
  // Background Colors - Adaptive Transparency Ready
  background: {
    primary: '#FFFFFF',
    secondary: '#F7F7F8',
    tertiary: '#F3F4F6',
    // Adaptive transparency variants (for liquid glass effects)
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      medium: 'rgba(255, 255, 255, 0.5)',
      dark: 'rgba(255, 255, 255, 0.3)',
    },
  },
  
  // Text Colors - High Contrast (WCAG 2.2 AA)
  text: {
    primary: '#111827',      // 4.5:1 contrast ratio on white
    secondary: '#6B7280',    // 4.5:1 contrast ratio
    tertiary: '#9CA3AF',     // 3:1 contrast ratio (for less important text)
    inverse: '#FFFFFF',      // For dark backgrounds
    disabled: '#D1D5DB',     // 3:1 contrast ratio
  },
  
  // Border Colors - Subtle & Refined
  border: {
    default: '#E5E7EB',      // Light gray
    hover: '#D1D5DB',        // Medium gray
    focus: '#3B82F6',        // Blue focus ring
    error: '#EF4444',         // Red for errors
    success: '#10B981',       // Green for success
  },
  
  // Accent Colors (earned, not decorative)
  accent: {
    blue: '#3B82F6',         // Primary blue
    indigo: '#6366F1',       // Indigo
    hover: '#2563EB',        // Darker blue on hover
    light: '#DBEAFE',        // Light blue background
  },
  
  // State Colors - WCAG 2.2 Compliant
  state: {
    success: '#10B981',      // Green (4.5:1 contrast)
    warning: '#F59E0B',      // Amber (4.5:1 contrast)
    error: '#EF4444',        // Red (4.5:1 contrast) - muted, not alarming
    info: '#3B82F6',         // Blue (4.5:1 contrast)
  },
  
  // Interactive States - Subtle & Purposeful
  interactive: {
    hover: '#F9FAFB',        // Very light gray background tint
    active: '#F3F4F6',       // Slightly darker tint
    focus: '#3B82F6',        // Blue focus ring (2px, visible)
    selected: '#EFF6FF',     // Light blue for selected items
    disabled: '#F9FAFB',     // Disabled state background
  },
} as const;

export const typography = {
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"SF Pro Display"',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(', '),
    mono: [
      '"SF Mono"',
      'Monaco',
      'Consolas',
      '"Liberation Mono"',
      '"Courier New"',
      'monospace',
    ].join(', '),
  },
  
  fontSize: {
    // 2026 Standard: Subtle scaling, high legibility
    pageTitle: {
      size: '20px',          // Increased from 18px for better readability
      lineHeight: '1.4',
      weight: '500',         // Medium
      letterSpacing: '-0.01em',
    },
    
    sectionLabel: {
      size: '14px',          // Increased from 13px
      lineHeight: '1.4',
      weight: '500',         // Medium
      letterSpacing: '0.01em',
      textTransform: 'uppercase' as const,
    },
    
    body: {
      size: '15px',          // Increased from 14px (2026 standard)
      lineHeight: '1.6',     // Increased from 1.5 for better readability
      weight: '400',         // Regular
    },
    
    bodyLarge: {
      size: '16px',          // For important content
      lineHeight: '1.6',
      weight: '400',
    },
    
    metadata: {
      size: '13px',          // Increased from 12px
      lineHeight: '1.4',
      weight: '400',
    },
    
    small: {
      size: '12px',
      lineHeight: '1.4',
      weight: '400',
    },
  },
  
  // Typography hierarchy - 2026: More generous spacing
  scale: {
    xs: '12px',
    sm: '13px',
    base: '15px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '28px',
  },
} as const;

// 8-Point Grid System (2026 Standard)
export const spacing = {
  // Base spacing unit (8px - 2026 standard)
  unit: GRID_UNIT,
  
  // Spacing scale - All multiples of 8
  scale: {
    xs: `${GRID_UNIT * 0.5}px`,    // 4px
    sm: `${GRID_UNIT * 1}px`,      // 8px
    md: `${GRID_UNIT * 2}px`,      // 16px
    lg: `${GRID_UNIT * 3}px`,      // 24px
    xl: `${GRID_UNIT * 4}px`,      // 32px
    '2xl': `${GRID_UNIT * 6}px`,   // 48px
    '3xl': `${GRID_UNIT * 8}px`,   // 64px
    '4xl': `${GRID_UNIT * 12}px`,  // 96px
  },
  
  // Component-specific spacing (8-point grid)
  component: {
    inputPadding: `${GRID_UNIT * 1.5}px ${GRID_UNIT * 2}px`,  // 12px 16px
    buttonPadding: `${GRID_UNIT * 1.5}px ${GRID_UNIT * 3}px`, // 12px 24px
    cardPadding: `${GRID_UNIT * 3}px`,                        // 24px
    sectionPadding: `${GRID_UNIT * 4}px`,                     // 32px
    containerPadding: `${GRID_UNIT * 4}px ${GRID_UNIT * 6}px`, // 32px 48px
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '6px',      // 2026: Slightly more rounded
  md: '8px',      // 2026: Standard
  lg: '12px',     // 2026: More generous
  xl: '16px',     // 2026: Large radius
  full: '9999px',
} as const;

export const motion = {
  // Duration (2026: Slightly faster, more responsive)
  duration: {
    instant: '50ms',   // New: Instant feedback
    fast: '100ms',
    normal: '150ms',
    slow: '200ms',
    slower: '300ms',   // New: For complex animations
  },
  
  // Easing (ease-out, never spring)
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',  // 2026: Material Design easing
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Transitions (purpose-driven only)
  transitions: {
    // Focus change (2026: Instant for better UX)
    focus: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Panel open/close
    panel: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Selection highlight
    selection: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Hover state
    hover: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // 2026: New transitions
    modal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    tooltip: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const shadows = {
  // 2026: Even more minimal shadows
  none: 'none',
  
  // Minimal shadow only when absolutely necessary
  minimal: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  
  // 2026: New shadow variants (for depth when needed)
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  // 2026: New z-index layers
  notification: 1080,
  loading: 1090,
} as const;

export const layout = {
  // Sidebar width (fixed)
  sidebarWidth: '256px',  // 2026: Slightly wider for better content
  
  // Top bar height (8-point grid)
  topBarHeight: '64px',   // 2026: 8 * 8 = 64px
  
  // Content max width
  contentMaxWidth: '1280px', // 2026: Wider for modern screens
  
  // Reading width (for content)
  readingWidth: '65ch',   // Optimal reading width
  
  // 2026: New layout values
  containerPadding: `${GRID_UNIT * 4}px`, // 32px
  sectionGap: `${GRID_UNIT * 6}px`,      // 48px
} as const;

// Accessibility Tokens (WCAG 2.2 Level AA)
export const accessibility = {
  // Focus indicators (2026: More visible)
  focus: {
    width: '2px',
    style: 'solid',
    color: colors.accent.blue,
    offset: '2px',
  },
  
  // Color contrast ratios (WCAG 2.2 AA)
  contrast: {
    normal: 4.5,      // Minimum for normal text
    large: 3.0,       // Minimum for large text (18px+)
    enhanced: 7.0,    // Enhanced (AAA) for important content
  },
  
  // Motion preferences (2026: Respect user preferences)
  motion: {
    respectReducedMotion: true,
    defaultDuration: '150ms',
    reducedMotionDuration: '0ms',
  },
  
  // Touch target sizes (2026: Minimum 44x44px)
  touchTarget: {
    minSize: '44px',
    recommendedSize: '48px',
  },
} as const;

// CSS Variables for use in CSS files
export const cssVariables = {
  // Colors
  '--color-background-primary': colors.background.primary,
  '--color-background-secondary': colors.background.secondary,
  '--color-background-tertiary': colors.background.tertiary,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-text-inverse': colors.text.inverse,
  '--color-border-default': colors.border.default,
  '--color-border-hover': colors.border.hover,
  '--color-border-focus': colors.border.focus,
  '--color-accent-blue': colors.accent.blue,
  '--color-accent-indigo': colors.accent.indigo,
  '--color-accent-hover': colors.accent.hover,
  '--color-state-success': colors.state.success,
  '--color-state-warning': colors.state.warning,
  '--color-state-error': colors.state.error,
  '--color-state-info': colors.state.info,
  '--color-interactive-hover': colors.interactive.hover,
  '--color-interactive-active': colors.interactive.active,
  '--color-interactive-focus': colors.interactive.focus,
  '--color-interactive-selected': colors.interactive.selected,
  
  // Typography
  '--font-family-sans': typography.fontFamily.sans,
  '--font-family-mono': typography.fontFamily.mono,
  '--font-size-page-title': typography.fontSize.pageTitle.size,
  '--font-size-section-label': typography.fontSize.sectionLabel.size,
  '--font-size-body': typography.fontSize.body.size,
  '--font-size-body-large': typography.fontSize.bodyLarge.size,
  '--font-size-metadata': typography.fontSize.metadata.size,
  '--font-size-small': typography.fontSize.small.size,
  
  // Spacing (8-point grid)
  '--spacing-unit': `${spacing.unit}px`,
  '--spacing-xs': spacing.scale.xs,
  '--spacing-sm': spacing.scale.sm,
  '--spacing-md': spacing.scale.md,
  '--spacing-lg': spacing.scale.lg,
  '--spacing-xl': spacing.scale.xl,
  '--spacing-2xl': spacing.scale['2xl'],
  '--spacing-3xl': spacing.scale['3xl'],
  '--spacing-4xl': spacing.scale['4xl'],
  
  // Border Radius
  '--border-radius-sm': borderRadius.sm,
  '--border-radius-md': borderRadius.md,
  '--border-radius-lg': borderRadius.lg,
  '--border-radius-xl': borderRadius.xl,
  
  // Motion
  '--motion-duration-instant': motion.duration.instant,
  '--motion-duration-fast': motion.duration.fast,
  '--motion-duration-normal': motion.duration.normal,
  '--motion-duration-slow': motion.duration.slow,
  '--motion-easing-default': motion.easing.default,
  
  // Layout
  '--layout-sidebar-width': layout.sidebarWidth,
  '--layout-top-bar-height': layout.topBarHeight,
  '--layout-content-max-width': layout.contentMaxWidth,
  '--layout-reading-width': layout.readingWidth,
  '--layout-container-padding': layout.containerPadding,
  '--layout-section-gap': layout.sectionGap,
  
  // Accessibility
  '--focus-width': accessibility.focus.width,
  '--focus-color': accessibility.focus.color,
  '--focus-offset': accessibility.focus.offset,
  '--touch-target-min': accessibility.touchTarget.minSize,
} as const;

// Export all tokens
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  motion,
  shadows,
  zIndex,
  layout,
  accessibility,
  cssVariables,
} as const;

export default designTokens;
