/**
 * Security Scanner - 2026 Enhanced Security
 * 
 * Scans requests for common attack patterns:
 * - SQL Injection
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - Path Traversal
 * - Command Injection
 * - SSRF (Server-Side Request Forgery)
 * - NoSQL Injection
 * - LDAP Injection
 */

export interface SecurityScanResult {
  isSafe: boolean;
  threats: SecurityThreat[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityThreat {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  payload?: string;
}

// SQL Injection patterns (2026 updated)
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
  /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%27)|(\%22))/i,
  /(\bOR\b.*=.*)|(\bAND\b.*=.*)/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bEXEC\b|\bEXECUTE\b)/i,
  /(\bxp_\w+\b)/i, // SQL Server extended procedures
  /(\bLOAD_FILE\b|\bINTO\s+OUTFILE\b)/i, // MySQL file operations
  /(\bpg_read_file\b|\bCOPY\b)/i, // PostgreSQL
];

// XSS patterns (2026 updated)
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/i,
  /on\w+\s*=/i, // Event handlers (onclick, onerror, etc.)
  /<iframe[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<svg[^>]*onload/i,
  /<img[^>]*onerror/i,
  /<body[^>]*onload/i,
  /<input[^>]*onfocus/i,
  /<link[^>]*href\s*=\s*["']?javascript:/i,
  /<style[^>]*>.*@import/i,
  /expression\s*\(/i, // CSS expressions
  /vbscript:/i,
  /data:text\/html/i,
  /&#x[0-9a-f]+;/i, // Hex encoded
  /&#[0-9]+;/i, // Decimal encoded
];

// Path Traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /\.\.%2F/gi,
  /\.\.%5C/gi,
  /%2E%2E%2F/gi,
  /%2E%2E%5C/gi,
  /\.\.%252F/gi,
  /\.\.%255C/gi,
];

// Command Injection patterns (more specific to avoid false positives)
const COMMAND_INJECTION_PATTERNS = [
  // Only match command injection patterns when they appear in suspicious contexts
  /[;&|`]\s*(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|rm|del|delete|wget|curl|fetch)\b/i,
  /\b(cmd|command|exec|system|shell_exec|passthru|proc_open)\s*[\(;]/i,
  /\$\s*\([^)]*\)/,
  /\$\s*\{[^}]*\}/,
  /`[^`]*(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|rm|del|delete|wget|curl|fetch)[^`]*`/i,
];

// SSRF patterns
const SSRF_PATTERNS = [
  /^(https?|ftp|file|gopher|ldap):\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i,
  /^(https?|ftp|file|gopher|ldap):\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i,
  /^(https?|ftp|file|gopher|ldap):\/\/169\.254\./i, // Link-local
  /^file:\/\//i,
  /^gopher:\/\//i,
  /^ldap:\/\//i,
];

// NoSQL Injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$ne/i,
  /\$gt/i,
  /\$lt/i,
  /\$gte/i,
  /\$lte/i,
  /\$in/i,
  /\$nin/i,
  /\$regex/i,
  /\$exists/i,
  /\$or/i,
  /\$and/i,
  /\$not/i,
  /\$nor/i,
];

// LDAP Injection patterns (more specific to avoid false positives in email addresses, etc.)
const LDAP_INJECTION_PATTERNS = [
  // Only match when these appear in suspicious LDAP query contexts
  /\([^)]*[&|!][^)]*\)/,
  /\*\)/,
  /\([^)]*\)[&|!]/,
  /[&|!]\s*\(/,
];

/**
 * Scan request body for security threats
 */
export function scanRequestBody(body: any, location: string = 'body'): SecurityScanResult {
  const threats: SecurityThreat[] = [];
  
  if (!body || typeof body !== 'object') {
    return { isSafe: true, threats: [], riskLevel: 'low' };
  }
  
  // Whitelist known safe fields that might contain special characters
  const safeFields = ['email', 'phone', 'company', 'first_name', 'last_name', 'job_title', 'notes', 'download_url', 'content_title'];
  const safeFieldValues: string[] = [];
  
  // Extract safe field values to exclude from scanning
  for (const field of safeFields) {
    if (body[field] && typeof body[field] === 'string') {
      safeFieldValues.push(body[field]);
    }
  }
  
  // Convert body to string for pattern matching
  let bodyString = JSON.stringify(body);
  
  // Remove safe field values from the string to scan (replace with placeholders)
  for (const safeValue of safeFieldValues) {
    // Escape special regex characters
    const escaped = safeValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    bodyString = bodyString.replace(new RegExp(escaped, 'g'), '[SAFE_FIELD]');
  }
  
  // Check SQL Injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'SQL Injection',
        severity: 'critical',
        description: 'Potential SQL injection attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Check XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'XSS (Cross-Site Scripting)',
        severity: 'high',
        description: 'Potential XSS attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Check Path Traversal
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'Path Traversal',
        severity: 'high',
        description: 'Potential path traversal attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Check Command Injection
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'Command Injection',
        severity: 'critical',
        description: 'Potential command injection attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Check SSRF
  for (const pattern of SSRF_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'SSRF (Server-Side Request Forgery)',
        severity: 'high',
        description: 'Potential SSRF attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Check NoSQL Injection
  for (const pattern of NOSQL_INJECTION_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'NoSQL Injection',
        severity: 'high',
        description: 'Potential NoSQL injection attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Check LDAP Injection
  for (const pattern of LDAP_INJECTION_PATTERNS) {
    if (pattern.test(bodyString)) {
      threats.push({
        type: 'LDAP Injection',
        severity: 'high',
        description: 'Potential LDAP injection attack detected',
        location,
        payload: bodyString.match(pattern)?.[0],
      });
      break;
    }
  }
  
  // Determine risk level
  const hasCritical = threats.some(t => t.severity === 'critical');
  const hasHigh = threats.some(t => t.severity === 'high');
  const hasMedium = threats.some(t => t.severity === 'medium');
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (hasCritical) riskLevel = 'critical';
  else if (hasHigh) riskLevel = 'high';
  else if (hasMedium) riskLevel = 'medium';
  
  return {
    isSafe: threats.length === 0,
    threats,
    riskLevel,
  };
}

/**
 * Scan URL parameters for security threats
 */
export function scanURL(url: string): SecurityScanResult {
  const threats: SecurityThreat[] = [];
  
  // Check all patterns against URL
  const allPatterns = [
    ...SQL_INJECTION_PATTERNS.map(p => ({ pattern: p, type: 'SQL Injection', severity: 'critical' as const })),
    ...XSS_PATTERNS.map(p => ({ pattern: p, type: 'XSS', severity: 'high' as const })),
    ...PATH_TRAVERSAL_PATTERNS.map(p => ({ pattern: p, type: 'Path Traversal', severity: 'high' as const })),
    ...COMMAND_INJECTION_PATTERNS.map(p => ({ pattern: p, type: 'Command Injection', severity: 'critical' as const })),
    ...SSRF_PATTERNS.map(p => ({ pattern: p, type: 'SSRF', severity: 'high' as const })),
  ];
  
  for (const { pattern, type, severity } of allPatterns) {
    if (pattern.test(url)) {
      threats.push({
        type,
        severity,
        description: `Potential ${type} attack detected in URL`,
        location: 'url',
        payload: url.match(pattern)?.[0],
      });
      break; // Only report first match per pattern type
    }
  }
  
  const hasCritical = threats.some(t => t.severity === 'critical');
  const hasHigh = threats.some(t => t.severity === 'high');
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (hasCritical) riskLevel = 'critical';
  else if (hasHigh) riskLevel = 'high';
  
  return {
    isSafe: threats.length === 0,
    threats,
    riskLevel,
  };
}

/**
 * Scan headers for security threats
 */
export function scanHeaders(headers: Headers): SecurityScanResult {
  const threats: SecurityThreat[] = [];
  
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'user-agent', 'referer'];
  
  for (const headerName of suspiciousHeaders) {
    const headerValue = headers.get(headerName);
    if (!headerValue) continue;
    
    // Check for SQL injection in headers
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(headerValue)) {
        threats.push({
          type: 'SQL Injection',
          severity: 'critical',
          description: `Potential SQL injection in ${headerName} header`,
          location: `header:${headerName}`,
          payload: headerValue.match(pattern)?.[0],
        });
        break;
      }
    }
    
    // Check for XSS in headers
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(headerValue)) {
        threats.push({
          type: 'XSS',
          severity: 'high',
          description: `Potential XSS in ${headerName} header`,
          location: `header:${headerName}`,
          payload: headerValue.match(pattern)?.[0],
        });
        break;
      }
    }
  }
  
  const hasCritical = threats.some(t => t.severity === 'critical');
  const hasHigh = threats.some(t => t.severity === 'high');
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (hasCritical) riskLevel = 'critical';
  else if (hasHigh) riskLevel = 'high';
  
  return {
    isSafe: threats.length === 0,
    threats,
    riskLevel,
  };
}

/**
 * Comprehensive security scan of request
 */
export function scanRequest(request: Request): SecurityScanResult {
  const allThreats: SecurityThreat[] = [];
  
  // Scan URL
  const urlScan = scanURL(request.url);
  allThreats.push(...urlScan.threats);
  
  // Scan headers
  const headerScan = scanHeaders(request.headers);
  allThreats.push(...headerScan.threats);
  
  // Determine overall risk
  const hasCritical = allThreats.some(t => t.severity === 'critical');
  const hasHigh = allThreats.some(t => t.severity === 'high');
  const hasMedium = allThreats.some(t => t.severity === 'medium');
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (hasCritical) riskLevel = 'critical';
  else if (hasHigh) riskLevel = 'high';
  else if (hasMedium) riskLevel = 'medium';
  
  return {
    isSafe: allThreats.length === 0,
    threats: allThreats,
    riskLevel,
  };
}



