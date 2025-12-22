import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
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
    coordinates: { latitude: 51.4561, longitude: 0.24678 },
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
    const store = mockStore({ profile: state, settings: { theme: 'light', language: 'en' } });
    return render(
      <Provider store={store}>
        <ProfileScreen />
      </Provider>
    );
  };

  const renderWithProfile = () =>
    renderProfileScreen({ data: mockProfile, loading: false, error: null });

  describe('Component Rendering', () => {
    it('renders profile screen with data', () => {
      const { getByTestId, getByText } = renderWithProfile();
      expect(getByTestId('profile-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-name')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
    });

    it('displays profile photo from carousel', () => {
      const { getByTestId } = renderWithProfile();
      const carouselImage = getByTestId('profile-carousel-image');
      expect(carouselImage).toBeOnTheScreen();
      expect(carouselImage.props.source.uri).toBe('https://example.com/profile-01.jpg');
    });

    it('displays avatar fallback when no images', () => {
      const profileWithoutImages = {
        ...mockProfile,
        galleryImages: [],
        profilePicture: undefined,
      } as unknown as Profile;
      const { queryByTestId, getByTestId } = renderProfileScreen({
        data: profileWithoutImages,
        loading: false,
        error: null,
      });
      expect(queryByTestId('profile-carousel-image')).toBeNull();
      expect(getByTestId('profile-avatar-fallback')).toBeOnTheScreen();
    });

    it('displays contact information rows', () => {
      const { getByTestId, getByText } = renderWithProfile();
      expect(getByTestId('profile-phone')).toBeOnTheScreen();
      expect(getByText('+447510084239')).toBeOnTheScreen();
      expect(getByTestId('profile-email')).toBeOnTheScreen();
      expect(getByText('hi@warrendeleon.com')).toBeOnTheScreen();
      expect(getByTestId('profile-birthday')).toBeOnTheScreen();
      expect(getByText('11 May 1990')).toBeOnTheScreen();
    });

    it('displays social media section when available', () => {
      const { getByTestId, getByText } = renderWithProfile();
      expect(getByTestId('profile-social-header')).toBeOnTheScreen();
      expect(getByText('Social Media')).toBeOnTheScreen();
      expect(getByTestId('profile-social-facebook')).toBeOnTheScreen();
      expect(getByTestId('profile-social-twitter')).toBeOnTheScreen();
      expect(getByTestId('profile-social-instagram')).toBeOnTheScreen();
      expect(getByTestId('profile-social-linkedin')).toBeOnTheScreen();
    });

    it('hides social section when no socials', () => {
      const profileWithoutSocials = { ...mockProfile, socials: undefined } as unknown as Profile;
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
    it('renders phone and email buttons as pressable', () => {
      const { getByTestId } = renderWithProfile();
      expect(getByTestId('profile-phone').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-email').props.accessibilityRole).toBe('button');
    });

    it('renders social media buttons as pressable', () => {
      const { getByTestId } = renderWithProfile();
      expect(getByTestId('profile-social-facebook').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-social-twitter').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-social-instagram').props.accessibilityRole).toBe('button');
      expect(getByTestId('profile-social-linkedin').props.accessibilityRole).toBe('button');
    });
  });

  describe('State Management', () => {
    it('displays loading indicator', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: null,
        loading: true,
        error: null,
      });
      expect(getByTestId('profile-loading')).toBeOnTheScreen();
      expect(getByText('Loading...')).toBeOnTheScreen();
    });

    it('displays error message', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: null,
        loading: false,
        error: 'Failed to load profile data',
      });
      expect(getByTestId('profile-error')).toBeOnTheScreen();
      expect(getByText('Error: Failed to load profile data')).toBeOnTheScreen();
    });

    it('displays empty state when no data', () => {
      const { getByTestId, getByText } = renderProfileScreen({
        data: null,
        loading: false,
        error: null,
      });
      expect(getByTestId('profile-empty')).toBeOnTheScreen();
      expect(getByText('No profile data available')).toBeOnTheScreen();
    });

    it('prioritizes loading state over error', () => {
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: null,
        loading: true,
        error: 'Network error',
      });
      expect(getByTestId('profile-loading')).toBeOnTheScreen();
      expect(queryByTestId('profile-error')).toBeNull();
    });
  });

  describe('Accessibility (EAA Compliance)', () => {
    it('has proper accessibility for phone button', () => {
      const { getByTestId } = renderWithProfile();
      const phoneButton = getByTestId('profile-phone');
      expect(phoneButton.props.accessibilityRole).toBe('button');
      expect(phoneButton.props.accessibilityLabel).toBe('Phone: +447510084239');
      expect(phoneButton.props.accessibilityHint).toBe('Double tap to call');
    });

    it('has proper accessibility for email button', () => {
      const { getByTestId } = renderWithProfile();
      const emailButton = getByTestId('profile-email');
      expect(emailButton.props.accessibilityRole).toBe('button');
      expect(emailButton.props.accessibilityLabel).toBe('Email: hi@warrendeleon.com');
      expect(emailButton.props.accessibilityHint).toBe('Double tap to send email');
    });

    it('has proper accessibility for birthday row', () => {
      const { getByTestId } = renderWithProfile();
      const birthdayRow = getByTestId('profile-birthday');
      expect(birthdayRow.props.accessibilityRole).toBe('text');
      expect(birthdayRow.props.accessibilityLabel).toBe('Birthday: 11 May 1990');
    });

    it('has proper accessibility for social media buttons', () => {
      const { getByTestId } = renderWithProfile();
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

    it('has proper accessibility for profile image', () => {
      const { getByTestId } = renderWithProfile();
      const profileImage = getByTestId('profile-carousel-image');
      expect(profileImage.props.accessibilityRole).toBe('image');
      expect(profileImage.props.accessibilityLabel).toBe('Profile photo of Warren de Leon');
    });

    it('has proper accessibility for heading', () => {
      const { getByTestId } = renderWithProfile();
      const nameHeading = getByTestId('profile-name');
      expect(nameHeading.props.accessibilityRole).toBe('header');
      expect(nameHeading.props.accessibilityLabel).toBe('Warren de Leon');
    });

    it('meets minimum touch target size (44px)', () => {
      const { getByTestId } = renderWithProfile();
      expect(getByTestId('profile-phone').props.style.minHeight).toBe(44);
      expect(getByTestId('profile-email').props.style.minHeight).toBe(44);
    });
  });

  describe('Redux Integration', () => {
    it('displays data from Redux selector', () => {
      const { getByText } = renderWithProfile();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
      expect(getByText('+447510084239')).toBeOnTheScreen();
      expect(getByText('hi@warrendeleon.com')).toBeOnTheScreen();
    });

    it('reflects loading state from Redux', () => {
      const { getByTestId } = renderProfileScreen({ data: null, loading: true, error: null });
      expect(getByTestId('profile-loading')).toBeOnTheScreen();
    });

    it('reflects error state from Redux', () => {
      const { getByTestId } = renderProfileScreen({
        data: null,
        loading: false,
        error: 'Redux error message',
      });
      expect(getByTestId('profile-error')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing headline', () => {
      const profileWithoutHeadline = { ...mockProfile, headline: undefined } as unknown as Profile;
      const { getByTestId, queryByTestId } = renderProfileScreen({
        data: profileWithoutHeadline,
        loading: false,
        error: null,
      });
      expect(getByTestId('profile-name')).toBeOnTheScreen();
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
      expect(getByTestId('profile-social-facebook')).toBeOnTheScreen();
      expect(queryByTestId('profile-social-twitter')).toBeNull();
      expect(queryByTestId('profile-social-instagram')).toBeNull();
      expect(queryByTestId('profile-social-linkedin')).toBeNull();
    });

    it('handles missing profilePicture with empty gallery', () => {
      const profileWithoutPicture = {
        ...mockProfile,
        profilePicture: undefined,
        galleryImages: [],
      } as unknown as Profile;
      const { queryByTestId, getByTestId } = renderProfileScreen({
        data: profileWithoutPicture,
        loading: false,
        error: null,
      });
      expect(queryByTestId('profile-carousel-image')).toBeNull();
      expect(getByTestId('profile-avatar-fallback')).toBeOnTheScreen();
    });

    it('uses profilePicture as fallback when carousel empty', () => {
      const profileWithEmptyCarousel = { ...mockProfile, galleryImages: [] };
      const { getByTestId } = renderProfileScreen({
        data: profileWithEmptyCarousel,
        loading: false,
        error: null,
      });
      expect(getByTestId('profile-carousel-image').props.source.uri).toBe(
        'https://example.com/avatar.png'
      );
    });
  });
});
