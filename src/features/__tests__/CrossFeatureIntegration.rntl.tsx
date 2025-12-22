/**
 * Cross-Feature Integration Tests
 *
 * Tests for cross-feature integration scenarios:
 * - Auth state affects navigation options
 * - Profile update reflects in Settings
 * - Language change updates all screens
 * - Theme change applies globally
 * - Logout clears all feature state
 * - Deep link triggers correct feature flow
 *
 * These tests verify that changes in one feature correctly
 * propagate to other features through shared state.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Pressable, Text } from '@gluestack-ui/themed';
import { fireEvent, waitFor } from '@testing-library/react-native';

import {
  clearProfile,
  logout,
  selectIsAuthenticated,
  selectLanguage,
  selectProfile,
  selectTheme,
  setLanguage,
  setTheme,
  updateUserProfile,
  useAppDispatch,
  useAppSelector,
} from '@app/store';
import { renderWithProviders } from '@app/test-utils';

// Test component that shows auth-dependent navigation options
const NavigationOptionsComponent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();

  return (
    <Box testID="navigation-options">
      <Text testID="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Text>
      <Box testID="navigation-items">
        <Text testID="nav-home">Home</Text>
        {isAuthenticated && (
          <>
            <Text testID="nav-profile">Profile</Text>
            <Text testID="nav-settings">Settings</Text>
            <Pressable
              testID="logout-button"
              onPress={() => dispatch(logout())}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <Text>Logout</Text>
            </Pressable>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Text testID="nav-login">Login</Text>
            <Text testID="nav-register">Register</Text>
          </>
        )}
      </Box>
    </Box>
  );
};

// Test component that shows profile data affecting settings
const ProfileSettingsComponent: React.FC = () => {
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();

  return (
    <Box testID="profile-settings">
      <Text testID="profile-name">{profile?.name ?? 'No Name'}</Text>
      <Text testID="profile-email">{profile?.email ?? 'No Email'}</Text>
      <Pressable
        testID="update-profile-button"
        onPress={() =>
          dispatch(
            updateUserProfile({
              firstName: 'Updated',
              lastName: 'User',
            })
          )
        }
        accessibilityRole="button"
        accessibilityLabel="Update profile"
      >
        <Text>Update Profile</Text>
      </Pressable>
    </Box>
  );
};

// Helper to create profile state with correct structure (matches Profile type)
const createProfileState = (hasProfile: boolean) => ({
  data: hasProfile
    ? {
        profilePicture: 'https://example.com/photo.jpg',
        name: 'John',
        lastName: 'Doe',
        headline: 'Software Developer',
        namePronunciation: 'John Doe',
        namePronunciationAudioTrack: '',
        email: 'john@example.com',
        phone: '+1234567890',
        birthday: '1990-01-01',
        location: {
          cityTown: 'London',
          county: 'Greater London',
          country: 'UK',
          coordinates: { latitude: 51.5074, longitude: -0.1278 },
        },
        galleryImages: [],
        socials: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedIn: 'johndoe',
        },
      }
    : null,
  loading: false,
  error: null,
});

// Test component that responds to language changes
const LanguageAwareComponent: React.FC = () => {
  const { t } = useTranslation();
  const currentLanguage = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();

  return (
    <Box testID="language-aware">
      <Text testID="current-language">{currentLanguage}</Text>
      <Text testID="translated-text">{t('home.title')}</Text>
      <Pressable
        testID="change-to-es-button"
        onPress={() => dispatch(setLanguage('es'))}
        accessibilityRole="button"
        accessibilityLabel="Change language to Spanish"
      >
        <Text>Spanish</Text>
      </Pressable>
      <Pressable
        testID="change-to-en-button"
        onPress={() => dispatch(setLanguage('en'))}
        accessibilityRole="button"
        accessibilityLabel="Change language to English"
      >
        <Text>English</Text>
      </Pressable>
    </Box>
  );
};

// Test component that responds to theme changes
const ThemeAwareComponent: React.FC = () => {
  const currentTheme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  return (
    <Box testID="theme-aware" bg={currentTheme === 'dark' ? '$black' : '$white'} p="$4">
      <Text testID="current-theme" color={currentTheme === 'dark' ? '$white' : '$black'}>
        {currentTheme}
      </Text>
      <Pressable
        testID="toggle-dark-button"
        onPress={() => dispatch(setTheme('dark'))}
        accessibilityRole="button"
        accessibilityLabel="Switch to dark theme"
      >
        <Text>Dark</Text>
      </Pressable>
      <Pressable
        testID="toggle-light-button"
        onPress={() => dispatch(setTheme('light'))}
        accessibilityRole="button"
        accessibilityLabel="Switch to light theme"
      >
        <Text>Light</Text>
      </Pressable>
      <Pressable
        testID="toggle-system-button"
        onPress={() => dispatch(setTheme('system'))}
        accessibilityRole="button"
        accessibilityLabel="Use system theme"
      >
        <Text>System</Text>
      </Pressable>
    </Box>
  );
};

// Test component that shows all state cleared on logout
const FullStateComponent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const profile = useAppSelector(selectProfile);
  const language = useAppSelector(selectLanguage);
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
  };

  return (
    <Box testID="full-state">
      <Text testID="auth-state">{isAuthenticated ? 'Logged In' : 'Logged Out'}</Text>
      <Text testID="profile-state">{profile ? 'Has Profile' : 'No Profile'}</Text>
      <Text testID="language-state">{language}</Text>
      <Text testID="theme-state">{theme}</Text>
      <Pressable
        testID="full-logout-button"
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Log out and clear data"
      >
        <Text>Logout</Text>
      </Pressable>
    </Box>
  );
};

// Test component for deep link handling
const DeepLinkComponent: React.FC<{
  initialPath?: string;
  params?: Record<string, string>;
}> = ({ initialPath, params }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();

  // Parse deep link and determine target
  const getDeepLinkTarget = () => {
    if (!initialPath) return 'home';

    if (initialPath.includes('profile')) {
      return isAuthenticated ? 'profile' : 'login-required';
    }
    if (initialPath.includes('settings')) {
      return isAuthenticated ? 'settings' : 'login-required';
    }
    if (initialPath.includes('shared-content')) {
      return 'shared-content';
    }
    return 'home';
  };

  const target = getDeepLinkTarget();

  return (
    <Box testID="deep-link-handler">
      <Text testID="deep-link-path">{initialPath ?? 'none'}</Text>
      <Text testID="deep-link-target">{target}</Text>
      {params && <Text testID="deep-link-params">{JSON.stringify(params)}</Text>}
      {target === 'login-required' && (
        <Text testID="auth-required-message">Please log in to continue</Text>
      )}
      <Pressable
        testID="simulate-login"
        onPress={() =>
          dispatch(
            updateUserProfile({
              firstName: 'Test',
              lastName: 'User',
            })
          )
        }
        accessibilityRole="button"
        accessibilityLabel="Simulate login"
      >
        <Text>Simulate Login</Text>
      </Pressable>
    </Box>
  );
};

// Multi-screen component to test global changes
const MultiScreenLayout: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const theme = useAppSelector(selectTheme);
  const { t } = useTranslation();

  return (
    <Box testID="multi-screen-layout">
      <Box testID="header-screen">
        <Text testID="header-language">{language}</Text>
        <Text testID="header-theme">{theme}</Text>
      </Box>
      <Box testID="main-screen">
        <Text testID="main-language">{language}</Text>
        <Text testID="main-translated">{t('home.title')}</Text>
      </Box>
      <Box testID="footer-screen">
        <Text testID="footer-language">{language}</Text>
        <Text testID="footer-theme">{theme}</Text>
      </Box>
    </Box>
  );
};

describe('Cross-Feature Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth state affects navigation options', () => {
    it('should show auth-only navigation when authenticated', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(<NavigationOptionsComponent />, {
        preloadedState: {
          auth: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              phoneNumber: null,
              profilePicture: null,
              authProvider: 'email',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            biometricEnabled: false,
          },
        },
      });

      expect(getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(getByTestId('nav-profile')).toBeOnTheScreen();
      expect(getByTestId('nav-settings')).toBeOnTheScreen();
      expect(getByTestId('logout-button')).toBeOnTheScreen();
      expect(queryByTestId('nav-login')).toBeNull();
      expect(queryByTestId('nav-register')).toBeNull();
    });

    it('should show public navigation when not authenticated', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(<NavigationOptionsComponent />, {
        preloadedState: {
          auth: {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            biometricEnabled: false,
          },
        },
      });

      expect(getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(getByTestId('nav-login')).toBeOnTheScreen();
      expect(getByTestId('nav-register')).toBeOnTheScreen();
      expect(queryByTestId('nav-profile')).toBeNull();
      expect(queryByTestId('nav-settings')).toBeNull();
    });

    it('should update navigation when auth state changes', async () => {
      const { getByTestId, store } = renderWithProviders(<NavigationOptionsComponent />, {
        preloadedState: {
          auth: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              phoneNumber: null,
              profilePicture: null,
              authProvider: 'email',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            biometricEnabled: false,
          },
        },
      });

      expect(getByTestId('nav-profile')).toBeOnTheScreen();

      // Trigger logout
      fireEvent.press(getByTestId('logout-button'));

      await waitFor(
        () => {
          expect(store.getState().auth.isAuthenticated).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('profile update reflects in Settings', () => {
    it('should display profile data from store', () => {
      const { getByTestId } = renderWithProviders(<ProfileSettingsComponent />, {
        preloadedState: {
          profile: createProfileState(true),
        },
      });

      expect(getByTestId('profile-name')).toHaveTextContent('John');
      expect(getByTestId('profile-email')).toHaveTextContent('john@example.com');
    });

    it('should show placeholder when no profile exists', () => {
      const { getByTestId } = renderWithProviders(<ProfileSettingsComponent />, {
        preloadedState: {
          profile: createProfileState(false),
        },
      });

      expect(getByTestId('profile-name')).toHaveTextContent('No Name');
      expect(getByTestId('profile-email')).toHaveTextContent('No Email');
    });
  });

  describe('language change updates all screens', () => {
    it('should change language across all components', async () => {
      const { getByTestId, store } = renderWithProviders(<LanguageAwareComponent />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      expect(getByTestId('current-language')).toHaveTextContent('en');

      fireEvent.press(getByTestId('change-to-es-button'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('es');
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('current-language')).toHaveTextContent('es');
    });

    it('should propagate language change to all screens in layout', async () => {
      const { getByTestId, store } = renderWithProviders(
        <>
          <MultiScreenLayout />
          <LanguageAwareComponent />
        </>,
        {
          preloadedState: {
            settings: {
              theme: 'system',
              language: 'en',
            },
          },
        }
      );

      // All screens should show English
      expect(getByTestId('header-language')).toHaveTextContent('en');
      expect(getByTestId('main-language')).toHaveTextContent('en');
      expect(getByTestId('footer-language')).toHaveTextContent('en');

      // Change language
      fireEvent.press(getByTestId('change-to-es-button'));

      await waitFor(
        () => {
          expect(store.getState().settings.language).toBe('es');
        },
        { timeout: 3000, interval: 100 }
      );

      // All screens should update
      expect(getByTestId('header-language')).toHaveTextContent('es');
      expect(getByTestId('main-language')).toHaveTextContent('es');
      expect(getByTestId('footer-language')).toHaveTextContent('es');
    });
  });

  describe('theme change applies globally', () => {
    it('should apply theme change to component', async () => {
      const { getByTestId, store } = renderWithProviders(<ThemeAwareComponent />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      expect(getByTestId('current-theme')).toHaveTextContent('light');

      fireEvent.press(getByTestId('toggle-dark-button'));

      await waitFor(
        () => {
          expect(store.getState().settings.theme).toBe('dark');
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should propagate theme to all screens', async () => {
      const { getByTestId, store } = renderWithProviders(
        <>
          <MultiScreenLayout />
          <ThemeAwareComponent />
        </>,
        {
          preloadedState: {
            settings: {
              theme: 'light',
              language: 'en',
            },
          },
        }
      );

      expect(getByTestId('header-theme')).toHaveTextContent('light');
      expect(getByTestId('footer-theme')).toHaveTextContent('light');

      fireEvent.press(getByTestId('toggle-dark-button'));

      await waitFor(
        () => {
          expect(store.getState().settings.theme).toBe('dark');
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('header-theme')).toHaveTextContent('dark');
      expect(getByTestId('footer-theme')).toHaveTextContent('dark');
    });

    it('should support system theme option', async () => {
      const { getByTestId, store } = renderWithProviders(<ThemeAwareComponent />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      fireEvent.press(getByTestId('toggle-system-button'));

      await waitFor(
        () => {
          expect(store.getState().settings.theme).toBe('system');
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('current-theme')).toHaveTextContent('system');
    });
  });

  describe('logout clears all feature state', () => {
    it('should clear auth state on logout', async () => {
      const { getByTestId, store } = renderWithProviders(<FullStateComponent />, {
        preloadedState: {
          auth: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              phoneNumber: null,
              profilePicture: null,
              authProvider: 'email',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            biometricEnabled: false,
          },
          profile: createProfileState(true),
        },
      });

      expect(getByTestId('auth-state')).toHaveTextContent('Logged In');
      expect(getByTestId('profile-state')).toHaveTextContent('Has Profile');

      fireEvent.press(getByTestId('full-logout-button'));

      await waitFor(
        () => {
          expect(store.getState().auth.isAuthenticated).toBe(false);
          expect(store.getState().profile.data).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('auth-state')).toHaveTextContent('Logged Out');
      expect(getByTestId('profile-state')).toHaveTextContent('No Profile');
    });

    it('should preserve settings on logout', async () => {
      const { getByTestId, store } = renderWithProviders(<FullStateComponent />, {
        preloadedState: {
          auth: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              phoneNumber: null,
              profilePicture: null,
              authProvider: 'email',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            biometricEnabled: false,
          },
          settings: {
            theme: 'dark',
            language: 'es',
          },
        },
      });

      expect(getByTestId('language-state')).toHaveTextContent('es');
      expect(getByTestId('theme-state')).toHaveTextContent('dark');

      fireEvent.press(getByTestId('full-logout-button'));

      await waitFor(
        () => {
          expect(store.getState().auth.isAuthenticated).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Settings should be preserved
      expect(getByTestId('language-state')).toHaveTextContent('es');
      expect(getByTestId('theme-state')).toHaveTextContent('dark');
    });
  });

  describe('deep link triggers correct feature flow', () => {
    it('should route to profile when authenticated', () => {
      const { getByTestId } = renderWithProviders(
        <DeepLinkComponent initialPath="/profile/edit" />,
        {
          preloadedState: {
            auth: {
              user: {
                id: 'user-1',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: null,
                profilePicture: null,
                authProvider: 'email',
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('deep-link-path')).toHaveTextContent('/profile/edit');
      expect(getByTestId('deep-link-target')).toHaveTextContent('profile');
    });

    it('should require login for protected routes when unauthenticated', () => {
      const { getByTestId } = renderWithProviders(
        <DeepLinkComponent initialPath="/settings/account" />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('deep-link-target')).toHaveTextContent('login-required');
      expect(getByTestId('auth-required-message')).toBeOnTheScreen();
    });

    it('should handle public deep links without auth', () => {
      const { getByTestId } = renderWithProviders(
        <DeepLinkComponent initialPath="/shared-content/abc123" />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('deep-link-target')).toHaveTextContent('shared-content');
    });

    it('should pass deep link parameters', () => {
      const { getByTestId } = renderWithProviders(
        <DeepLinkComponent
          initialPath="/shared-content/item"
          params={{ itemId: '12345', source: 'email' }}
        />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      // The params are JSON stringified, so we check for the JSON output
      const paramsText = getByTestId('deep-link-params').props.children;
      expect(paramsText).toContain('itemId');
      expect(paramsText).toContain('12345');
      expect(paramsText).toContain('source');
      expect(paramsText).toContain('email');
    });

    it('should default to home for unknown paths', () => {
      const { getByTestId } = renderWithProviders(
        <DeepLinkComponent initialPath="/unknown/route" />,
        {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              biometricEnabled: false,
            },
          },
        }
      );

      expect(getByTestId('deep-link-target')).toHaveTextContent('home');
    });
  });

  describe('accessibility', () => {
    it('should have accessible logout button', () => {
      const { getByTestId } = renderWithProviders(<NavigationOptionsComponent />, {
        preloadedState: {
          auth: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              phoneNumber: null,
              profilePicture: null,
              authProvider: 'email',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            biometricEnabled: false,
          },
        },
      });

      const logoutButton = getByTestId('logout-button');
      expect(logoutButton.props.accessibilityRole).toBe('button');
      expect(logoutButton.props.accessibilityLabel).toBe('Log out');
    });

    it('should have accessible language controls', () => {
      const { getByTestId } = renderWithProviders(<LanguageAwareComponent />);

      const esButton = getByTestId('change-to-es-button');
      expect(esButton.props.accessibilityRole).toBe('button');
      expect(esButton.props.accessibilityLabel).toBe('Change language to Spanish');
    });

    it('should have accessible theme controls', () => {
      const { getByTestId } = renderWithProviders(<ThemeAwareComponent />);

      const darkButton = getByTestId('toggle-dark-button');
      expect(darkButton.props.accessibilityRole).toBe('button');
      expect(darkButton.props.accessibilityLabel).toBe('Switch to dark theme');
    });
  });
});
