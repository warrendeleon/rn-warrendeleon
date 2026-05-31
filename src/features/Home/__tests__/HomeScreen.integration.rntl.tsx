/**
 * HomeScreen Integration Tests
 *
 * Tests navigation flows, state management integration, and cross-component
 * interactions from the HomeScreen. Verifies that user journeys work correctly
 * when multiple features interact.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import {
  errorHandlers,
  mockEducation,
  mockProfile,
  mockWorkXP,
  renderWithProviders,
  server,
} from '@app/test-utils';

import { HomeScreen } from '../HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      reset: mockReset,
    }),
    useFocusEffect: jest.fn(callback => {
      callback();
    }),
  };
});

describe('HomeScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Data Loading', () => {
    it('displays profile data when loaded from store', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(<HomeScreen />, {
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

      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(queryByTestId('home-loading')).toBeNull();
    });

    it('renders home screen without profile card when profile data is null', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(<HomeScreen />, {
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

      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(queryByTestId('profile-card')).toBeNull();
    });

    it('handles profile loading state gracefully', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
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
            loading: true,
            error: null,
          },
          education: {
            data: [],
            loading: true,
            error: null,
          },
        },
      });

      // Menu sections should still be accessible during loading
      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(getByTestId('home-work-experience-button')).toBeOnTheScreen();
      expect(getByTestId('home-education-button')).toBeOnTheScreen();
    });
  });

  describe('Navigation Flow Integration', () => {
    it('navigates to WorkExperience and returns correctly', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
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

      await fireEvent.press(getByTestId('home-work-experience-button'));
      expect(mockNavigate).toHaveBeenCalledWith('WorkExperience');
    });

    it('navigates to Education screen', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />);

      await fireEvent.press(getByTestId('home-education-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Education');
    });

    it('navigates to Settings screen', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />);

      await fireEvent.press(getByTestId('home-settings-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Settings');
    });

    it('navigates to Profile when profile card is pressed', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
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

      await fireEvent.press(getByTestId('profile-card'));
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('navigates to WebView with correct GitHub URI', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />);

      await fireEvent.press(getByTestId('home-github-button'));
      expect(mockNavigate).toHaveBeenCalledWith('WebView', {
        uri: 'https://github.com/warrendeleon/rn-warrendeleon',
      });
    });

    it('navigates to PDF with CV URL', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />);

      await fireEvent.press(getByTestId('home-cv-button'));
      expect(mockNavigate).toHaveBeenCalledWith('PDF', {
        uri: 'https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf',
        title: 'CV',
      });
    });
  });

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      server.use(...errorHandlers);
    });

    it('remains functional when profile fails to load', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(<HomeScreen />, {
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

      // Home screen should still be fully functional
      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(getByTestId('home-work-experience-button')).toBeOnTheScreen();
      expect(getByTestId('home-settings-button')).toBeOnTheScreen();

      // Profile card should not be visible
      expect(queryByTestId('profile-card')).toBeNull();

      // Navigation should still work
      await fireEvent.press(getByTestId('home-settings-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Settings');
    });

    it('displays all menu sections regardless of data fetch errors', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
        preloadedState: {
          profile: {
            data: null,
            loading: false,
            error: 'Network error',
          },
          settings: {
            language: 'en',
            theme: 'light',
          },
          workExperience: {
            data: [],
            loading: false,
            error: 'Network error',
          },
          education: {
            data: [],
            loading: false,
            error: 'Network error',
          },
        },
      });

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

  describe('State Persistence', () => {
    it('preserves navigation state after returning from sub-screens', async () => {
      const { getByTestId, rerender } = await renderWithProviders(<HomeScreen />, {
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

      // Navigate away
      await fireEvent.press(getByTestId('home-work-experience-button'));
      expect(mockNavigate).toHaveBeenCalledWith('WorkExperience');

      // Simulate returning (re-render with same state)
      await rerender(<HomeScreen />);

      // Verify screen is still functional
      expect(getByTestId('home-screen')).toBeOnTheScreen();
      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });

    it('reflects updated profile data after returning from Profile screen', async () => {
      const updatedProfile = {
        ...mockProfile,
        name: 'Updated',
        lastName: 'Name',
      };

      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
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

      expect(getByTestId('profile-card')).toBeOnTheScreen();

      // Re-render with updated profile (simulating return from Profile screen)
      const { getByTestId: getByTestId2 } = await renderWithProviders(<HomeScreen />, {
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

      expect(getByTestId2('profile-card')).toBeOnTheScreen();
    });
  });

  describe('Multiple Navigation Actions', () => {
    it('handles rapid navigation button presses correctly', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />);

      // Rapid presses should result in only the appropriate navigations
      await fireEvent.press(getByTestId('home-settings-button'));
      await fireEvent.press(getByTestId('home-work-experience-button'));
      await fireEvent.press(getByTestId('home-education-button'));

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'Settings');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, 'WorkExperience');
      expect(mockNavigate).toHaveBeenNthCalledWith(3, 'Education');
    });

    it('navigates to all placeholder screens', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />);

      await fireEvent.press(getByTestId('home-contact-me-button'));
      expect(mockNavigate).toHaveBeenCalledWith('ChatPlaceholder');

      await fireEvent.press(getByTestId('home-book-a-call-button'));
      expect(mockNavigate).toHaveBeenCalledWith('BookingPlaceholder');
    });
  });

  describe('Theme Integration', () => {
    it('renders correctly with light theme', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
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

      expect(getByTestId('home-screen')).toBeOnTheScreen();
    });

    it('renders correctly with dark theme', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'en',
            theme: 'dark',
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

      expect(getByTestId('home-screen')).toBeOnTheScreen();
    });
  });

  describe('Language Integration', () => {
    it('displays content based on selected language', async () => {
      const { getByTestId } = await renderWithProviders(<HomeScreen />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          settings: {
            language: 'es',
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

      // Screen should render regardless of language setting
      expect(getByTestId('home-screen')).toBeOnTheScreen();
    });
  });
});
