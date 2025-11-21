# TASK-215: Login RNTL Tests

**ID**: TASK-215 | **Title**: Write RNTL Tests for Login Screen and useLogin Hook
**User Story**: [US-036](../stories/US-036-email-password-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 1.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

This task ensures 100% test coverage for the login functionality using React Native Testing Library (RNTL). Tests validate UI interactions, form validation, API integration, token storage, and error handling.

---

## Objective

Write comprehensive unit tests for:

1. LoginScreen component (UI, form interactions)
2. useLogin hook (API calls, token storage, navigation)
3. loginWithEmail API function (Zod validation, error handling)
4. tokenStorage utilities (Keychain operations)

**Coverage Target**: 100%

---

## Test Files

### File 1: `src/screens/auth/__tests__/LoginScreen.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { useLogin } from '../../../hooks/useLogin';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../../../hooks/useLogin');

const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLogin as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });
  });

  it('should render correctly', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    expect(getByTestId('login-screen')).toBeTruthy();
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('should show email validation error on invalid email', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = getByTestId('email-input');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should show password validation error on empty password', async () => {
    const { getByTestId, getByText, getByRole } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = getByTestId('email-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('should call login function on form submit', async () => {
    const mockLogin = jest.fn();
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'SecurePass123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
    });
  });

  it('should display API error message', () => {
    (useLogin as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: false,
      error: 'Incorrect email or password',
      clearError: jest.fn(),
    });

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    expect(getByTestId('login-error')).toBeTruthy();
    expect(getByText('Incorrect email or password')).toBeTruthy();
  });

  it('should show loading state during login', () => {
    (useLogin as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: true,
      error: null,
      clearError: jest.fn(),
    });

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const loginButton = getByTestId('login-button');

    expect(getByText('Logging in...')).toBeTruthy();
    expect(loginButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should toggle password visibility', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const passwordInput = getByTestId('password-input');
    const passwordToggle = getByTestId('password-toggle');

    // Initial state: password hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Tap toggle → password visible
    fireEvent.press(passwordToggle);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    // Tap again → password hidden
    fireEvent.press(passwordToggle);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should navigate to Register screen on "Sign up" press', () => {
    const { getByText } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const signUpLink = getByText('Sign up');
    fireEvent.press(signUpLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('should navigate to ForgotPassword screen on "Forgot password?" press', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const forgotPasswordLink = getByTestId('forgot-password-link');
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });
});
```

---

### File 2: `src/hooks/__tests__/useLogin.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useLogin } from '../useLogin';
import { loginWithEmail, LoginError } from '../../api/auth/login';
import { storeTokens } from '../../utils/tokenStorage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Provider } from 'react-redux';
import { store } from '../../store';

jest.mock('../../api/auth/login');
jest.mock('../../utils/tokenStorage');
jest.mock('react-native-encrypted-storage');

const mockNavigation = {
  reset: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and navigate to Home', async () => {
    const mockResponse = {
      access_token: 'mock_access_token',
      token_type: 'bearer' as const,
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
      user: {
        id: 'user-id',
        email: 'user@example.com',
        email_confirmed_at: '2025-11-21T10:30:00Z',
        created_at: '2025-11-20T08:15:00Z',
        updated_at: '2025-11-21T10:30:00Z',
        user_metadata: {
          full_name: 'John Doe',
        },
      },
    };

    (loginWithEmail as jest.Mock).mockResolvedValue(mockResponse);
    (storeTokens as jest.Mock).mockResolvedValue(undefined);
    (EncryptedStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
    });

    expect(loginWithEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'SecurePass123',
    });
    expect(storeTokens).toHaveBeenCalledWith('mock_access_token', 'mock_refresh_token');
    expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
      'user_metadata',
      expect.stringContaining('user@example.com')
    );
    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should set error on invalid credentials', async () => {
    (loginWithEmail as jest.Mock).mockRejectedValue(
      new LoginError('invalid_grant', 'Invalid login credentials', 401)
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'wrong@example.com',
        password: 'WrongPassword',
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Incorrect email or password. Please try again.');
    expect(mockNavigation.reset).not.toHaveBeenCalled();
  });

  it('should set error on rate limit exceeded', async () => {
    (loginWithEmail as jest.Mock).mockRejectedValue(
      new LoginError('rate_limit_exceeded', 'Email rate limit exceeded', 429)
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
    });

    expect(result.current.error).toBe('Too many login attempts. Please try again later.');
  });

  it('should set error on network error', async () => {
    (loginWithEmail as jest.Mock).mockRejectedValue(
      new LoginError('network_error', 'Network error', 0)
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
    });

    expect(result.current.error).toBe('Network error. Please check your connection.');
  });

  it('should clear error when clearError is called', async () => {
    (loginWithEmail as jest.Mock).mockRejectedValue(
      new LoginError('invalid_grant', 'Invalid login credentials', 401)
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'wrong@example.com',
        password: 'WrongPassword',
      });
    });

    expect(result.current.error).toBe('Incorrect email or password. Please try again.');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});
```

---

### File 3: `src/api/auth/__tests__/login.test.ts`

(Already created in TASK-214)

---

### File 4: `src/utils/__tests__/tokenStorage.test.ts`

```typescript
import * as Keychain from 'react-native-keychain';
import { storeTokens, getAccessToken, getRefreshToken, clearTokens } from '../tokenStorage';

jest.mock('react-native-keychain');

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeTokens', () => {
    it('should store access and refresh tokens in Keychain', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      await storeTokens('access_token_123', 'refresh_token_456');

      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(2);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth_access_token',
        'access_token_123',
        expect.any(Object)
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth_refresh_token',
        'refresh_token_456',
        expect.any(Object)
      );
    });

    it('should throw error if Keychain fails', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'));

      await expect(storeTokens('access_token', 'refresh_token')).rejects.toThrow(
        'Failed to store tokens securely'
      );
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from Keychain', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'auth_access_token',
        password: 'access_token_123',
      });

      const token = await getAccessToken();

      expect(token).toBe('access_token_123');
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'auth_access_token',
      });
    });

    it('should return null if no token found', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      const token = await getAccessToken();

      expect(token).toBe(null);
    });

    it('should return null if Keychain fails', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'));

      const token = await getAccessToken();

      expect(token).toBe(null);
    });
  });

  describe('clearTokens', () => {
    it('should clear both tokens from Keychain', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      await clearTokens();

      expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(2);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_access_token',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_refresh_token',
      });
    });
  });
});
```

---

## Acceptance Criteria

**Coverage**:

- [ ] LoginScreen: 100% coverage
- [ ] useLogin hook: 100% coverage
- [ ] loginWithEmail: 100% coverage (from TASK-214)
- [ ] tokenStorage: 100% coverage

**Test Scenarios**:

- [ ] LoginScreen renders correctly
- [ ] Email validation errors
- [ ] Password validation errors
- [ ] Form submission
- [ ] API error display
- [ ] Loading state
- [ ] Password visibility toggle
- [ ] Navigation links
- [ ] useLogin success flow
- [ ] useLogin error scenarios (401, 429, network)
- [ ] Token storage in Keychain
- [ ] Token retrieval from Keychain
- [ ] Token clearing

---

## Definition of Done

- [ ] All test files created
- [ ] All tests passing: `yarn test --coverage`
- [ ] 100% coverage for all files
- [ ] `yarn validate` passes

---

**Dependencies**:

- TASK-213 (Login UI Form) complete
- TASK-214 (Login API Integration) complete

**Next Task**: [TASK-216](TASK-216-login-e2e-tests.md) - Login E2E Tests

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 1.5 hours
