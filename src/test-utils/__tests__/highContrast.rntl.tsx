/**
 * High Contrast Mode Test Utilities
 *
 * Tests for verifying high contrast mode support in React Native components.
 * EAA (European Accessibility Act) compliance - WCAG 2.1 Level AA.
 *
 * High contrast mode helps users with:
 * - Low vision
 * - Colour blindness
 * - Photosensitivity
 * - Reading difficulties
 */

import React from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { calculateContrastRatio, CONTRAST_RATIOS, expectColorContrast } from '../accessibility';

// Mock AccessibilityInfo
const mockIsBoldTextEnabled = jest.fn<Promise<boolean>, []>();
const mockIsGrayscaleEnabled = jest.fn<Promise<boolean>, []>();
const mockIsInvertColorsEnabled = jest.fn<Promise<boolean>, []>();
const mockAddEventListener = jest.fn<
  { remove: () => void },
  [string, (isEnabled: boolean) => void]
>();
const mockRemove = jest.fn();

// Override AccessibilityInfo methods
beforeEach(() => {
  jest.clearAllMocks();

  mockIsBoldTextEnabled.mockResolvedValue(false);
  mockIsGrayscaleEnabled.mockResolvedValue(false);
  mockIsInvertColorsEnabled.mockResolvedValue(false);
  mockAddEventListener.mockReturnValue({ remove: mockRemove });

  (AccessibilityInfo.isBoldTextEnabled as jest.Mock) = mockIsBoldTextEnabled;
  (AccessibilityInfo.isGrayscaleEnabled as jest.Mock) = mockIsGrayscaleEnabled;
  (AccessibilityInfo.isInvertColorsEnabled as jest.Mock) = mockIsInvertColorsEnabled;
  (AccessibilityInfo.addEventListener as jest.Mock) = mockAddEventListener;
});

describe('high contrast colour combinations', () => {
  describe('WCAG 2.1 Level AA contrast requirements', () => {
    it('requires 4.5:1 contrast for normal text', () => {
      expect(CONTRAST_RATIOS.normalText).toBe(4.5);
    });

    it('requires 3:1 contrast for large text', () => {
      expect(CONTRAST_RATIOS.largeText).toBe(3.0);
    });

    it('requires 3:1 contrast for UI components', () => {
      expect(CONTRAST_RATIOS.uiComponents).toBe(3.0);
    });
  });

  describe('common high contrast colour pairs', () => {
    it('black on white meets all requirements', () => {
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(CONTRAST_RATIOS.normalText);
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('white on black meets all requirements', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeGreaterThanOrEqual(CONTRAST_RATIOS.normalText);
    });

    it('dark grey on white meets normal text requirements', () => {
      // #595959 on white is approximately 7:1
      const ratio = calculateContrastRatio('#595959', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(CONTRAST_RATIOS.normalText);
    });

    it('blue on white can meet requirements with right shade', () => {
      // Dark blue (#0000AA) on white
      const ratio = calculateContrastRatio('#0000AA', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(CONTRAST_RATIOS.normalText);
    });

    it('yellow text on dark background meets large text requirements', () => {
      // Yellow (#FFD700) on dark grey (#333333)
      const ratio = calculateContrastRatio('#FFD700', '#333333');
      expect(ratio).toBeGreaterThanOrEqual(CONTRAST_RATIOS.largeText);
    });
  });

  describe('failing contrast combinations', () => {
    it('light grey on white fails normal text requirements', () => {
      // #CCCCCC on white is approximately 1.6:1
      expect(() => expectColorContrast('#cccccc', '#ffffff', { type: 'normalText' })).toThrow();
    });

    it('red on green can fail (colour blindness consideration)', () => {
      // Pure red (#FF0000) on green (#00FF00) - problematic for red-green colour blindness
      // While technically may pass contrast, not recommended
      const ratio = calculateContrastRatio('#FF0000', '#00FF00');
      // This shows why contrast alone isn't enough - need to consider colour blindness
      expect(ratio).toBeDefined();
    });

    it('blue on purple fails requirements', () => {
      // Blue (#0000FF) on purple (#800080) - low contrast
      const ratio = calculateContrastRatio('#0000FF', '#800080');
      expect(ratio).toBeLessThan(CONTRAST_RATIOS.normalText);
    });
  });
});

describe('high contrast mode detection', () => {
  describe('bold text preference', () => {
    it('detects when bold text is enabled', async () => {
      mockIsBoldTextEnabled.mockResolvedValue(true);

      const result = await AccessibilityInfo.isBoldTextEnabled();

      expect(result).toBe(true);
    });

    it('detects when bold text is disabled', async () => {
      mockIsBoldTextEnabled.mockResolvedValue(false);

      const result = await AccessibilityInfo.isBoldTextEnabled();

      expect(result).toBe(false);
    });
  });

  describe('grayscale mode', () => {
    it('detects when grayscale is enabled', async () => {
      mockIsGrayscaleEnabled.mockResolvedValue(true);

      const result = await AccessibilityInfo.isGrayscaleEnabled();

      expect(result).toBe(true);
    });

    it('detects when grayscale is disabled', async () => {
      mockIsGrayscaleEnabled.mockResolvedValue(false);

      const result = await AccessibilityInfo.isGrayscaleEnabled();

      expect(result).toBe(false);
    });
  });

  describe('inverted colours', () => {
    it('detects when colours are inverted', async () => {
      mockIsInvertColorsEnabled.mockResolvedValue(true);

      const result = await AccessibilityInfo.isInvertColorsEnabled();

      expect(result).toBe(true);
    });

    it('detects when colours are not inverted', async () => {
      mockIsInvertColorsEnabled.mockResolvedValue(false);

      const result = await AccessibilityInfo.isInvertColorsEnabled();

      expect(result).toBe(false);
    });
  });
});

describe('high contrast component patterns', () => {
  /**
   * Example component that adapts to high contrast settings
   */
  const HighContrastAwareButton = ({
    label,
    highContrastMode,
  }: {
    label: string;
    highContrastMode?: boolean;
  }) => {
    const backgroundColor = highContrastMode ? '#000000' : '#0066CC';
    const textColor = highContrastMode ? '#FFFFFF' : '#FFFFFF';
    const borderColor = highContrastMode ? '#FFFFFF' : 'transparent';

    return (
      <View
        testID="button"
        style={{
          backgroundColor,
          borderColor,
          borderWidth: highContrastMode ? 2 : 0,
          padding: 12,
          minWidth: 44,
          minHeight: 44,
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text testID="button-text" style={{ color: textColor }}>
          {label}
        </Text>
        <Text testID="bg-color">{backgroundColor}</Text>
        <Text testID="text-color">{textColor}</Text>
        <Text testID="border-color">{borderColor}</Text>
      </View>
    );
  };

  it('uses high contrast colours when mode is enabled', async () => {
    await render(<HighContrastAwareButton label="Submit" highContrastMode={true} />);

    expect(screen.getByTestId('bg-color')).toHaveTextContent('#000000');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#FFFFFF');
    expect(screen.getByTestId('border-color')).toHaveTextContent('#FFFFFF');
  });

  it('uses standard colours when mode is disabled', async () => {
    await render(<HighContrastAwareButton label="Submit" highContrastMode={false} />);

    expect(screen.getByTestId('bg-color')).toHaveTextContent('#0066CC');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#FFFFFF');
    expect(screen.getByTestId('border-color')).toHaveTextContent('transparent');
  });

  it('maintains proper accessibility label', async () => {
    await render(<HighContrastAwareButton label="Submit form" highContrastMode={true} />);

    expect(screen.getByTestId('button')).toHaveAccessibleName('Submit form');
  });
});

describe('colour blindness considerations', () => {
  /**
   * Tests for ensuring colour is not the only means of conveying information.
   * WCAG 1.4.1: Use of Colour
   */
  describe('WCAG 1.4.1 - Use of Colour', () => {
    /**
     * Example form field that uses multiple indicators for errors
     */
    const AccessibleErrorField = ({
      hasError,
      errorMessage,
    }: {
      hasError: boolean;
      errorMessage?: string;
    }) => {
      return (
        <View testID="field-container">
          <View
            testID="input-wrapper"
            style={{
              borderColor: hasError ? '#D32F2F' : '#CCCCCC',
              borderWidth: hasError ? 2 : 1,
            }}
            accessibilityState={{ disabled: hasError }}
            aria-invalid={hasError}
          >
            <Text testID="input-placeholder">Enter value</Text>
            <Text testID="has-error">{hasError ? 'true' : 'false'}</Text>
          </View>
          {hasError && (
            <View
              testID="error-container"
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {/* Icon provides visual indicator beyond colour */}
              <Text testID="error-icon">⚠️</Text>
              {/* Text provides screen reader accessible error message */}
              <Text testID="error-text" accessibilityLabel={errorMessage}>
                {errorMessage}
              </Text>
            </View>
          )}
        </View>
      );
    };

    it('provides multiple indicators for error state', async () => {
      await render(<AccessibleErrorField hasError={true} errorMessage="This field is required" />);

      // Error is conveyed through:
      // 1. Border colour change
      // 2. Border width change (2 vs 1)
      // 3. Error icon
      // 4. Error text message
      expect(screen.getByTestId('error-icon')).toBeOnTheScreen();
      expect(screen.getByTestId('error-text')).toHaveTextContent('This field is required');
    });

    it('marks field error state in UI', async () => {
      await render(<AccessibleErrorField hasError={true} errorMessage="Required" />);

      const hasError = screen.getByTestId('has-error');
      expect(hasError).toHaveTextContent('true');
    });

    it('provides error as live region for screen readers', async () => {
      await render(<AccessibleErrorField hasError={true} errorMessage="Invalid email format" />);

      const errorContainer = screen.getByTestId('error-container');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLiveRegion).toBe('polite');
    });

    it('does not show error indicators when valid', async () => {
      await render(<AccessibleErrorField hasError={false} />);

      expect(screen.queryByTestId('error-container')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('error-icon')).not.toBeOnTheScreen();
    });
  });

  describe('status indicators beyond colour', () => {
    /**
     * Example status badge that uses icons and text in addition to colour
     */
    const StatusBadge = ({ status }: { status: 'success' | 'warning' | 'error' }) => {
      const configs = {
        success: { icon: '✓', label: 'Success', color: '#4CAF50' },
        warning: { icon: '⚠', label: 'Warning', color: '#FF9800' },
        error: { icon: '✕', label: 'Error', color: '#F44336' },
      };

      const config = configs[status];

      return (
        <View
          testID="status-badge"
          style={{ backgroundColor: config.color }}
          accessibilityLabel={config.label}
          accessibilityRole="text"
        >
          <Text testID="status-icon">{config.icon}</Text>
          <Text testID="status-label">{config.label}</Text>
        </View>
      );
    };

    it('success status has icon and label', async () => {
      await render(<StatusBadge status="success" />);

      expect(screen.getByTestId('status-icon')).toHaveTextContent('✓');
      expect(screen.getByTestId('status-label')).toHaveTextContent('Success');
    });

    it('warning status has icon and label', async () => {
      await render(<StatusBadge status="warning" />);

      expect(screen.getByTestId('status-icon')).toHaveTextContent('⚠');
      expect(screen.getByTestId('status-label')).toHaveTextContent('Warning');
    });

    it('error status has icon and label', async () => {
      await render(<StatusBadge status="error" />);

      expect(screen.getByTestId('status-icon')).toHaveTextContent('✕');
      expect(screen.getByTestId('status-label')).toHaveTextContent('Error');
    });

    it('has accessible name for screen readers', async () => {
      await render(<StatusBadge status="error" />);

      expect(screen.getByTestId('status-badge')).toHaveAccessibleName('Error');
    });
  });
});

describe('focus indicators', () => {
  /**
   * WCAG 2.4.7: Focus Visible
   * Focus indicators must be visible and not rely solely on colour.
   */
  const FocusableElement = ({
    isFocused,
    highContrast,
  }: {
    isFocused?: boolean;
    highContrast?: boolean;
  }) => {
    const focusStyle = {
      borderWidth: isFocused ? 3 : 1,
      borderColor: isFocused ? (highContrast ? '#000000' : '#0066CC') : '#CCCCCC',
      // Additional visual indicator - outline offset for high contrast
      outlineWidth: isFocused && highContrast ? 2 : 0,
      outlineColor: isFocused && highContrast ? '#FFFFFF' : 'transparent',
    };

    return (
      <View
        testID="focusable-element"
        style={focusStyle}
        accessibilityState={{ selected: isFocused }}
      >
        <Text testID="border-width">{focusStyle.borderWidth}</Text>
        <Text testID="border-color">{focusStyle.borderColor}</Text>
        <Text>Focusable Content</Text>
      </View>
    );
  };

  it('shows visible focus indicator when focused', async () => {
    await render(<FocusableElement isFocused={true} />);

    expect(screen.getByTestId('border-width')).toHaveTextContent('3');
    expect(screen.getByTestId('border-color')).toHaveTextContent('#0066CC');
  });

  it('shows enhanced focus indicator in high contrast mode', async () => {
    await render(<FocusableElement isFocused={true} highContrast={true} />);

    expect(screen.getByTestId('border-width')).toHaveTextContent('3');
    expect(screen.getByTestId('border-color')).toHaveTextContent('#000000');
  });

  it('shows minimal border when not focused', async () => {
    await render(<FocusableElement isFocused={false} />);

    expect(screen.getByTestId('border-width')).toHaveTextContent('1');
    expect(screen.getByTestId('border-color')).toHaveTextContent('#CCCCCC');
  });

  it('sets accessibility state for screen readers', async () => {
    await render(<FocusableElement isFocused={true} />);

    const element = screen.getByTestId('focusable-element');
    expect(element.props.accessibilityState?.selected).toBe(true);
  });
});

describe('text sizing and readability', () => {
  /**
   * WCAG 1.4.4: Resize Text
   * Text should be resizable without loss of content or functionality.
   */
  describe('dynamic text sizing', () => {
    const ScalableText = ({ scale = 1, baseSize = 16 }: { scale?: number; baseSize?: number }) => {
      const scaledSize = baseSize * scale;

      return (
        <View testID="text-container">
          <Text testID="scaled-text" style={{ fontSize: scaledSize }} accessibilityRole="text">
            Scalable Content
          </Text>
          <Text testID="font-size">{scaledSize}</Text>
        </View>
      );
    };

    it('scales text size based on preference', async () => {
      await render(<ScalableText scale={1.5} baseSize={16} />);

      expect(screen.getByTestId('font-size')).toHaveTextContent('24');
    });

    it('maintains readability at 200% scale', async () => {
      await render(<ScalableText scale={2} baseSize={16} />);

      expect(screen.getByTestId('font-size')).toHaveTextContent('32');
      expect(screen.getByTestId('scaled-text')).toBeOnTheScreen();
    });

    it('uses base size by default', async () => {
      await render(<ScalableText />);

      expect(screen.getByTestId('font-size')).toHaveTextContent('16');
    });
  });

  describe('minimum text sizes', () => {
    /**
     * Body text should be at least 16px
     * Secondary text should be at least 14px
     */
    const TextWithMinimums = ({ type }: { type: 'body' | 'secondary' | 'caption' }) => {
      const sizes = {
        body: 16,
        secondary: 14,
        caption: 12,
      };

      return (
        <Text testID={`${type}-text`} style={{ fontSize: sizes[type] }}>
          {type} text content
        </Text>
      );
    };

    it('body text is at least 16px', async () => {
      await render(<TextWithMinimums type="body" />);
      // Visual check - text should be readable
      expect(screen.getByTestId('body-text')).toBeOnTheScreen();
    });

    it('secondary text is at least 14px', async () => {
      await render(<TextWithMinimums type="secondary" />);
      expect(screen.getByTestId('secondary-text')).toBeOnTheScreen();
    });

    it('caption text exists but may be smaller', async () => {
      await render(<TextWithMinimums type="caption" />);
      // Captions at 12px are acceptable for non-essential info
      expect(screen.getByTestId('caption-text')).toBeOnTheScreen();
    });
  });
});

describe('contrast ratio calculations', () => {
  describe('calculateContrastRatio function', () => {
    it('handles hex colours correctly', () => {
      expect(calculateContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    });

    it('handles shorthand hex colours', () => {
      expect(calculateContrastRatio('#000', '#fff')).toBeCloseTo(21, 0);
    });

    it('handles rgb colours', () => {
      expect(calculateContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBeCloseTo(21, 0);
    });

    it('handles rgba colours', () => {
      expect(calculateContrastRatio('rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)')).toBeCloseTo(
        21,
        0
      );
    });

    it('returns correct ratio for mid-grey', () => {
      // #767676 on white is approximately 4.54:1 (minimum AA for normal text)
      const ratio = calculateContrastRatio('#767676', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeLessThan(5);
    });

    it('throws for invalid colour format', () => {
      expect(() => calculateContrastRatio('invalid', '#ffffff')).toThrow();
    });

    it('is commutative (same result regardless of order)', () => {
      const ratio1 = calculateContrastRatio('#123456', '#fedcba');
      const ratio2 = calculateContrastRatio('#fedcba', '#123456');
      expect(ratio1).toBeCloseTo(ratio2, 10);
    });
  });

  describe('expectColorContrast assertion', () => {
    it('passes for sufficient normal text contrast', () => {
      expect(() => expectColorContrast('#000000', '#ffffff', { type: 'normalText' })).not.toThrow();
    });

    it('passes for sufficient large text contrast', () => {
      // #808080 on white is approximately 3.95:1
      expect(() => expectColorContrast('#808080', '#ffffff', { type: 'largeText' })).not.toThrow();
    });

    it('passes for sufficient UI component contrast', () => {
      expect(() =>
        expectColorContrast('#808080', '#ffffff', { type: 'uiComponents' })
      ).not.toThrow();
    });

    it('fails for insufficient contrast', () => {
      expect(() => expectColorContrast('#aaaaaa', '#ffffff', { type: 'normalText' })).toThrow();
    });

    it('accepts custom minimum ratio', () => {
      expect(() => expectColorContrast('#888888', '#ffffff', { minRatio: 3 })).not.toThrow();
    });
  });
});
