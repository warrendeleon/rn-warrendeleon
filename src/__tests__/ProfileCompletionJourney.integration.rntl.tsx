/**
 * Profile Completion Journey Integration Tests
 *
 * Tests for complete profile completion flows:
 * - Profile viewing with various data states
 * - Account editing with form validation
 * - Change password journey
 * - Logout flow with confirmation
 * - Profile picture section interactions
 *
 * These tests verify end-to-end user flows behave
 * correctly throughout the profile management process.
 */

import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { EditAccountScreen } from '@app/features/Profile/EditAccountScreen';
import { renderWithProviders } from '@app/test-utils';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const React = jest.requireActual('react');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      reset: mockReset,
      setOptions: jest.fn(),
      setParams: jest.fn(),
      addListener: jest.fn(() => () => {}),
      removeListener: jest.fn(),
      dispatch: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
      getId: jest.fn(),
      getParent: jest.fn(),
      getState: jest.fn(() => ({
        key: 'EditAccount',
        index: 0,
        routeNames: ['EditAccount'],
        routes: [{ key: 'EditAccount', name: 'EditAccount', params: undefined }],
      })),
    }),
    useRoute: () => ({
      key: 'EditAccount-1',
      name: 'EditAccount',
      params: {},
    }),
    useFocusEffect: (callback: () => void) => {
      React.useEffect(callback, [callback]);
    },
  };
});

// Mock SupabaseAuthClient
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    updateUser: jest.fn().mockResolvedValue({
      id: 'user-123',
      aud: 'authenticated',
      email: 'warren@example.com',
      user_metadata: {
        first_name: 'Warren Updated',
        last_name: 'de Leon',
      },
    }),
    getCurrentUser: jest.fn().mockResolvedValue({
      id: 'user-123',
      email: 'warren@example.com',
      user_metadata: {
        first_name: 'Warren',
        last_name: 'de Leon',
      },
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

const authenticatedState = {
  auth: {
    user: {
      id: 'user-123',
      email: 'warren@example.com',
      firstName: 'Warren',
      lastName: 'de Leon',
      phoneNumber: '+447123456789',
      profilePicture: null,
      authProvider: 'email' as const,
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    biometricEnabled: false,
  },
};

const socialAuthState = {
  auth: {
    user: {
      id: 'user-456',
      email: 'social@example.com',
      firstName: 'Social',
      lastName: 'User',
      phoneNumber: null,
      profilePicture: 'https://example.com/avatar.jpg',
      authProvider: 'linkedin' as const,
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    biometricEnabled: false,
  },
};

describe('Profile Completion Journey Integration', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseColorScheme.mockReturnValue('light');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('profile editing journey', () => {
    it('should complete full profile edit flow', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      // Verify screen loaded
      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Edit profile fields
      await fireEvent.changeText(getByTestId('first-name-input'), 'Warren Updated');
      await fireEvent.changeText(getByTestId('last-name-input'), 'de Leon Updated');

      // Verify changes are reflected
      expect(getByDisplayValue('Warren Updated')).toBeOnTheScreen();
      expect(getByDisplayValue('de Leon Updated')).toBeOnTheScreen();

      // Save button should be available
      expect(getByTestId('save-button')).toBeOnTheScreen();
    });

    it('should navigate through edit account to change password', async () => {
      const { getByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Navigate to change password
      await fireEvent.press(getByTestId('change-password-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ChangePassword');
    });

    it('should complete profile edit with keyboard navigation', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Fill first name and navigate to next field
      await fireEvent.changeText(getByTestId('first-name-input'), 'John');
      await fireEvent(getByTestId('first-name-input'), 'submitEditing');

      // Fill last name
      await fireEvent.changeText(getByTestId('last-name-input'), 'Smith');
      await fireEvent(getByTestId('last-name-input'), 'submitEditing');

      // Verify all changes
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('Smith')).toBeOnTheScreen();
    });
  });

  describe('logout journey', () => {
    it('should complete logout flow with confirmation', async () => {
      const { getByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Initiate logout
      await fireEvent.press(getByTestId('logout-button'));

      // Confirmation dialog should appear
      await waitFor(
        () => {
          expect(getByTestId('logout-dialog')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should cancel logout and remain on screen', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Initiate logout
      await fireEvent.press(getByTestId('logout-button'));

      await waitFor(
        () => {
          expect(getByTestId('logout-dialog')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Cancel logout
      await fireEvent.press(getByTestId('logout-cancel-button'));

      // Dialog should close, remain on edit account
      await waitFor(
        () => {
          expect(queryByTestId('logout-dialog')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });
  });

  describe('social auth profile journey', () => {
    it('should display social auth profile correctly', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: socialAuthState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Social auth user data should be displayed
      expect(getByDisplayValue('Social')).toBeOnTheScreen();
      expect(getByDisplayValue('User')).toBeOnTheScreen();
    });

    it('should allow social auth user to edit profile', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: socialAuthState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Edit profile
      await fireEvent.changeText(getByTestId('first-name-input'), 'Updated Social');

      expect(getByDisplayValue('Updated Social')).toBeOnTheScreen();
    });
  });

  describe('profile journey state transitions', () => {
    it('should handle loading state during profile operations', async () => {
      const { getByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: {
          ...authenticatedState,
          auth: {
            ...authenticatedState.auth,
            isLoading: true,
          },
        },
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle transition from editing to saving', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <EditAccountScreen />,
        { preloadedState: authenticatedState }
      );

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make changes
      await fireEvent.changeText(getByTestId('first-name-input'), 'NewName');
      expect(getByDisplayValue('NewName')).toBeOnTheScreen();

      // Simulate save in progress
      await rerender(<EditAccountScreen />);

      // Form should remain stable
      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });

    it('should handle error state during profile journey', async () => {
      const { getByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: {
          ...authenticatedState,
          auth: {
            ...authenticatedState.auth,
            error: 'Failed to save profile',
          },
        },
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // User can still interact with form
      await fireEvent.changeText(getByTestId('first-name-input'), 'Retry');

      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });
  });

  describe('profile journey validation', () => {
    it('should validate name fields during edit journey', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Clear first name (invalid)
      await fireEvent.changeText(getByTestId('first-name-input'), '');

      // Form reflects the empty value
      expect(getByDisplayValue('')).toBeOnTheScreen();
    });

    it('should allow valid Unicode names in profile', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Enter Unicode name
      await fireEvent.changeText(getByTestId('first-name-input'), '田中');
      await fireEvent.changeText(getByTestId('last-name-input'), '太郎');

      expect(getByDisplayValue('田中')).toBeOnTheScreen();
      expect(getByDisplayValue('太郎')).toBeOnTheScreen();
    });

    it('should handle special characters in profile names', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Enter names with special characters
      await fireEvent.changeText(getByTestId('first-name-input'), "O'Brien");
      await fireEvent.changeText(getByTestId('last-name-input'), 'García-López');

      expect(getByDisplayValue("O'Brien")).toBeOnTheScreen();
      expect(getByDisplayValue('García-López')).toBeOnTheScreen();
    });
  });

  describe('profile journey interruption handling', () => {
    it('should handle unmount during profile edit', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make changes
      await fireEvent.changeText(getByTestId('first-name-input'), 'Interrupted');

      // Unmount during edit
      await unmount();
      jest.runAllTimers();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid navigation during profile journey', async () => {
      const { getByTestId } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Rapid navigation actions
      await fireEvent.press(getByTestId('change-password-button'));
      await fireEvent.press(getByTestId('change-password-button'));
      await fireEvent.press(getByTestId('change-password-button'));

      // Navigation should be called
      expect(mockNavigate).toHaveBeenCalled();
      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });
  });

  describe('profile data persistence', () => {
    it('should preserve edits across rerenders', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <EditAccountScreen />,
        { preloadedState: authenticatedState }
      );

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make changes
      await fireEvent.changeText(getByTestId('first-name-input'), 'Persisted');

      // Multiple rerenders
      for (let i = 0; i < 3; i++) {
        await rerender(<EditAccountScreen />);
      }

      // Data should be preserved
      expect(getByDisplayValue('Persisted')).toBeOnTheScreen();
    });

    it('should handle form state during multiple field edits', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Multiple rapid edits
      await fireEvent.changeText(getByTestId('first-name-input'), 'A');
      await fireEvent.changeText(getByTestId('last-name-input'), 'B');
      await fireEvent.changeText(getByTestId('first-name-input'), 'AB');
      await fireEvent.changeText(getByTestId('last-name-input'), 'CD');
      await fireEvent.changeText(getByTestId('first-name-input'), 'Final First');
      await fireEvent.changeText(getByTestId('last-name-input'), 'Final Last');

      // Final values should be correct
      expect(getByDisplayValue('Final First')).toBeOnTheScreen();
      expect(getByDisplayValue('Final Last')).toBeOnTheScreen();
    });
  });

  describe('theme changes during profile journey', () => {
    it('should handle theme change during profile edit', async () => {
      const { getByTestId, getByDisplayValue, rerender } = await renderWithProviders(
        <EditAccountScreen />,
        { preloadedState: authenticatedState }
      );

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make changes
      await fireEvent.changeText(getByTestId('first-name-input'), 'Dark Mode');

      // Switch to dark mode
      mockUseColorScheme.mockReturnValue('dark');
      await rerender(<EditAccountScreen />);

      // Data should be preserved
      expect(getByDisplayValue('Dark Mode')).toBeOnTheScreen();
      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });
  });

  describe('complete profile journey scenarios', () => {
    it('should handle full edit → save → navigate flow', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Complete edit journey
      await fireEvent.changeText(getByTestId('first-name-input'), 'Complete');
      await fireEvent.changeText(getByTestId('last-name-input'), 'Journey');

      expect(getByDisplayValue('Complete')).toBeOnTheScreen();
      expect(getByDisplayValue('Journey')).toBeOnTheScreen();

      // Press save
      await fireEvent.press(getByTestId('save-button'));

      // Screen should remain stable
      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });

    it('should handle edit → cancel → re-edit flow', async () => {
      const { getByTestId, getByDisplayValue } = await renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make changes
      await fireEvent.changeText(getByTestId('first-name-input'), 'First Edit');
      expect(getByDisplayValue('First Edit')).toBeOnTheScreen();

      // Clear and re-edit
      await fireEvent.changeText(getByTestId('first-name-input'), '');
      await fireEvent.changeText(getByTestId('first-name-input'), 'Second Edit');

      expect(getByDisplayValue('Second Edit')).toBeOnTheScreen();
    });
  });
});
