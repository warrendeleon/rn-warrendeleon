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
