import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { Profile } from '@app/types/portfolio';

import { ProfileScreen } from '../ProfileScreen';

// Use requireActual to avoid type compatibility issues with redux-mock-store
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

describe('ProfileScreen', () => {
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

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(UNSAFE_root).toBeTruthy();
    });

    it('displays profile data when loaded', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-name')).toBeTruthy();
      expect(getByText('Warren de Leon')).toBeTruthy();
      expect(getByText('Senior React Native Developer')).toBeTruthy();
    });

    it('displays profile photo when carousel is available', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const carouselImage = getByTestId('profile-carousel-image');
      expect(carouselImage).toBeTruthy();
      expect(carouselImage.props.source.uri).toBe('https://example.com/profile-01.jpg');
    });

    it('displays avatar fallback when no carousel and no profile picture', () => {
      const profileWithoutImages = {
        ...mockProfile,
        galleryImages: [],
        profilePicture: undefined,
      } as unknown as Profile;
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: profileWithoutImages,
        loading: false,
        error: null,
      });

      expect(queryByTestId('profile-carousel-image')).toBeNull();
      expect(getByTestId('profile-avatar-fallback')).toBeTruthy();
    });

    it('displays contact information rows', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-phone')).toBeTruthy();
      expect(getByText('+447510084239')).toBeTruthy();
      expect(getByTestId('profile-email')).toBeTruthy();
      expect(getByText('hi@warrendeleon.com')).toBeTruthy();
      expect(getByTestId('profile-birthday')).toBeTruthy();
      expect(getByText('11 May 1990')).toBeTruthy();
    });

    it('displays social media section when socials available', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-social-header')).toBeTruthy();
      expect(getByText('Social Media')).toBeTruthy();
      expect(getByTestId('profile-social-facebook')).toBeTruthy();
      expect(getByTestId('profile-social-twitter')).toBeTruthy();
      expect(getByTestId('profile-social-instagram')).toBeTruthy();
      expect(getByTestId('profile-social-linkedin')).toBeTruthy();
    });

    it('hides social media section when no socials available', () => {
      const profileWithoutSocials = {
        ...mockProfile,
        socials: undefined,
      } as unknown as Profile;
      const { queryByTestId } = renderProfileScreen({
        data: profileWithoutSocials,
        loading: false,
        error: null,
      });

      expect(queryByTestId('profile-social-header')).toBeNull();
      expect(queryByTestId('profile-social-facebook')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('renders phone button as pressable', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phoneButton = getByTestId('profile-phone');
      expect(phoneButton).toBeTruthy();
      expect(phoneButton.props.accessibilityRole).toBe('button');
    });

    it('renders email button as pressable', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const emailButton = getByTestId('profile-email');
      expect(emailButton).toBeTruthy();
      expect(emailButton.props.accessibilityRole).toBe('button');
    });

    it('renders social media buttons as pressable', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-social-facebook').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-social-twitter').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-social-instagram').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-social-linkedin').props.accessibilityRole).toBe('button');
    });
  });

  describe('State Management', () => {
    it('displays loading indicator when loading', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-loading')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('displays error message when error occurs', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: null,
        loading: false,
        error: 'Failed to load profile data',
      });

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-error')).toBeTruthy();
      expect(getByText('Error: Failed to load profile data')).toBeTruthy();
    });

    it('displays empty state when no data available', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: null,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-empty')).toBeTruthy();
      expect(getByText('No profile data available')).toBeTruthy();
    });

    it('prioritizes loading state over error state', () => {
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: 'Network error',
      });

      // Loading is checked first in the component
      expect(getByTestId('profile-loading')).toBeTruthy();
      expect(queryByTestId('profile-error')).toBeNull();
    });
  });

  describe('Accessibility (EAA Compliance)', () => {
    it('has proper accessibilityRole for phone button', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phoneButton = getByTestId('profile-phone');
      expect(phoneButton.props.accessibilityRole).toBe('button');
    });

    it('has proper accessibilityRole for email button', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const emailButton = getByTestId('profile-email');
      expect(emailButton.props.accessibilityRole).toBe('button');
    });

    it('has descriptive accessibilityLabel for phone', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phoneButton = getByTestId('profile-phone');
      expect(phoneButton.props.accessibilityLabel).toBe('Phone: +447510084239');
      expect(phoneButton.props.accessibilityHint).toBe('Double tap to call');
    });

    it('has descriptive accessibilityLabel for email', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const emailButton = getByTestId('profile-email');
      expect(emailButton.props.accessibilityLabel).toBe('Email: hi@warrendeleon.com');
      expect(emailButton.props.accessibilityHint).toBe('Double tap to send email');
    });

    it('has descriptive accessibilityLabel for birthday (non-interactive)', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const birthdayRow = getByTestId('profile-birthday');
      expect(birthdayRow.props.accessibilityRole).toBe('text');
      expect(birthdayRow.props.accessibilityLabel).toBe('Birthday: 11 May 1990');
    });

    it('has proper accessibilityLabel for social media buttons', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-social-facebook').props.accessibilityLabel).toBe(
        'Open facebook profile'
      );
      expect(getByTestId('profile-social-twitter').props.accessibilityLabel).toBe(
        'Open twitter profile'
      );
      expect(getByTestId('profile-social-instagram').props.accessibilityLabel).toBe(
        'Open instagram profile'
      );
      expect(getByTestId('profile-social-linkedin').props.accessibilityLabel).toBe(
        'Open linkedin profile'
      );
    });

    it('has proper accessibilityLabel for profile image', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const profileImage = getByTestId('profile-carousel-image');
      expect(profileImage.props.accessibilityRole).toBe('image');
      expect(profileImage.props.accessibilityLabel).toBe('Profile photo of Warren de Leon');
    });

    it('has proper accessibilityRole for heading', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const nameHeading = getByTestId('profile-name');
      expect(nameHeading.props.accessibilityRole).toBe('header');
      expect(nameHeading.props.accessibilityLabel).toBe('Warren de Leon');
    });

    it('meets minimum touch target size for interactive elements (44px)', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phoneButton = getByTestId('profile-phone');
      expect(phoneButton.props.style.minHeight).toBe(44);

      const emailButton = getByTestId('profile-email');
      expect(emailButton.props.style.minHeight).toBe(44);
    });
  });

  describe('Redux Integration', () => {
    it('displays data from Redux selector', () => {
      const { getByText } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByText('Warren de Leon')).toBeTruthy();
      expect(getByText('Senior React Native Developer')).toBeTruthy();
      expect(getByText('+447510084239')).toBeTruthy();
      expect(getByText('hi@warrendeleon.com')).toBeTruthy();
    });

    it('reflects loading state from Redux', () => {
      const { getByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('profile-loading')).toBeTruthy();
    });

    it('reflects error state from Redux', () => {
      const { getByTestId } = renderProfileScreen({
        data: null,
        loading: false,
        error: 'Redux error message',
      });

      expect(getByTestId('profile-error')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing headline gracefully', () => {
      const profileWithoutHeadline = {
        ...mockProfile,
        headline: undefined,
      } as unknown as Profile;
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: profileWithoutHeadline,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-name')).toBeTruthy();
      expect(queryByTestId('profile-headline')).toBeNull();
    });

    it('handles partial social links', () => {
      const profileWithPartialSocials = {
        ...mockProfile,
        socials: {
          facebook: 'https://www.facebook.com/warren.deleon/',
          twitter: undefined,
          instagram: undefined,
          linkedIn: undefined,
        },
      } as unknown as Profile;
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: profileWithPartialSocials,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-social-facebook')).toBeTruthy();
      expect(queryByTestId('profile-social-twitter')).toBeNull();
      expect(queryByTestId('profile-social-instagram')).toBeNull();
      expect(queryByTestId('profile-social-linkedin')).toBeNull();
    });

    it('handles missing profilePicture URL', () => {
      const profileWithoutPicture = {
        ...mockProfile,
        profilePicture: undefined,
        galleryImages: [],
      } as unknown as Profile;
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: profileWithoutPicture,
        loading: false,
        error: null,
      });

      expect(queryByTestId('profile-carousel-image')).toBeNull();
      expect(getByTestId('profile-avatar-fallback')).toBeTruthy();
    });

    it('uses profilePicture as fallback when carousel is empty', () => {
      const profileWithEmptyCarousel = { ...mockProfile, galleryImages: [] };
      const { getByTestId } = renderProfileScreen({
        data: profileWithEmptyCarousel,
        loading: false,
        error: null,
      });

      const carouselImage = getByTestId('profile-carousel-image');
      expect(carouselImage.props.source.uri).toBe('https://example.com/avatar.png');
    });
  });
});
