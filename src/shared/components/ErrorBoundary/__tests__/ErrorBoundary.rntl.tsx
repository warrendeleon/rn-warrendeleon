// Mock navigation BEFORE imports
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof import('@react-navigation/native')>(
    '@react-navigation/native'
  );
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { ErrorBoundary } from '../ErrorBoundary';

// Test components
const WorkingComponent: React.FC = () => <Text>Working Component</Text>;

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.error to suppress error output in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockNavigate.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Normal Operation', () => {
    it('renders children when no error occurs', async () => {
      const { getByText } = await render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(getByText('Working Component')).toBeOnTheScreen();
    });

    it('does not display fallback UI when children render successfully', async () => {
      const { queryByText } = await render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(queryByText(/Something Went Wrong/i)).toBeNull();
      expect(queryByText(/Try Again/i)).toBeNull();
    });
  });

  describe('Error Boundary Static Methods', () => {
    it('getDerivedStateFromError returns error state', () => {
      const testError = new Error('Test error');
      const newState = ErrorBoundary.getDerivedStateFromError(testError);

      expect(newState).toEqual({
        hasError: true,
        error: testError,
      });
    });

    it('getDerivedStateFromError sets hasError to true', () => {
      const testError = new Error('Another test error');
      const { hasError } = ErrorBoundary.getDerivedStateFromError(testError);

      expect(hasError).toBe(true);
    });
  });

  describe('Component Did Catch', () => {
    it('calls componentDidCatch and logs error in development', () => {
      const boundary = new ErrorBoundary({ children: null });
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };

      boundary.componentDidCatch(error, errorInfo);

      // Error objects are masked (non-enumerable props become {})
      // Context is passed through masking as well
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DEV] Error caught by ErrorBoundary',
        expect.objectContaining({}), // Error object (masked due to non-enumerable props)
        expect.objectContaining({
          errorInfo: expect.objectContaining({
            componentStack: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Reset Error', () => {
    it('resetError sets state back to no error', () => {
      const boundary = new ErrorBoundary({ children: null });
      boundary.state = { hasError: true, error: new Error('Test') };

      const setStateSpy = jest.spyOn(boundary, 'setState');

      boundary.resetError();

      expect(setStateSpy).toHaveBeenCalledWith({ hasError: false, error: null });
    });
  });
});

describe('FallbackUI', () => {
  const mockOnReset = jest.fn();
  const mockError = new Error('Test error message');

  beforeEach(() => {
    mockOnReset.mockClear();
    mockNavigate.mockClear();
  });

  // Import FallbackUI and renderWithProviders for testing with full context

  const { FallbackUI } = require('../FallbackUI') as typeof import('../FallbackUI');

  const { renderWithProviders } = require('@app/test-utils') as typeof import('@app/test-utils');

  describe('rendering', () => {
    it('renders the FallbackUI component with all elements', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
      expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
    });

    it('renders with null error gracefully', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={null} onReset={mockOnReset} />
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
      expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
    });
  });

  describe('button interactions', () => {
    const { fireEvent } =
      require('@testing-library/react-native') as typeof import('@testing-library/react-native');

    it('calls onReset when Try Again button is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      await fireEvent.press(getByTestId('error-try-again-button'));

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('calls onReset and navigates to Home when Go Home button is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      await fireEvent.press(getByTestId('error-go-home-button'));

      expect(mockOnReset).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('calls onReset before navigation on Go Home', async () => {
      const callOrder: string[] = [];
      const trackingOnReset = jest.fn(() => callOrder.push('reset'));
      mockNavigate.mockImplementation(() => callOrder.push('navigate'));

      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={trackingOnReset} />
      );

      await fireEvent.press(getByTestId('error-go-home-button'));

      // onReset should be called before navigation
      expect(callOrder).toEqual(['reset', 'navigate']);
    });
  });

  describe('accessibility', () => {
    it('has accessible Try Again button', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      const tryAgainButton = getByTestId('error-try-again-button');
      // GlueStack Button components have implicit button role
      expect(tryAgainButton).toBeOnTheScreen();
    });

    it('has accessible Go Home button', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      const goHomeButton = getByTestId('error-go-home-button');
      expect(goHomeButton).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    const { expectMinTouchTarget } = require('@app/test-utils') as typeof import('@app/test-utils');

    it('Try Again button has accessible touch target', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      expectMinTouchTarget(getByTestId('error-try-again-button'));
    });

    it('Go Home button has accessible touch target', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      expectMinTouchTarget(getByTestId('error-go-home-button'));
    });

    it('buttons are accessible when error is null', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={null} onReset={mockOnReset} />
      );

      expectMinTouchTarget(getByTestId('error-try-again-button'));
      expectMinTouchTarget(getByTestId('error-go-home-button'));
    });

    it('buttons can receive programmatic focus', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={mockError} onReset={mockOnReset} />
      );

      const tryAgainButton = getByTestId('error-try-again-button');
      const goHomeButton = getByTestId('error-go-home-button');

      // Buttons should not be explicitly marked as non-accessible
      expect(tryAgainButton.props.accessible).not.toBe(false);
      expect(goHomeButton.props.accessible).not.toBe(false);
    });
  });
});
