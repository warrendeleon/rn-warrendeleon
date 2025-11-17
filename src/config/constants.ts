/**
 * Application-wide constants
 */

/**
 * Allowed domains for WebView content
 *
 * Only these domains (and their subdomains) can be loaded in WebView.
 * Enforces HTTPS-only and prevents XSS/phishing attacks.
 *
 * Security: All URLs must use HTTPS protocol
 */
export const ALLOWED_WEBVIEW_DOMAINS = [
  // Professional networks
  'linkedin.com',
  'www.linkedin.com',

  // Social media
  'facebook.com',
  'www.facebook.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'instagram.com',
  'www.instagram.com',

  // Developer platforms
  'github.com',
  'www.github.com',
] as const;

/**
 * Allowed domains for PDF content
 *
 * Only these domains (and their subdomains) can be loaded in PDF viewer.
 * Enforces HTTPS-only and prevents loading of malicious PDF files.
 *
 * Security: All URLs must use HTTPS protocol
 */
export const ALLOWED_PDF_DOMAINS = [
  // Personal portfolio
  'warrendeleon.com',
  'www.warrendeleon.com',

  // Document hosting (if needed in future)
  // 'drive.google.com',
  // 'dropbox.com',
] as const;
