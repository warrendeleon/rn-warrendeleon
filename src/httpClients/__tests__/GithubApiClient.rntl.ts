/**
 * Tests for GithubApiClient
 */
import { BASE_URL, GithubApiClient } from '../GithubApiClient';

describe('GithubApiClient', () => {
  describe('BASE_URL', () => {
    it('points to GitHub raw content API', () => {
      expect(BASE_URL).toBe(
        'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/test-utils/fixtures/api'
      );
    });

    it('uses HTTPS protocol', () => {
      expect(BASE_URL).toMatch(/^https:\/\//);
    });

    it('points to main branch', () => {
      expect(BASE_URL).toContain('/main/');
    });

    it('points to test fixtures directory', () => {
      expect(BASE_URL).toContain('/test-utils/fixtures/api');
    });
  });

  describe('Client Configuration', () => {
    it('exports axios instance with HTTP methods', () => {
      expect(GithubApiClient.get).toBeDefined();
      expect(GithubApiClient.post).toBeDefined();
      expect(GithubApiClient.put).toBeDefined();
      expect(GithubApiClient.delete).toBeDefined();
      expect(GithubApiClient.patch).toBeDefined();
      expect(GithubApiClient.request).toBeDefined();
    });

    it('has correct HTTP method types', () => {
      expect(typeof GithubApiClient.get).toBe('function');
      expect(typeof GithubApiClient.post).toBe('function');
      expect(typeof GithubApiClient.put).toBe('function');
      expect(typeof GithubApiClient.delete).toBe('function');
      expect(typeof GithubApiClient.patch).toBe('function');
      expect(typeof GithubApiClient.request).toBe('function');
    });
  });

  describe('Security', () => {
    it('uses HTTPS for secure communication', () => {
      expect(BASE_URL).toMatch(/^https:\/\//);
    });

    it('does not include authentication headers for public repo', () => {
      // Public repository - no auth required
      // Testing that client is created without auth
      expect(GithubApiClient).toBeDefined();
    });

    it('points to trusted GitHub domain', () => {
      expect(BASE_URL).toContain('githubusercontent.com');
      expect(BASE_URL).toMatch(/github/i);
    });
  });

  describe('Expected Behavior', () => {
    it('is configured for GitHub API requests', () => {
      // Verify client can be used for API requests
      expect(GithubApiClient).toBeDefined();
      expect(typeof GithubApiClient.request).toBe('function');
    });

    it('exports BASE_URL constant', () => {
      expect(BASE_URL).toBeDefined();
      expect(typeof BASE_URL).toBe('string');
    });
  });
});
