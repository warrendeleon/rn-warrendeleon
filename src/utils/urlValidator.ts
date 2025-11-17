/**
 * URL validation utility for WebView security
 *
 * Validates URLs against a whitelist of allowed domains and enforces HTTPS-only.
 * Prevents XSS attacks, phishing, and malicious content loading.
 */

/**
 * Check if a URL is allowed based on domain whitelist
 *
 * @param url - The URL to validate
 * @param allowedDomains - Array of allowed domain names
 * @returns true if URL is allowed, false otherwise
 *
 * Security rules:
 * - Only HTTPS protocol allowed
 * - Domain must exactly match or be a subdomain of an allowed domain
 * - Invalid URLs are rejected
 */
export const isUrlAllowed = (url: string, allowedDomains: readonly string[]): boolean => {
  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS protocol for security
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Extract hostname and normalize to lowercase
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check if hostname matches allowed domains (exact match or subdomain)
    return allowedDomains.some(domain => {
      const normalizedDomain = domain.toLowerCase();
      return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`);
    });
  } catch {
    // Invalid URL format - reject
    return false;
  }
};
