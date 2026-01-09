/**
 * Security Validator
 * 
 * Input sanitization and validation to prevent XSS, SQL injection, and other attacks.
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onload=, etc.)
    .trim();
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML content (basic)
 * For production, use a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check for potentially dangerous file types
  const dangerousTypes = [
    'application/x-msdownload', // .exe
    'application/x-executable',
    'application/x-sharedlib',
  ];

  if (dangerousTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type is not allowed for security reasons',
    };
  }

  return { valid: true };
}

/**
 * Prevent SQL injection by escaping special characters
 * Note: Use parameterized queries instead when possible
 */
export function escapeSqlString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/%/g, '\\%') // Escape wildcards
    .replace(/_/g, '\\_'); // Escape wildcards
}

/**
 * Validate request body size
 */
export function validateRequestBodySize(
  body: string | object,
  maxSize: number = 1024 * 1024 // 1MB default
): { valid: boolean; error?: string } {
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  const size = new Blob([bodyString]).size;

  if (size > maxSize) {
    return {
      valid: false,
      error: `Request body size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]) as any;
    }
  }

  return sanitized;
}







