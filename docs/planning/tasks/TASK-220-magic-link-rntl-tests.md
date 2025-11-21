# TASK-220: Magic Link RNTL Tests

**ID**: TASK-220 | **Title**: Write RNTL Tests for Magic Link Components
**User Story**: [US-037](../stories/US-037-magic-link-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 1.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Objective

Write comprehensive RNTL tests for:

1. MagicLinkTab component
2. LoginCallbackScreen
3. sendMagicLink API function

**Coverage Target**: 100%

---

## Test Files

### File 1: `src/components/auth/__tests__/MagicLinkTab.test.tsx`

(Already created in TASK-218)

---

### File 2: `src/screens/auth/__tests__/LoginCallbackScreen.test.tsx`

```typescript
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { LoginCallbackScreen } from '../LoginCallbackScreen';
import { Linking } from 'react-native';
import { storeTokens } from '../../../utils/tokenStorage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Provider } from 'react-redux';
import { store } from '../../../store';

jest.mock('../../../utils/tokenStorage');
jest.mock('react-native-encrypted-storage');

const mockNavigation = {
  reset: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('LoginCallbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(
      <Provider store={store}>
        <LoginCallbackScreen />
      </Provider>
    );

    expect(getByText('Logging you in...')).toBeTruthy();
  });

  it('should process deep link and navigate to Home', async () => {
    const mockURL = 'warrendeleon://login?access_token=mock_access_token&refresh_token=mock_refresh_token&type=magiclink';

    (Linking.getInitialURL as jest.Mock).mockResolvedValue(mockURL);
    (storeTokens as jest.Mock).mockResolvedValue(undefined);
    (EncryptedStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    render(
      <Provider store={store}>
        <LoginCallbackScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith('mock_access_token', 'mock_refresh_token');
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  it('should show error on invalid URL parameters', async () => {
    const mockURL = 'warrendeleon://login?invalid=params';

    (Linking.getInitialURL as jest.Mock).mockResolvedValue(mockURL);

    const { getByText } = render(
      <Provider store={store}>
        <LoginCallbackScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('Invalid login link. Please request a new one.')).toBeTruthy();
    });
  });

  it('should show error on missing access_token', async () => {
    const mockURL = 'warrendeleon://login?refresh_token=mock_refresh_token&type=magiclink';

    (Linking.getInitialURL as jest.Mock).mockResolvedValue(mockURL);

    const { getByText } = render(
      <Provider store={store}>
        <LoginCallbackScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('Invalid login link. Please request a new one.')).toBeTruthy();
    });
  });

  it('should show error on token storage failure', async () => {
    const mockURL = 'warrendeleon://login?access_token=mock_access_token&refresh_token=mock_refresh_token&type=magiclink';

    (Linking.getInitialURL as jest.Mock).mockResolvedValue(mockURL);
    (storeTokens as jest.Mock).mockRejectedValue(new Error('Keychain error'));

    const { getByText } = render(
      <Provider store={store}>
        <LoginCallbackScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('An error occurred. Please try again.')).toBeTruthy();
    });
  });
});
```

---

### File 3: `src/api/auth/__tests__/magicLink.test.ts`

(Already created in TASK-219)

---

## Acceptance Criteria

**Coverage**:

- [ ] MagicLinkTab: 100% coverage
- [ ] LoginCallbackScreen: 100% coverage
- [ ] sendMagicLink: 100% coverage

**Test Scenarios**:

- [ ] MagicLinkTab renders correctly
- [ ] Email validation errors
- [ ] Magic link sending success
- [ ] Resend countdown
- [ ] LoginCallbackScreen loading state
- [ ] Deep link processing success
- [ ] Deep link error scenarios
- [ ] Token storage success/failure

---

## Definition of Done

- [ ] All test files created
- [ ] All tests passing: `yarn test --coverage`
- [ ] 100% coverage for all files
- [ ] `yarn validate` passes

---

**Dependencies**:

- TASK-218 (Magic Link UI) complete
- TASK-219 (Magic Link API) complete

**Next Task**: [TASK-221](TASK-221-magic-link-e2e-tests.md) - Magic Link E2E Tests

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 1.5 hours
