/**
 * PINSetupScreen Tests
 */

import React from 'react';
import type { ReactTestInstance } from 'react-test-renderer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { expectFocusOrder, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { PINSetupScreen } from '../PINSetupScreen';

// Mock the pinHashing module directly to avoid bcrypt callback issues
jest.mock('../utils/pinHashing', () => ({
  hashPIN: jest.fn().mockResolvedValue('$2a$10$hashedpin'),
  storePINHash: jest.fn().mockResolvedValue(undefined),
}));

type PINSetupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PINSetup'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
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
    key: 'PINSetup',
    index: 0,
    routeNames: ['PINSetup'],
    routes: [{ key: 'PINSetup', name: 'PINSetup', params: undefined }],
  })),
} as unknown as PINSetupNavigationProp;

const mockRoute = {
  key: 'PINSetup',
  name: 'PINSetup' as const,
  params: undefined,
};

describe('PINSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders PIN setup screen with title and input', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Verify main content renders
      expect(getByText('Create Your PIN')).toBeOnTheScreen();
      expect(getByTestId('pin-input-enter')).toBeOnTheScreen();
    });

    it('renders PIN input for entering PIN', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('pin-input-enter')).toBeOnTheScreen();
    });

    it('renders keypad buttons', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      for (let i = 0; i <= 9; i++) {
        expect(getByTestId(`pin-input-enter-keypad-${i}`)).toBeOnTheScreen();
      }
    });

    it('renders delete button', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByTestId('pin-input-enter-keypad-delete')).toBeOnTheScreen();
    });
  });

  describe('PIN Validation', () => {
    it('shows error for sequential PIN (123456)', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter sequential PIN
      for (const digit of ['1', '2', '3', '4', '5', '6']) {
        fireEvent.press(getByTestId(`pin-input-enter-keypad-${digit}`));
      }

      const errorMessage = await findByTestId('pin-error-message');
      expect(errorMessage).toBeOnTheScreen();
    });

    it('shows error for repeated PIN (000000)', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter repeated PIN
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestId('pin-input-enter-keypad-0'));
      }

      const errorMessage = await findByTestId('pin-error-message');
      expect(errorMessage).toBeOnTheScreen();
    });

    it('shows error for repeated pairs (121212)', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter repeated pairs
      for (const digit of ['1', '2', '1', '2', '1', '2']) {
        fireEvent.press(getByTestId(`pin-input-enter-keypad-${digit}`));
      }

      const errorMessage = await findByTestId('pin-error-message');
      expect(errorMessage).toBeOnTheScreen();
    });

    it('proceeds to confirmation step with valid PIN', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid PIN (742589)
      for (const digit of ['7', '4', '2', '5', '8', '9']) {
        fireEvent.press(getByTestId(`pin-input-enter-keypad-${digit}`));
      }

      // Should now show confirmation input
      const confirmInput = await findByTestId('pin-input-confirm');
      expect(confirmInput).toBeOnTheScreen();
    });
  });

  describe('PIN Confirmation Flow', () => {
    const enterValidPIN = (getByTestId: (id: string) => ReactTestInstance) => {
      for (const digit of ['7', '4', '2', '5', '8', '9']) {
        fireEvent.press(getByTestId(`pin-input-enter-keypad-${digit}`));
      }
    };

    const enterConfirmPIN = (getByTestId: (id: string) => ReactTestInstance, digits: string[]) => {
      for (const digit of digits) {
        fireEvent.press(getByTestId(`pin-input-confirm-keypad-${digit}`));
      }
    };

    it('shows success message in confirmation step', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      enterValidPIN(getByTestId);

      const successMessage = await findByTestId('pin-strong-message');
      expect(successMessage).toBeOnTheScreen();
    });

    it('shows change PIN link in confirmation step', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      enterValidPIN(getByTestId);

      const changePinLink = await findByTestId('change-pin-link');
      expect(changePinLink).toBeOnTheScreen();
    });

    it('returns to enter step when change PIN link is pressed', async () => {
      const { getByTestId, findByTestId, queryByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      enterValidPIN(getByTestId);

      const changePinLink = await findByTestId('change-pin-link');
      fireEvent.press(changePinLink);

      await waitFor(
        () => {
          expect(queryByTestId('pin-input-enter')).toBeOnTheScreen();
          expect(queryByTestId('pin-input-confirm')).toBeFalsy();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows error when confirmation PIN does not match', async () => {
      const { getByTestId, findByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid PIN
      enterValidPIN(getByTestId);

      // Wait for confirmation step
      await findByTestId('pin-input-confirm');

      // Enter different PIN for confirmation (uses confirm keypad)
      enterConfirmPIN(getByTestId, ['1', '2', '3', '7', '8', '9']);

      const errorMessage = await findByTestId('pin-error-message');
      expect(errorMessage).toBeOnTheScreen();
    });

    it('navigates to Home on successful PIN setup', async () => {
      const { getByTestId, findByTestId, queryByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid PIN
      enterValidPIN(getByTestId);

      // Wait for confirmation step
      await findByTestId('pin-input-confirm');

      // Verify we're in confirmation step
      expect(queryByTestId('pin-input-confirm')).toBeOnTheScreen();

      // Enter matching PIN for confirmation one digit at a time
      const confirmDigits = ['7', '4', '2', '5', '8', '9'];
      for (const digit of confirmDigits) {
        await act(async () => {
          fireEvent.press(getByTestId(`pin-input-confirm-keypad-${digit}`));
        });
      }

      // Wait for all async operations: PINInput's 100ms setTimeout + bcrypt callbacks
      await waitFor(
        () => {
          expect(mockNavigation.reset).toHaveBeenCalledWith({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Delete Functionality', () => {
    it('allows deleting entered digits', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter 3 digits
      for (const digit of ['7', '4', '2']) {
        fireEvent.press(getByTestId(`pin-input-enter-keypad-${digit}`));
      }

      // Delete one digit
      fireEvent.press(getByTestId('pin-input-enter-keypad-delete'));

      // Enter 4 more digits to complete (should now need 4 to complete)
      for (const digit of ['5', '8', '9', '3']) {
        fireEvent.press(getByTestId(`pin-input-enter-keypad-${digit}`));
      }

      // Should not navigate yet as we're testing the delete worked
      expect(mockNavigation.reset).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible screen', () => {
      const { getByRole } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Check for heading with accessible label
      expect(getByRole('header')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('keypad buttons have accessible touch targets (44×44 minimum)', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Check a sample of keypad buttons
      expectMinTouchTarget(getByTestId('pin-input-enter-keypad-5'));
      expectMinTouchTarget(getByTestId('pin-input-enter-keypad-0'));
      expectMinTouchTarget(getByTestId('pin-input-enter-keypad-delete'));
    });

    it('has correct focus order for PIN dots', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const dots = [];
      for (let i = 0; i < 6; i++) {
        dots.push(getByTestId(`pin-input-enter-dot-${i}`));
      }

      expectFocusOrder(dots);
    });

    it('all digit buttons have accessible touch targets', () => {
      const { getByTestId } = renderWithProviders(
        <PINSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      for (let i = 0; i <= 9; i++) {
        expectMinTouchTarget(getByTestId(`pin-input-enter-keypad-${i}`));
      }
    });
  });
});
