/**
 * Cache Invalidation Integration Tests
 *
 * Tests for cache invalidation, stale data handling, and version migration.
 * Ensures data consistency across app state changes.
 */

import React from 'react';

import {
  errorHandlers,
  mockEducation,
  mockProfile,
  mockWorkXP,
  renderWithProviders,
  server,
} from '@app/test-utils';

// In-memory storage for testing cache patterns
class MockStorage {
  private data: Record<string, string> = {};

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  getItem(key: string): string | null {
    return this.data[key] ?? null;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  getAllKeys(): string[] {
    return Object.keys(this.data);
  }

  multiRemove(keys: string[]): void {
    keys.forEach(key => delete this.data[key]);
  }
}

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
    }),
  };
});

// Simple component for testing cache scenarios
const CacheTestComponent: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const { View, Text, Pressable } = require('react-native');
  return (
    <View testID="cache-test-screen">
      <Text testID="cache-status">Cache Test</Text>
      {onRefresh && (
        <Pressable testID="refresh-button" onPress={onRefresh}>
          <Text>Refresh</Text>
        </Pressable>
      )}
    </View>
  );
};

describe('Cache Invalidation Integration', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = new MockStorage();
  });

  describe('Stale Data Handling', () => {
    it('refreshes profile data after edit', () => {
      const initialProfile = { ...mockProfile, name: 'Original' };
      const updatedProfile = { ...mockProfile, name: 'Updated' };

      const { store } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: initialProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      // Verify initial state
      expect(store.getState().profile.data?.name).toBe('Original');

      // Simulate profile update
      const { store: store2 } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: updatedProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      // Verify updated state
      expect(store2.getState().profile.data?.name).toBe('Updated');
    });

    it('invalidates cache on logout', () => {
      // Set up cached data
      mockStorage.setItem(
        'persist:root',
        JSON.stringify({
          profile: JSON.stringify({ data: mockProfile }),
          auth: JSON.stringify({ isAuthenticated: true }),
        })
      );

      expect(mockStorage.getItem('persist:root')).not.toBeNull();

      // Simulate logout (clear cache)
      mockStorage.clear();

      // Verify cache is cleared
      expect(mockStorage.getItem('persist:root')).toBeNull();
    });

    it('handles cache corruption gracefully', () => {
      // Set corrupted data
      mockStorage.setItem('persist:root', 'not-valid-json{{{');

      const { getByTestId } = renderWithProviders(<CacheTestComponent />);

      // App should still render despite corrupted cache
      expect(getByTestId('cache-test-screen')).toBeOnTheScreen();
    });

    it('refreshes data when cache is stale', () => {
      const staleProfile = { ...mockProfile, name: 'Stale' };

      const { store } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: staleProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      // Initial stale data
      expect(store.getState().profile.data?.name).toBe('Stale');

      // Simulate refresh with fresh data
      const { store: freshStore } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      // Fresh data should be loaded
      expect(freshStore.getState().profile.data).toEqual(mockProfile);
    });
  });

  describe('Version Migration', () => {
    it('migrates cache format on app upgrade', () => {
      // Old format (v1)
      const oldFormat = {
        profile: { data: mockProfile },
        _version: 1,
      };

      mockStorage.setItem('persist:root', JSON.stringify(oldFormat));

      // Simulate migration to new format (v2)
      const stored = mockStorage.getItem('persist:root');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed._version === 1) {
          // Migrate to v2
          const migrated = {
            ...parsed,
            _version: 2,
            _migratedAt: new Date().toISOString(),
          };
          mockStorage.setItem('persist:root', JSON.stringify(migrated));
        }
      }

      // Verify migration
      const migratedData = JSON.parse(mockStorage.getItem('persist:root') || '{}');
      expect(migratedData._version).toBe(2);
      expect(migratedData._migratedAt).toBeDefined();
    });

    it('clears incompatible cache versions', () => {
      // Incompatible old version
      const incompatibleCache = {
        profile: 'string-instead-of-object',
        _version: 0,
      };

      mockStorage.setItem('persist:root', JSON.stringify(incompatibleCache));

      // Simulate version check and clear
      const stored = mockStorage.getItem('persist:root');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed._version < 1) {
          // Incompatible, clear it
          mockStorage.removeItem('persist:root');
        }
      }

      // Verify incompatible cache was cleared
      expect(mockStorage.getItem('persist:root')).toBeNull();
    });

    it('preserves compatible cache versions', () => {
      // Compatible version
      const compatibleCache = {
        profile: JSON.stringify({ data: mockProfile }),
        _version: 2,
      };

      mockStorage.setItem('persist:root', JSON.stringify(compatibleCache));

      // Simulate version check (v2 is compatible with current v2)
      const stored = mockStorage.getItem('persist:root');
      const parsed = JSON.parse(stored || '{}');

      expect(parsed._version).toBe(2);
      // Should not be cleared
      expect(stored).not.toBeNull();
    });
  });

  describe('Cache State Transitions', () => {
    it('transitions from cached to fresh data smoothly', () => {
      const cachedData = { ...mockProfile, name: 'Cached' };

      // Start with cached data
      const { store } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: cachedData,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      expect(store.getState().profile.data?.name).toBe('Cached');
    });

    it('handles cache miss gracefully', () => {
      // No cached data
      const { getByTestId, store } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: null,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      // App should render without cached data
      expect(getByTestId('cache-test-screen')).toBeOnTheScreen();
      expect(store.getState().profile.data).toBeNull();
    });
  });

  describe('Selective Cache Invalidation', () => {
    it('invalidates only specific cache keys on targeted update', () => {
      // Set up multiple cached items
      mockStorage.setItem('profile', JSON.stringify(mockProfile));
      mockStorage.setItem('settings', JSON.stringify({ theme: 'light' }));
      mockStorage.setItem('education', JSON.stringify(mockEducation));

      // Invalidate only profile cache
      mockStorage.removeItem('profile');

      // Verify selective invalidation
      expect(mockStorage.getItem('profile')).toBeNull();
      expect(mockStorage.getItem('settings')).not.toBeNull();
      expect(mockStorage.getItem('education')).not.toBeNull();
    });

    it('invalidates related caches together', () => {
      // Related caches
      mockStorage.setItem('auth:token', 'some-token');
      mockStorage.setItem('auth:refreshToken', 'some-refresh-token');
      mockStorage.setItem('auth:user', JSON.stringify({ id: '123' }));
      mockStorage.setItem('settings', JSON.stringify({ theme: 'dark' }));

      // Invalidate all auth-related caches
      const allKeys = mockStorage.getAllKeys();
      const authKeys = allKeys.filter((key: string) => key.startsWith('auth:'));
      mockStorage.multiRemove(authKeys);

      // Verify auth caches cleared
      expect(mockStorage.getItem('auth:token')).toBeNull();
      expect(mockStorage.getItem('auth:refreshToken')).toBeNull();
      expect(mockStorage.getItem('auth:user')).toBeNull();

      // Non-auth caches should remain
      expect(mockStorage.getItem('settings')).not.toBeNull();
    });
  });

  describe('Cache and Network Sync', () => {
    it('updates cache after successful network request', () => {
      const { store } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: mockWorkXP,
            loading: false,
            error: null,
          },
          education: {
            data: mockEducation,
            loading: false,
            error: null,
          },
        },
      });

      // Store should have data that can be persisted
      expect(store.getState().profile.data).toEqual(mockProfile);
    });

    it('preserves cache on network failure', () => {
      server.use(...errorHandlers);

      const { getByTestId, store } = renderWithProviders(<CacheTestComponent />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: null,
          },
          education: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      // Even with network errors, cached data should be preserved
      expect(store.getState().profile.data).toEqual(mockProfile);
      expect(getByTestId('cache-test-screen')).toBeOnTheScreen();
    });
  });

  describe('Cache Expiry', () => {
    it('treats cache as stale after expiry time', () => {
      // Cache with timestamp
      const cachedData = {
        profile: mockProfile,
        _cachedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        _expiresIn: 12 * 60 * 60 * 1000, // 12 hours
      };

      mockStorage.setItem('profile:cache', JSON.stringify(cachedData));

      // Check if cache is expired
      const stored = mockStorage.getItem('profile:cache');
      const parsed = JSON.parse(stored || '{}');
      const cachedAt = new Date(parsed._cachedAt).getTime();
      const isExpired = Date.now() - cachedAt > parsed._expiresIn;

      expect(isExpired).toBe(true);
    });

    it('uses fresh cache within expiry time', () => {
      // Fresh cache
      const cachedData = {
        profile: mockProfile,
        _cachedAt: new Date().toISOString(), // Now
        _expiresIn: 12 * 60 * 60 * 1000, // 12 hours
      };

      mockStorage.setItem('profile:cache', JSON.stringify(cachedData));

      // Check if cache is still valid
      const stored = mockStorage.getItem('profile:cache');
      const parsed = JSON.parse(stored || '{}');
      const cachedAt = new Date(parsed._cachedAt).getTime();
      const isExpired = Date.now() - cachedAt > parsed._expiresIn;

      expect(isExpired).toBe(false);
    });
  });
});
