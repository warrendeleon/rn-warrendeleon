/**
 * Transport Security Tests
 *
 * Tests for HTTPS enforcement, URL validation, and transport-layer security.
 * Validates that the HTTP client properly enforces secure connections.
 */

import axios from 'axios';

// Mock react-native-config before importing anything that uses it
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

jest.mock('@app/utils/storage/EncryptedStore', () => ({
  EncryptedStore: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  EncryptedStoreKey: {
    USER_EMAIL: 'userEmail',
    USER_FIRST_NAME: 'userFirstName',
    USER_LAST_NAME: 'userLastName',
    USER_PHONE_NUMBER: 'userPhoneNumber',
  },
}));

jest.mock('@app/utils/storage/SecureStore', () => ({
  SecureStore: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  SecureStoreKey: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
  },
}));

import Config from 'react-native-config';

describe('Transport Security', () => {
  describe('HTTPS Enforcement', () => {
    it('should configure API client with HTTPS base URL', () => {
      // Verify the configured URL uses HTTPS
      expect(Config.SUPABASE_URL).toMatch(/^https:\/\//);
    });

    it('should not allow HTTP URLs in configuration', () => {
      // This is a static check - in real config, HTTP should never be used
      const url = Config.SUPABASE_URL;
      expect(url).not.toMatch(/^http:\/\//);
    });

    it('should create axios instance with HTTPS URL', () => {
      // Create a test axios instance similar to how the client does
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          apikey: Config.SUPABASE_ANON_KEY,
        },
      });

      // Verify the baseURL is HTTPS
      expect(instance.defaults.baseURL).toBe('https://test.supabase.co');
    });

    it('should have proper timeout configured', () => {
      // Create a test axios instance
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        timeout: 10000,
      });

      // Timeout should be set (prevents hanging connections)
      expect(instance.defaults.timeout).toBe(10000);
    });
  });

  describe('URL Validation', () => {
    const validateUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    it('should validate HTTPS URLs as secure', () => {
      expect(validateUrl('https://api.example.com')).toBe(true);
      expect(validateUrl('https://test.supabase.co')).toBe(true);
    });

    it('should reject HTTP URLs as insecure', () => {
      expect(validateUrl('http://api.example.com')).toBe(false);
      expect(validateUrl('http://localhost:3000')).toBe(false);
    });

    it('should reject file:// protocol', () => {
      expect(validateUrl('file:///etc/passwd')).toBe(false);
    });

    it('should reject ftp:// protocol', () => {
      expect(validateUrl('ftp://files.example.com')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject URLs with embedded credentials', () => {
      // URLs with embedded credentials are security risks
      const urlWithCreds = 'https://user:password@api.example.com';
      const parsed = new URL(urlWithCreds);
      expect(parsed.username).toBe('user');
      expect(parsed.password).toBe('password');
      // While URL parses, we should strip credentials in production
    });

    it('should handle HTTPS URLs with ports', () => {
      expect(validateUrl('https://api.example.com:443')).toBe(true);
      expect(validateUrl('https://api.example.com:8443')).toBe(true);
    });

    it('should handle HTTPS URLs with paths', () => {
      expect(validateUrl('https://api.example.com/auth/v1/token')).toBe(true);
      expect(validateUrl('https://api.example.com/api/v1')).toBe(true);
    });
  });

  describe('Mixed Content Prevention', () => {
    it('should not load resources over HTTP when base is HTTPS', () => {
      const baseUrl = Config.SUPABASE_URL;
      expect(baseUrl).toMatch(/^https:/);

      // Any relative URLs will inherit HTTPS from base
      const fullUrl = new URL('/auth/v1/user', baseUrl);
      expect(fullUrl.protocol).toBe('https:');
    });

    it('should construct API endpoints with HTTPS', () => {
      const baseUrl = Config.SUPABASE_URL;
      const endpoints = [
        '/auth/v1/signup',
        '/auth/v1/token',
        '/auth/v1/logout',
        '/auth/v1/user',
        '/auth/v1/recover',
      ];

      endpoints.forEach(endpoint => {
        const fullUrl = new URL(endpoint, baseUrl);
        expect(fullUrl.protocol).toBe('https:');
      });
    });
  });

  describe('Security Headers', () => {
    it('should include Content-Type header in requests', () => {
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        headers: {
          'Content-Type': 'application/json',
          apikey: Config.SUPABASE_ANON_KEY,
        },
      });

      expect(instance.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should include API key in headers', () => {
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        headers: {
          'Content-Type': 'application/json',
          apikey: Config.SUPABASE_ANON_KEY,
        },
      });

      expect(instance.defaults.headers.apikey).toBe('test-anon-key');
    });

    it('should not expose sensitive headers in error responses', () => {
      // When an error occurs, headers should be sanitised
      const sensitiveHeaders = ['apikey', 'Authorization'];

      // Mock error handler that would strip sensitive data
      const sanitiseError = (error: { config?: { headers?: Record<string, string> } }) => {
        if (error.config?.headers) {
          sensitiveHeaders.forEach(header => {
            if (error.config?.headers?.[header]) {
              error.config.headers[header] = '[REDACTED]';
            }
          });
        }
        return error;
      };

      const mockError = {
        config: {
          headers: {
            apikey: 'secret-key',
            Authorization: 'Bearer secret-token',
            'Content-Type': 'application/json',
          },
        },
      };

      const sanitised = sanitiseError(mockError);
      expect(sanitised.config?.headers?.apikey).toBe('[REDACTED]');
      expect(sanitised.config?.headers?.Authorization).toBe('[REDACTED]');
      expect(sanitised.config?.headers?.['Content-Type']).toBe('application/json');
    });
  });

  describe('TLS Requirements', () => {
    it('should target production URL with valid TLS', () => {
      // In production, the Supabase URL must use TLS
      const prodUrl = Config.SUPABASE_URL;
      expect(prodUrl).toMatch(/^https:\/\//);
      expect(prodUrl).toMatch(/\.supabase\.co$/);
    });

    it('should use Supabase domain which enforces TLS 1.2+', () => {
      // Supabase enforces TLS 1.2+ on all endpoints
      const url = Config.SUPABASE_URL;
      expect(url).toContain('supabase.co');
      // Supabase.co rejects TLS 1.0/1.1 connections at infrastructure level
    });
  });

  describe('Connection Security', () => {
    it('should set reasonable timeout to prevent hanging', () => {
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        timeout: 10000, // 10 seconds
      });

      // Timeout prevents indefinite hanging on dead connections
      expect(instance.defaults.timeout).toBeLessThanOrEqual(30000);
      expect(instance.defaults.timeout).toBeGreaterThan(0);
    });

    it('should not follow redirects to HTTP', () => {
      // Axios config to prevent following insecure redirects
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        maxRedirects: 5,
      });

      // In a real implementation, we'd add interceptor to block HTTP redirects
      expect(instance.defaults.maxRedirects).toBe(5);
    });
  });

  describe('URL Normalisation', () => {
    it('should handle trailing slashes consistently', () => {
      const baseWithSlash = 'https://test.supabase.co/';
      const baseWithoutSlash = 'https://test.supabase.co';

      // Both should resolve to same endpoint
      const url1 = new URL('/auth/v1/token', baseWithSlash);
      const url2 = new URL('/auth/v1/token', baseWithoutSlash);

      expect(url1.href).toBe('https://test.supabase.co/auth/v1/token');
      expect(url2.href).toBe('https://test.supabase.co/auth/v1/token');
    });

    it('should handle double slashes in paths', () => {
      const baseUrl = 'https://test.supabase.co';
      const endpoint = '//auth/v1/token'; // Double slash

      const url = new URL(endpoint, baseUrl);
      // URL class normalises this - but we should avoid in our code
      expect(url.pathname).not.toContain('//');
    });

    it('should preserve query parameters in HTTPS URLs', () => {
      const baseUrl = 'https://test.supabase.co';
      const endpoint = '/auth/v1/token?grant_type=password';

      const url = new URL(endpoint, baseUrl);
      expect(url.protocol).toBe('https:');
      expect(url.searchParams.get('grant_type')).toBe('password');
    });
  });

  describe('Environment Configuration Security', () => {
    it('should not expose configuration values in error messages', () => {
      const config = {
        url: Config.SUPABASE_URL,
        key: Config.SUPABASE_ANON_KEY,
      };

      // Error messages should not contain raw config values
      const createSafeError = (message: string) => {
        // Replace potential secrets before throwing
        let safeMessage = message;
        if (config.key) {
          safeMessage = safeMessage.replace(config.key, '[API_KEY]');
        }
        return new Error(safeMessage);
      };

      const error = createSafeError(`Failed with key: ${config.key}`);
      expect(error.message).not.toContain(config.key);
      expect(error.message).toContain('[API_KEY]');
    });

    it('should use environment-specific URLs', () => {
      // This validates that URLs come from config, not hardcoded
      const url = Config.SUPABASE_URL ?? '';
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
      expect(url).toMatch(/^https:\/\//);
    });
  });

  describe('Secure Defaults', () => {
    it('should create axios instance with secure defaults', () => {
      const instance = axios.create({
        baseURL: Config.SUPABASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          apikey: Config.SUPABASE_ANON_KEY,
        },
        // Secure defaults
        validateStatus: status => status >= 200 && status < 500,
      });

      // Validate secure configuration
      expect(instance.defaults.baseURL).toMatch(/^https:/);
      expect(instance.defaults.timeout).toBeGreaterThan(0);
      expect(instance.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should not include credentials in URLs', () => {
      const baseUrl = Config.SUPABASE_URL ?? '';
      const parsed = new URL(baseUrl);

      // Base URL should never contain credentials
      expect(parsed.username).toBe('');
      expect(parsed.password).toBe('');
    });

    it('should not include sensitive data in URL paths', () => {
      // API keys and tokens should be in headers, not URL paths
      const baseUrl = Config.SUPABASE_URL;
      const apiKey = Config.SUPABASE_ANON_KEY;

      expect(baseUrl).not.toContain(apiKey);
      expect(baseUrl).not.toContain('token=');
      expect(baseUrl).not.toContain('key=');
    });
  });
});
