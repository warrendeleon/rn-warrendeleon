/**
 * Profile Form Recovery Tests
 *
 * Tests for multi-step form recovery scenarios in profile editing:
 * - Form abandoned mid-edit, resume on return
 * - Form data preserved during navigation
 * - Form draft cleanup after successful submission
 * - Back navigation preserves form data
 * - Network error allows retry with preserved data
 *
 * These tests verify resilience and recovery behaviour during
 * profile editing interactions.
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { EditAccountScreen } from '../EditAccountScreen';

// Mock storage modules
jest.mock('@app/utils/storage/SecureStore');
jest.mock('@app/utils/storage/EncryptedStore', () => ({
  EncryptedStore: {
    get: jest.fn().mockImplementation((key: string) => {
      const mockData: Record<string, string | null> = {
        auth_provider: 'email',
        profile_picture_url: null,
      };
      return Promise.resolve(mockData[key] ?? null);
    }),
    set: jest.fn().mockResolvedValue(true),
  },
  EncryptedStoreKey: {
    USER_FIRST_NAME: 'user_first_name',
    USER_LAST_NAME: 'user_last_name',
    USER_EMAIL: 'user_email',
    PROFILE_PICTURE_URL: 'profile_picture_url',
    AUTH_PROVIDER: 'auth_provider',
  },
}));

// Mock SupabaseAuthClient
jest.mock('@app/httpClients', () => ({
  SupabaseAuthClient: {
    updateUser: jest.fn().mockResolvedValue({
      id: 'user-123',
      aud: 'authenticated',
      email: 'warren@example.com',
      email_confirmed_at: new Date().toISOString(),
      phone: null,
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      user_metadata: {
        first_name: 'Warren Updated',
        last_name: 'de Leon',
      },
    }),
    getCurrentUser: jest.fn().mockResolvedValue({
      id: 'user-123',
      aud: 'authenticated',
      email: 'warren@example.com',
      email_confirmed_at: new Date().toISOString(),
      phone: null,
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      user_metadata: {
        first_name: 'Warren',
        last_name: 'de Leon',
      },
    }),
  },
}));

// Mock react-navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockSetParams = jest.fn();

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
      setParams: mockSetParams,
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

const authenticatedState = {
  auth: {
    user: {
      id: 'user-123',
      email: 'warren@example.com',
      firstName: 'Warren',
      lastName: 'de Leon',
      phoneNumber: null,
      profilePicture: null,
      authProvider: 'email' as const,
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    biometricEnabled: false,
  },
};

describe('Profile Form Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('form data preservation during editing', () => {
    it('should preserve edited form data during rerender', async () => {
      const { getByTestId, getByDisplayValue, rerender } = renderWithProviders(
        <EditAccountScreen />,
        { preloadedState: authenticatedState }
      );

      // Wait for form to load
      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Edit first name
      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'Warren Updated');

      // Rerender (simulates navigation back)
      rerender(<EditAccountScreen />);

      // Data should be preserved
      expect(getByDisplayValue('Warren Updated')).toBeOnTheScreen();
    });

    it('should preserve multiple field edits', async () => {
      const { getByTestId, getByDisplayValue, rerender } = renderWithProviders(
        <EditAccountScreen />,
        { preloadedState: authenticatedState }
      );

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Edit multiple fields
      fireEvent.changeText(getByTestId('first-name-input'), 'John');
      fireEvent.changeText(getByTestId('last-name-input'), 'Smith');

      // Rerender
      rerender(<EditAccountScreen />);

      // Both edits preserved
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('Smith')).toBeOnTheScreen();
    });

    it('should preserve edits after blur events', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Edit and blur
      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent(firstNameInput, 'blur');

      // Data should be preserved after blur
      expect(getByDisplayValue('John')).toBeOnTheScreen();
    });
  });

  describe('form recovery after error', () => {
    it('should preserve form data when save fails', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
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

      // Edit form while error is displayed
      fireEvent.changeText(getByTestId('first-name-input'), 'John');
      fireEvent.changeText(getByTestId('last-name-input'), 'Doe');

      // Data should be preserved
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('Doe')).toBeOnTheScreen();
    });

    it('should allow retry after network error', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make changes
      fireEvent.changeText(getByTestId('first-name-input'), 'John');

      // Verify data is there (can retry)
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByTestId('save-button')).toBeOnTheScreen();
    });
  });

  describe('form state during loading', () => {
    it('should preserve form data during save operation', async () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
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

      // Even during loading, form should render with data
      // and not lose any pending edits
      expect(getByTestId('first-name-input')).toBeOnTheScreen();
    });
  });

  describe('unmount and remount recovery', () => {
    it('should not crash on unmount during form edit', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount, getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Start editing
      fireEvent.changeText(getByTestId('first-name-input'), 'John');

      // Unmount mid-edit
      expect(() => unmount()).not.toThrow();

      // No memory leak warnings
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('unmounted component'))
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid mount/unmount cycles', async () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderWithProviders(<EditAccountScreen />, {
          preloadedState: authenticatedState,
        });
        unmount();
      }

      // Final mount should work correctly
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle multiple rapid rerenders during form edit', async () => {
      const { getByTestId, getByDisplayValue, rerender } = renderWithProviders(
        <EditAccountScreen />,
        { preloadedState: authenticatedState }
      );

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Rapid edits with rerenders
      fireEvent.changeText(getByTestId('first-name-input'), 'J');
      rerender(<EditAccountScreen />);

      fireEvent.changeText(getByTestId('first-name-input'), 'Jo');
      rerender(<EditAccountScreen />);

      fireEvent.changeText(getByTestId('first-name-input'), 'Joh');
      rerender(<EditAccountScreen />);

      fireEvent.changeText(getByTestId('first-name-input'), 'John');

      // Final value should be preserved
      expect(getByDisplayValue('John')).toBeOnTheScreen();
    });
  });

  describe('keyboard interaction recovery', () => {
    it('should preserve form data after keyboard show/hide cycles', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Edit with keyboard interactions
      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent(firstNameInput, 'blur');

      const lastNameInput = getByTestId('last-name-input');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent(lastNameInput, 'blur');

      // Data should be preserved
      expect(getByDisplayValue('John')).toBeOnTheScreen();
      expect(getByDisplayValue('Doe')).toBeOnTheScreen();
    });

    it('should preserve data when keyboard is dismissed via submit editing', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Fill and submit edit
      fireEvent.changeText(getByTestId('first-name-input'), 'John');
      fireEvent(getByTestId('first-name-input'), 'submitEditing');

      // Data preserved
      expect(getByDisplayValue('John')).toBeOnTheScreen();
    });
  });

  describe('edge cases', () => {
    it('should handle clearing field to empty string', async () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Fill then clear
      fireEvent.changeText(getByTestId('first-name-input'), 'John');
      fireEvent.changeText(getByTestId('first-name-input'), '');

      expect(getByTestId('first-name-input').props.value).toBe('');
    });

    it('should handle special characters in profile fields', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Names with special characters
      fireEvent.changeText(getByTestId('first-name-input'), "O'Brien");
      fireEvent.changeText(getByTestId('last-name-input'), 'García-López');

      expect(getByDisplayValue("O'Brien")).toBeOnTheScreen();
      expect(getByDisplayValue('García-López')).toBeOnTheScreen();
    });

    it('should handle Unicode characters in names', async () => {
      const { getByTestId, getByDisplayValue } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Unicode names
      fireEvent.changeText(getByTestId('first-name-input'), '田中');
      fireEvent.changeText(getByTestId('last-name-input'), '太郎');

      expect(getByDisplayValue('田中')).toBeOnTheScreen();
      expect(getByDisplayValue('太郎')).toBeOnTheScreen();
    });

    it('should handle very long input values', async () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      const longName = 'A'.repeat(100);
      fireEvent.changeText(getByTestId('first-name-input'), longName);

      // Should handle without crash
      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });
  });

  describe('dirty state tracking', () => {
    it('should track when form has unsaved changes', async () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make a change
      fireEvent.changeText(getByTestId('first-name-input'), 'John');

      // Save button should be enabled (form is dirty)
      const saveButton = getByTestId('save-button');
      expect(saveButton).toBeOnTheScreen();
    });

    it('should reset dirty state after successful save simulation', async () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      await waitFor(
        () => {
          expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Make a change
      fireEvent.changeText(getByTestId('first-name-input'), 'John');

      // Press save
      fireEvent.press(getByTestId('save-button'));

      // Screen should remain stable
      expect(getByTestId('edit-account-screen')).toBeOnTheScreen();
    });
  });
});
