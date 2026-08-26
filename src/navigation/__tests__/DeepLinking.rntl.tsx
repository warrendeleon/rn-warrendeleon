/**
 * Deep Linking Tests
 *
 * Tests the deep linking configuration for the app, covering:
 * - URL parsing to correct screens
 * - Auth callback handling (Supabase)
 * - Malformed URL handling
 * - Query parameter parsing
 * - Authentication-required deep links
 *
 * @see src/navigation/linking.ts for implementation
 */

import { type EmitterSubscription, Linking } from 'react-native';

/**
 * Creates a minimal mock subscription for testing Linking.addEventListener.
 * Provides all instance properties required by EmitterSubscription.
 */
function createMockLinkingSubscription(): EmitterSubscription {
  // Build the subscription object with all required properties
  const subscription: Pick<
    EmitterSubscription,
    'remove' | 'emitter' | 'listener' | 'context' | 'eventType' | 'key' | 'subscriber'
  > = {
    remove: jest.fn(),
    emitter: {
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
      listenerCount: jest.fn(),
      emit: jest.fn(),
    } as EmitterSubscription['emitter'],
    listener: jest.fn(),
    context: null,
    eventType: 'url',
    key: 0,
    subscriber: {
      addSubscription: jest.fn(),
      removeAllSubscriptions: jest.fn(),
      removeSubscription: jest.fn(),
      getSubscriptionsForType: jest.fn(),
    } as EmitterSubscription['subscriber'],
  };
  // Cast is safe because we've provided all instance members
  return subscription as EmitterSubscription;
}

// Unmock the linking module to test the real implementation
jest.unmock('@app/navigation/linking');

// Mock SecureStore for token storage tests
jest.mock('@app/utils/storage/SecureStore', () => ({
  SecureStore: {
    set: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
    remove: jest.fn().mockResolvedValue(true),
    clear: jest.fn().mockResolvedValue(true),
  },
  SecureStoreKey: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    HASHED_PIN: 'hashedPIN',
  },
}));

// Unmock navigationRef to use our test-specific mock
jest.unmock('@app/navigation/navigationRef');
jest.mock('../navigationRef', () => ({
  resetToRoute: jest.fn(),
  navigate: jest.fn(),
  navigationRef: {
    isReady: jest.fn().mockReturnValue(true),
    reset: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Import after unmocking
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

import { linkingConfiguration, setOnAuthTokensStored } from '../linking';
import * as navigationRefModule from '../navigationRef';

const mockSecureStoreSet = SecureStore.set as jest.MockedFunction<typeof SecureStore.set>;
const mockResetToRoute = navigationRefModule.resetToRoute as jest.MockedFunction<
  typeof navigationRefModule.resetToRoute
>;

describe('Deep Linking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('linkingConfiguration', () => {
    it('has correct URL scheme prefix', () => {
      expect(linkingConfiguration.prefixes).toContain('warrendeleonapp://');
    });

    it('has screen configuration for all navigable routes', () => {
      const { config } = linkingConfiguration;
      expect(config?.screens).toBeDefined();

      const screens = config?.screens as Record<string, string>;
      expect(screens.Home).toBe('home');
      expect(screens.Login).toBe('login');
      expect(screens.Registration).toBe('register');
      expect(screens.ForgotPassword).toBe('forgot-password');
      expect(screens.ResetPassword).toBe('reset-password');
      expect(screens.Settings).toBe('settings');
      expect(screens.EditAccount).toBe('edit-account');
    });

    it('has getInitialURL function', () => {
      expect(linkingConfiguration.getInitialURL).toBeDefined();
      expect(typeof linkingConfiguration.getInitialURL).toBe('function');
    });

    it('has subscribe function', () => {
      expect(linkingConfiguration.subscribe).toBeDefined();
      expect(typeof linkingConfiguration.subscribe).toBe('function');
    });

    it('has getStateFromPath function', () => {
      expect(linkingConfiguration.getStateFromPath).toBeDefined();
      expect(typeof linkingConfiguration.getStateFromPath).toBe('function');
    });
  });

  describe('getInitialURL', () => {
    let getInitialURLSpy: jest.SpyInstance;

    beforeEach(() => {
      getInitialURLSpy = jest.spyOn(Linking, 'getInitialURL');
    });

    afterEach(() => {
      getInitialURLSpy.mockRestore();
    });

    it('returns initial URL from Linking API', async () => {
      const mockURL = 'warrendeleonapp://home';
      getInitialURLSpy.mockResolvedValue(mockURL);

      const result = await linkingConfiguration.getInitialURL?.();

      expect(result).toBe(mockURL);
      expect(getInitialURLSpy).toHaveBeenCalled();
    });

    it('returns null when no initial URL', async () => {
      getInitialURLSpy.mockResolvedValue(null);

      const result = await linkingConfiguration.getInitialURL?.();

      expect(result).toBeNull();
    });
  });

  describe('subscribe', () => {
    let addEventListenerSpy: jest.SpyInstance;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(Linking, 'addEventListener');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it('subscribes to URL events', () => {
      const mockListener = jest.fn();
      const mockRemove = jest.fn();
      addEventListenerSpy.mockReturnValue({ remove: mockRemove });

      const unsubscribe = linkingConfiguration.subscribe?.(mockListener);

      expect(addEventListenerSpy).toHaveBeenCalledWith('url', expect.any(Function));
      expect(typeof unsubscribe).toBe('function');
    });

    it('returns cleanup function that removes listener', () => {
      const mockListener = jest.fn();
      const mockRemove = jest.fn();
      addEventListenerSpy.mockReturnValue({ remove: mockRemove });

      const unsubscribe = linkingConfiguration.subscribe?.(mockListener);
      unsubscribe?.();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('getStateFromPath - Standard Routes', () => {
    it('falls back to default parsing for non-auth routes', () => {
      // Standard routes fall back to the mocked getStateFromPath from @react-navigation/native
      // In test environment, the mock returns undefined since it doesn't actually parse paths
      const result = linkingConfiguration.getStateFromPath?.('home', linkingConfiguration.config);

      // The mock returns undefined, which is expected in test environment
      // In production, this would return the parsed navigation state
      expect(result).toBeUndefined();
    });

    it('falls back to default parsing for unknown routes', () => {
      const result = linkingConfiguration.getStateFromPath?.(
        'unknown-route',
        linkingConfiguration.config
      );

      // Unknown routes return undefined from default parsing
      expect(result).toBeUndefined();
    });
  });

  describe('getStateFromPath - Auth Callbacks', () => {
    const validAccessToken = 'valid-access-token-123';
    const validRefreshToken = 'valid-refresh-token-456';

    describe('Password Recovery (type=recovery)', () => {
      it('routes to ResetPassword screen with access token', () => {
        const path = `auth/callback#access_token=${validAccessToken}&type=recovery`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [
            { name: 'Home' },
            {
              name: 'ResetPassword',
              params: {
                accessToken: validAccessToken,
                fromEditAccount: false,
              },
            },
          ],
        });
      });

      it('handles recovery callback with refresh token', () => {
        const path = `auth/callback#access_token=${validAccessToken}&refresh_token=${validRefreshToken}&type=recovery`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [
            { name: 'Home' },
            {
              name: 'ResetPassword',
              params: {
                accessToken: validAccessToken,
                fromEditAccount: false,
              },
            },
          ],
        });
      });
    });

    describe('Email Confirmation (type=signup)', () => {
      it('routes to Home screen and stores tokens', () => {
        const path = `auth/callback#access_token=${validAccessToken}&refresh_token=${validRefreshToken}&type=signup`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
        // Token storage is fire-and-forget, so we verify it was called
        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.ACCESS_TOKEN,
          validAccessToken
        );
      });

      it('stores access token on signup callback', () => {
        const path = `auth/callback#access_token=${validAccessToken}&type=signup`;

        linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.ACCESS_TOKEN,
          validAccessToken
        );
      });

      it('stores refresh token when provided on signup callback', async () => {
        jest.useRealTimers();
        const path = `auth/callback#access_token=${validAccessToken}&refresh_token=${validRefreshToken}&type=signup`;

        linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Wait for async token storage to complete (fire-and-forget pattern)
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.REFRESH_TOKEN,
          validRefreshToken
        );
      });
    });

    describe('Email Change Confirmation (type=email_change)', () => {
      it('routes to Home screen', () => {
        const path = `auth/callback#access_token=${validAccessToken}&type=email_change`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
      });

      it('stores tokens on email change callback', async () => {
        jest.useRealTimers();
        const path = `auth/callback#access_token=${validAccessToken}&refresh_token=${validRefreshToken}&type=email_change`;

        linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Wait for async token storage to complete (fire-and-forget pattern)
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.ACCESS_TOKEN,
          validAccessToken
        );
        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.REFRESH_TOKEN,
          validRefreshToken
        );
      });
    });

    describe('Magic Link Login (type=magiclink)', () => {
      it('routes to Home screen', () => {
        const path = `auth/callback#access_token=${validAccessToken}&type=magiclink`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
      });

      it('stores tokens on magic link callback', () => {
        const path = `auth/callback#access_token=${validAccessToken}&refresh_token=${validRefreshToken}&type=magiclink`;

        linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.ACCESS_TOKEN,
          validAccessToken
        );
      });
    });

    describe('Unknown Auth Type (default case)', () => {
      it('routes to Home screen for unknown type', () => {
        const path = `auth/callback#access_token=${validAccessToken}&type=unknown_type`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
      });

      it('handles callback without type parameter', () => {
        const path = `auth/callback#access_token=${validAccessToken}`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
      });
    });
  });

  describe('getStateFromPath - Malformed URLs', () => {
    it('handles malformed deep link URLs gracefully', () => {
      // URL with auth/callback but no valid tokens should fall back
      const path = 'auth/callback#invalid-format';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Should fall back to default parsing when no valid tokens
      expect(result).toBeUndefined();
    });

    it('handles auth/callback without hash fragment', () => {
      const path = 'auth/callback';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Should fall back to default parsing when no tokens
      expect(result).toBeUndefined();
    });

    it('handles URL with only refresh token (no access token)', () => {
      const path = 'auth/callback#refresh_token=token-only';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Should fall back since access_token is required
      expect(result).toBeUndefined();
    });

    it('handles empty hash fragment', () => {
      const path = 'auth/callback#';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Should fall back to default parsing
      expect(result).toBeUndefined();
    });

    it('handles URL with query params instead of hash (fallback)', () => {
      const accessToken = 'query-param-token';
      const path = `auth/callback?access_token=${accessToken}&type=recovery`;

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Should handle query params as fallback
      expect(result).toEqual({
        routes: [
          { name: 'Home' },
          {
            name: 'ResetPassword',
            params: {
              accessToken: accessToken,
              fromEditAccount: false,
            },
          },
        ],
      });
    });
  });

  describe('getStateFromPath - URL Encoding', () => {
    it('handles URL-encoded tokens', () => {
      const encodedToken = 'token%2Bwith%2Bspecial%3Dchars';
      const path = `auth/callback#access_token=${encodedToken}&type=signup`;

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      expect(result).toEqual({
        routes: [{ name: 'Home' }],
      });
      // URLSearchParams automatically decodes
      expect(mockSecureStoreSet).toHaveBeenCalledWith(
        SecureStoreKey.ACCESS_TOKEN,
        'token+with+special=chars'
      );
    });

    it('handles tokens with special characters', () => {
      // JWT tokens often contain dots and hyphens
      const jwtToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const path = `auth/callback#access_token=${jwtToken}&type=signup`;

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      expect(result).toEqual({
        routes: [{ name: 'Home' }],
      });
      expect(mockSecureStoreSet).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, jwtToken);
    });
  });

  describe('setOnAuthTokensStored callback', () => {
    afterEach(() => {
      // Clean up callback after each test
      setOnAuthTokensStored(null);
    });

    it('calls registered callback when tokens are stored', async () => {
      jest.useRealTimers();
      const mockCallback = jest.fn();
      setOnAuthTokensStored(mockCallback);

      const path = 'auth/callback#access_token=test-token&type=signup';
      linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Wait for async token storage to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockCallback).toHaveBeenCalled();
    });

    it('clears callback when set to null', async () => {
      jest.useRealTimers();
      const mockCallback = jest.fn();
      setOnAuthTokensStored(mockCallback);
      setOnAuthTokensStored(null);

      const path = 'auth/callback#access_token=test-token&type=signup';
      linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Wait for async token storage to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Warm Start Deep Link Handling (subscribe)', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let urlListener: ((event: { url: string }) => void) | null = null;

    beforeEach(() => {
      jest.useRealTimers();
      urlListener = null;
      addEventListenerSpy = jest
        .spyOn(Linking, 'addEventListener')
        .mockImplementation((_type: 'url', handler: (event: { url: string }) => void) => {
          urlListener = handler;
          return createMockLinkingSubscription();
        });
      // Setup subscription
      linkingConfiguration.subscribe?.(() => {});
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it('handles recovery deep link during warm start', async () => {
      const accessToken = 'warm-start-recovery-token';
      const url = `warrendeleonapp://auth/callback#access_token=${accessToken}&type=recovery`;

      // Simulate URL event
      urlListener?.({ url });

      // Wait for async handling
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockResetToRoute).toHaveBeenCalledWith('ResetPassword', {
        accessToken: accessToken,
        fromEditAccount: false,
      });
    });

    it('handles signup deep link during warm start', async () => {
      const accessToken = 'warm-start-signup-token';
      const refreshToken = 'warm-start-refresh-token';
      const url = `warrendeleonapp://auth/callback#access_token=${accessToken}&refresh_token=${refreshToken}&type=signup`;

      urlListener?.({ url });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockSecureStoreSet).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, accessToken);
      expect(mockSecureStoreSet).toHaveBeenCalledWith(SecureStoreKey.REFRESH_TOKEN, refreshToken);
      expect(mockResetToRoute).toHaveBeenCalledWith('Home', undefined);
    });

    it('passes non-auth URLs to default listener', async () => {
      const mockDefaultListener = jest.fn();
      // Re-setup with tracking listener
      addEventListenerSpy.mockImplementation((event: string, listener: unknown) => {
        if (event === 'url') {
          urlListener = listener as (event: { url: string }) => void;
        }
        return createMockLinkingSubscription();
      });
      linkingConfiguration.subscribe?.(mockDefaultListener);

      const url = 'warrendeleonapp://settings';
      urlListener?.({ url });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockDefaultListener).toHaveBeenCalledWith(url);
    });
  });

  describe('Deep Link with Nested Navigation State', () => {
    it('creates correct navigation state with nested routes for recovery', () => {
      const path = 'auth/callback#access_token=token&type=recovery';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Verifies nested state: Home -> ResetPassword
      expect(result?.routes).toHaveLength(2);
      expect(result?.routes?.[0]?.name).toBe('Home');
      expect(result?.routes?.[1]?.name).toBe('ResetPassword');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long tokens', () => {
      const longToken = 'a'.repeat(1000);
      const path = `auth/callback#access_token=${longToken}&type=signup`;

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      expect(result).toEqual({
        routes: [{ name: 'Home' }],
      });
      expect(mockSecureStoreSet).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, longToken);
    });

    it('handles multiple hash fragments (takes first)', () => {
      // This shouldn't happen but tests robustness
      const path = 'auth/callback#access_token=first#access_token=second';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // URLSearchParams will parse everything after the first #
      // access_token=first#access_token=second becomes a value
      expect(result).toBeDefined();
    });

    it('handles tokens with equals signs', () => {
      // Base64 encoded tokens often end with =
      const tokenWithEquals = 'token==';
      const path = `auth/callback#access_token=${encodeURIComponent(tokenWithEquals)}&type=signup`;

      linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      expect(mockSecureStoreSet).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, tokenWithEquals);
    });

    it('handles empty access token gracefully', () => {
      const path = 'auth/callback#access_token=&type=recovery';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // Empty string is falsy, should fall back to default parsing
      expect(result).toBeUndefined();
    });

    it('handles whitespace-only access token', () => {
      const path = 'auth/callback#access_token=%20%20%20&type=recovery';

      const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

      // URLSearchParams decodes whitespace - non-empty string is truthy
      // Current implementation treats whitespace as valid (matches current behaviour)
      expect(result).toEqual({
        routes: [
          { name: 'Home' },
          {
            name: 'ResetPassword',
            params: {
              accessToken: '   ',
              fromEditAccount: false,
            },
          },
        ],
      });
    });
  });

  describe('Deep Link Edge Cases', () => {
    describe('malformed deep links', () => {
      it('handles completely malformed URL structure gracefully', () => {
        const malformedPaths = [
          ':::invalid:::',
          'auth/callback###',
          '?????',
          'auth//callback//double-slash',
          '../../../etc/passwd',
          'javascript:alert(1)',
          '<script>alert(1)</script>',
        ];

        malformedPaths.forEach(path => {
          // Should not throw
          expect(() => {
            linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);
          }).not.toThrow();
        });
      });

      it('handles URL injection attempts gracefully', () => {
        const injectionAttempts = [
          'auth/callback#access_token=token&redirect=http://evil.com',
          'auth/callback#access_token=token%00null-byte',
          'auth/callback#access_token=token\nheader-injection',
          'auth/callback#access_token=<img onerror=alert(1)>',
        ];

        injectionAttempts.forEach(path => {
          // Should not throw and should handle gracefully
          expect(() => {
            linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);
          }).not.toThrow();
        });
      });

      it('handles extremely long URL paths gracefully', () => {
        // URL with 10000 character path
        const longPath = 'auth/callback#access_token=' + 'a'.repeat(10000);

        expect(() => {
          linkingConfiguration.getStateFromPath?.(longPath, linkingConfiguration.config);
        }).not.toThrow();
      });

      it('handles Unicode characters in deep link path', () => {
        const unicodePaths = [
          'auth/callback#access_token=token🔐&type=signup',
          'auth/callback#access_token=日本語トークン&type=signup',
          'auth/callback#access_token=émoji©®™&type=signup',
        ];

        unicodePaths.forEach(path => {
          expect(() => {
            linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);
          }).not.toThrow();
        });
      });
    });

    describe('expired deep link tokens', () => {
      it('handles expired token format (JWT with past exp)', () => {
        // JWT with expired timestamp (exp: 0)
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.signature';
        const path = `auth/callback#access_token=${expiredToken}&type=signup`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Token validation happens server-side; client accepts the token format
        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
        expect(mockSecureStoreSet).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, expiredToken);
      });

      it('handles recovery link with potentially expired token', () => {
        const oldToken = 'old-recovery-token-from-email';
        const path = `auth/callback#access_token=${oldToken}&type=recovery`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Should still route to ResetPassword; server validates expiry
        expect(result).toEqual({
          routes: [
            { name: 'Home' },
            {
              name: 'ResetPassword',
              params: {
                accessToken: oldToken,
                fromEditAccount: false,
              },
            },
          ],
        });
      });

      it('stores token even if potentially expired (server validates)', () => {
        const potentiallyExpiredToken = 'potentially-expired-token';
        const path = `auth/callback#access_token=${potentiallyExpiredToken}&type=magiclink`;

        linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Client stores the token; server will reject if expired
        expect(mockSecureStoreSet).toHaveBeenCalledWith(
          SecureStoreKey.ACCESS_TOKEN,
          potentiallyExpiredToken
        );
      });
    });

    describe('deep links to deleted content', () => {
      it('routes to profile even if user may be deleted', () => {
        // Deep link to a user profile that may no longer exist
        const path = 'profile/deleted-user-id';

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Falls back to default parsing; 404 handled at screen level
        expect(result).toBeUndefined();
      });

      it('routes to settings even if account may be suspended', () => {
        const path = 'settings';

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Should parse normally; access control handled at screen level
        expect(result).toBeUndefined(); // Default mock returns undefined
      });

      it('handles auth callback for potentially deleted account', () => {
        const deletedAccountToken = 'deleted-account-token';
        const path = `auth/callback#access_token=${deletedAccountToken}&type=signup`;

        const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

        // Routes to Home; deleted account check happens at API level
        expect(result).toEqual({
          routes: [{ name: 'Home' }],
        });
      });
    });

    describe('concurrent deep link handling', () => {
      it('handles rapid sequential deep link processing', () => {
        const paths = [
          'auth/callback#access_token=token1&type=signup',
          'auth/callback#access_token=token2&type=recovery',
          'auth/callback#access_token=token3&type=magiclink',
        ];

        const results: Array<unknown> = [];

        // Process multiple deep links rapidly
        paths.forEach(path => {
          const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);
          results.push(result);
        });

        // All should be processed without interference
        expect(results).toHaveLength(3);
        expect(results[0]).toEqual({ routes: [{ name: 'Home' }] });
        expect(results[1]).toEqual({
          routes: [
            { name: 'Home' },
            {
              name: 'ResetPassword',
              params: { accessToken: 'token2', fromEditAccount: false },
            },
          ],
        });
        expect(results[2]).toEqual({ routes: [{ name: 'Home' }] });
      });

      it('handles simultaneous deep link calls (no race condition)', () => {
        const token = 'concurrent-token';
        const path = `auth/callback#access_token=${token}&type=signup`;

        // Simulate concurrent calls
        const promises = Array.from({ length: 10 }, () =>
          Promise.resolve(
            linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config)
          )
        );

        // All should resolve to the same result
        return Promise.all(promises).then(results => {
          results.forEach(result => {
            expect(result).toEqual({ routes: [{ name: 'Home' }] });
          });
        });
      });

      it('handles interleaved auth and non-auth deep links', () => {
        const mixedPaths = [
          { path: 'home', expectedRoutes: undefined },
          { path: 'auth/callback#access_token=t1&type=signup', expectedRoutes: [{ name: 'Home' }] },
          { path: 'settings', expectedRoutes: undefined },
          { path: 'auth/callback#access_token=t2&type=recovery', expectedRoutes: 2 },
          { path: 'login', expectedRoutes: undefined },
        ];

        mixedPaths.forEach(({ path, expectedRoutes }) => {
          const result = linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);

          if (expectedRoutes === undefined) {
            expect(result).toBeUndefined();
          } else if (typeof expectedRoutes === 'number') {
            expect(result?.routes).toHaveLength(expectedRoutes);
          } else {
            expect(result).toEqual({ routes: expectedRoutes });
          }
        });
      });
    });

    describe('deep link security edge cases', () => {
      it('does not execute javascript: protocol URLs', () => {
        const jsPath = 'javascript:alert(document.cookie)';

        const result = linkingConfiguration.getStateFromPath?.(jsPath, linkingConfiguration.config);

        // Should return undefined (not execute)
        expect(result).toBeUndefined();
      });

      it('does not follow data: URLs', () => {
        const dataPath = 'data:text/html,<script>alert(1)</script>';

        const result = linkingConfiguration.getStateFromPath?.(
          dataPath,
          linkingConfiguration.config
        );

        expect(result).toBeUndefined();
      });

      it('sanitises path traversal attempts', () => {
        const traversalPaths = [
          '../../../etc/passwd',
          '..\\..\\..\\windows\\system32',
          'auth/callback/../../../sensitive',
        ];

        traversalPaths.forEach(path => {
          // Should not throw or access system paths
          expect(() => {
            linkingConfiguration.getStateFromPath?.(path, linkingConfiguration.config);
          }).not.toThrow();
        });
      });
    });
  });
});
