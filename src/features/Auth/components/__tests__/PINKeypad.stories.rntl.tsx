import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PINKeypad } from '../PINKeypad';
import * as stories from '../PINKeypad.stories';

describe('PINKeypad Stories', () => {
  const mockDigitPress = jest.fn();
  const mockDeletePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Default story with all digit buttons', async () => {
    const { args } = stories.Default;
    const { getByTestId } = await renderWithProviders(
      <PINKeypad
        onDigitPress={args?.onDigitPress ?? mockDigitPress}
        onDeletePress={args?.onDeletePress ?? mockDeletePress}
        disabled={args?.disabled ?? false}
        testID="keypad"
      />
    );
    for (let i = 0; i <= 9; i++) {
      expect(getByTestId(`keypad-${i}`)).toBeOnTheScreen();
    }
    expect(getByTestId('keypad-delete')).toBeOnTheScreen();
  });

  it('renders Interactive story with digit buttons', async () => {
    const Story = stories.Interactive.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/keypad-\d/).length).toBe(10);
  });

  it('renders Disabled story with disabled buttons', async () => {
    const { args } = stories.Disabled;
    const { getByTestId } = await renderWithProviders(
      <PINKeypad
        onDigitPress={args?.onDigitPress ?? mockDigitPress}
        onDeletePress={args?.onDeletePress ?? mockDeletePress}
        disabled={args?.disabled ?? true}
        testID="keypad"
      />
    );
    expect(getByTestId('keypad-5').props.accessibilityState?.disabled).toBe(true);
  });

  describe('story args validation', () => {
    it('Default story has disabled false', () => {
      const { args } = stories.Default;
      expect(args?.disabled).toBe(false);
    });

    it('Disabled story has disabled true', () => {
      const { args } = stories.Disabled;
      expect(args?.disabled).toBe(true);
    });
  });

  describe('keypad functionality', () => {
    it('renders all digit buttons 0-9', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      for (let i = 0; i <= 9; i++) {
        expect(getByTestId(`keypad-${i}`)).toBeOnTheScreen();
      }
    });

    it('renders delete button', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      expect(getByTestId('keypad-delete')).toBeOnTheScreen();
    });

    it('calls onDigitPress when digit is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      await fireEvent.press(getByTestId('keypad-5'));
      expect(mockDigitPress).toHaveBeenCalledWith('5');
    });

    it('calls onDeletePress when delete is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      await fireEvent.press(getByTestId('keypad-delete'));
      expect(mockDeletePress).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('digit buttons have correct accessibility role', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      const button5 = getByTestId('keypad-5');
      expect(button5.props.accessibilityRole).toBe('button');
    });

    it('digit buttons have correct accessibility label', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      const button5 = getByTestId('keypad-5');
      expect(button5.props.accessibilityLabel).toBe('Digit 5');
    });

    it('digit buttons have correct accessibility hint', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      const button5 = getByTestId('keypad-5');
      expect(button5.props.accessibilityHint).toBe('Enters digit 5');
    });

    it('delete button has correct accessibility label', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      const deleteButton = getByTestId('keypad-delete');
      expect(deleteButton.props.accessibilityLabel).toBe('Delete');
    });

    it('delete button has correct accessibility hint', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad onDigitPress={mockDigitPress} onDeletePress={mockDeletePress} testID="keypad" />
      );

      const deleteButton = getByTestId('keypad-delete');
      expect(deleteButton.props.accessibilityHint).toBe('Removes the last entered digit');
    });

    it('disabled buttons have correct accessibility state', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINKeypad
          onDigitPress={mockDigitPress}
          onDeletePress={mockDeletePress}
          disabled={true}
          testID="keypad"
        />
      );

      const button5 = getByTestId('keypad-5');
      expect(button5.props.accessibilityState?.disabled).toBe(true);
    });
  });
});
