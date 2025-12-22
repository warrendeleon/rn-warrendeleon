/**
 * PINKeypad Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { PINKeypad } from '../PINKeypad';

const mockOnDigitPress = jest.fn();
const mockOnDeletePress = jest.fn();

const renderPINKeypad = (props: Partial<Parameters<typeof PINKeypad>[0]> = {}) => {
  const defaultProps = {
    onDigitPress: mockOnDigitPress,
    onDeletePress: mockOnDeletePress,
    disabled: false,
    testID: 'pin-keypad',
  };

  return renderWithProviders(<PINKeypad {...defaultProps} {...props} />);
};

describe('PINKeypad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders keypad with all digit and delete buttons', () => {
      const { getByTestId } = renderPINKeypad();

      // Verify main container and key buttons render
      expect(getByTestId('pin-keypad')).toBeOnTheScreen();
      expect(getByTestId('pin-keypad-0')).toBeOnTheScreen();
      expect(getByTestId('pin-keypad-delete')).toBeOnTheScreen();
    });

    it('renders all digit buttons 0-9', () => {
      const { getByTestId } = renderPINKeypad();

      for (let i = 0; i <= 9; i++) {
        expect(getByTestId(`pin-keypad-${i}`)).toBeOnTheScreen();
      }
    });

    it('renders delete button', () => {
      const { getByTestId } = renderPINKeypad();

      expect(getByTestId('pin-keypad-delete')).toBeOnTheScreen();
    });
  });

  describe('Digit Button Interactions', () => {
    it.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const)(
      'calls onDigitPress with "%s" when digit %s button is pressed',
      digit => {
        const { getByTestId } = renderPINKeypad();

        fireEvent.press(getByTestId(`pin-keypad-${digit}`));

        expect(mockOnDigitPress).toHaveBeenCalledWith(digit);
      }
    );

    it('calls onDigitPress exactly 10 times when all digit buttons pressed sequentially', () => {
      const { getByTestId } = renderPINKeypad();

      for (let i = 0; i <= 9; i++) {
        fireEvent.press(getByTestId(`pin-keypad-${i}`));
      }

      expect(mockOnDigitPress).toHaveBeenCalledTimes(10);
    });
  });

  describe('Delete Button Interactions', () => {
    it('calls onDeletePress when delete button is pressed', () => {
      const { getByTestId } = renderPINKeypad();

      fireEvent.press(getByTestId('pin-keypad-delete'));

      expect(mockOnDeletePress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('does not call onDigitPress when disabled', () => {
      const { getByTestId } = renderPINKeypad({ disabled: true });

      fireEvent.press(getByTestId('pin-keypad-5'));

      expect(mockOnDigitPress).not.toHaveBeenCalled();
    });

    it('does not call onDeletePress when disabled', () => {
      const { getByTestId } = renderPINKeypad({ disabled: true });

      fireEvent.press(getByTestId('pin-keypad-delete'));

      expect(mockOnDeletePress).not.toHaveBeenCalled();
    });

    it('all buttons are not pressable when disabled', () => {
      const { getByTestId } = renderPINKeypad({ disabled: true });

      for (let i = 0; i <= 9; i++) {
        fireEvent.press(getByTestId(`pin-keypad-${i}`));
      }
      fireEvent.press(getByTestId('pin-keypad-delete'));

      expect(mockOnDigitPress).not.toHaveBeenCalled();
      expect(mockOnDeletePress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('digit buttons have correct accessibility label', () => {
      const { getByTestId } = renderPINKeypad();

      const button5 = getByTestId('pin-keypad-5');
      expect(button5.props.accessibilityLabel).toContain('5');
    });

    it('delete button has correct accessibility label', () => {
      const { getByTestId } = renderPINKeypad();

      const deleteButton = getByTestId('pin-keypad-delete');
      expect(deleteButton.props.accessibilityLabel).toBe('Delete');
    });

    it('all buttons have button accessibility role', () => {
      const { getByTestId } = renderPINKeypad();

      for (let i = 0; i <= 9; i++) {
        const button = getByTestId(`pin-keypad-${i}`);
        expect(button.props.accessibilityRole).toBe('button');
      }

      const deleteButton = getByTestId('pin-keypad-delete');
      expect(deleteButton.props.accessibilityRole).toBe('button');
    });

    it('buttons have correct accessibilityState when disabled', () => {
      const { getByTestId } = renderPINKeypad({ disabled: true });

      const button5 = getByTestId('pin-keypad-5');
      expect(button5.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('all digit buttons have accessible touch targets (44×44 minimum)', () => {
      const { getByTestId } = renderPINKeypad();

      for (let i = 0; i <= 9; i++) {
        const button = getByTestId(`pin-keypad-${i}`);
        expectMinTouchTarget(button);
      }
    });

    it('delete button has accessible touch target', () => {
      const { getByTestId } = renderPINKeypad();

      const deleteButton = getByTestId('pin-keypad-delete');
      expectMinTouchTarget(deleteButton);
    });

    it('disabled buttons maintain accessible touch targets', () => {
      const { getByTestId } = renderPINKeypad({ disabled: true });

      const button5 = getByTestId('pin-keypad-5');
      expectMinTouchTarget(button5);

      const deleteButton = getByTestId('pin-keypad-delete');
      expectMinTouchTarget(deleteButton);
    });
  });
});
