/* eslint-disable simple-import-sort/imports */
import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import component directly to avoid circular dependency
import { handleGitHubPress, handleSettingsPress, HomeScreen } from '../HomeScreen';

import type { RootStackParamList } from '@app/navigation';
import { mockProfile, renderWithProviders } from '@app/test-utils';
/* eslint-enable simple-import-sort/imports */

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

describe('HomeScreen', () => {
  it('renders home screen with correct testID', () => {
    const { getByTestId } = renderWithProviders(<HomeScreen />);

    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('renders all Work & Learning buttons', () => {
    const { getByTestId } = renderWithProviders(<HomeScreen />);

    expect(getByTestId('home-work-experience-button')).toBeTruthy();
    expect(getByTestId('home-education-button')).toBeTruthy();
    expect(getByTestId('home-cv-button')).toBeTruthy();
  });

  it('renders all Contact buttons', () => {
    const { getByTestId } = renderWithProviders(<HomeScreen />);

    expect(getByTestId('home-contact-me-button')).toBeTruthy();
    expect(getByTestId('home-book-a-call-button')).toBeTruthy();
  });

  it('renders Settings section buttons', () => {
    const { getByTestId } = renderWithProviders(<HomeScreen />);

    expect(getByTestId('home-github-button')).toBeTruthy();
    expect(getByTestId('home-settings-button')).toBeTruthy();
  });

  it('navigates to Settings when handleSettingsPress is called', () => {
    const mockNavigation = {
      navigate: jest.fn(),
    } as unknown as HomeScreenNavigationProp;

    handleSettingsPress(mockNavigation);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
  });

  it('navigates to WebView with GitHub URI when handleGitHubPress is called', () => {
    const mockNavigation = {
      navigate: jest.fn(),
    } as unknown as HomeScreenNavigationProp;

    handleGitHubPress(mockNavigation);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('WebView', {
      uri: 'https://github.com/warrendeleon/rn-warrendeleon',
    });
  });
});

describe('HomeScreen implementation', () => {
  it('exports handleSettingsPress function', () => {
    expect(typeof handleSettingsPress).toBe('function');
  });

  it('exports handleGitHubPress function', () => {
    expect(typeof handleGitHubPress).toBe('function');
  });
});

describe('HomeScreen with ProfileCard', () => {
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
    expect(getByTestId('profile-card')).toBeTruthy();
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
    expect(getByTestId('home-screen')).toBeTruthy();
    // But ProfileCard should not be present
    expect(queryByTestId('profile-card')).toBeNull();
  });
});
