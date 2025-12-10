/**
 * PINKeypad Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

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
    it('renders without crashing', () => {
      const { getByTestId } = renderPINKeypad();

      expect(getByTestId('pin-keypad')).toBeTruthy();
    });

    it('renders all digit buttons 0-9', () => {
      const { getByTestId } = renderPINKeypad();

      for (let i = 0; i <= 9; i++) {
        expect(getByTestId(`pin-keypad-${i}`)).toBeTruthy();
      }
    });

    it('renders delete button', () => {
      const { getByTestId } = renderPINKeypad();

      expect(getByTestId('pin-keypad-delete')).toBeTruthy();
    });
  });

  describe('Digit Button Interactions', () => {
    it('calls onDigitPress when digit 1 is pressed', () => {
      const { getByTestId } = renderPINKeypad();

      fireEvent.press(getByTestId('pin-keypad-1'));

      expect(mockOnDigitPress).toHaveBeenCalledWith('1');
    });

    it('calls onDigitPress when digit 0 is pressed', () => {
      const { getByTestId } = renderPINKeypad();

      fireEvent.press(getByTestId('pin-keypad-0'));

      expect(mockOnDigitPress).toHaveBeenCalledWith('0');
    });

    it('calls onDigitPress with correct digit for each button', () => {
      const { getByTestId } = renderPINKeypad();

      for (let i = 0; i <= 9; i++) {
        fireEvent.press(getByTestId(`pin-keypad-${i}`));
        expect(mockOnDigitPress).toHaveBeenCalledWith(String(i));
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
});
