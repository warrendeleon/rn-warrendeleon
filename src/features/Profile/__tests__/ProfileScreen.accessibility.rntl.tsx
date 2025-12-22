import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import { expectCanReceiveFocus, expectFocusOrder } from '@app/test-utils';
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

describe('ProfileScreen Screen Reader Accessibility', () => {
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

  describe('focus order for screen readers', () => {
    it('should have correct focus order for contact elements', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phone = getByTestId('profile-phone');
      const email = getByTestId('profile-email');

      expectFocusOrder([phone, email]);
    });

    it('should have correct focus order for social media buttons', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const facebook = getByTestId('profile-social-facebook');
      const twitter = getByTestId('profile-social-twitter');
      const instagram = getByTestId('profile-social-instagram');
      const linkedin = getByTestId('profile-social-linkedin');

      expectFocusOrder([facebook, twitter, instagram, linkedin]);
    });

    it('should have focusable phone button', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expectCanReceiveFocus(getByTestId('profile-phone'));
    });

    it('should have focusable email button', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expectCanReceiveFocus(getByTestId('profile-email'));
    });

    it('should have focusable social media buttons', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expectCanReceiveFocus(getByTestId('profile-social-facebook'));
      expectCanReceiveFocus(getByTestId('profile-social-twitter'));
      expectCanReceiveFocus(getByTestId('profile-social-instagram'));
      expectCanReceiveFocus(getByTestId('profile-social-linkedin'));
    });
  });

  describe('heading hierarchy', () => {
    it('should have profile name as header', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const nameHeading = getByTestId('profile-name');
      expect(nameHeading.props.accessibilityRole).toBe('header');
    });

    it('should have social media section header', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const socialHeader = getByTestId('profile-social-header');
      expect(socialHeader).toBeOnTheScreen();
    });
  });

  describe('screen reader announcements', () => {
    it('should have accessible labels on all contact buttons', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phoneButton = getByTestId('profile-phone');
      const emailButton = getByTestId('profile-email');

      expect(phoneButton.props.accessibilityLabel).toBeDefined();
      expect(emailButton.props.accessibilityLabel).toBeDefined();
    });

    it('should have accessible hints on contact buttons', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      const phoneButton = getByTestId('profile-phone');
      const emailButton = getByTestId('profile-email');

      expect(phoneButton.props.accessibilityHint).toBeDefined();
      expect(emailButton.props.accessibilityHint).toBeDefined();
    });

    it('should have accessible labels on social media buttons', () => {
      const { getByTestId } = renderProfileScreen({
        data: mockProfile,
        loading: false,
        error: null,
      });

      expect(getByTestId('profile-social-facebook').props.accessibilityLabel).toBeDefined();
      expect(getByTestId('profile-social-twitter').props.accessibilityLabel).toBeDefined();
      expect(getByTestId('profile-social-instagram').props.accessibilityLabel).toBeDefined();
      expect(getByTestId('profile-social-linkedin').props.accessibilityLabel).toBeDefined();
    });
  });
});
