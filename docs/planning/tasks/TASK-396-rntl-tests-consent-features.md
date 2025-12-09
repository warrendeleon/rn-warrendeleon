# TASK-396: RNTL Tests for Consent Features

**Task ID**: TASK-396
**Title**: RNTL Tests for Consent Features
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-073: Privacy Settings & Re-consent Flow](../stories/US-073-privacy-settings-reconsent.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Overview

Create RNTL tests for the ConsentScreen and Privacy Settings features. Tests should cover all user interactions, accessibility, and state management.

---

## Technical Details

### Test Files

**`src/features/Consent/__tests__/ConsentScreen.rntl.tsx`**:

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { ConsentScreen } from '../ConsentScreen';
import { configureStore } from '@app/store/configureStore';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock storage and services
jest.mock('../storage/consentStorage');
jest.mock('@app/config/sentry');
jest.mock('@app/config/posthog');

const renderWithProviders = (component: React.ReactElement) => {
  const store = configureStore();
  return render(
    <Provider store={store}>
      <NavigationContainer>{component}</NavigationContainer>
    </Provider>
  );
};

describe('ConsentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render with analytics toggle OFF by default', () => {
      renderWithProviders(<ConsentScreen />);

      const toggle = screen.getByTestId('analytics-toggle');
      expect(toggle.props.value).toBe(false);
    });

    it('should render with terms checkbox unchecked', () => {
      renderWithProviders(<ConsentScreen />);

      const checkbox = screen.getByTestId('terms-checkbox');
      expect(checkbox.props.isChecked).toBe(false);
    });

    it('should render Continue button disabled', () => {
      renderWithProviders(<ConsentScreen />);

      const button = screen.getByTestId('continue-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Interactions', () => {
    it('should enable Continue button when terms accepted', () => {
      renderWithProviders(<ConsentScreen />);

      const checkbox = screen.getByTestId('terms-checkbox');
      fireEvent.press(checkbox);

      const button = screen.getByTestId('continue-button');
      expect(button.props.accessibilityState.disabled).toBe(false);
    });

    it('should toggle analytics switch', () => {
      renderWithProviders(<ConsentScreen />);

      const toggle = screen.getByTestId('analytics-toggle');
      fireEvent(toggle, 'valueChange', true);

      expect(toggle.props.value).toBe(true);
    });

    it('should navigate to Terms when link pressed', () => {
      renderWithProviders(<ConsentScreen />);

      const link = screen.getByTestId('terms-link');
      fireEvent.press(link);

      expect(mockNavigate).toHaveBeenCalledWith('TermsAndConditions');
    });

    it('should navigate to Privacy Policy when link pressed', () => {
      renderWithProviders(<ConsentScreen />);

      const link = screen.getByTestId('privacy-link');
      fireEvent.press(link);

      expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('Continue Flow', () => {
    it('should save consent when Continue pressed', async () => {
      const { saveConsentToStorage } = require('../storage/consentStorage');
      renderWithProviders(<ConsentScreen />);

      // Accept terms
      fireEvent.press(screen.getByTestId('terms-checkbox'));

      // Press continue
      fireEvent.press(screen.getByTestId('continue-button'));

      await waitFor(() => {
        expect(saveConsentToStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            analyticsEnabled: false,
            termsVersionAccepted: expect.any(String),
            privacyVersionAccepted: expect.any(String),
          })
        );
      });
    });

    it('should initialise analytics when enabled and Continue pressed', async () => {
      const { initSentry } = require('@app/config/sentry');
      const { initPostHog } = require('@app/config/posthog');

      renderWithProviders(<ConsentScreen />);

      // Enable analytics
      fireEvent(screen.getByTestId('analytics-toggle'), 'valueChange', true);

      // Accept terms
      fireEvent.press(screen.getByTestId('terms-checkbox'));

      // Press continue
      fireEvent.press(screen.getByTestId('continue-button'));

      await waitFor(() => {
        expect(initSentry).toHaveBeenCalledWith(true);
        expect(initPostHog).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', () => {
      renderWithProviders(<ConsentScreen />);

      expect(screen.getByTestId('analytics-toggle').props.accessibilityRole).toBe('switch');
      expect(screen.getByTestId('terms-checkbox').props.accessibilityRole).toBe('checkbox');
      expect(screen.getByTestId('continue-button').props.accessibilityRole).toBe('button');
      expect(screen.getByTestId('terms-link').props.accessibilityRole).toBe('link');
    });

    it('should have accessibility state for disabled button', () => {
      renderWithProviders(<ConsentScreen />);

      const button = screen.getByTestId('continue-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });
});
```

**`src/features/Settings/__tests__/PrivacySettings.rntl.tsx`**:

```typescript
// Tests for Privacy Settings section in SettingsScreen
describe('SettingsScreen Privacy Section', () => {
  it('should render privacy section', () => {
    // ...
  });

  it('should toggle analytics and update services', async () => {
    // ...
  });

  it('should navigate to legal documents', () => {
    // ...
  });
});
```

---

## Files to Create

| File                                                       | Purpose                |
| ---------------------------------------------------------- | ---------------------- |
| `src/features/Consent/__tests__/ConsentScreen.rntl.tsx`    | ConsentScreen tests    |
| `src/features/Consent/__tests__/consentStorage.rntl.tsx`   | Storage helpers tests  |
| `src/features/Consent/store/__tests__/reducer.rntl.tsx`    | Redux slice tests      |
| `src/features/Settings/__tests__/PrivacySettings.rntl.tsx` | Privacy Settings tests |

---

## Acceptance Criteria

- [ ] Tests for ConsentScreen default state
- [ ] Tests for all user interactions (toggle, checkbox, links, button)
- [ ] Tests for Continue flow (storage, service init)
- [ ] Tests for accessibility props
- [ ] Tests for Privacy Settings section in SettingsScreen
- [ ] Tests for analytics toggle in Settings
- [ ] Tests for consent storage helpers
- [ ] Tests for consent Redux slice
- [ ] All tests use proper async/await with waitFor
- [ ] 100% code coverage on ConsentScreen
- [ ] `yarn test src/features/Consent` passes
- [ ] `yarn validate` passes with 0 errors

---

## Test Scenarios Coverage

| Feature                     | Test Count    |
| --------------------------- | ------------- |
| ConsentScreen Initial State | 3             |
| ConsentScreen Interactions  | 4             |
| ConsentScreen Continue Flow | 2             |
| ConsentScreen Accessibility | 2             |
| Privacy Settings            | 3             |
| Consent Storage             | 4             |
| Consent Redux               | 5             |
| **Total**                   | **~23 tests** |

---

## Dependencies

**Blocked By**: TASK-389, TASK-391, TASK-393, TASK-395

**Blocks**: None

---

## Notes

**Mocking Strategy**:

- Mock navigation with `jest.mock('@react-navigation/native')`
- Mock storage helpers to verify calls without actual I/O
- Mock Sentry/PostHog to verify initialisation calls

**Async Testing**:
Use `waitFor` for any tests that involve async operations like storage or service initialisation.

---

**Last Updated**: 2025-12-09
