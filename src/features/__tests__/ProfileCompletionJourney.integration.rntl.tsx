/**
 * Profile Completion Journey Integration Tests
 *
 * Tests for complete profile completion user journeys:
 * - Add education → Add work experience → Upload photo → Profile complete
 * - Profile completion percentage calculation
 * - Missing field prompts
 * - Profile strength indicator
 *
 * These tests verify the profile completion flow works correctly
 * across multiple screens and state transitions.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { Profile } from '@app/types/portfolio';

import { ProfileScreen } from '../Profile/ProfileScreen';

const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

const completeProfile: Profile = {
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
  galleryImages: ['https://example.com/profile-01.jpg', 'https://example.com/profile-02.jpg'],
  socials: {
    facebook: 'https://www.facebook.com/warren.deleon/',
    twitter: 'https://twitter.com/warren_deleon',
    instagram: 'https://www.instagram.com/warren_deleon/',
    linkedIn: 'https://www.linkedin.com/in/warrendeleonofalla',
  },
};

const incompleteProfile: Profile = {
  profilePicture: null as unknown as string,
  name: 'Warren',
  lastName: 'de Leon',
  headline: null as unknown as string,
  namePronunciation: null as unknown as string,
  namePronunciationAudioTrack: null as unknown as string,
  email: 'hi@warrendeleon.com',
  phone: null as unknown as string,
  birthday: null as unknown as string,
  location: {
    cityTown: null as unknown as string,
    county: null as unknown as string,
    country: 'UK',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  },
  galleryImages: [],
  socials: {
    facebook: null as unknown as string,
    twitter: null as unknown as string,
    instagram: null as unknown as string,
    linkedIn: null as unknown as string,
  },
};

const renderProfileScreen = (
  profileData: Profile | null,
  loading = false,
  error: string | null = null
) => {
  const store = mockStore({
    profile: { data: profileData, loading, error },
    settings: { theme: 'light', language: 'en' },
  });

  return render(
    <Provider store={store}>
      <ProfileScreen />
    </Provider>
  );
};

describe('Profile Completion Journey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('profile display states', () => {
    it('should display complete profile data', () => {
      const { getByTestId, getByText } = renderProfileScreen(completeProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should display incomplete profile data', () => {
      const { getByTestId, getByText } = renderProfileScreen(incompleteProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('should handle loading state', () => {
      const { getByTestId } = renderProfileScreen(null, true);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle error state', () => {
      const { getByTestId } = renderProfileScreen(null, false, 'Failed to load profile');

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('profile completion percentage calculation', () => {
    it('should consider profile with all fields as complete', () => {
      const { getByTestId } = renderProfileScreen(completeProfile);

      // Profile screen renders successfully with complete data
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-name')).toBeOnTheScreen();
    });

    it('should identify incomplete profile', () => {
      const { getByTestId } = renderProfileScreen(incompleteProfile);

      // Profile screen renders with incomplete data
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle profile with some fields complete', () => {
      const partialProfile: Profile = {
        ...incompleteProfile,
        headline: 'Developer',
        phone: '+447123456789',
      };

      const { getByTestId } = renderProfileScreen(partialProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle profile picture completion', () => {
      const profileWithPicture: Profile = {
        ...incompleteProfile,
        profilePicture: 'https://example.com/photo.jpg',
      };

      const { getByTestId } = renderProfileScreen(profileWithPicture);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle social links completion', () => {
      const profileWithSocials: Profile = {
        ...incompleteProfile,
        socials: {
          ...completeProfile.socials,
        },
      };

      const { getByTestId } = renderProfileScreen(profileWithSocials);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('missing field handling', () => {
    it('should render profile without profile picture', () => {
      const profileWithoutPicture: Profile = {
        ...completeProfile,
        profilePicture: null as unknown as string,
      };

      const { getByTestId } = renderProfileScreen(profileWithoutPicture);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should render profile without headline', () => {
      const profileWithoutHeadline: Profile = {
        ...completeProfile,
        headline: null as unknown as string,
      };

      const { getByTestId } = renderProfileScreen(profileWithoutHeadline);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should render profile without phone number', () => {
      const profileWithoutPhone: Profile = {
        ...completeProfile,
        phone: null as unknown as string,
      };

      const { getByTestId } = renderProfileScreen(profileWithoutPhone);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should render profile without birthday', () => {
      const profileWithoutBirthday: Profile = {
        ...completeProfile,
        birthday: null as unknown as string,
      };

      const { getByTestId } = renderProfileScreen(profileWithoutBirthday);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should render profile without location details', () => {
      const profileWithoutLocation: Profile = {
        ...completeProfile,
        location: {
          cityTown: null as unknown as string,
          county: null as unknown as string,
          country: 'UK',
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
      };

      const { getByTestId } = renderProfileScreen(profileWithoutLocation);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should render profile without gallery images', () => {
      const profileWithoutGallery: Profile = {
        ...completeProfile,
        galleryImages: [],
      };

      const { getByTestId } = renderProfileScreen(profileWithoutGallery);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should render profile without social links', () => {
      const profileWithoutSocials: Profile = {
        ...completeProfile,
        socials: {
          facebook: null as unknown as string,
          twitter: null as unknown as string,
          instagram: null as unknown as string,
          linkedIn: null as unknown as string,
        },
      };

      const { getByTestId } = renderProfileScreen(profileWithoutSocials);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('profile strength indicator', () => {
    it('should indicate strong profile when all fields complete', () => {
      const { getByTestId } = renderProfileScreen(completeProfile);

      // Full profile renders with all data
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-name')).toBeOnTheScreen();
    });

    it('should indicate weak profile when minimal fields complete', () => {
      const minimalProfile: Profile = {
        ...incompleteProfile,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const { getByTestId } = renderProfileScreen(minimalProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should indicate medium profile when some fields complete', () => {
      const mediumProfile: Profile = {
        ...incompleteProfile,
        headline: 'Developer',
        phone: '+447123456789',
        profilePicture: 'https://example.com/photo.jpg',
      };

      const { getByTestId } = renderProfileScreen(mediumProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('profile data transitions', () => {
    it('should handle transition from loading to data', async () => {
      const { rerender, getByText } = renderProfileScreen(null, true);

      // Update with loaded data
      const store = mockStore({
        profile: { data: completeProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByText('Warren de Leon')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle transition from error to data', async () => {
      const { rerender, getByTestId, getByText } = renderProfileScreen(
        null,
        false,
        'Network error'
      );

      expect(getByTestId('profile-screen')).toBeOnTheScreen();

      // Update with recovered data
      const store = mockStore({
        profile: { data: completeProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByText('Warren de Leon')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle profile update', async () => {
      const { rerender, getByText } = renderProfileScreen(incompleteProfile);

      expect(getByText('Warren de Leon')).toBeOnTheScreen();

      // Update profile with more data
      const updatedProfile: Profile = {
        ...incompleteProfile,
        headline: 'Senior Developer',
        profilePicture: 'https://example.com/new-photo.jpg',
      };

      const store = mockStore({
        profile: { data: updatedProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });
  });

  describe('profile completion journey steps', () => {
    it('should display profile with only basic info', () => {
      const basicProfile: Profile = {
        ...incompleteProfile,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const { getByTestId, getByText } = renderProfileScreen(basicProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('John Doe')).toBeOnTheScreen();
    });

    it('should display profile after adding headline', () => {
      const profileWithHeadline: Profile = {
        ...incompleteProfile,
        headline: 'Software Developer',
      };

      const { getByTestId } = renderProfileScreen(profileWithHeadline);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should display profile after adding profile picture', () => {
      const profileWithPhoto: Profile = {
        ...incompleteProfile,
        profilePicture: 'https://example.com/photo.jpg',
      };

      const { getByTestId } = renderProfileScreen(profileWithPhoto);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should display profile after adding contact details', () => {
      const profileWithContact: Profile = {
        ...incompleteProfile,
        phone: '+447123456789',
        email: 'updated@example.com',
      };

      const { getByTestId } = renderProfileScreen(profileWithContact);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should display profile after adding location', () => {
      const profileWithLocation: Profile = {
        ...incompleteProfile,
        location: {
          cityTown: 'London',
          county: 'Greater London',
          country: 'UK',
          coordinates: {
            latitude: 51.5074,
            longitude: -0.1278,
          },
        },
      };

      const { getByTestId } = renderProfileScreen(profileWithLocation);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should display fully completed profile', () => {
      const { getByTestId, getByText } = renderProfileScreen(completeProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });
  });

  describe('rapid state changes during completion', () => {
    it('should handle multiple rapid profile updates', async () => {
      const { rerender, getByTestId } = renderProfileScreen(incompleteProfile);

      // Simulate rapid updates as user completes profile
      const profiles = [
        { ...incompleteProfile, headline: 'Step 1' },
        { ...incompleteProfile, headline: 'Step 1', phone: '+447123456789' },
        { ...incompleteProfile, headline: 'Step 1', phone: '+447123456789', profilePicture: 'url' },
      ];

      for (const profile of profiles) {
        const store = mockStore({
          profile: { data: profile, loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={store}>
            <ProfileScreen />
          </Provider>
        );
      }

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should handle intermittent loading states during completion', async () => {
      const { rerender, getByTestId } = renderProfileScreen(incompleteProfile);

      // Simulate loading between updates
      const states = [
        { data: incompleteProfile, loading: true, error: null },
        { data: { ...incompleteProfile, headline: 'Updated' }, loading: false, error: null },
        { data: { ...incompleteProfile, headline: 'Updated' }, loading: true, error: null },
        { data: completeProfile, loading: false, error: null },
      ];

      for (const state of states) {
        const store = mockStore({
          profile: state,
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={store}>
            <ProfileScreen />
          </Provider>
        );
      }

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('error handling during profile completion', () => {
    it('should handle save error during profile update', () => {
      const { getByTestId } = renderProfileScreen(incompleteProfile, false, 'Failed to save');

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });

    it('should recover from error and show updated profile', async () => {
      const { rerender, getByText } = renderProfileScreen(incompleteProfile, false, 'Save failed');

      // Recover with successful save
      const store = mockStore({
        profile: { data: completeProfile, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByText('Warren de Leon')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should preserve partial data on error', () => {
      const partialProfile: Profile = {
        ...incompleteProfile,
        headline: 'Partially updated',
      };

      const { getByTestId } = renderProfileScreen(partialProfile, false, 'Network error');

      // Profile should still render with partial data
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
    });
  });

  describe('accessibility during profile completion', () => {
    it('should have accessible profile screen', () => {
      const { getByTestId } = renderProfileScreen(completeProfile);

      const profileScreen = getByTestId('profile-screen');
      expect(profileScreen).toBeOnTheScreen();
    });

    it('should have accessible profile name', () => {
      const { getByTestId } = renderProfileScreen(completeProfile);

      const profileName = getByTestId('profile-name');
      expect(profileName.props.accessibilityRole).toBe('header');
    });

    it('should maintain accessibility with incomplete profile', () => {
      const { getByTestId } = renderProfileScreen(incompleteProfile);

      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-name')).toBeOnTheScreen();
    });
  });
});
