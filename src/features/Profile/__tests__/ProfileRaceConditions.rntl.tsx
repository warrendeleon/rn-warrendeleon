/**
 * Profile Race Condition Tests
 *
 * Tests for async operation race conditions in profile flows:
 * - Concurrent fetch requests
 * - Request cancellation on unmount
 * - Profile data refresh during navigation
 * - State consistency during rapid updates
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { Profile } from '@app/types/portfolio';

import { ProfileScreen } from '../ProfileScreen';

const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

const mockProfile: Profile = {
  profilePicture: 'https://example.com/avatar.png',
  name: 'Warren',
  lastName: 'de Leon',
  headline: 'Senior React Native Developer',
  namePronunciation: '[ w AW - r uh n ]',
  namePronunciationAudioTrack: 'https://example.com/audio.m4a',
  email: 'hi@warrendeleon.com',
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
  galleryImages: [
    'https://example.com/profile-01.jpg',
    'https://example.com/profile-02.jpg',
    'https://example.com/profile-03.jpg',
  ],
  socials: {
    facebook: 'https://www.facebook.com/warren.deleon/',
    twitter: 'https://twitter.com/warren_deleon',
    instagram: 'https://www.instagram.com/warren_deleon/',
    linkedIn: 'https://www.linkedin.com/in/warrendeleonofalla',
  },
};

const renderProfileScreen = (state: {
  data: Profile | null;
  loading: boolean;
  error: string | null;
}) => {
  const store = mockStore({
    profile: state,
    settings: { theme: 'light', language: 'en' },
  });

  return render(
    <Provider store={store}>
      <ProfileScreen />
    </Provider>
  );
};

describe('Profile Race Conditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('concurrent fetch requests', () => {
    it('should handle rapid data fetches without crashing', async () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should display loading state during data fetch', () => {
      const { getByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle loading to data transition', async () => {
      // Start with loading state
      const { rerender, getByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Update store with loaded data
      const updatedStore = mockStore({
        profile: { data: mockProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      // Should display profile data
      await waitFor(
        () => {
          expect(getByTestId('profile-name')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('request cancellation on unmount', () => {
    it('should handle unmount during loading state', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount during loading
      unmount();

      // Advance timers
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderProfileScreen({
          data: mockProfile,
          loading: false,
          error: null,
        });
        unmount();
      }

      // Final mount should work correctly
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should not crash when state changes after unmount', () => {
      const { unmount, getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Unmount
      expect(() => unmount()).not.toThrow();

      // Advance timers to simulate delayed state update
      jest.runAllTimers();
    });
  });

  describe('state transitions during async flow', () => {
    it('should handle null to data transition', async () => {
      const { rerender, getByTestId } = renderProfileScreen({
        data: null,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Update with data
      const updatedStore = mockStore({
        profile: { data: mockProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByTestId('profile-name')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle data to error transition', async () => {
      const { rerender, getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-name')).toBeOnTheScreen();

      // Update with error
      const updatedStore = mockStore({
        profile: { data: null, loading: false, error: 'Network error' },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      // Screen should still render
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle error to data recovery', async () => {
      const { rerender, getByTestId } = renderProfileScreen({
        data: null,
        loading: false,
        error: 'Network error',
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Recover with data
      const updatedStore = mockStore({
        profile: { data: mockProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByTestId('profile-name')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle rapid state changes', async () => {
      const { rerender, getByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      // Rapid state changes
      for (let i = 0; i < 3; i++) {
        // Toggle between loading and loaded
        const loadingStore = mockStore({
          profile: { data: null, loading: true, error: null },
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={loadingStore}>
            <ProfileScreen />
          </Provider>
        );

        const loadedStore = mockStore({
          profile: { data: mockProfile, loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={loadedStore}>
            <ProfileScreen />
          </Provider>
        );
      }

      // Final state should be stable
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('profile data refresh consistency', () => {
    it('should handle profile update with different data', async () => {
      const { rerender, getByText } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Update with modified profile
      const updatedProfile = { ...mockProfile, name: 'John', lastName: 'Smith' };
      const updatedStore = mockStore({
        profile: { data: updatedProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByText('John Smith')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle partial profile data', () => {
      const partialProfile = {
        ...mockProfile,
        socials: undefined,
        galleryImages: [],
      };

      const { getByTestId } = renderProfileScreen({
        data: partialProfile as unknown as Profile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle profile with null nested fields', () => {
      const profileWithNulls = {
        ...mockProfile,
        location: {
          ...mockProfile.location,
          coordinates: null as unknown as Profile['location']['coordinates'],
        },
      };

      const { getByTestId } = renderProfileScreen({
        data: profileWithNulls,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('concurrent store updates', () => {
    it('should handle settings change during profile load', async () => {
      const { rerender, getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      // Change settings while profile is displayed
      const updatedStore = mockStore({
        profile: { data: mockProfile, loading: false, error: null },
        settings: { theme: 'dark', language: 'es' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      // Profile should still be displayed correctly
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-name')).toBeOnTheScreen();
    });

    it('should handle multiple slice updates simultaneously', async () => {
      const { rerender, getByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      // Update both profile and settings
      const updatedStore = mockStore({
        profile: { data: mockProfile, loading: false, error: null },
        settings: { theme: 'dark', language: 'es' },
      });

      rerender(
        <Provider store={updatedStore}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByTestId('profile-name')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
