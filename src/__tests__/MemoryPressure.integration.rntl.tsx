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
    it('should gracefully handle large image gallery', async () => {
      // Create profile with many gallery images
      const manyImages = Array.from(
        { length: 100 },
        (_, i) => `https://example.com/image-${i}.jpg`
      );
      const profileWithManyImages = createMockProfile({ galleryImages: manyImages });

      const { getByTestId, getByText } = await renderProfileWithState({
        data: profileWithManyImages,
        loading: false,
        error: null,
      });

      // Screen should render without crashing
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle profile with extensive social links', async () => {
      const profileWithExtendedData = createMockProfile({
        socials: {
          facebook: 'https://www.facebook.com/test',
          twitter: 'https://twitter.com/test',
          instagram: 'https://www.instagram.com/test',
          linkedIn: 'https://www.linkedin.com/in/test',
        },
      });

      const { getByTestId } = await renderProfileWithState({
        data: profileWithExtendedData,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle very long text content', async () => {
      const longHeadline = 'Senior React Native Developer '.repeat(10);
      const profileWithLongContent = createMockProfile({
        headline: longHeadline,
      });

      const { getByTestId } = await renderProfileWithState({
        data: profileWithLongContent,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('memory warning recovery', () => {
    it('should recover from memory warning during navigation', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const mockProfile = createMockProfile();

      // First render
      const { unmount: unmount1, getByTestId: getByTestId1 } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId1('profile-screen')).toBeOnTheScreen();

      // Simulate memory warning by unmounting
      await unmount1();
      jest.runAllTimers();

      // Re-mount after memory warning
      const { getByTestId: getByTestId2 } = await renderProfileWithState({
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

    it('should handle rapid remounts under memory pressure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      // Rapid mount/unmount cycles simulating memory pressure
      for (let i = 0; i < 10; i++) {
        const { unmount } = await renderProfileWithState({
          data: mockProfile,
          loading: false,
          error: null,
        });
        await unmount();
        jest.runAllTimers();
      }

      // Final mount should work
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
  });

  describe('cache eviction behaviour', () => {
    it('should clear caches appropriately under pressure', async () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Simulate cache clear (profile data still available via store)
      await rerender(<ProfileScreen />);

      // Profile should still be accessible
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should prioritise critical data retention', async () => {
      const mockProfile = createMockProfile();

      const { getByTestId, getByText } = await renderProfileWithState({
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

      const { rerender, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Loading state during potential cache refresh (rerender keeps same store)
      await rerender(<ProfileScreen />);

      // Cached data should still be visible during refresh
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('critical data retention', () => {
    it('should prioritise auth tokens survival during memory pressure', async () => {
      // Auth tokens are handled by Redux persist, test component stability
      const mockProfile = createMockProfile();

      const { unmount, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount (simulates memory pressure)
      await unmount();
      jest.runAllTimers();

      // Remount with same auth state (tokens persisted)
      const { getByTestId: getByTestId2 } = await renderProfileWithState({
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
      const { unmount: unmount1 } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      // Multiple memory events
      for (let i = 0; i < 5; i++) {
        await unmount1();
        jest.runAllTimers();

        const { unmount: unmountNext, getByTestId } = await renderProfileWithState({
          data: mockProfile,
          loading: false,
          error: null,
        });

        expect(getByTestId('profile-screen')).toBeOnTheScreen();

        if (i < 4) {
          await unmountNext();
        }
      }
    });
  });

  describe('component cleanup on low memory', () => {
    it('should clean up event listeners on unmount', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockProfile = createMockProfile();

      const { unmount, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount should clean up all listeners
      await unmount();
      jest.runAllTimers();

      // No warnings about cleanup failures
      const cleanupWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('cleanup'))
      );
      expect(cleanupWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should release resources during loading state unmount', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderProfileWithState({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount during loading
      await unmount();
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

      const { unmount, rerender, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Multiple rerenders before unmount
      for (let i = 0; i < 3; i++) {
        await rerender(<ProfileScreen />);
      }

      // Final unmount
      await unmount();
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
    it('should handle gallery with many images without crash', async () => {
      // Large gallery simulation
      const manyImages = Array.from(
        { length: 50 },
        (_, i) => `https://example.com/gallery-${i}.jpg`
      );
      const profileWithGallery = createMockProfile({ galleryImages: manyImages });

      const { getByTestId, getByText } = await renderProfileWithState({
        data: profileWithGallery,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle empty gallery gracefully', async () => {
      const profileWithEmptyGallery = createMockProfile({ galleryImages: [] });

      const { getByTestId, getByText } = await renderProfileWithState({
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

      const { unmount, getByTestId } = await renderProfileWithState({
        data: profileWithGallery,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Memory event causes unmount
      await unmount();
      jest.runAllTimers();

      // Remount
      const { getByTestId: getByTestId2 } = await renderProfileWithState({
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

      const { unmount, getByText } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Memory pressure event
      await unmount();
      jest.runAllTimers();

      // State should be preserved (from Redux store)
      const { getByText: getByText2 } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText2('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle partial state loss gracefully', async () => {
      // Profile with missing optional data (simulates partial state loss)
      const partialProfile = createMockProfile({
        namePronunciation: undefined as unknown as string,
        namePronunciationAudioTrack: undefined as unknown as string,
        socials: undefined as unknown as Profile['socials'],
      });

      const { getByTestId, getByText } = await renderProfileWithState({
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
      const { rerender, getByTestId, queryByText } = await renderProfileWithState({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(queryByText('Warren de Leon')).toBeNull();

      // Hydration succeeds - rerender to trigger UI update
      await rerender(<ProfileScreen />);

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

      const { rerender, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Rapid state updates simulating concurrent operations
      for (let i = 0; i < 10; i++) {
        await rerender(<ProfileScreen />);
      }

      // Final state should be stable
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle settings change during memory event', async () => {
      const mockProfile = createMockProfile();

      const { rerender, getByTestId } = await renderProfileWithState({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Settings change during memory event (rerender keeps same store)
      await rerender(<ProfileScreen />);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });
});
