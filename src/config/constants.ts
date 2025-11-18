/**
 * Application-wide constants
 */

/**
 * Minimum duration to display splash screen (in milliseconds)
 * Ensures branding visibility even with fast network connections
 */
export const SPLASH_MINIMUM_DURATION = 1500;

/**
 * Carousel image height ratio relative to window height
 * Used for consistent image sizing across different screen sizes
 */
export const CAROUSEL_HEIGHT_RATIO = 0.4;

/**
 * Minimum touch target size for interactive elements
 * iOS Human Interface Guidelines: 44×44 points minimum
 * Android Material Design: 48×48 dp minimum
 * Using iOS standard for consistency across platforms
 */
export const TOUCH_TARGET_SIZE = { width: 44, height: 44 } as const;

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
