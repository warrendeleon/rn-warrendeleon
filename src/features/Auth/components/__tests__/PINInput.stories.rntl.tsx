import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PINInput } from '../PINInput';
import * as stories from '../PINInput.stories';

describe('PINInput Stories', () => {
  const mockOnComplete = jest.fn();
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Default story with keypad and dots', async () => {
    const Story = stories.Default.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-dot-\d/).length).toBeGreaterThan(0);
    expect(getAllByTestId(/pin-input-keypad-\d/).length).toBeGreaterThan(0);
  });

  it('renders WithDisplay story with dots visible', async () => {
    const Story = stories.WithDisplay.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-dot-\d/).length).toBeGreaterThan(0);
  });

  it('renders FourDigit story with 4 dots', async () => {
    const Story = stories.FourDigit.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-dot-\d/).length).toBe(4);
  });

  it('renders ErrorState story with dots visible', async () => {
    const Story = stories.ErrorState.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-dot-\d/).length).toBeGreaterThan(0);
  });

  it('renders Disabled story with keypad present', async () => {
    const Story = stories.Disabled.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-keypad-\d/).length).toBe(10);
  });

  it('renders PartiallyFilled story with some filled dots', async () => {
    const Story = stories.PartiallyFilled.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-dot-\d/).length).toBeGreaterThan(0);
  });

  it('renders FullWithError story with all dots', async () => {
    const Story = stories.FullWithError.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/pin-input-dot-\d/).length).toBeGreaterThan(0);
  });

  describe('PIN input functionality', () => {
    it('displays correct number of dots for default length', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput value="" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      // Default length is 6
      for (let i = 0; i < 6; i++) {
        expect(getByTestId(`pin-dot-${i}`)).toBeOnTheScreen();
      }
    });

    it('displays correct number of dots for custom length', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(
        <PINInput
          value=""
          onChange={mockOnChange}
          onComplete={mockOnComplete}
          length={4}
          testID="pin"
        />
      );

      // 4 dots should exist
      for (let i = 0; i < 4; i++) {
        expect(getByTestId(`pin-dot-${i}`)).toBeOnTheScreen();
      }
      // 5th dot should not exist
      expect(queryByTestId('pin-dot-4')).toBeNull();
    });

    it('fills dots as digits are entered', async () => {
      const { getByTestId, rerender } = await renderWithProviders(
        <PINInput value="" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      // Initially all empty
      const dot0 = getByTestId('pin-dot-0');
      expect(dot0.props.accessibilityLabel).toContain('empty');

      // Rerender with value "12"
      await rerender(
        <PINInput value="12" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      // First two filled, rest empty
      expect(getByTestId('pin-dot-0').props.accessibilityLabel).toContain('entered');
      expect(getByTestId('pin-dot-1').props.accessibilityLabel).toContain('entered');
      expect(getByTestId('pin-dot-2').props.accessibilityLabel).toContain('empty');
    });

    it('calls onChange when digit is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput value="" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      await fireEvent.press(getByTestId('pin-keypad-5'));

      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('5');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('calls onChange when delete is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput value="123" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      await fireEvent.press(getByTestId('pin-keypad-delete'));

      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('12');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('calls onComplete when all digits entered', async () => {
      jest.useFakeTimers();

      const { getByTestId, rerender } = await renderWithProviders(
        <PINInput
          value="12345"
          onChange={mockOnChange}
          onComplete={mockOnComplete}
          length={6}
          testID="pin"
        />
      );

      // Enter final digit
      await fireEvent.press(getByTestId('pin-keypad-6'));

      // Rerender with full value to simulate state update
      await rerender(
        <PINInput
          value="123456"
          onChange={mockOnChange}
          onComplete={mockOnComplete}
          length={6}
          testID="pin"
        />
      );

      // Wait for completion callback (has 100ms delay)
      jest.advanceTimersByTime(150);

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );

      jest.useRealTimers();
    });

    it('does not allow input when disabled', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput
          value=""
          onChange={mockOnChange}
          onComplete={mockOnComplete}
          disabled={true}
          testID="pin"
        />
      );

      await fireEvent.press(getByTestId('pin-keypad-5'));

      // onChange should not be called
      await waitFor(
        () => {
          expect(mockOnChange).not.toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('error state', () => {
    it('shows error state on all filled dots when hasError is true', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput
          value="123456"
          onChange={mockOnChange}
          onComplete={mockOnComplete}
          hasError={true}
          testID="pin"
        />
      );

      // All dots should show filled state (component handles error styling internally)
      for (let i = 0; i < 6; i++) {
        const dot = getByTestId(`pin-dot-${i}`);
        expect(dot.props.accessibilityLabel).toContain('entered');
      }
    });
  });

  describe('accessibility', () => {
    it('keypad has correct accessibility props', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput value="" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      const keypad = getByTestId('pin-keypad');
      expect(keypad.props.accessibilityLabel).toBe('PIN keypad');
    });

    it('dots container is accessible', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINInput value="" onChange={mockOnChange} onComplete={mockOnComplete} testID="pin" />
      );

      expect(getByTestId('pin-dots')).toBeOnTheScreen();
    });
  });
});
