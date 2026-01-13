/**
 * Feature Flags - Control which features are enabled
 * Set these to false to hide features temporarily
 */

export const FEATURE_FLAGS = {
  // Hero Slides Management
  HERO_SLIDES: process.env.NEXT_PUBLIC_FEATURE_HERO_SLIDES !== 'false', // Default: enabled
  
  // Office Addresses Management
  OFFICE_ADDRESSES: process.env.NEXT_PUBLIC_FEATURE_OFFICE_ADDRESSES !== 'false', // Default: enabled
  
  // Page Visibility Controls
  PAGE_VISIBILITY: process.env.NEXT_PUBLIC_FEATURE_PAGE_VISIBILITY !== 'false', // Default: enabled
  
  // CDN Caching (keep enabled for performance)
  CDN_CACHING: process.env.NEXT_PUBLIC_FEATURE_CDN_CACHING !== 'false', // Default: enabled
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] === true;
}

/**
 * Get all disabled features (for debugging)
 */
export function getDisabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => !enabled)
    .map(([feature]) => feature);
}


