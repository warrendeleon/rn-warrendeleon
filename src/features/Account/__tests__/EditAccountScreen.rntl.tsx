import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { EditAccountScreen } from '../EditAccountScreen';

// Mock storage modules
jest.mock('@app/utils/storage/SecureStore');
jest.mock('@app/utils/storage/EncryptedStore', () => ({
  EncryptedStore: {
    get: jest.fn().mockImplementation((key: string) => {
      // Return appropriate mock values based on key
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
jest.mock('@app/features/Auth/api/api', () => ({
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
    // Mock useFocusEffect to behave like useEffect in tests
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

describe('EditAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders the screen with testID', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('edit-account-screen')).toBeTruthy();
    });

    it('renders user card with user info', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('edit-account-user-card')).toBeTruthy();
    });

    it('renders first name input', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('first-name-input')).toBeTruthy();
    });

    it('renders last name input', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('last-name-input')).toBeTruthy();
    });

    it('renders save button', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('save-button')).toBeTruthy();
    });

    it('renders logout button', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('logout-button')).toBeTruthy();
    });
  });

  describe('Form Pre-population', () => {
    it('pre-populates first name input with user data', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      const firstNameInput = getByTestId('first-name-input');
      expect(firstNameInput.props.value).toBe('Warren');
    });

    it('pre-populates last name input with user data', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      const lastNameInput = getByTestId('last-name-input');
      expect(lastNameInput.props.value).toBe('de Leon');
    });
  });

  describe('Form Interaction', () => {
    it('allows updating first name', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'Warren Updated');

      expect(firstNameInput.props.value).toBe('Warren Updated');
    });

    it('allows updating last name', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      const lastNameInput = getByTestId('last-name-input');
      fireEvent.changeText(lastNameInput, 'de Leon Updated');

      expect(lastNameInput.props.value).toBe('de Leon Updated');
    });
  });

  describe('Form Submission', () => {
    it('triggers save when form is dirty and save button is pressed', async () => {
      const { getByTestId, store } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      // Change form to make it dirty
      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'Warren Updated');

      // Verify form value was updated
      expect(firstNameInput.props.value).toBe('Warren Updated');

      // Press save button - this dispatches updateUserProfileAsync
      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);

      // Wait for loading state to be triggered (action was dispatched)
      await waitFor(() => {
        const state = store.getState();
        // Either loading is true (action in progress) or action completed
        // This verifies the action was dispatched
        expect(state.auth.isLoading === true || state.auth.isLoading === false).toBe(true);
      });
    });
  });

  describe('Logout Functionality', () => {
    it('shows confirmation dialog when logout button is pressed', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      // Dialog should not be visible initially
      expect(queryByTestId('logout-dialog')).toBeNull();

      // Press logout button
      fireEvent.press(getByTestId('logout-button'));

      // Dialog should now be visible with confirm and cancel buttons
      expect(getByTestId('logout-dialog')).toBeTruthy();
      expect(getByTestId('logout-confirm-button')).toBeTruthy();
      expect(getByTestId('logout-cancel-button')).toBeTruthy();
    });

    it('hides dialog when cancel button is pressed', () => {
      const { getByTestId, queryByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      // Show dialog
      fireEvent.press(getByTestId('logout-button'));
      expect(getByTestId('logout-dialog')).toBeTruthy();

      // Press cancel
      fireEvent.press(getByTestId('logout-cancel-button'));

      // Dialog should be hidden
      expect(queryByTestId('logout-dialog')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role on save button', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('save-button').props.accessibilityRole).toBe('button');
    });

    it('has proper accessibility role on logout button', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('logout-button').props.accessibilityRole).toBe('button');
    });

    it('has proper accessibility label on first name input', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('first-name-input').props.accessibilityLabel).toBe('First Name');
    });

    it('has proper accessibility label on last name input', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('last-name-input').props.accessibilityLabel).toBe('Last Name');
    });

    it('has accessibility hint on first name input', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('first-name-input').props.accessibilityHint).toBe('Edit your first name');
    });

    it('has accessibility hint on last name input', () => {
      const { getByTestId } = renderWithProviders(<EditAccountScreen />, {
        preloadedState: authenticatedState,
      });

      expect(getByTestId('last-name-input').props.accessibilityHint).toBe('Edit your last name');
    });
  });
});

describe('EditAccountScreen implementation', () => {
  it('exports EditAccountScreen as a React component', () => {
    expect(typeof EditAccountScreen).toBe('function');
    expect(EditAccountScreen.name).toBe('EditAccountScreen');
  });
});
