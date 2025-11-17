/**
 * Tests for URL validation utility
 */
import { isUrlAllowed } from '../urlValidator';

describe('isUrlAllowed', () => {
  const allowedDomains = ['example.com', 'www.example.com', 'github.com', 'linkedin.com'] as const;

  describe('HTTPS Protocol Enforcement', () => {
    it('allows HTTPS URLs', () => {
      expect(isUrlAllowed('https://example.com', allowedDomains)).toBe(true);
    });

    it('rejects HTTP URLs', () => {
      expect(isUrlAllowed('http://example.com', allowedDomains)).toBe(false);
    });

    it('rejects FTP URLs', () => {
      expect(isUrlAllowed('ftp://example.com', allowedDomains)).toBe(false);
    });

    it('rejects file:// URLs', () => {
      expect(isUrlAllowed('file:///etc/passwd', allowedDomains)).toBe(false);
    });

    it('rejects javascript: URLs', () => {
      expect(isUrlAllowed('javascript:alert(1)', allowedDomains)).toBe(false);
    });
  });

  describe('Domain Whitelisting', () => {
    it('allows exact domain match', () => {
      expect(isUrlAllowed('https://example.com', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://github.com', allowedDomains)).toBe(true);
    });

    it('allows subdomains of whitelisted domains', () => {
      expect(isUrlAllowed('https://blog.example.com', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://api.github.com', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://gist.github.com', allowedDomains)).toBe(true);
    });

    it('allows nested subdomains', () => {
      expect(isUrlAllowed('https://api.v2.example.com', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://cdn.assets.github.com', allowedDomains)).toBe(true);
    });

    it('rejects non-whitelisted domains', () => {
      expect(isUrlAllowed('https://evil.com', allowedDomains)).toBe(false);
      expect(isUrlAllowed('https://malicious.net', allowedDomains)).toBe(false);
    });

    it('rejects domain that ends with whitelisted domain but is not subdomain', () => {
      // example.com is whitelisted, but notexample.com should be rejected
      expect(isUrlAllowed('https://notexample.com', allowedDomains)).toBe(false);
      expect(isUrlAllowed('https://fakegithub.com', allowedDomains)).toBe(false);
    });

    it('is case-insensitive for domain matching', () => {
      expect(isUrlAllowed('https://EXAMPLE.COM', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://Example.Com', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://API.GITHUB.COM', allowedDomains)).toBe(true);
    });
  });

  describe('URL Path and Query Parameters', () => {
    it('allows URLs with paths', () => {
      expect(isUrlAllowed('https://example.com/path/to/resource', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://github.com/user/repo', allowedDomains)).toBe(true);
    });

    it('allows URLs with query parameters', () => {
      expect(isUrlAllowed('https://example.com?foo=bar&baz=qux', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://linkedin.com/in/profile?ref=home', allowedDomains)).toBe(true);
    });

    it('allows URLs with fragments', () => {
      expect(isUrlAllowed('https://example.com#section', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://github.com/user/repo#readme', allowedDomains)).toBe(true);
    });

    it('allows URLs with paths, query params, and fragments', () => {
      expect(isUrlAllowed('https://example.com/path?foo=bar#section', allowedDomains)).toBe(true);
    });
  });

  describe('Port Numbers', () => {
    it('allows URLs with explicit HTTPS port (443)', () => {
      expect(isUrlAllowed('https://example.com:443', allowedDomains)).toBe(true);
    });

    it('allows URLs with custom ports over HTTPS', () => {
      expect(isUrlAllowed('https://example.com:8443', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://github.com:3000', allowedDomains)).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('rejects malformed URLs', () => {
      expect(isUrlAllowed('not a url', allowedDomains)).toBe(false);
      expect(isUrlAllowed('htp://example.com', allowedDomains)).toBe(false);
      expect(isUrlAllowed('://example.com', allowedDomains)).toBe(false);
    });

    it('rejects empty strings', () => {
      expect(isUrlAllowed('', allowedDomains)).toBe(false);
    });

    it('rejects URLs without protocol', () => {
      expect(isUrlAllowed('example.com', allowedDomains)).toBe(false);
      expect(isUrlAllowed('www.example.com/path', allowedDomains)).toBe(false);
    });
  });

  describe('Special Characters and Encoding', () => {
    it('allows URLs with encoded characters', () => {
      expect(isUrlAllowed('https://example.com/path%20with%20spaces', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://github.com/%E2%9C%93', allowedDomains)).toBe(true);
    });

    it('allows URLs with international domain names', () => {
      // Note: URL constructor handles punycode encoding automatically
      expect(isUrlAllowed('https://example.com/föö', allowedDomains)).toBe(true);
    });
  });

  describe('www Prefix Handling', () => {
    it('treats www.example.com as separate from example.com', () => {
      // Both are in allowedDomains, so both should pass
      expect(isUrlAllowed('https://example.com', allowedDomains)).toBe(true);
      expect(isUrlAllowed('https://www.example.com', allowedDomains)).toBe(true);
    });

    it('allows subdomains of www.example.com if www.example.com is whitelisted', () => {
      expect(isUrlAllowed('https://blog.www.example.com', allowedDomains)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty allowed domains array', () => {
      expect(isUrlAllowed('https://example.com', [])).toBe(false);
    });

    it('handles URLs with authentication info (not recommended but valid)', () => {
      expect(isUrlAllowed('https://user:pass@example.com', allowedDomains)).toBe(true);
    });

    it('handles URLs with IP addresses (should be rejected as not in whitelist)', () => {
      expect(isUrlAllowed('https://192.168.1.1', allowedDomains)).toBe(false);
      expect(isUrlAllowed('https://127.0.0.1:8080', allowedDomains)).toBe(false);
    });

    it('rejects data: URLs', () => {
      expect(isUrlAllowed('data:text/html,<script>alert(1)</script>', allowedDomains)).toBe(false);
    });

    it('rejects blob: URLs', () => {
      expect(isUrlAllowed('blob:https://example.com/123', allowedDomains)).toBe(false);
    });
  });
});
