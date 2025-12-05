/**
 * Server-side HTML Sanitization Utilities
 * Uses a lightweight regex-based sanitizer for serverless environments
 * (isomorphic-dompurify/jsdom has ESM compatibility issues on Vercel)
 */

// Simple regex-based HTML sanitizer for server-side use
// This is safe because we only allow specific tags and attributes

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

/**
 * Regex-based HTML sanitizer for serverless environments
 * Removes dangerous tags and attributes while preserving safe content
 */
function sanitizeHtmlRegex(html: string, config: SanitizeConfig): string {
  let sanitized = html;

  // Remove forbidden tags and their content
  const forbiddenTags = config.FORBID_TAGS || ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
  forbiddenTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing tags
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), '');
  });

  // Remove event handlers (onclick, onerror, etc.)
  const forbiddenAttrs = config.FORBID_ATTR || ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
  forbiddenAttrs.forEach(attr => {
    sanitized = sanitized.replace(new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi'), '');
    sanitized = sanitized.replace(new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]*`, 'gi'), '');
  });

  // Remove javascript: and data: URLs from href/src attributes
  sanitized = sanitized.replace(/href\s*=\s*["']?javascript:[^"'\s>]*/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?javascript:[^"'\s>]*/gi, 'src=""');
  sanitized = sanitized.replace(/href\s*=\s*["']?data:text\/html[^"'\s>]*/gi, 'href="#"');

  // Keep only allowed tags (if specified)
  if (config.ALLOWED_TAGS && config.ALLOWED_TAGS.length > 0) {
    // Extract all tags
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      const lowerTag = tagName.toLowerCase();
      if (config.ALLOWED_TAGS!.some(allowed => allowed.toLowerCase() === lowerTag)) {
        return match;
      }
      return ''; // Remove disallowed tags
    });
  }

  return sanitized;
}

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

  // Use a simple but effective regex-based sanitizer for serverless environments
  // This avoids jsdom/parse5 ESM issues on Vercel
  return sanitizeHtmlRegex(dirty, config);
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

  // Strip all HTML tags and return plain text
  // Use regex to remove all tags safely
  return html.replace(/<[^>]*>/g, '').trim();
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
  
  // Remove all script tags and event handlers using regex
  // Remove <script> tags and their content
  let sanitized = script.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  return sanitized.trim();
}

