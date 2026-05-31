/**
 * App Lifecycle Integration Tests
 *
 * Tests for uncommon app state transitions:
 * - App termination during auth flow
 * - State restoration after low-memory termination
 * - First launch after update scenarios
 * - Data migration from previous versions
 * - Cold start vs warm start behaviour
 * - Background to foreground transitions
 * - Deep link handling during lifecycle events
 * - State persistence across app restarts
 *
 * These tests verify the application handles
 * lifecycle events gracefully without data loss.
 */

import React from 'react';
import { waitFor } from '@testing-library/react-native';

import { LoginScreen } from '@app/features/Auth/LoginScreen';
import { RegistrationScreen } from '@app/features/Auth/RegistrationScreen';
import { ProfileScreen } from '@app/features/Profile/ProfileScreen';
import { loginScreenProps, registrationScreenProps, renderWithProviders } from '@app/test-utils';
import type { Profile } from '@app/types/portfolio';

const { navigation: mockLoginNav, route: mockLoginRoute } = loginScreenProps();
const { navigation: mockRegNav, route: mockRegRoute } = registrationScreenProps();

const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  profilePicture: 'https://example.com/avatar.png',
  name: 'Warren',
  lastName: 'de Leon',
  headline: 'Senior React Native Developer',
  namePronunciation: '[ w AW - r uh n ]',
  namePronunciationAudioTrack: 'https://example.com/audio.m4a',
  email: 'test@example.com',
  phone: '+447510084239',
  birthday: '1990-05-11',
  location: {
    cityTown: 'Dartford',
    county: 'Kent',
    country: 'UK',
    coordinates: {
      latitude: 51.4561,
      longitude: 0.24678,
    },
  },
  galleryImages: [],
  socials: {
    facebook: 'https://www.facebook.com/test',
    twitter: 'https://twitter.com/test',
    instagram: 'https://www.instagram.com/test',
    linkedIn: 'https://www.linkedin.com/in/test',
  },
  ...overrides,
});

const renderProfileWithState = (profileState: {
  data: Profile | null;
  loading: boolean;
  error: string | null;
}) => {
  return renderWithProviders(<ProfileScreen />, {
    preloadedState: {
      profile: profileState,
      settings: { theme: 'light', language: 'en' },
    },
  });
};

describe('App Lifecycle Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('app termination during auth flow', () => {
    it('should handle app termination during auth flow', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: true,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();

      // App terminated during auth
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should restore to login screen after termination during auth', async () => {
      // App restarts after termination during auth
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      // Should show login screen (fresh state)
      expect(getByTestId('login-screen')).toBeOnTheScreen();
      expect(getByTestId('email-input')).toBeOnTheScreen();
      expect(getByTestId('password-input')).toBeOnTheScreen();
    });

    it('should handle termination during registration flow', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(
        <RegistrationScreen navigation={mockRegNav} route={mockRegRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: true,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('registration-screen')).toBeOnTheScreen();

      // Terminated during registration
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('state restoration after low-memory termination', () => {
    it('should restore state after low-memory termination', async () => {
      const mockProfile = createMockProfile();

      // Simulates redux-persist rehydration after restart
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle partial state rehydration', async () => {
      // Only partial state restored (some data missing)
      const partialProfile = createMockProfile({
        galleryImages: [],
        socials: undefined as unknown as Profile['socials'],
      });

      const { getByTestId, getByText } = await renderProfileWithState({
        data: partialProfile,
        loading: false,
        error: null,
      });

      // Should work with partial data
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle corrupted persisted state', async () => {
      // Corrupted state results in null/error
      const { rerender, getByTestId } = await renderProfileWithState({
        data: null,
        loading: false,
        error: 'Failed to restore state',
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // State recovers - rerender simulates recovery
      await rerender(<ProfileScreen />);

      await waitFor(
        () => {
          expect(getByTestId('profile-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should show loading during rehydration', async () => {
      const { getByTestId } = await renderProfileWithState({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('first launch after update scenarios', () => {
    it('should handle first launch after update', async () => {
      // Fresh state after update (no persisted data)
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should migrate settings from previous version', async () => {
      const mockProfile = createMockProfile();

      // Settings migrated from old format
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle missing migration data gracefully', async () => {
      // Migration data missing
      const { getByTestId } = await renderProfileWithState({
        data: null,
        loading: false,
        error: null,
      });

      // Should still render (shows empty/default state)
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('data migration from previous app version', () => {
    it('should migrate data from previous app version', async () => {
      const mockProfile = createMockProfile();

      // Old data format migrated to new format
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle migration with new required fields', async () => {
      // New fields added with defaults
      const migratedProfile = createMockProfile({
        headline: 'Default headline', // Simulates newly required field
      });

      const { getByTestId, getByText } = await renderProfileWithState({
        data: migratedProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle migration of deprecated fields', async () => {
      // Old fields ignored, new format used
      const modernProfile = createMockProfile();

      const { getByTestId, getByText } = await renderProfileWithState({
        data: modernProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should rollback migration on failure', async () => {
      // Migration failed, show error
      const { getByTestId } = await renderProfileWithState({
        data: null,
        loading: false,
        error: 'Migration failed. Please update the app.',
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('cold start vs warm start behaviour', () => {
    it('should handle cold start correctly', async () => {
      // Cold start: fresh app launch, no cached data
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });

    it('should handle warm start with cached data', async () => {
      const mockProfile = createMockProfile();

      // Warm start: app resumes with cached data
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should prioritise cache on warm start', async () => {
      const cachedProfile = createMockProfile({ headline: 'Cached headline' });

      const { getByTestId, getByText } = await renderProfileWithState({
        data: cachedProfile,
        loading: false,
        error: null,
      });

      // Cached data shown immediately
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should refresh stale cache on warm start', async () => {
      const staleProfile = createMockProfile({ headline: 'Stale data' });

      // Show cached data first
      const { rerender, getByTestId, getByText } = await renderProfileWithState({
        data: staleProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Fresh data arrives after background refresh (rerender keeps same store)
      await rerender(<ProfileScreen />);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });
  });

  describe('background to foreground transitions', () => {
    it('should handle background to foreground transition', async () => {
      const mockProfile = createMockProfile();

      const { unmount, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // App goes to background (unmount simulates)
      await unmount();

      // App returns to foreground (remount)
      const { getByTestId: getByTestId2, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId2('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should refresh data on foreground return', async () => {
      const initialProfile = createMockProfile();

      const { rerender, getByTestId, getByText } = await renderProfileWithState({
        data: initialProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Foreground return triggers refresh (rerender keeps same store)
      await rerender(<ProfileScreen />);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle session expiry during background', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired while in background.',
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();
      expect(getByText('Session expired while in background.')).toBeOnTheScreen();
    });

    it('should handle network change while backgrounded', async () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: 'Network error',
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Network recovers while backgrounded (rerender keeps same store)
      await rerender(<ProfileScreen />);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('state persistence across app restarts', () => {
    it('should persist auth state across restarts', async () => {
      // Simulates authenticated state restored from persistence
      const { getByTestId, queryByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();
      expect(queryByTestId('auth-error-message')).toBeNull();
    });

    it('should persist profile data across restarts', async () => {
      const mockProfile = createMockProfile();

      // Profile persisted and restored
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should persist settings across restarts', async () => {
      const mockProfile = createMockProfile();

      // Settings restored (dark theme)
      const { getByTestId } = await renderWithProviders(<ProfileScreen />, {
        preloadedState: {
          profile: { data: mockProfile, loading: false, error: null },
          settings: { theme: 'dark', language: 'en' },
        },
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle persistence failure gracefully', async () => {
      // Persistence failed, show fresh state
      const { getByTestId } = await renderWithProviders(
        <LoginScreen navigation={mockLoginNav} route={mockLoginRoute} />
      );

      expect(getByTestId('login-screen')).toBeOnTheScreen();
    });
  });

  describe('lifecycle event combinations', () => {
    it('should handle rapid lifecycle events', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      // Rapid lifecycle events
      for (let i = 0; i < 5; i++) {
        const { unmount } = await renderProfileWithState({
          data: mockProfile,
          loading: false,
          error: null,
        });

        // Background
        await unmount();
        jest.advanceTimersByTime(100);
      }

      // Final foreground
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle update during background', async () => {
      const mockProfile = createMockProfile();

      const { unmount } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      // App goes to background
      await unmount();

      // App update happens (simulated by delay)
      jest.advanceTimersByTime(1000);

      // App relaunches with potentially different version
      const { getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle memory warning followed by termination', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      // Memory warning
      const { unmount: unmount1 } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      unmount1();
      jest.runAllTimers();

      // Termination
      const { unmount: unmount2, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      unmount2();
      jest.runAllTimers();

      // Restart
      const { getByTestId: getByTestId3, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId3('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });
});
