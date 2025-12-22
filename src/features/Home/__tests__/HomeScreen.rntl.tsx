/**
 * Tests for HomeScreen
 *
 * Tests user interactions via fireEvent.press, not handler functions directly
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import {
  expectCanReceiveFocus,
  expectFocusOrder,
  mockProfile,
  renderWithProviders,
} from '@app/test-utils';

import { HomeScreen } from '../HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders home screen with correct testID', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expect(getByTestId('home-screen')).toBeOnTheScreen();
    });

    it('renders all Work & Learning buttons', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expect(getByTestId('home-work-experience-button')).toBeOnTheScreen();
      expect(getByTestId('home-education-button')).toBeOnTheScreen();
      expect(getByTestId('home-cv-button')).toBeOnTheScreen();
    });

    it('renders all Contact buttons', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expect(getByTestId('home-contact-me-button')).toBeOnTheScreen();
      expect(getByTestId('home-book-a-call-button')).toBeOnTheScreen();
    });

    it('renders Settings section buttons', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expect(getByTestId('home-github-button')).toBeOnTheScreen();
      expect(getByTestId('home-settings-button')).toBeOnTheScreen();
    });
  });

  describe('navigation - user interactions', () => {
    it('navigates to Settings when settings button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-settings-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Settings');
    });

    it('navigates to WebView with GitHub URI when github button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-github-button'));

      expect(mockNavigate).toHaveBeenCalledWith('WebView', {
        uri: 'https://github.com/warrendeleon/rn-warrendeleon',
      });
    });

    it('navigates to WorkExperience when work experience button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-work-experience-button'));

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperience');
    });

    it('navigates to Education when education button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-education-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Education');
    });

    it('navigates to PDF with CV URL when CV button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-cv-button'));

      expect(mockNavigate).toHaveBeenCalledWith('PDF', {
        uri: 'https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf',
        title: 'CV',
      });
    });

    it('navigates to ChatPlaceholder when contact me button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-contact-me-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ChatPlaceholder');
    });

    it('navigates to BookingPlaceholder when book a call button is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      fireEvent.press(getByTestId('home-book-a-call-button'));

      expect(mockNavigate).toHaveBeenCalledWith('BookingPlaceholder');
    });

    it('navigates to Profile when profile card is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />, {
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

      fireEvent.press(getByTestId('profile-card'));

      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });
  });

  describe('accessibility', () => {
    it('has accessible screen label', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      const screen = getByTestId('home-screen');
      expect(screen.props.accessibilityLabel).toBeDefined();
    });

    it('has accessible section headers', () => {
      const { getAllByRole } = renderWithProviders(<HomeScreen />);

      const headers = getAllByRole('header');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });

    it('all buttons are rendered and accessible', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      // All buttons should be accessible
      expect(getByTestId('home-work-experience-button')).toBeOnTheScreen();
      expect(getByTestId('home-education-button')).toBeOnTheScreen();
      expect(getByTestId('home-cv-button')).toBeOnTheScreen();
      expect(getByTestId('home-contact-me-button')).toBeOnTheScreen();
      expect(getByTestId('home-book-a-call-button')).toBeOnTheScreen();
      expect(getByTestId('home-github-button')).toBeOnTheScreen();
      expect(getByTestId('home-settings-button')).toBeOnTheScreen();
    });
  });

  describe('focus order for screen readers', () => {
    it('should have correct focus order for Work & Learning section', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      const workExperience = getByTestId('home-work-experience-button');
      const education = getByTestId('home-education-button');
      const cv = getByTestId('home-cv-button');

      expectFocusOrder([workExperience, education, cv]);
    });

    it('should have correct focus order for Contact section', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      const contactMe = getByTestId('home-contact-me-button');
      const bookACall = getByTestId('home-book-a-call-button');

      expectFocusOrder([contactMe, bookACall]);
    });

    it('should have focusable work experience button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-work-experience-button'));
    });

    it('should have focusable education button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-education-button'));
    });

    it('should have focusable cv button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-cv-button'));
    });

    it('should have focusable contact me button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-contact-me-button'));
    });

    it('should have focusable book a call button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-book-a-call-button'));
    });

    it('should have focusable github button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-github-button'));
    });

    it('should have focusable settings button', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);

      expectCanReceiveFocus(getByTestId('home-settings-button'));
    });

    it('should have focusable profile card when profile data exists', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />, {
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

      expectCanReceiveFocus(getByTestId('profile-card'));
    });
  });

  describe('ProfileCard', () => {
    it('renders ProfileCard when profile data exists', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />, {
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

      // ProfileCard should be visible when profile data exists
      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });

    it('does not render ProfileCard when profile data is null', () => {
      const { queryByTestId, getByTestId } = renderWithProviders(<HomeScreen />, {
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

      // HomeScreen should still render
      expect(getByTestId('home-screen')).toBeOnTheScreen();
      // But ProfileCard should not be present
      expect(queryByTestId('profile-card')).toBeNull();
    });

    it('still renders all menu sections when profile is loading', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(<HomeScreen />, {
        preloadedState: {
          profile: {
            data: null,
            loading: true,
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

      // All menu sections should still be accessible during profile load
      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(getByTestId('home-work-experience-button')).toBeOnTheScreen();
      expect(getByTestId('home-settings-button')).toBeOnTheScreen();
      // ProfileCard hidden when data is null (even during loading)
      expect(queryByTestId('profile-card')).toBeNull();
    });

    it('still renders all menu sections when profile has error', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(<HomeScreen />, {
        preloadedState: {
          profile: {
            data: null,
            loading: false,
            error: 'Failed to load profile',
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

      // Home screen remains usable even with profile error
      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(getByTestId('home-work-experience-button')).toBeOnTheScreen();
      expect(getByTestId('home-contact-me-button')).toBeOnTheScreen();
      // ProfileCard hidden when data is null
      expect(queryByTestId('profile-card')).toBeNull();
    });
  });
});
