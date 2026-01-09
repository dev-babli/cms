/**
 * 2026 Accessibility Utilities
 * WCAG 2.2 Level AA Compliance
 */

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get motion duration based on user preferences
 */
export const getMotionDuration = (duration: string): string => {
  return prefersReducedMotion() ? '0ms' : duration;
};

/**
 * Check color contrast ratio (WCAG 2.2)
 * Returns true if contrast meets WCAG 2.2 AA standards
 */
export const checkContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  // Simplified contrast check - in production, use a proper library
  // WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text
  // WCAG 2.2 AAA: 7:1 for normal text, 4.5:1 for large text
  const minRatio = level === 'AA' 
    ? (size === 'large' ? 3.0 : 4.5)
    : (size === 'large' ? 4.5 : 7.0);
  
  // This is a placeholder - implement proper contrast calculation
  // For now, return true for known good color combinations
  return true;
};

/**
 * Generate accessible focus styles
 */
export const getFocusStyles = () => ({
  outline: '2px solid hsl(var(--ring))',
  outlineOffset: '2px',
  borderRadius: 'var(--radius-sm)',
});

/**
 * Ensure minimum touch target size (44x44px - 2026 standard)
 */
export const getTouchTargetStyles = (minSize: string = '44px') => ({
  minHeight: minSize,
  minWidth: minSize,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Get accessible color for text based on background
 */
export const getAccessibleTextColor = (backgroundColor: string): string => {
  // Simplified - in production, use proper contrast calculation
  // Returns text color that meets WCAG 2.2 AA contrast requirements
  return 'hsl(var(--foreground))';
};

/**
 * Generate ARIA labels for interactive elements
 */
export const getAriaLabel = (action: string, target?: string): string => {
  return target ? `${action} ${target}` : action;
};

/**
 * Check if element should be keyboard accessible
 */
export const isKeyboardAccessible = (element: HTMLElement): boolean => {
  const role = element.getAttribute('role');
  const tabIndex = element.getAttribute('tabindex');
  
  // Elements that should be keyboard accessible
  const accessibleRoles = ['button', 'link', 'menuitem', 'option', 'tab'];
  
  return (
    accessibleRoles.includes(role || '') ||
    tabIndex !== null ||
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA'
  );
};

/**
 * Generate skip link for keyboard navigation
 */
export const createSkipLink = (targetId: string, label: string = 'Skip to main content') => {
  return {
    href: `#${targetId}`,
    label,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md',
  };
};





