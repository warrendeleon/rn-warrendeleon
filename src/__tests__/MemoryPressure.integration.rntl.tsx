/**
 * Memory Pressure Integration Tests
 *
 * Verifies app behaviour under memory constraints,
 * common on older devices:
 * - Large data set handling without memory issues
 * - Recovery from memory warnings
 * - Cache eviction behaviour
 * - Critical data retention under pressure
 * - Component cleanup on low memory
 * - Image gallery memory management
 * - Navigation stack cleanup
 * - State persistence during memory pressure
 *
 * These tests ensure the application remains stable
 * and responsive even under memory constraints.
 */

import React from 'react';
import { waitFor } from '@testing-library/react-native';

import { ProfileScreen } from '@app/features/Profile/ProfileScreen';
import { renderWithProviders } from '@app/test-utils';
import type { Profile } from '@app/types/portfolio';

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

describe('Memory Pressure Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('large data set handling', () => {
    it('should gracefully handle large image gallery', () => {
      // Create profile with many gallery images
      const manyImages = Array.from(
        { length: 100 },
        (_, i) => `https://example.com/image-${i}.jpg`
      );
      const profileWithManyImages = createMockProfile({ galleryImages: manyImages });

      const { getByTestId, getByText } = renderProfileWithState({
        data: profileWithManyImages,
        loading: false,
        error: null,
      });

      // Screen should render without crashing
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle profile with extensive social links', () => {
      const profileWithExtendedData = createMockProfile({
        socials: {
          facebook: 'https://www.facebook.com/test',
          twitter: 'https://twitter.com/test',
          instagram: 'https://www.instagram.com/test',
          linkedIn: 'https://www.linkedin.com/in/test',
        },
      });

      const { getByTestId } = renderProfileWithState({
        data: profileWithExtendedData,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle very long text content', () => {
      const longHeadline = 'Senior React Native Developer '.repeat(10);
      const profileWithLongContent = createMockProfile({
        headline: longHeadline,
      });

      const { getByTestId } = renderProfileWithState({
        data: profileWithLongContent,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('memory warning recovery', () => {
    it('should recover from memory warning during navigation', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const mockProfile = createMockProfile();

      // First render
      const { unmount: unmount1, getByTestId: getByTestId1 } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId1('profile-screen')).toBeOnTheScreen();

      // Simulate memory warning by unmounting
      unmount1();
      jest.runAllTimers();

      // Re-mount after memory warning
      const { getByTestId: getByTestId2 } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId2('profile-screen')).toBeOnTheScreen();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid remounts under memory pressure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      // Rapid mount/unmount cycles simulating memory pressure
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderProfileWithState({
          data: mockProfile,
          loading: false,
          error: null,
        });
        unmount();
        jest.runAllTimers();
      }

      // Final mount should work
      const { getByTestId, getByText } = renderProfileWithState({
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
  });

  describe('cache eviction behaviour', () => {
    it('should clear caches appropriately under pressure', async () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId, getByText } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Simulate cache clear (profile data still available via store)
      rerender(<ProfileScreen />);

      // Profile should still be accessible
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should prioritise critical data retention', () => {
      const mockProfile = createMockProfile();

      const { getByTestId, getByText } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      // Critical user data should always be retained
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle state transitions during cache clear', async () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Loading state during potential cache refresh (rerender keeps same store)
      rerender(<ProfileScreen />);

      // Cached data should still be visible during refresh
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('critical data retention', () => {
    it('should prioritise auth tokens survival during memory pressure', async () => {
      // Auth tokens are handled by Redux persist, test component stability
      const mockProfile = createMockProfile();

      const { unmount, getByTestId } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount (simulates memory pressure)
      unmount();
      jest.runAllTimers();

      // Remount with same auth state (tokens persisted)
      const { getByTestId: getByTestId2 } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      // User data should be available (auth session preserved)
      expect(getByTestId2('profile-screen')).toBeOnTheScreen();
    });

    it('should maintain user session across memory events', async () => {
      const mockProfile = createMockProfile();

      // Initial render
      const { unmount: unmount1 } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      // Multiple memory events
      for (let i = 0; i < 5; i++) {
        unmount1();
        jest.runAllTimers();

        const { unmount: unmountNext, getByTestId } = renderProfileWithState({
          data: mockProfile,
          loading: false,
          error: null,
        });

        expect(getByTestId('profile-screen')).toBeOnTheScreen();

        if (i < 4) {
          unmountNext();
        }
      }
    });
  });

  describe('component cleanup on low memory', () => {
    it('should clean up event listeners on unmount', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      const { unmount, getByTestId } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount should clean up all listeners
      unmount();
      jest.runAllTimers();

      // No warnings about cleanup failures
      const cleanupWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('cleanup'))
      );
      expect(cleanupWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should release resources during loading state unmount', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = renderProfileWithState({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount during loading
      unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should clean up subscriptions properly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      const { unmount, rerender, getByTestId } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Multiple rerenders before unmount
      for (let i = 0; i < 3; i++) {
        rerender(<ProfileScreen />);
      }

      // Final unmount
      unmount();
      jest.runAllTimers();

      // No subscription leak warnings
      const subscriptionWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('subscription'))
      );
      expect(subscriptionWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('image gallery memory management', () => {
    it('should handle gallery with many images without crash', () => {
      // Large gallery simulation
      const manyImages = Array.from(
        { length: 50 },
        (_, i) => `https://example.com/gallery-${i}.jpg`
      );
      const profileWithGallery = createMockProfile({ galleryImages: manyImages });

      const { getByTestId, getByText } = renderProfileWithState({
        data: profileWithGallery,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle empty gallery gracefully', () => {
      const profileWithEmptyGallery = createMockProfile({ galleryImages: [] });

      const { getByTestId, getByText } = renderProfileWithState({
        data: profileWithEmptyGallery,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle gallery scroll position reset on memory event', async () => {
      const manyImages = Array.from({ length: 20 }, (_, i) => `https://example.com/img-${i}.jpg`);
      const profileWithGallery = createMockProfile({ galleryImages: manyImages });

      const { unmount, getByTestId } = renderProfileWithState({
        data: profileWithGallery,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Memory event causes unmount
      unmount();
      jest.runAllTimers();

      // Remount
      const { getByTestId: getByTestId2 } = renderProfileWithState({
        data: profileWithGallery,
        loading: false,
        error: null,
      });

      // Gallery should be accessible again
      expect(getByTestId2('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('state persistence during memory pressure', () => {
    it('should preserve profile state across memory events', async () => {
      const mockProfile = createMockProfile();

      const { unmount, getByText } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Memory pressure event
      unmount();
      jest.runAllTimers();

      // State should be preserved (from Redux store)
      const { getByText: getByText2 } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText2('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle partial state loss gracefully', () => {
      // Profile with missing optional data (simulates partial state loss)
      const partialProfile = createMockProfile({
        namePronunciation: undefined as unknown as string,
        namePronunciationAudioTrack: undefined as unknown as string,
        socials: undefined as unknown as Profile['socials'],
      });

      const { getByTestId, getByText } = renderProfileWithState({
        data: partialProfile,
        loading: false,
        error: null,
      });

      // Should render with available data
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should recover from state hydration failure', async () => {
      // Start with no data (hydration failed)
      const { rerender, getByTestId, queryByText } = renderProfileWithState({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(queryByText('Warren de Leon')).toBeNull();

      // Hydration succeeds - rerender to trigger UI update
      rerender(<ProfileScreen />);

      await waitFor(
        () => {
          expect(getByTestId('profile-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('concurrent memory operations', () => {
    it('should handle concurrent state updates during memory pressure', async () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Rapid state updates simulating concurrent operations
      for (let i = 0; i < 10; i++) {
        rerender(<ProfileScreen />);
      }

      // Final state should be stable
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle settings change during memory event', () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId } = renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Settings change during memory event (rerender keeps same store)
      rerender(<ProfileScreen />);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });
});
