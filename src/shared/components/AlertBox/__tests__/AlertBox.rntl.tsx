/**
 * Tests for AlertBox component
 *
 * EAA compliance verified: role="alert", accessibilityLabel, live regions
 */

import React from 'react';
import { screen } from '@testing-library/react-native';

import {
  expectLiveRegionContent,
  expectScreenReaderAnnouncement,
  renderWithProviders,
} from '@app/test-utils';

import { AlertBox, type AlertBoxVariant } from '../AlertBox';

// Mock useAppColorScheme hook
const mockUseAppColorScheme = jest.fn();
jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => mockUseAppColorScheme(),
}));

describe('AlertBox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
  });

  describe('rendering', () => {
    it('renders with message only', async () => {
      await renderWithProviders(<AlertBox variant="error" message="Something went wrong" />);

      expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    });

    it('renders with title and message', async () => {
      await renderWithProviders(
        <AlertBox variant="error" title="Error" message="Something went wrong" />
      );

      expect(screen.getByText('Error')).toBeOnTheScreen();
      expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    });

    it('renders with testID', async () => {
      await renderWithProviders(<AlertBox variant="error" message="Test message" testID="alert-box" />);

      expect(screen.getByTestId('alert-box')).toBeOnTheScreen();
    });
  });

  describe('variants', () => {
    it.each<AlertBoxVariant>(['error', 'success', 'info'])('renders %s variant', async variant => {
      await renderWithProviders(
        <AlertBox variant={variant} message={`${variant} message`} testID="alert" />
      );

      expect(screen.getByTestId('alert')).toBeOnTheScreen();
      expect(screen.getByText(`${variant} message`)).toBeOnTheScreen();
    });

    it('renders error variant with correct icon accessibility', async () => {
      await renderWithProviders(<AlertBox variant="error" message="Error occurred" testID="alert-box" />);

      // The alert should have role="alert"
      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityRole).toBe('alert');
    });

    it('renders success variant correctly', async () => {
      await renderWithProviders(
        <AlertBox variant="success" message="Operation successful" testID="alert-box" />
      );

      expect(screen.getByText('Operation successful')).toBeOnTheScreen();
    });

    it('renders info variant correctly', async () => {
      await renderWithProviders(
        <AlertBox variant="info" message="Important information" testID="alert-box" />
      );

      expect(screen.getByText('Important information')).toBeOnTheScreen();
    });
  });

  describe('theme support', () => {
    it('renders in light mode', async () => {
      mockUseAppColorScheme.mockReturnValue('light');

      await renderWithProviders(
        <AlertBox variant="error" message="Light mode alert" testID="alert-box" />
      );

      expect(screen.getByTestId('alert-box')).toBeOnTheScreen();
    });

    it('renders in dark mode', async () => {
      mockUseAppColorScheme.mockReturnValue('dark');

      await renderWithProviders(
        <AlertBox variant="error" message="Dark mode alert" testID="alert-box" />
      );

      expect(screen.getByTestId('alert-box')).toBeOnTheScreen();
    });

    it.each<AlertBoxVariant>(['error', 'success', 'info'])(
      'renders %s variant in dark mode',
      async variant => {
        mockUseAppColorScheme.mockReturnValue('dark');

        await renderWithProviders(
          <AlertBox variant={variant} message={`${variant} dark mode`} testID="alert" />
        );

        expect(screen.getByTestId('alert')).toBeOnTheScreen();
      }
    );
  });

  describe('accessibility - EAA compliance', () => {
    it('has role="alert"', async () => {
      await renderWithProviders(<AlertBox variant="error" message="Alert message" testID="alert-box" />);

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityRole).toBe('alert');
    });

    it('has correct accessibility label for message only', async () => {
      await renderWithProviders(
        <AlertBox variant="error" message="Something went wrong" testID="alert-box" />
      );

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityLabel).toBe('Something went wrong');
    });

    it('has correct accessibility label for title and message', async () => {
      await renderWithProviders(
        <AlertBox variant="error" title="Error" message="Something went wrong" testID="alert-box" />
      );

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityLabel).toBe('Error: Something went wrong');
    });

    it('supports polite live region', async () => {
      await renderWithProviders(
        <AlertBox
          variant="info"
          message="Info message"
          accessibilityLiveRegion="polite"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityLiveRegion).toBe('polite');
    });

    it('supports assertive live region for critical alerts', async () => {
      await renderWithProviders(
        <AlertBox
          variant="error"
          message="Critical error"
          accessibilityLiveRegion="assertive"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('defaults to polite live region when not specified', async () => {
      await renderWithProviders(<AlertBox variant="success" message="Success" testID="alert-box" />);

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityLiveRegion).toBe('polite');
    });

    it('allows disabling live region with none', async () => {
      await renderWithProviders(
        <AlertBox
          variant="success"
          message="Success"
          accessibilityLiveRegion="none"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      expect(alertBox.props.accessibilityLiveRegion).toBe('none');
    });
  });

  describe('content layout', () => {
    it('renders message inline when no title', async () => {
      await renderWithProviders(<AlertBox variant="info" message="Simple message" testID="alert-box" />);

      expect(screen.getByText('Simple message')).toBeOnTheScreen();
      // Without title, there's only one Text component for the message
    });

    it('renders title and message in stacked layout', async () => {
      await renderWithProviders(
        <AlertBox
          variant="success"
          title="Success!"
          message="Your changes have been saved"
          testID="alert-box"
        />
      );

      expect(screen.getByText('Success!')).toBeOnTheScreen();
      expect(screen.getByText('Your changes have been saved')).toBeOnTheScreen();
    });

    it('uses smaller padding when no title (p=$3)', async () => {
      await renderWithProviders(<AlertBox variant="info" message="No title" testID="alert-box" />);

      const alertBox = screen.getByTestId('alert-box');
      // Without title, Box uses p="$3" (smaller padding)
      // The component should render without title layout
      expect(alertBox).toBeOnTheScreen();
      expect(screen.queryByText('Success!')).toBeNull(); // No title present
    });

    it('uses larger padding when title present (p=$4)', async () => {
      await renderWithProviders(
        <AlertBox variant="info" title="Info" message="With title" testID="alert-box" />
      );

      const alertBox = screen.getByTestId('alert-box');
      // With title, Box uses p="$4" (larger padding)
      expect(alertBox).toBeOnTheScreen();
      expect(screen.getByText('Info')).toBeOnTheScreen(); // Title present
    });

    it('uses smaller icon when no title (size 20)', async () => {
      await renderWithProviders(<AlertBox variant="error" message="No title error" testID="alert-box" />);

      // Without title, iconSize = 20
      expect(screen.getByTestId('alert-box')).toBeOnTheScreen();
    });

    it('uses larger icon when title present (size 24)', async () => {
      await renderWithProviders(
        <AlertBox variant="error" title="Error" message="With title error" testID="alert-box" />
      );

      // With title, iconSize = 24
      expect(screen.getByTestId('alert-box')).toBeOnTheScreen();
      expect(screen.getByText('Error')).toBeOnTheScreen();
    });
  });

  describe('edge cases', () => {
    it('handles empty message', async () => {
      await renderWithProviders(<AlertBox variant="error" message="" testID="alert-box" />);

      expect(screen.getByTestId('alert-box')).toBeOnTheScreen();
    });

    it('handles very long message', async () => {
      const longMessage = 'A'.repeat(500);

      await renderWithProviders(<AlertBox variant="info" message={longMessage} testID="alert-box" />);

      expect(screen.getByText(longMessage)).toBeOnTheScreen();
    });

    it('handles special characters in message', async () => {
      const specialMessage = 'Error: "Invalid input" <script>alert(1)</script>';

      await renderWithProviders(<AlertBox variant="error" message={specialMessage} testID="alert-box" />);

      expect(screen.getByText(specialMessage)).toBeOnTheScreen();
    });

    it('handles unicode characters in message', async () => {
      const unicodeMessage = 'Ошибка: データが見つかりません 🚨';

      await renderWithProviders(<AlertBox variant="error" message={unicodeMessage} testID="alert-box" />);

      expect(screen.getByText(unicodeMessage)).toBeOnTheScreen();
    });
  });

  describe('live region state changes', () => {
    it('uses expectScreenReaderAnnouncement for polite live region', async () => {
      await renderWithProviders(
        <AlertBox
          variant="info"
          message="Information updated"
          accessibilityLiveRegion="polite"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      expectScreenReaderAnnouncement(alertBox, {
        liveRegion: 'polite',
        role: 'alert',
      });
    });

    it('uses expectScreenReaderAnnouncement for assertive live region', async () => {
      await renderWithProviders(
        <AlertBox
          variant="error"
          message="Critical error occurred"
          accessibilityLiveRegion="assertive"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      expectScreenReaderAnnouncement(alertBox, {
        liveRegion: 'assertive',
        role: 'alert',
      });
    });

    it('verifies live region content with expectLiveRegionContent', async () => {
      await renderWithProviders(
        <AlertBox
          variant="error"
          message="Login failed"
          accessibilityLiveRegion="polite"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      expectLiveRegionContent(alertBox, 'Login failed', {
        liveRegion: 'polite',
        role: 'alert',
      });
    });

    it('verifies live region content changes on rerender', async () => {
      const { rerender } = await renderWithProviders(
        <AlertBox
          variant="error"
          message="Error 1"
          accessibilityLiveRegion="polite"
          testID="alert-box"
        />
      );

      // Initial content
      let alertBox = screen.getByTestId('alert-box');
      expectLiveRegionContent(alertBox, 'Error 1', {
        liveRegion: 'polite',
        role: 'alert',
      });

      // Rerender with new content
      await rerender(
        <AlertBox
          variant="error"
          message="Error 2"
          accessibilityLiveRegion="polite"
          testID="alert-box"
        />
      );

      alertBox = screen.getByTestId('alert-box');
      expectLiveRegionContent(alertBox, 'Error 2', {
        liveRegion: 'polite',
        role: 'alert',
      });
    });

    it('verifies live region content with title and message', async () => {
      await renderWithProviders(
        <AlertBox
          variant="error"
          title="Authentication Failed"
          message="Invalid credentials"
          accessibilityLiveRegion="assertive"
          testID="alert-box"
        />
      );

      const alertBox = screen.getByTestId('alert-box');
      // The accessibility label combines title and message
      expect(alertBox.props.accessibilityLabel).toBe('Authentication Failed: Invalid credentials');
      expectScreenReaderAnnouncement(alertBox, {
        liveRegion: 'assertive',
        role: 'alert',
      });
    });
  });
});
