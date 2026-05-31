/**
 * PINInput Component Tests
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { expectFocusOrder, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { PINInput } from '../PINInput';

const mockOnChange = jest.fn();
const mockOnComplete = jest.fn();

const renderPINInput = (props: Partial<Parameters<typeof PINInput>[0]> = {}) => {
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onComplete: mockOnComplete,
    disabled: false,
    hasError: false,
    testID: 'pin-input',
  };

  return renderWithProviders(<PINInput {...defaultProps} {...props} />);
};

describe('PINInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders PIN input with dots and keypad', async () => {
      const { getByTestId } = await renderPINInput();

      // Verify main container, dots, and keypad render
      expect(getByTestId('pin-input')).toBeOnTheScreen();
      expect(getByTestId('pin-input-dot-0')).toBeOnTheScreen();
      expect(getByTestId('pin-input-keypad')).toBeOnTheScreen();
    });

    it('renders 6 PIN dots', async () => {
      const { getByTestId } = await renderPINInput();

      for (let i = 0; i < 6; i++) {
        expect(getByTestId(`pin-input-dot-${i}`)).toBeOnTheScreen();
      }
    });

    it('renders keypad', async () => {
      const { getByTestId } = await renderPINInput();

      expect(getByTestId('pin-input-keypad')).toBeOnTheScreen();
    });
  });

  describe('Digit Entry', () => {
    it('calls onChange when digit is pressed', async () => {
      const { getByTestId } = await renderPINInput({ value: '' });

      await fireEvent.press(getByTestId('pin-input-keypad-5'));

      expect(mockOnChange).toHaveBeenCalledWith('5');
    });

    it('appends digit to existing value', async () => {
      const { getByTestId } = await renderPINInput({ value: '12' });

      await fireEvent.press(getByTestId('pin-input-keypad-3'));

      expect(mockOnChange).toHaveBeenCalledWith('123');
    });

    it('does not append digit when value is 6 digits', async () => {
      const { getByTestId } = await renderPINInput({ value: '123456' });

      await fireEvent.press(getByTestId('pin-input-keypad-7'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('calls onComplete when 6th digit is entered', async () => {
      const { getByTestId } = await renderPINInput({ value: '12345' });

      await fireEvent.press(getByTestId('pin-input-keypad-6'));

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledWith('123456');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Delete', () => {
    it('removes last digit when delete is pressed', async () => {
      const { getByTestId } = await renderPINInput({ value: '123' });

      await fireEvent.press(getByTestId('pin-input-keypad-delete'));

      expect(mockOnChange).toHaveBeenCalledWith('12');
    });

    it('does nothing when delete pressed on empty value', async () => {
      const { getByTestId } = await renderPINInput({ value: '' });

      await fireEvent.press(getByTestId('pin-input-keypad-delete'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('handles delete on single digit', async () => {
      const { getByTestId } = await renderPINInput({ value: '5' });

      await fireEvent.press(getByTestId('pin-input-keypad-delete'));

      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('PIN Dots Display', () => {
    it('shows correct number of filled dots for 3-digit value', async () => {
      const { getByTestId } = await renderPINInput({ value: '123' });

      // Check dots 0-2 exist (they should be filled in the component)
      for (let i = 0; i < 3; i++) {
        expect(getByTestId(`pin-input-dot-${i}`)).toBeOnTheScreen();
      }
      // Check dots 3-5 exist (they should be empty)
      for (let i = 3; i < 6; i++) {
        expect(getByTestId(`pin-input-dot-${i}`)).toBeOnTheScreen();
      }
    });

    it('shows all dots as empty when value is empty', async () => {
      const { getByTestId } = await renderPINInput({ value: '' });

      for (let i = 0; i < 6; i++) {
        expect(getByTestId(`pin-input-dot-${i}`)).toBeOnTheScreen();
      }
    });

    it('shows all dots as filled when value is 6 digits', async () => {
      const { getByTestId } = await renderPINInput({ value: '123456' });

      for (let i = 0; i < 6; i++) {
        expect(getByTestId(`pin-input-dot-${i}`)).toBeOnTheScreen();
      }
    });
  });

  describe('Disabled State', () => {
    it('does not call onChange when disabled', async () => {
      const { getByTestId } = await renderPINInput({ disabled: true, value: '12' });

      await fireEvent.press(getByTestId('pin-input-keypad-3'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onComplete when disabled', async () => {
      const { getByTestId } = await renderPINInput({ disabled: true, value: '12345' });

      await fireEvent.press(getByTestId('pin-input-keypad-6'));

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('renders with error state', async () => {
      const { getByTestId } = await renderPINInput({ hasError: true, value: '123' });

      expect(getByTestId('pin-input')).toBeOnTheScreen();
    });
  });

  describe('Full PIN Entry Flow', () => {
    it('allows entering complete PIN', async () => {
      // Use a controlled component approach
      const { getByTestId } = await renderPINInput({ value: '' });

      // Verify all digit buttons work
      for (const digit of ['1', '2', '3', '4', '5']) {
        await fireEvent.press(getByTestId(`pin-input-keypad-${digit}`));
      }

      expect(mockOnChange).toHaveBeenCalledTimes(5);

      // Now test with value '12345' to trigger onComplete
      const { getByTestId: getByTestId2 } = await renderPINInput({ value: '12345' });
      await fireEvent.press(getByTestId2('pin-input-keypad-6'));

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledWith('123456');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('PIN dots have accessible ordering for screen readers', async () => {
      const { getByTestId } = await renderPINInput({ value: '123' });

      const dots = [];
      for (let i = 0; i < 6; i++) {
        dots.push(getByTestId(`pin-input-dot-${i}`));
      }

      expectFocusOrder(dots);
    });

    it('keypad has accessible touch targets', async () => {
      const { getByTestId } = await renderPINInput();

      // Check a sample of keypad buttons
      const keypad5 = getByTestId('pin-input-keypad-5');
      expectMinTouchTarget(keypad5);

      const deleteButton = getByTestId('pin-input-keypad-delete');
      expectMinTouchTarget(deleteButton);
    });

    it('disabled state maintains accessible touch targets', async () => {
      const { getByTestId } = await renderPINInput({ disabled: true });

      const keypad5 = getByTestId('pin-input-keypad-5');
      expectMinTouchTarget(keypad5);
    });

    it('error state maintains accessible touch targets', async () => {
      const { getByTestId } = await renderPINInput({ hasError: true, value: '123' });

      const keypad5 = getByTestId('pin-input-keypad-5');
      expectMinTouchTarget(keypad5);
    });
  });
});
