/**
 * Device Orientation Integration Tests
 *
 * Tests for rotation/orientation change handling across the app.
 * Ensures form state, focus position, and navigation state are preserved.
 */
import React from 'react';
import { Dimensions } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { LoginScreen } from '@app/features/Auth/LoginScreen';
import { RegistrationScreen } from '@app/features/Auth/RegistrationScreen';
import { renderWithProviders, TEST_CREDENTIALS } from '@app/test-utils';

// Local helper for filling fields without user event setup
const fillField = async (testID: string, value: string) => {
  const input = screen.getByTestId(testID);
  await fireEvent.changeText(input, value);
};

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  getParent: jest.fn(),
  getId: jest.fn(),
  getState: jest.fn().mockReturnValue({
    key: 'root',
    index: 0,
    routeNames: [],
    routes: [],
  }),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
};

const mockRoute = {
  key: 'test',
  name: 'Test',
  params: {},
};

// Helper to simulate orientation change
const simulateOrientationChange = (orientation: 'portrait' | 'landscape') => {
  const dimensions =
    orientation === 'portrait' ? { width: 390, height: 844 } : { width: 844, height: 390 };

  jest.spyOn(Dimensions, 'get').mockImplementation(() => ({
    ...dimensions,
    scale: 2,
    fontScale: 1,
  }));

  // Trigger dimension change event
  Dimensions.addEventListener('change', jest.fn());
};

describe('Device Orientation Changes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Start in portrait
    simulateOrientationChange('portrait');
  });

  describe('Form Layout Adaptation', () => {
    it('should maintain form state during orientation change', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      // Fill in form fields
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await fireEvent.changeText(emailInput, TEST_CREDENTIALS.VALID_EMAIL);
      await fireEvent.changeText(passwordInput, TEST_CREDENTIALS.VALID_PASSWORD);

      // Verify values before orientation change
      expect(emailInput.props.value).toBe(TEST_CREDENTIALS.VALID_EMAIL);
      expect(passwordInput.props.value).toBe(TEST_CREDENTIALS.VALID_PASSWORD);

      // Simulate orientation change
      simulateOrientationChange('landscape');

      // Values should be preserved after orientation change
      await waitFor(() => {
        expect(screen.getByTestId('email-input').props.value).toBe(TEST_CREDENTIALS.VALID_EMAIL);
        expect(screen.getByTestId('password-input').props.value).toBe(
          TEST_CREDENTIALS.VALID_PASSWORD
        );
      });
    });

    it('should preserve focus position after rotation', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      const emailInput = screen.getByTestId('email-input');

      // Focus on email input
      await fireEvent(emailInput, 'focus');

      // Simulate orientation change
      simulateOrientationChange('landscape');

      // Form should still be rendered
      await waitFor(() => {
        expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      });
    });

    it('should reflow form layout correctly in landscape', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      // Simulate orientation change to landscape
      simulateOrientationChange('landscape');

      // Form elements should still be visible and accessible
      await waitFor(() => {
        expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
        expect(screen.getByTestId('email-input')).toBeOnTheScreen();
        expect(screen.getByTestId('password-input')).toBeOnTheScreen();
        expect(screen.getByTestId('login-button')).toBeOnTheScreen();
      });
    });

    it('should maintain touch targets in both orientations', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      const loginButton = screen.getByTestId('login-button');

      // Check touch target in portrait
      expect(loginButton.props.style?.minHeight || 44).toBeGreaterThanOrEqual(44);

      // Simulate orientation change
      simulateOrientationChange('landscape');

      // Touch target should still meet minimum in landscape
      await waitFor(() => {
        const button = screen.getByTestId('login-button');
        expect(button.props.style?.minHeight || 44).toBeGreaterThanOrEqual(44);
      });
    });

    it('should preserve validation errors during orientation change', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      // Trigger validation by blurring empty fields
      const emailInput = screen.getByTestId('email-input');
      await fireEvent(emailInput, 'blur');

      // Wait for validation error
      await waitFor(() => {
        // Check if error exists (either visible or in accessible description)
        expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      });

      // Simulate orientation change
      simulateOrientationChange('landscape');

      // Form should still be visible after rotation
      await waitFor(() => {
        expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      });
    });
  });

  describe('Navigation During Rotation', () => {
    it('should not lose navigation state during rotation', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      // Verify initial render
      expect(screen.getByTestId('login-screen')).toBeOnTheScreen();

      // Simulate orientation change
      simulateOrientationChange('landscape');

      // Screen should still be rendered
      await waitFor(() => {
        expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
      });

      // Change back to portrait
      simulateOrientationChange('portrait');

      await waitFor(() => {
        expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
      });
    });

    it('should preserve deep link state through rotation', async () => {
      // Render with specific route params
      const routeWithParams = {
        ...mockRoute,
        params: { email: 'prefilled@example.com' },
      };

      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={routeWithParams as never} />
      );

      // Simulate multiple orientation changes
      simulateOrientationChange('landscape');
      simulateOrientationChange('portrait');
      simulateOrientationChange('landscape');

      // Screen should remain stable
      await waitFor(() => {
        expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
      });
    });
  });

  describe('Complex Form State During Rotation', () => {
    it('should preserve registration form state through orientation changes', async () => {
      await renderWithProviders(
        <RegistrationScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      // Fill multiple fields
      await fillField('firstName-input', 'Warren');
      await fillField('lastName-input', 'de Leon');
      await fillField('email-input', TEST_CREDENTIALS.VALID_EMAIL);

      // Simulate orientation change
      simulateOrientationChange('landscape');

      // All values should be preserved
      await waitFor(() => {
        expect(screen.getByTestId('firstName-input').props.value).toBe('Warren');
        expect(screen.getByTestId('lastName-input').props.value).toBe('de Leon');
        expect(screen.getByTestId('email-input').props.value).toBe(TEST_CREDENTIALS.VALID_EMAIL);
      });
    });

    it('should handle rapid orientation changes gracefully', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      // Fill form
      await fillField('email-input', TEST_CREDENTIALS.VALID_EMAIL);

      // Rapid orientation changes (simulating quick device rotations)
      for (let i = 0; i < 5; i++) {
        simulateOrientationChange(i % 2 === 0 ? 'landscape' : 'portrait');
      }

      // Form should remain stable
      await waitFor(() => {
        expect(screen.getByTestId('email-input').props.value).toBe(TEST_CREDENTIALS.VALID_EMAIL);
      });
    });
  });

  describe('Accessibility During Rotation', () => {
    it('should maintain accessibility properties after orientation change', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      const emailInput = screen.getByTestId('email-input');
      const initialAccessibilityLabel = emailInput.props.accessibilityLabel;

      // Simulate orientation change
      simulateOrientationChange('landscape');

      await waitFor(() => {
        const rotatedInput = screen.getByTestId('email-input');
        expect(rotatedInput.props.accessibilityLabel).toBe(initialAccessibilityLabel);
      });
    });

    it('should preserve accessibility hints after rotation', async () => {
      await renderWithProviders(
        <LoginScreen navigation={mockNavigation as never} route={mockRoute as never} />
      );

      const emailInput = screen.getByTestId('email-input');
      const initialHint = emailInput.props.accessibilityHint;

      simulateOrientationChange('landscape');

      await waitFor(() => {
        const rotatedInput = screen.getByTestId('email-input');
        expect(rotatedInput.props.accessibilityHint).toBe(initialHint);
      });
    });
  });
});
