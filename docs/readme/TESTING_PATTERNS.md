# Testing Patterns

Code examples and patterns for React Native Testing Library (RNTL) tests.

## Table of Contents

1. [Component Testing](#component-testing)
2. [Form Testing](#form-testing)
3. [Redux Testing](#redux-testing)
4. [Async Testing](#async-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Security Testing](#security-testing)
7. [Navigation Testing](#navigation-testing)
8. [Snapshot Testing](#snapshot-testing)

---

## Component Testing

### Basic Component Render

```typescript
import { renderWithProviders } from '@app/test-utils';
import { ButtonWithChevron } from '../ButtonWithChevron';

describe('ButtonWithChevron', () => {
  it('renders with label', () => {
    const { getByText } = renderWithProviders(
      <ButtonWithChevron label="Settings" onPress={jest.fn()} />
    );

    expect(getByText('Settings')).toBeOnTheScreen();
  });

  it('renders with end label', () => {
    const { getByText } = renderWithProviders(
      <ButtonWithChevron
        label="Language"
        endLabel="English"
        onPress={jest.fn()}
      />
    );

    expect(getByText('Language')).toBeOnTheScreen();
    expect(getByText('English')).toBeOnTheScreen();
  });
});
```

### Testing Props Variations

```typescript
describe('Button variants', () => {
  const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;

  variants.forEach(variant => {
    it(`renders ${variant} variant`, () => {
      const { getByTestId } = renderWithProviders(
        <Button variant={variant} testID="button">
          Click me
        </Button>
      );

      expect(getByTestId('button')).toBeOnTheScreen();
    });
  });
});
```

### Testing Conditional Rendering

```typescript
it('shows loading indicator when loading prop is true', () => {
  const { getByTestId, queryByText } = renderWithProviders(
    <SubmitButton loading={true}>Submit</SubmitButton>
  );

  expect(getByTestId('loading-spinner')).toBeOnTheScreen();
  expect(queryByText('Submit')).toBeNull();
});

it('shows text when not loading', () => {
  const { getByText, queryByTestId } = renderWithProviders(
    <SubmitButton loading={false}>Submit</SubmitButton>
  );

  expect(getByText('Submit')).toBeOnTheScreen();
  expect(queryByTestId('loading-spinner')).toBeNull();
});
```

---

## Form Testing

### Basic Form Input

```typescript
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, TEST_CREDENTIALS } from '@app/test-utils';

it('updates input value on change', () => {
  const { getByTestId } = renderWithProviders(<LoginForm />);
  const emailInput = getByTestId('email-input');

  fireEvent.changeText(emailInput, TEST_CREDENTIALS.VALID_EMAIL);

  expect(emailInput.props.value).toBe(TEST_CREDENTIALS.VALID_EMAIL);
});
```

### Form Validation

```typescript
describe('Form Validation', () => {
  it('shows error for empty required field', async () => {
    const { getByTestId, getByText } = renderWithProviders(<LoginForm />);

    // Leave email empty and submit
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Email is required')).toBeOnTheScreen();
    });
  });

  it('shows error for invalid email format', async () => {
    const { getByTestId, getByText } = renderWithProviders(<LoginForm />);

    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeOnTheScreen();
    });
  });

  it('clears error when valid input entered', async () => {
    const { getByTestId, getByText, queryByText } = renderWithProviders(<LoginForm />);

    // Trigger error
    fireEvent.changeText(getByTestId('email-input'), 'invalid');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeOnTheScreen();
    });

    // Fix input
    fireEvent.changeText(getByTestId('email-input'), 'valid@example.com');

    await waitFor(() => {
      expect(queryByText('Invalid email format')).toBeNull();
    });
  });
});
```

### Form Submission

```typescript
it('submits form with valid data', async () => {
  const onSubmit = jest.fn();
  const { getByTestId } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

  fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
  fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');
  fireEvent.press(getByTestId('submit-button'));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'SecurePass123!',
    });
  });
});
```

### Disabled Submit While Loading

```typescript
it('disables submit button during form submission', async () => {
  const { getByTestId } = renderWithProviders(<LoginForm />);
  const submitButton = getByTestId('submit-button');

  // Fill form
  fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
  fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

  // Submit
  fireEvent.press(submitButton);

  // Button should be disabled whilst loading
  expect(submitButton.props.accessibilityState?.disabled).toBe(true);

  // Wait for completion
  await waitFor(() => {
    expect(submitButton.props.accessibilityState?.disabled).toBe(false);
  });
});
```

---

## Redux Testing

### Testing Reducers

```typescript
import { settingsReducer, settingsSliceActions } from '../reducer';

describe('settingsReducer', () => {
  const initialState = {
    theme: 'system' as const,
    language: 'en' as const,
    notifications: true,
  };

  it('updates theme', () => {
    const newState = settingsReducer(initialState, settingsSliceActions.setTheme('dark'));

    expect(newState.theme).toBe('dark');
    expect(newState.language).toBe('en'); // Unchanged
  });

  it('handles reset action', () => {
    const modifiedState = {
      theme: 'dark' as const,
      language: 'es' as const,
      notifications: false,
    };

    const newState = settingsReducer(modifiedState, settingsSliceActions.resetSettings());

    expect(newState).toEqual(initialState);
  });
});
```

### Testing Selectors

```typescript
import { selectTheme, selectIsAuthenticated } from '../selectors';
import type { RootState } from '@app/store';

describe('Auth Selectors', () => {
  const mockState: RootState = {
    auth: {
      user: { id: '123', email: 'user@example.com' },
      isAuthenticated: true,
      loading: false,
      error: null,
    },
    settings: {
      theme: 'dark',
      language: 'en',
    },
  };

  it('selectIsAuthenticated returns auth status', () => {
    expect(selectIsAuthenticated(mockState)).toBe(true);
  });

  it('selectTheme returns current theme', () => {
    expect(selectTheme(mockState)).toBe('dark');
  });
});
```

### Testing Components with Redux State

```typescript
import { renderWithProviders, createAuthenticatedState } from '@app/test-utils';

it('displays user name from Redux state', () => {
  const { getByText } = renderWithProviders(<ProfileHeader />, {
    preloadedState: createAuthenticatedState({
      user: { firstName: 'Warren', lastName: 'de Leon' },
    }),
  });

  expect(getByText('Warren de Leon')).toBeOnTheScreen();
});

it('shows login prompt when not authenticated', () => {
  const { getByText } = renderWithProviders(<ProfileHeader />, {
    preloadedState: {
      auth: { isAuthenticated: false, user: null },
    },
  });

  expect(getByText('Please log in')).toBeOnTheScreen();
});
```

### Testing Redux Thunks with MSW

```typescript
import { renderWithProviders, server, errorHandlers } from '@app/test-utils';

it('updates Redux state after API call', async () => {
  const { store } = renderWithProviders(<ProfileScreen />);

  // Wait for thunk to complete
  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  });

  // Verify state updated from MSW mock response
  expect(store.getState().profile.data?.fullName).toBe('Warren de Leon');
});

it('sets error state on API failure', async () => {
  server.use(...errorHandlers);

  const { store } = renderWithProviders(<ProfileScreen />);

  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  });

  expect(store.getState().profile.error).toBeTruthy();
  expect(store.getState().profile.data).toBeNull();
});
```

---

## Async Testing

### Using waitFor

```typescript
import { waitFor } from '@testing-library/react-native';

it('loads data asynchronously', async () => {
  const { getByText, queryByTestId } = renderWithProviders(<DataScreen />);

  // Initially shows loading
  expect(queryByTestId('loading-spinner')).toBeOnTheScreen();

  // Wait for data
  await waitFor(() => {
    expect(queryByTestId('loading-spinner')).toBeNull();
  });

  // Verify data displayed
  expect(getByText('Data loaded')).toBeOnTheScreen();
});
```

### Custom Timeout

```typescript
it('handles slow API response', async () => {
  const { getByText } = renderWithProviders(<SlowScreen />);

  // Increase timeout for slow operations
  await waitFor(
    () => {
      expect(getByText('Loaded')).toBeOnTheScreen();
    },
    { timeout: 5000 }
  );
});
```

### Testing Loading States

```typescript
describe('Loading States', () => {
  it('shows skeleton whilst loading', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ProfileCard loading={true} data={null} />
    );

    expect(getByTestId('skeleton-loader')).toBeOnTheScreen();
    expect(queryByTestId('profile-content')).toBeNull();
  });

  it('shows content after loading', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ProfileCard loading={false} data={{ name: 'Warren' }} />
    );

    expect(queryByTestId('skeleton-loader')).toBeNull();
    expect(getByTestId('profile-content')).toBeOnTheScreen();
  });
});
```

---

## Accessibility Testing

### Touch Target Size

```typescript
import { expectMinTouchTarget, TOUCH_TARGET_SIZES } from '@app/test-utils';

it('meets minimum touch target size', () => {
  const { getByTestId } = renderWithProviders(<IconButton icon="close" />);
  const button = getByTestId('icon-button');

  expectMinTouchTarget(button);
});

it('meets Android touch target requirements', () => {
  const { getByTestId } = renderWithProviders(<SmallButton />);
  const button = getByTestId('small-button');

  expectMinTouchTarget(
    button,
    TOUCH_TARGET_SIZES.android.minWidth,
    TOUCH_TARGET_SIZES.android.minHeight
  );
});
```

### Accessibility Props

```typescript
import { expectAccessibilityProps, expectAccessibilityComplete } from '@app/test-utils';

it('has required accessibility props', () => {
  const { getByTestId } = renderWithProviders(
    <Button testID="submit" onPress={jest.fn()}>Submit</Button>
  );
  const button = getByTestId('submit');

  expectAccessibilityProps(button, {
    role: 'button',
    label: true,
    hint: true,
  });
});

it('has complete accessibility for interactive element', () => {
  const { getByTestId } = renderWithProviders(<SubmitButton />);

  expectAccessibilityComplete(getByTestId('submit-button'), {
    role: 'button',
    label: 'Submit form',
    hint: 'Saves your changes',
    state: { disabled: false },
    touchTarget: true,
  });
});
```

### Screen Reader Announcements

```typescript
import { expectScreenReaderAnnouncement, expectLiveRegionContent } from '@app/test-utils';

it('announces error to screen readers', () => {
  const { getByTestId } = renderWithProviders(
    <ErrorBanner message="Invalid email" />
  );

  expectScreenReaderAnnouncement(getByTestId('error-banner'), {
    liveRegion: 'polite',
    role: 'alert',
  });
});

it('announces correct error content', () => {
  const { getByTestId } = renderWithProviders(
    <ErrorBanner message="Invalid email" />
  );

  expectLiveRegionContent(getByTestId('error-banner'), 'Invalid email', {
    liveRegion: 'polite',
    role: 'alert',
  });
});
```

### Focus Order

```typescript
import { expectFocusOrder, expectCanReceiveFocus } from '@app/test-utils';

it('has correct focus order in form', () => {
  const { getByTestId } = renderWithProviders(<LoginForm />);

  const elements = [
    getByTestId('email-input'),
    getByTestId('password-input'),
    getByTestId('forgot-password-link'),
    getByTestId('submit-button'),
  ];

  expectFocusOrder(elements);
});

it('first input can receive focus', () => {
  const { getByTestId } = renderWithProviders(<LoginForm />);

  expectCanReceiveFocus(getByTestId('email-input'), { autoFocus: true });
});
```

---

## Security Testing

### Input Sanitisation

```typescript
import { SECURITY_TEST_VALUES } from '@app/test-utils';

describe('Input Sanitisation', () => {
  it('rejects SQL injection attempts', async () => {
    const { getByTestId, getByText } = renderWithProviders(<LoginForm />);

    fireEvent.changeText(
      getByTestId('email-input'),
      SECURITY_TEST_VALUES.SQL_INJECTION
    );
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeOnTheScreen();
    });
  });

  it('rejects XSS attempts', async () => {
    const { getByTestId, getByText } = renderWithProviders(<LoginForm />);

    fireEvent.changeText(
      getByTestId('email-input'),
      SECURITY_TEST_VALUES.XSS_ATTEMPT
    );
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeOnTheScreen();
    });
  });

  it('handles null bytes safely', async () => {
    const { getByTestId, getByText } = renderWithProviders(<LoginForm />);

    fireEvent.changeText(
      getByTestId('email-input'),
      SECURITY_TEST_VALUES.NULL_BYTES
    );
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeOnTheScreen();
    });
  });
});
```

### Token Handling

```typescript
describe('Token Security', () => {
  it('clears tokens on logout', async () => {
    const mockStorage = createMockStorage();
    mockStorage.setItem('accessToken', 'old-token');

    const { getByTestId } = renderWithProviders(<SettingsScreen />, {
      preloadedState: createAuthenticatedState(),
    });

    fireEvent.press(getByTestId('logout-button'));

    await waitFor(() => {
      expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  it('handles concurrent refresh requests', async () => {
    const refreshPromises = [
      authClient.refreshSession(),
      authClient.refreshSession(),
      authClient.refreshSession(),
    ];

    const results = await Promise.all(refreshPromises);

    // Should deduplicate requests
    results.forEach(result => {
      expect(result.access_token).toBeDefined();
    });
  });
});
```

---

## Navigation Testing

### Basic Navigation

```typescript
import {
  createMockNavigation,
  createMockRoute,
  loginScreenProps,
} from '@app/test-utils';

describe('Navigation', () => {
  it('navigates to Registration on signup link press', async () => {
    const { navigation, route } = loginScreenProps();

    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('signup-link'));

    expect(navigation.navigate).toHaveBeenCalledWith('Registration');
  });

  it('navigates back on cancel', () => {
    const { navigation, route } = createScreenProps('EditProfile');

    const { getByTestId } = renderWithProviders(
      <EditProfileScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('cancel-button'));

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
```

### Navigation with Params

```typescript
it('navigates with params', () => {
  const { navigation, route } = createScreenProps('UserList');

  const { getByTestId } = renderWithProviders(
    <UserListScreen navigation={navigation} route={route} />
  );

  fireEvent.press(getByTestId('user-123'));

  expect(navigation.navigate).toHaveBeenCalledWith('UserProfile', {
    userId: '123',
  });
});
```

### Reading Route Params

```typescript
it('reads params from route', () => {
  const { navigation, route } = createScreenProps('UserProfile', {
    userId: '456',
  });

  const { getByText } = renderWithProviders(
    <UserProfileScreen navigation={navigation} route={route} />
  );

  // Component should use route.params.userId
  expect(getByText('User ID: 456')).toBeOnTheScreen();
});
```

---

## Snapshot Testing

### Basic Snapshot

```typescript
it('matches snapshot', () => {
  const { toJSON } = renderWithProviders(<ProfileCard user={mockUser} />);

  expect(toJSON()).toMatchSnapshot();
});
```

### Snapshot with Variations

```typescript
describe('Button Snapshots', () => {
  const variants = ['primary', 'secondary', 'outline'] as const;

  variants.forEach(variant => {
    it(`matches snapshot for ${variant} variant`, () => {
      const { toJSON } = renderWithProviders(
        <Button variant={variant}>Click me</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
```

### When to Use Snapshots

**Use sparingly.** Prefer explicit assertions over snapshots.

**Good use cases:**

- Visual regression detection for stable components
- Verifying complex rendered structure
- Detecting unintended changes

**Bad use cases:**

- Testing logic (use explicit assertions)
- Frequently changing components
- Dynamic content

```typescript
// Prefer explicit assertions
it('renders user name', () => {
  const { getByText } = renderWithProviders(<UserCard user={mockUser} />);
  expect(getByText('Warren de Leon')).toBeOnTheScreen();
});

// Over snapshots for simple cases
it('matches snapshot', () => {
  const { toJSON } = renderWithProviders(<UserCard user={mockUser} />);
  expect(toJSON()).toMatchSnapshot(); // Less maintainable
});
```

---

## Test Utilities Quick Reference

### renderWithProviders

```typescript
const {
  getByTestId,
  getByText,
  queryByTestId,
  store,  // Redux store for assertions
  rerender,
} = renderWithProviders(<Component />, {
  preloadedState: { /* initial Redux state */ },
});
```

### Test Constants

```typescript
import {
  TEST_CREDENTIALS, // Valid email, password, names
  INVALID_CREDENTIALS, // Invalid email, short password
  SECURITY_TEST_VALUES, // SQL injection, XSS, null bytes
  HTTP_STATUS, // 200, 401, 403, 500, etc.
  MOCK_TOKENS, // Access, refresh, expired tokens
  TEST_TIMEOUTS, // SHORT, MEDIUM, LONG
} from '@app/test-utils';
```

### Test Factories

```typescript
import {
  createMockUser,
  createAuthenticatedState,
  createScreenProps,
  loginScreenProps,
} from '@app/test-utils';
```

### Accessibility Utilities

```typescript
import {
  expectMinTouchTarget,
  expectAccessibilityProps,
  expectAccessibilityComplete,
  expectScreenReaderAnnouncement,
  expectLiveRegionContent,
  expectFocusOrder,
  expectCanReceiveFocus,
  expectColorContrast,
} from '@app/test-utils';
```

### MSW Server

```typescript
import { server, handlers, errorHandlers } from '@app/test-utils';

// Override handlers for specific test
server.use(...errorHandlers);

// Reset after test (automatic via jest.setup.ts)
server.resetHandlers();
```

---

## Related Documentation

- **[Testing Guide](./TESTING.md)** - Main testing guide
- **[MSW Testing Guide](./MSW_TESTING_GUIDE.md)** - HTTP mocking patterns
- **[E2E Testing](./E2E_TESTING.md)** - Detox and Cucumber
- **[Accessibility Guide](./ACCESSIBILITY.md)** - EAA compliance
