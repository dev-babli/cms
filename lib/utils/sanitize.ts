/**
 * Server-side HTML Sanitization Utilities
 * Uses isomorphic-dompurify for safe HTML sanitization on both server and client
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content for safe storage and rendering
 * Removes dangerous scripts, event handlers, and other XSS vectors
 * 
 * @param dirty - Unsanitized HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for storage and rendering
 */
type SanitizeConfig = {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOWED_URI_REGEXP?: RegExp;
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  KEEP_CONTENT?: boolean;
  [key: string]: any;
};

export function sanitizeHtml(dirty: string | null | undefined, options?: SanitizeConfig): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Default configuration - strict for security
  const defaultOptions: SanitizeConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'div', 'span', 'hr', 'sub', 'sup', 'strike', 'del',
      'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class', 'id', 'style',
      'colspan', 'rowspan', 'align', 'target', 'rel', 'data-*'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Remove all event handlers and javascript: URLs
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Sanitize style attributes to prevent CSS injection
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  };

  const config = { ...defaultOptions, ...options };

  // Sanitize the HTML
  // @ts-ignore - isomorphic-dompurify types may not be perfect
  return DOMPurify.sanitize(dirty, config) as string;
}

/**
 * Sanitize HTML for article content (allows more tags)
 */
export function sanitizeArticleContent(html: string | null | undefined): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'div', 'span', 'hr', 'sub', 'sup', 'strike', 'del',
      'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class', 'id', 'style',
      'colspan', 'rowspan', 'align', 'target', 'rel', 'data-*'
    ],
  });
}

/**
 * Sanitize HTML for titles (very restrictive)
 */
export function sanitizeTitle(html: string | null | undefined): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Strip HTML tags and return plain text
 * Safe alternative to using innerHTML
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Use DOMPurify to sanitize first, then extract text
  // @ts-ignore - isomorphic-dompurify types may not be perfect
  const sanitized = DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }) as string;

  // For server-side, use a simple regex to extract text
  // This is safe because DOMPurify has already removed all dangerous content
  return sanitized.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize custom tracking script field
 * SECURITY: This should be empty or disabled, but if it must be stored,
 * we sanitize it to prevent XSS. However, executing arbitrary scripts
 * from CMS content is inherently unsafe.
 */
export function sanitizeTrackingScript(script: string | null | undefined): string {
  // SECURITY WARNING: Storing executable scripts in CMS is a security risk
  // This function sanitizes the script, but ideally this field should be disabled
  // or replaced with declarative configuration (JSON with tracking parameters)
  
  if (!script || typeof script !== 'string') {
    return '';
  }

  // For tracking scripts, we should ideally reject them entirely
  // But if they must be stored, we at least sanitize any HTML/script tags
  // Note: This doesn't prevent all XSS if the script is executed later
  // The React app should NOT execute these scripts (which we've already disabled)
  
  // Remove all script tags and event handlers
  // @ts-ignore - isomorphic-dompurify types may not be perfect
  return DOMPurify.sanitize(script, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: false, // Remove all content from script tags
  }) as string;
}

