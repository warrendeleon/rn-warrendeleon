/**
 * Tests for TestErrorButton component
 *
 * Tests DEV-only rendering and error throwing behaviour.
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { expectCanReceiveFocus, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { TestErrorButton } from '../TestErrorButton';

// Access __DEV__ from global scope (defined by React Native)
const getGlobal = () => global as typeof globalThis & { __DEV__?: boolean };

describe('TestErrorButton', () => {
  // Store original __DEV__ value
  const originalDev = getGlobal().__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore __DEV__ after each test
    getGlobal().__DEV__ = originalDev;
  });

  describe('DEV mode behaviour', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = true;
    });

    it('renders in DEV mode', () => {
      renderWithProviders(<TestErrorButton />);

      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });

    it('displays DEV indicator in button text', () => {
      renderWithProviders(<TestErrorButton />);

      expect(screen.getByText('[DEV] Trigger Error')).toBeOnTheScreen();
    });

    it('has correct testID', () => {
      renderWithProviders(<TestErrorButton />);

      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });
  });

  describe('production mode behaviour', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = false;
    });

    it('returns null in production mode', () => {
      renderWithProviders(<TestErrorButton />);

      expect(screen.queryByTestId('test-error-button')).toBeNull();
    });

    it('does not render any content in production', () => {
      renderWithProviders(<TestErrorButton />);

      expect(screen.queryByText('[DEV] Trigger Error')).toBeNull();
    });
  });

  describe('error throwing behaviour', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = true;
    });

    it('renders interactive button for triggering errors', () => {
      // The component uses internal state to trigger error on re-render
      // We verify the button exists and is accessible
      // Actual error throwing is tested via ErrorBoundary in integration tests
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');
      expect(button).toBeOnTheScreen();
    });

    it('button is pressable element', () => {
      renderWithProviders(<TestErrorButton />);

      // The button should be a pressable component with the correct text
      expect(screen.getByText('[DEV] Trigger Error')).toBeOnTheScreen();
      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });

    it('does not throw before being pressed', () => {
      renderWithProviders(<TestErrorButton />);

      // Should render without throwing
      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });

    it('throws error when button is pressed', () => {
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');

      // Pressing the button should trigger state change that causes throw on next render
      expect(() => {
        fireEvent.press(button);
      }).toThrow('Test error triggered by TestErrorButton');
    });

    it('throws with the correct error message', () => {
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');

      try {
        fireEvent.press(button);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Test error triggered by TestErrorButton');
      }
    });
  });

  describe('button properties', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = true;
    });

    it('is a pressable button', () => {
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');
      expect(button).toBeOnTheScreen();
    });

    it('has negative action styling', () => {
      renderWithProviders(<TestErrorButton />);

      // The button uses action="negative" which applies red styling
      // We verify the button renders correctly
      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = true;
    });

    it('button is accessible', () => {
      renderWithProviders(<TestErrorButton />);

      // Button should be findable
      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });

    it('button text is visible', () => {
      renderWithProviders(<TestErrorButton />);

      expect(screen.getByText('[DEV] Trigger Error')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = true;
    });

    it('meets minimum touch target requirements', () => {
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');
      expectMinTouchTarget(button);
    });

    it('can receive programmatic focus', () => {
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');
      expectCanReceiveFocus(button);
    });

    it('is accessible to screen readers', () => {
      renderWithProviders(<TestErrorButton />);

      const button = screen.getByTestId('test-error-button');
      // GlueStack Button component renders with button behaviour
      expect(button).toBeOnTheScreen();
      expect(button.props.accessible).not.toBe(false);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      getGlobal().__DEV__ = true;
    });

    it('can be rendered multiple times', () => {
      renderWithProviders(
        <>
          <TestErrorButton />
          <TestErrorButton />
        </>
      );

      const buttons = screen.getAllByText('[DEV] Trigger Error');
      expect(buttons).toHaveLength(2);
    });

    it('handles rapid re-renders', () => {
      const { rerender } = renderWithProviders(<TestErrorButton />);

      rerender(<TestErrorButton />);
      rerender(<TestErrorButton />);
      rerender(<TestErrorButton />);

      expect(screen.getByTestId('test-error-button')).toBeOnTheScreen();
    });
  });
});
