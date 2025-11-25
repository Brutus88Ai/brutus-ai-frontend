/**
 * Security Configuration für Brutus AI Frontend
 * Enthält alle sicherheitsrelevanten Einstellungen
 */

// Content Security Policy
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://generativelanguage.googleapis.com https://www.googleapis.com https://api.openai.com https://graph.facebook.com https://www.instagram.com https://www.tiktok.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
};

// API Key Validation
export const validateApiKey = (key, type = 'gemini') => {
  if (!key || typeof key !== 'string') return false;
  
  const patterns = {
    gemini: /^AIza[0-9A-Za-z-_]{35}$/,
    openai: /^sk-[A-Za-z0-9]{48}$/,
  };
  
  return patterns[type]?.test(key) || false;
};

// Sanitize User Input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[^\w\s\-.,!?@äöüÄÖÜß]/g, '') // Allow only safe characters
    .trim()
    .slice(0, 5000); // Max length
};

// Rate Limiting Configuration
export const RATE_LIMITS = {
  api_calls: {
    max: 100,
    window: 60 * 1000, // 1 minute
  },
  content_generation: {
    max: 10,
    window: 60 * 60 * 1000, // 1 hour
  },
  login_attempts: {
    max: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
};

// Secure Storage Keys
export const STORAGE_KEYS = {
  API_KEY: 'brutus_api_key_encrypted',
  USER_PREFERENCES: 'brutus_user_prefs',
  SESSION_TOKEN: 'brutus_session',
};

// Encrypt sensitive data before localStorage
export const encryptData = (data) => {
  try {
    // Simple Base64 encoding (in production use crypto.subtle.encrypt)
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Decrypt sensitive data from localStorage
export const decryptData = (encrypted) => {
  try {
    return JSON.parse(atob(encrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// XSS Protection
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF Token Generator
export const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Validate URLs
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_) {
    return false;
  }
};

// Security Headers für Vercel/Production
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Allowed Origins for CORS
export const ALLOWED_ORIGINS = [
  'https://brutus-ai.de',
  'https://www.brutus-ai.de',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Check if origin is allowed
export const isAllowedOrigin = (origin) => {
  return ALLOWED_ORIGINS.includes(origin);
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    valid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasSpecialChar: !hasSpecialChar,
    }
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Prevent SQL Injection (for future backend)
export const sanitizeSQLInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/['";\\]/g, '');
};

// Log security events
export const logSecurityEvent = (eventType, details) => {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    details: details,
    userAgent: navigator.userAgent,
  };
  
  // In production: send to security monitoring service
  console.log('[SECURITY]', event);
};

// Session timeout (15 minutes)
export const SESSION_TIMEOUT = 15 * 60 * 1000;

// Check session validity
export const isSessionValid = (lastActivity) => {
  const now = Date.now();
  return (now - lastActivity) < SESSION_TIMEOUT;
};
