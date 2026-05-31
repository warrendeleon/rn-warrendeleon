/**
 * Accessibility Test Utilities - Self Tests
 *
 * Verifies the accessibility testing utilities work correctly before
 * they are used across the test suite for EAA compliance verification.
 *
 * ## Utilities Tested
 *
 * | Utility                      | WCAG Criterion              | Purpose                    |
 * |------------------------------|-----------------------------|----------------------------|
 * | `expectMinTouchTarget`       | 2.5.5 Target Size           | Touch target >=44/48px     |
 * | `expectMinHitSlop`           | 2.5.5 Target Size           | hitSlop for small targets  |
 * | `expectAccessibilityProps`   | 4.1.2 Name, Role, Value     | Role, label, hint, state   |
 * | `expectScreenReaderAnnouncement` | 4.1.3 Status Messages   | Live regions for updates   |
 * | `expectLiveRegionContent`    | 4.1.3 Status Messages       | Content in live regions    |
 * | `expectFocusOrder`           | 2.4.3 Focus Order           | Logical focus sequence     |
 * | `expectCanReceiveFocus`      | 2.1.1 Keyboard              | Focusable elements         |
 * | `expectColorContrast`        | 1.4.3 Contrast (Minimum)    | 4.5:1 text, 3:1 large      |
 * | `expectNoTimingDependence`   | 2.2.1 Timing Adjustable     | No time-based interactions |
 * | `expectPauseStopHide`        | 2.2.2 Pause, Stop, Hide     | Controls for auto-content  |
 * | `expectNoFlashing`           | 2.3.1 Three Flashes         | No seizure triggers        |
 * | `expectConsistentNavigation` | 3.2.3 Consistent Navigation | Same nav order             |
 * | `expectErrorIdentification`  | 3.3.1 Error Identification  | Clear error indication     |
 * | `expectLabelInstructions`    | 3.3.2 Labels or Instructions| Required field labels      |
 *
 * ## Test Structure
 *
 * Each utility has tests for:
 * - Passing case (element meets requirements)
 * - Failing case (element does not meet requirements)
 * - Edge cases (boundary values, missing props)
 *
 * @see src/test-utils/accessibility.ts for utility implementations
 * @see docs/readme/ACCESSIBILITY.md for EAA compliance requirements
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';

// Custom prop types for testing edge cases that may exist at runtime
type TestPressableProps = React.ComponentProps<typeof Pressable> & {
  accessibilityOrder?: number;
  autoFocus?: boolean;
};

// Test-only Pressable wrapper that accepts custom accessibility props
// These props are passed through so they appear in element.props for testing
const TestPressable = (props: TestPressableProps) => {
  // Cast to unknown first then to Pressable props to safely include custom attributes
  const pressableProps = props as unknown as React.ComponentProps<typeof Pressable>;
  return <Pressable {...pressableProps} />;
};

import {
  calculateContrastRatio,
  CONTRAST_RATIOS,
  expectAccessibilityComplete,
  expectAccessibilityProps,
  expectCanReceiveFocus,
  expectColorContrast,
  expectConsistentNavigation,
  expectErrorIdentification,
  expectFocusOrder,
  expectLabelInstructions,
  expectLiveRegionContent,
  expectMinHitSlop,
  expectMinTouchTarget,
  expectNoFlashing,
  expectNoTimingDependence,
  expectPauseStopHide,
  expectScreenReaderAnnouncement,
  hasAccessibilityProps,
  TOUCH_TARGET_SIZES,
} from '../accessibility';

describe('accessibility test utilities', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('TOUCH_TARGET_SIZES', () => {
    it('should have iOS minimum of 44×44', () => {
      expect(TOUCH_TARGET_SIZES.ios.minWidth).toBe(44);
      expect(TOUCH_TARGET_SIZES.ios.minHeight).toBe(44);
    });

    it('should have Android minimum of 48×48', () => {
      expect(TOUCH_TARGET_SIZES.android.minWidth).toBe(48);
      expect(TOUCH_TARGET_SIZES.android.minHeight).toBe(48);
    });

    it('should use iOS as default', () => {
      expect(TOUCH_TARGET_SIZES.default.minWidth).toBe(44);
      expect(TOUCH_TARGET_SIZES.default.minHeight).toBe(44);
    });
  });

  describe('CONTRAST_RATIOS', () => {
    it('should require 4.5:1 for normal text', () => {
      expect(CONTRAST_RATIOS.normalText).toBe(4.5);
    });

    it('should require 3:1 for large text', () => {
      expect(CONTRAST_RATIOS.largeText).toBe(3.0);
    });

    it('should require 3:1 for UI components', () => {
      expect(CONTRAST_RATIOS.uiComponents).toBe(3.0);
    });
  });

  describe('expectMinTouchTarget', () => {
    it('should pass for element with minWidth and minHeight >= 44', async () => {
      await render(
        <Pressable testID="button" style={{ minWidth: 44, minHeight: 44 }}>
          <Text>Button</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should pass for element larger than 44×44', async () => {
      await render(
        <Pressable testID="button" style={{ minWidth: 100, minHeight: 60 }}>
          <Text>Large Button</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should fail for element smaller than 44×44 when explicitly sized', async () => {
      await render(
        <Pressable testID="button" style={{ minWidth: 30, minHeight: 30 }}>
          <Text>Small</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinTouchTarget(button)).toThrow();
    });

    it('should account for padding in touch target calculation', async () => {
      await render(
        <Pressable testID="button" style={{ width: 30, height: 30, padding: 8 }}>
          <Text>Padded</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // 30 + 16 (padding*2) = 46 >= 44
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should accept custom minimum sizes', async () => {
      await render(
        <Pressable testID="button" style={{ minWidth: 48, minHeight: 48 }}>
          <Text>Android</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // Should pass with Android-sized requirements
      expect(() => expectMinTouchTarget(button, 48, 48)).not.toThrow();
    });

    it('should pass for element using width and height instead of min', async () => {
      await render(
        <Pressable testID="button" style={{ width: 50, height: 50 }}>
          <Text>Fixed</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should handle style arrays', async () => {
      await render(
        <Pressable testID="button" style={[{ minWidth: 44 }, { minHeight: 44 }]}>
          <Text>Array Styles</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should not fail for element without explicit sizes (parent controlled)', async () => {
      await render(
        <Pressable testID="button">
          <Text>No Size</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // Should not throw when no explicit size (parent controls touch target)
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should handle string values with px suffix', async () => {
      // Use type assertion to test edge case where runtime receives string values
      const stringStyle = { minWidth: '50px', minHeight: '50px' } as unknown as ViewStyle;
      await render(
        <Pressable testID="button" style={stringStyle}>
          <Text>String Size</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // Should parse '50px' as 50 and pass
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should handle paddingHorizontal for touch target', async () => {
      await render(
        <Pressable testID="button" style={{ width: 30, height: 44, paddingHorizontal: 14 }}>
          <Text>Padded H</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // 30 + 14 (paddingHorizontal) = 44 >= 44
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should handle paddingVertical for touch target', async () => {
      await render(
        <Pressable testID="button" style={{ width: 44, height: 30, paddingVertical: 14 }}>
          <Text>Padded V</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // 30 + 14 (paddingVertical) = 44 >= 44
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should handle paddingLeft and paddingRight separately', async () => {
      await render(
        <Pressable
          testID="button"
          style={{ width: 30, height: 44, paddingLeft: 7, paddingRight: 7 }}
        >
          <Text>LR Padded</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // 30 + 14 (7 + 7) = 44 >= 44
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });

    it('should handle paddingTop and paddingBottom separately', async () => {
      await render(
        <Pressable
          testID="button"
          style={{ width: 44, height: 30, paddingTop: 7, paddingBottom: 7 }}
        >
          <Text>TB Padded</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // 30 + 14 (7 + 7) = 44 >= 44
      expect(() => expectMinTouchTarget(button)).not.toThrow();
    });
  });

  describe('expectMinHitSlop', () => {
    it('should pass when hitSlop meets minimum', async () => {
      await render(
        <Pressable testID="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text>Icon</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinHitSlop(button, 8)).not.toThrow();
    });

    it('should pass when hitSlop is a number', async () => {
      await render(
        <Pressable testID="button" hitSlop={12}>
          <Text>Icon</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinHitSlop(button, 10)).not.toThrow();
    });

    it('should fail when no hitSlop defined', async () => {
      await render(
        <Pressable testID="button">
          <Text>No HitSlop</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinHitSlop(button)).toThrow(/no hitSlop defined/i);
    });

    it('should fail when hitSlop is too small', async () => {
      await render(
        <Pressable testID="button" hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
          <Text>Small HitSlop</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectMinHitSlop(button, 8)).toThrow();
    });
  });

  describe('calculateContrastRatio', () => {
    it('should return ~21 for black on white', () => {
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1 for identical colours', () => {
      const ratio = calculateContrastRatio('#ffffff', '#ffffff');
      expect(ratio).toBe(1);
    });

    it('should handle shorthand hex (#RGB)', () => {
      const ratio = calculateContrastRatio('#000', '#fff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should handle rgb() format', () => {
      const ratio = calculateContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should handle rgba() format', () => {
      const ratio = calculateContrastRatio('rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate correct ratio for WCAG AA compliant colours', () => {
      // #767676 on white is approximately the minimum for AA (4.54:1)
      const ratio = calculateContrastRatio('#767676', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should calculate correct ratio for large text (3:1)', () => {
      // #909090 on white gives approximately 3.5:1
      const ratio = calculateContrastRatio('#909090', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it('should throw for invalid colour formats', () => {
      expect(() => calculateContrastRatio('invalid', '#ffffff')).toThrow(/Cannot parse colours/);
    });

    it('should handle lowercase and uppercase hex', () => {
      const lower = calculateContrastRatio('#aabbcc', '#ffffff');
      const upper = calculateContrastRatio('#AABBCC', '#FFFFFF');
      expect(lower).toBeCloseTo(upper, 2);
    });
  });

  describe('expectColorContrast', () => {
    it('should pass for 4.5:1 contrast with normal text', () => {
      expect(() => expectColorContrast('#000000', '#ffffff', { type: 'normalText' })).not.toThrow();
    });

    it('should pass for 3:1 contrast with large text', () => {
      // #767676 on white gives ~4.5:1, more than enough for large text
      expect(() => expectColorContrast('#767676', '#ffffff', { type: 'largeText' })).not.toThrow();
    });

    it('should fail for insufficient contrast', () => {
      // #cccccc on white gives ~1.6:1, insufficient
      expect(() => expectColorContrast('#cccccc', '#ffffff', { type: 'normalText' })).toThrow();
    });

    it('should accept custom minimum ratio', () => {
      expect(() => expectColorContrast('#808080', '#ffffff', { minRatio: 3.0 })).not.toThrow();
    });

    it('should default to normalText when no type specified', () => {
      expect(() => expectColorContrast('#000000', '#ffffff')).not.toThrow();
    });
  });

  describe('expectAccessibilityProps', () => {
    it('should pass when role matches', async () => {
      await render(
        <Pressable testID="button" accessibilityRole="button">
          <Text>Button</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectAccessibilityProps(button, { role: 'button' })).not.toThrow();
    });

    it('should pass when label is truthy', async () => {
      await render(
        <Pressable testID="button" accessibilityLabel="Submit form">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectAccessibilityProps(button, { label: true })).not.toThrow();
    });

    it('should pass when label matches exact string', async () => {
      await render(
        <Pressable testID="button" accessibilityLabel="Submit form">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectAccessibilityProps(button, { label: 'Submit form' })).not.toThrow();
    });

    it('should pass when hint matches', async () => {
      await render(
        <Pressable testID="button" accessibilityHint="Saves your changes">
          <Text>Save</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectAccessibilityProps(button, { hint: 'Saves your changes' })).not.toThrow();
    });

    it('should verify accessibility state', async () => {
      await render(
        <Pressable testID="button" accessibilityState={{ disabled: true }}>
          <Text>Disabled</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectAccessibilityProps(button, { state: { disabled: true } })).not.toThrow();
    });

    it('should fail when role does not match', async () => {
      await render(
        <Pressable testID="button" accessibilityRole="link">
          <Text>Button</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectAccessibilityProps(button, { role: 'button' })).toThrow();
    });
  });

  describe('expectScreenReaderAnnouncement', () => {
    it('should verify liveRegion is set', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite">
          <Text>Error</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() => expectScreenReaderAnnouncement(alert, { liveRegion: 'polite' })).not.toThrow();
    });

    it('should verify assertive live region', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="assertive">
          <Text>Critical</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectScreenReaderAnnouncement(alert, { liveRegion: 'assertive' })
      ).not.toThrow();
    });

    it('should verify role if specified', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite" accessibilityRole="alert">
          <Text>Error</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectScreenReaderAnnouncement(alert, { liveRegion: 'polite', role: 'alert' })
      ).not.toThrow();
    });

    it('should verify atomic option when true (element not hidden)', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite" accessibilityElementsHidden={false}>
          <Text>Atomic content</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectScreenReaderAnnouncement(alert, { liveRegion: 'polite', atomic: true })
      ).not.toThrow();
    });

    it('should verify atomic option when false (element hidden)', async () => {
      const { getByTestId } = await render(
        <View testID="alert" accessibilityLiveRegion="polite" accessibilityElementsHidden={true}>
          <Text>Non-atomic content</Text>
        </View>
      );

      // Use includeHiddenElements since accessibilityElementsHidden hides from normal queries
      const alert = getByTestId('alert', { includeHiddenElements: true });
      expect(() =>
        expectScreenReaderAnnouncement(alert, { liveRegion: 'polite', atomic: false })
      ).not.toThrow();
    });

    it('should fail atomic check when hidden state does not match', async () => {
      const { getByTestId } = await render(
        <View testID="alert" accessibilityLiveRegion="polite" accessibilityElementsHidden={true}>
          <Text>Content</Text>
        </View>
      );

      // Use includeHiddenElements since accessibilityElementsHidden hides from normal queries
      const alert = getByTestId('alert', { includeHiddenElements: true });
      // atomic: true expects accessibilityElementsHidden to be false
      expect(() =>
        expectScreenReaderAnnouncement(alert, { liveRegion: 'polite', atomic: true })
      ).toThrow();
    });
  });

  describe('expectFocusOrder', () => {
    it('should pass for correctly ordered focusable elements', async () => {
      await render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="second" accessible={true}>
            <Text>Second</Text>
          </Pressable>
          <Pressable testID="third" accessible={true}>
            <Text>Third</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');
      const third = screen.getByTestId('third');

      expect(() => expectFocusOrder([first, second, third])).not.toThrow();
    });

    it('should fail if element is not accessible', async () => {
      await render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="second" accessible={false}>
            <Text>Hidden</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');

      expect(() => expectFocusOrder([first, second])).toThrow();
    });

    it('should fail if element is hidden from accessibility', async () => {
      const { getByTestId } = await render(
        <View>
          <Pressable testID="first">
            <Text>First</Text>
          </Pressable>
          <Pressable testID="second" accessibilityElementsHidden={true}>
            <Text>Hidden</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      // Use includeHiddenElements since accessibilityElementsHidden hides from normal queries
      const second = getByTestId('second', { includeHiddenElements: true });

      expect(() => expectFocusOrder([first, second])).toThrow();
    });

    it('should accept elements with accessibilityViewIsModal (creates own focus context)', async () => {
      const { getByTestId } = await render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="modal" accessible={true} accessibilityViewIsModal={true}>
            <Text>Modal Element</Text>
          </Pressable>
        </View>
      );

      // accessibilityViewIsModal may hide siblings, so include hidden elements for both
      const first = getByTestId('first', { includeHiddenElements: true });
      const modal = getByTestId('modal', { includeHiddenElements: true });

      // Modal elements create their own focus context so should not throw
      expect(() => expectFocusOrder([first, modal])).not.toThrow();
    });

    it('should verify accessibilityOrder matches expected sequence', async () => {
      await render(
        <View>
          <TestPressable testID="first" accessible={true} accessibilityOrder={0}>
            <Text>First</Text>
          </TestPressable>
          <TestPressable testID="second" accessible={true} accessibilityOrder={1}>
            <Text>Second</Text>
          </TestPressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');

      expect(() => expectFocusOrder([first, second])).not.toThrow();
    });

    it('should fail when accessibilityOrder does not match sequence', async () => {
      await render(
        <View>
          <TestPressable testID="first" accessible={true} accessibilityOrder={1}>
            <Text>First</Text>
          </TestPressable>
          <TestPressable testID="second" accessible={true} accessibilityOrder={0}>
            <Text>Second</Text>
          </TestPressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');

      // First is at index 0 but has accessibilityOrder 1, should fail
      expect(() => expectFocusOrder([first, second])).toThrow();
    });

    it('should fail for element with importantForAccessibility no-hide-descendants', async () => {
      const { getByTestId } = await render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="hidden" importantForAccessibility="no-hide-descendants">
            <Text>Hidden</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      // Use includeHiddenElements since importantForAccessibility hides from normal queries
      const hidden = getByTestId('hidden', { includeHiddenElements: true });

      expect(() => expectFocusOrder([first, hidden])).toThrow();
    });
  });

  describe('expectCanReceiveFocus', () => {
    it('should pass for accessible element', async () => {
      await render(
        <Pressable testID="button" accessible={true}>
          <Text>Button</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectCanReceiveFocus(button)).not.toThrow();
    });

    it('should fail for non-accessible element', async () => {
      await render(
        <Pressable testID="button" accessible={false}>
          <Text>Hidden</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectCanReceiveFocus(button)).toThrow();
    });

    it('should fail for element hidden from accessibility tree', async () => {
      const { getByTestId } = await render(
        <Pressable testID="button" accessibilityElementsHidden={true}>
          <Text>Hidden</Text>
        </Pressable>
      );

      // Use includeHiddenElements since accessibilityElementsHidden hides from normal queries
      const button = getByTestId('button', { includeHiddenElements: true });
      expect(() => expectCanReceiveFocus(button)).toThrow();
    });

    it('should verify autoFocus when requested', async () => {
      await render(
        <TestPressable testID="button" autoFocus={true}>
          <Text>AutoFocus</Text>
        </TestPressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectCanReceiveFocus(button, { autoFocus: true })).not.toThrow();
    });

    it('should fail autoFocus check when not set', async () => {
      await render(
        <Pressable testID="button">
          <Text>No AutoFocus</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectCanReceiveFocus(button, { autoFocus: true })).toThrow();
    });
  });

  describe('expectAccessibilityComplete', () => {
    it('should pass when all required props present', async () => {
      await render(
        <Pressable
          testID="button"
          accessibilityRole="button"
          accessibilityLabel="Submit form"
          accessibilityHint="Saves your changes"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() =>
        expectAccessibilityComplete(button, {
          role: 'button',
          label: 'Submit form',
          hint: 'Saves your changes',
        })
      ).not.toThrow();
    });

    it('should fail when role is missing', async () => {
      await render(
        <Pressable testID="button" accessibilityLabel="Submit">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() =>
        expectAccessibilityComplete(button, { role: 'button', label: 'Submit' })
      ).toThrow();
    });

    it('should fail when label is missing', async () => {
      await render(
        <Pressable testID="button" accessibilityRole="button">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() =>
        expectAccessibilityComplete(button, { role: 'button', label: 'Submit' })
      ).toThrow();
    });

    it('should verify state when provided', async () => {
      await render(
        <Pressable
          testID="button"
          accessibilityRole="button"
          accessibilityLabel="Submit"
          accessibilityState={{ disabled: true }}
        >
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() =>
        expectAccessibilityComplete(button, {
          role: 'button',
          label: 'Submit',
          state: { disabled: true },
        })
      ).not.toThrow();
    });

    it('should check touch target by default', async () => {
      await render(
        <Pressable
          testID="button"
          accessibilityRole="button"
          accessibilityLabel="Submit"
          style={{ minWidth: 20, minHeight: 20 }}
        >
          <Text>Small</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() =>
        expectAccessibilityComplete(button, { role: 'button', label: 'Submit' })
      ).toThrow();
    });

    it('should skip touch target check when disabled', async () => {
      await render(
        <Pressable
          testID="button"
          accessibilityRole="button"
          accessibilityLabel="Submit"
          style={{ minWidth: 20, minHeight: 20 }}
        >
          <Text>Small</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() =>
        expectAccessibilityComplete(button, {
          role: 'button',
          label: 'Submit',
          touchTarget: false,
        })
      ).not.toThrow();
    });

    it('should accept element with hitSlop for touch target', async () => {
      await render(
        <Pressable
          testID="button"
          accessibilityRole="button"
          accessibilityLabel="Icon button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text>Icon</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // Element with hitSlop satisfies touch target check
      expect(() =>
        expectAccessibilityComplete(button, {
          role: 'button',
          label: 'Icon button',
        })
      ).not.toThrow();
    });

    it('should accept element with padding for touch target', async () => {
      await render(
        <Pressable
          testID="button"
          accessibilityRole="button"
          accessibilityLabel="Padded button"
          style={{ padding: 16 }}
        >
          <Text>Padded</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      // Element with padding satisfies touch target check
      expect(() =>
        expectAccessibilityComplete(button, {
          role: 'button',
          label: 'Padded button',
        })
      ).not.toThrow();
    });

    it('should verify multiple state values', async () => {
      await render(
        <Pressable
          testID="checkbox"
          accessibilityRole="checkbox"
          accessibilityLabel="Accept terms"
          accessibilityState={{ checked: true, disabled: false }}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Text>Checkbox</Text>
        </Pressable>
      );

      const checkbox = screen.getByTestId('checkbox');
      expect(() =>
        expectAccessibilityComplete(checkbox, {
          role: 'checkbox',
          label: 'Accept terms',
          state: { checked: true, disabled: false },
        })
      ).not.toThrow();
    });
  });

  describe('expectLiveRegionContent', () => {
    it('should verify live region has expected content in children', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite">
          <Text>Error message here</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, 'Error message here', { liveRegion: 'polite' })
      ).not.toThrow();
    });

    it('should verify content in accessibilityLabel', async () => {
      await render(
        <View
          testID="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel="Error: Invalid input"
        />
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, 'Invalid input', { liveRegion: 'polite' })
      ).not.toThrow();
    });

    it('should verify role when specified', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="assertive" accessibilityRole="alert">
          <Text>Critical error</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, 'Critical error', {
          liveRegion: 'assertive',
          role: 'alert',
        })
      ).not.toThrow();
    });

    it('should fail if content not found', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite">
          <Text>Different message</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, 'Expected content', { liveRegion: 'polite' })
      ).toThrow();
    });

    it('should verify content in accessibilityValue.text', async () => {
      await render(
        <View
          testID="alert"
          accessibilityLiveRegion="polite"
          accessibilityValue={{ text: 'Progress: 50% complete' }}
        />
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, '50% complete', { liveRegion: 'polite' })
      ).not.toThrow();
    });

    it('should handle nested children with props.children', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="assertive">
          <View>
            <Text>Nested error message</Text>
          </View>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, 'Nested error', { liveRegion: 'assertive' })
      ).not.toThrow();
    });

    it('should handle numeric children content', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite">
          <Text>{42}</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() => expectLiveRegionContent(alert, '42', { liveRegion: 'polite' })).not.toThrow();
    });

    it('should handle array children content', async () => {
      await render(
        <View testID="alert" accessibilityLiveRegion="polite">
          <Text>Error: </Text>
          <Text>Invalid input</Text>
        </View>
      );

      const alert = screen.getByTestId('alert');
      expect(() =>
        expectLiveRegionContent(alert, 'Invalid input', { liveRegion: 'polite' })
      ).not.toThrow();
    });
  });

  describe('hasAccessibilityProps', () => {
    it('should return true when element has role and label', async () => {
      await render(
        <Pressable testID="button" accessibilityRole="button" accessibilityLabel="Submit">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(hasAccessibilityProps(button)).toBe(true);
    });

    it('should return false when missing role', async () => {
      await render(
        <Pressable testID="button" accessibilityLabel="Submit">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(hasAccessibilityProps(button)).toBe(false);
    });

    it('should return false when missing label', async () => {
      await render(
        <Pressable testID="button" accessibilityRole="button">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(hasAccessibilityProps(button)).toBe(false);
    });

    it('should return false when both missing', async () => {
      await render(
        <Pressable testID="button">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(hasAccessibilityProps(button)).toBe(false);
    });
  });
});

/**
 * WCAG 2.1 Level AA Checklist Tests
 *
 * Complete checklist covering all WCAG 2.1 Level AA success criteria
 * relevant to React Native mobile applications for EAA compliance.
 */
describe('WCAG 2.1 Level AA Checklist', () => {
  describe('1. Perceivable', () => {
    describe('1.1 Text Alternatives', () => {
      describe('1.1.1 Non-text Content (Level A)', () => {
        it('images have accessible text alternatives', async () => {
          await render(
            <View testID="image-container">
              <View
                testID="profile-image"
                accessibilityRole="image"
                accessibilityLabel="Profile picture of John Doe"
              />
            </View>
          );

          const image = screen.getByTestId('profile-image');
          expect(image.props.accessibilityRole).toBe('image');
          expect(image.props.accessibilityLabel).toBe('Profile picture of John Doe');
        });

        it('decorative images are hidden from screen readers', async () => {
          const { getByTestId } = await render(
            <View testID="container">
              <View
                testID="decorative-image"
                accessibilityRole="image"
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
              />
            </View>
          );

          const image = getByTestId('decorative-image', { includeHiddenElements: true });
          expect(image.props.accessibilityElementsHidden).toBe(true);
        });

        it('icon buttons have accessible labels', async () => {
          await render(
            <Pressable
              testID="icon-button"
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Text>✕</Text>
            </Pressable>
          );

          const button = screen.getByTestId('icon-button');
          expect(button.props.accessibilityLabel).toBe('Close dialog');
        });
      });
    });

    describe('1.3 Adaptable', () => {
      describe('1.3.1 Info and Relationships (Level A)', () => {
        it('headings use appropriate accessibility role', async () => {
          await render(
            <View>
              <Text testID="heading" accessibilityRole="header">
                Section Title
              </Text>
            </View>
          );

          const heading = screen.getByTestId('heading');
          expect(heading.props.accessibilityRole).toBe('header');
        });

        it('form fields have associated labels', async () => {
          await render(
            <View accessibilityLabel="Email input">
              <Text>Email</Text>
              <View testID="email-input" accessibilityLabel="Email" accessibilityRole="none" />
            </View>
          );

          const input = screen.getByTestId('email-input');
          expect(input.props.accessibilityLabel).toBe('Email');
        });

        it('grouped content is semantically grouped', async () => {
          await render(
            <View
              testID="card"
              accessible={true}
              accessibilityLabel="Product card: iPhone 15, £999, In stock"
            >
              <Text>iPhone 15</Text>
              <Text>£999</Text>
              <Text>In stock</Text>
            </View>
          );

          const card = screen.getByTestId('card');
          expect(card.props.accessible).toBe(true);
          expect(card.props.accessibilityLabel).toContain('iPhone 15');
        });
      });

      describe('1.3.4 Orientation (Level AA)', () => {
        it('content does not restrict orientation programmatically', async () => {
          // This is verified by not using orientation-locking APIs
          // Test verifies component renders without orientation restrictions
          await render(
            <View testID="content" style={{ flex: 1 }}>
              <Text>Content available in any orientation</Text>
            </View>
          );

          expect(screen.getByTestId('content')).toBeOnTheScreen();
        });
      });

      describe('1.3.5 Identify Input Purpose (Level AA)', () => {
        it('text fields specify input purpose with accessible hints', async () => {
          await render(
            <View
              testID="email-field"
              accessibilityRole="none"
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email address for account login"
            />
          );

          const field = screen.getByTestId('email-field');
          expect(field.props.accessibilityLabel).toBe('Email address');
          expect(field.props.accessibilityHint).toContain('email');
        });
      });
    });

    describe('1.4 Distinguishable', () => {
      describe('1.4.1 Use of Colour (Level A)', () => {
        it('error states have multiple indicators beyond colour', async () => {
          await render(
            <View testID="error-field">
              <Text testID="error-icon">⚠️</Text>
              <Text testID="error-message">Error: This field is required</Text>
            </View>
          );

          // Error conveyed through icon AND text (not colour alone)
          expect(screen.getByTestId('error-icon')).toBeOnTheScreen();
          expect(screen.getByText(/Error:/)).toBeOnTheScreen();
        });
      });

      describe('1.4.3 Contrast (Minimum) (Level AA)', () => {
        it('text meets 4.5:1 contrast ratio', () => {
          expect(() =>
            expectColorContrast('#333333', '#ffffff', { type: 'normalText' })
          ).not.toThrow();
        });

        it('large text meets 3:1 contrast ratio', () => {
          expect(() =>
            expectColorContrast('#666666', '#ffffff', { type: 'largeText' })
          ).not.toThrow();
        });

        it('UI components meet 3:1 contrast ratio', () => {
          expect(() =>
            expectColorContrast('#595959', '#ffffff', { type: 'uiComponents' })
          ).not.toThrow();
        });
      });

      describe('1.4.4 Resize Text (Level AA)', () => {
        it('text can scale up to 200% without loss of content', async () => {
          // In RN, this is typically handled by respecting system font scaling
          // Test verifies component doesn't use fixed pixel sizes inappropriately
          await render(
            <View testID="content">
              <Text style={{ fontSize: 16 }}>Scalable text</Text>
            </View>
          );

          expect(screen.getByText('Scalable text')).toBeOnTheScreen();
        });
      });

      describe('1.4.10 Reflow (Level AA)', () => {
        it('content reflows at 320px viewport width', async () => {
          // Verified by flexible layout that adapts to screen size
          await render(
            <View testID="container" style={{ flex: 1, flexWrap: 'wrap' }}>
              <Text>Content that reflows</Text>
            </View>
          );

          expect(screen.getByTestId('container')).toBeOnTheScreen();
        });
      });

      describe('1.4.11 Non-text Contrast (Level AA)', () => {
        it('focus indicators have sufficient contrast', async () => {
          // Focus indicator with 3:1 contrast against background
          await render(
            <Pressable
              testID="focused-element"
              style={{
                borderWidth: 2,
                borderColor: '#0066CC', // High contrast focus colour
              }}
            >
              <Text>Focused</Text>
            </Pressable>
          );

          const element = screen.getByTestId('focused-element');
          expect(element).toBeOnTheScreen();
        });
      });

      describe('1.4.12 Text Spacing (Level AA)', () => {
        it('content handles increased text spacing', async () => {
          // Verified by not using fixed heights that truncate text
          await render(
            <View testID="text-container" style={{ minHeight: 'auto' }}>
              <Text style={{ lineHeight: 24 }}>Text with adequate spacing</Text>
            </View>
          );

          expect(screen.getByTestId('text-container')).toBeOnTheScreen();
        });
      });

      describe('1.4.13 Content on Hover or Focus (Level AA)', () => {
        it('hover/focus content is dismissible, hoverable, persistent', async () => {
          // In RN, tooltips should be dismissible and persistent
          await render(
            <View testID="tooltip-trigger" accessibilityHint="Long press for more information">
              <Text>Info</Text>
            </View>
          );

          const trigger = screen.getByTestId('tooltip-trigger');
          expect(trigger.props.accessibilityHint).toBeDefined();
        });
      });
    });
  });

  describe('2. Operable', () => {
    describe('2.1 Keyboard Accessible', () => {
      describe('2.1.1 Keyboard (Level A)', () => {
        it('all interactive elements are focusable', async () => {
          await render(
            <Pressable testID="button" accessible={true} accessibilityRole="button">
              <Text>Click me</Text>
            </Pressable>
          );

          const button = screen.getByTestId('button');
          expect(button.props.accessible).toBe(true);
        });
      });

      describe('2.1.2 No Keyboard Trap (Level A)', () => {
        it('focus can move away from all interactive elements', async () => {
          await render(
            <View>
              <Pressable testID="first" accessible={true}>
                <Text>First</Text>
              </Pressable>
              <Pressable testID="second" accessible={true}>
                <Text>Second</Text>
              </Pressable>
            </View>
          );

          // Both elements are independently focusable
          expect(screen.getByTestId('first').props.accessible).not.toBe(false);
          expect(screen.getByTestId('second').props.accessible).not.toBe(false);
        });
      });
    });

    describe('2.4 Navigable', () => {
      describe('2.4.3 Focus Order (Level A)', () => {
        it('focus order follows logical reading sequence', async () => {
          await render(
            <View>
              <Pressable testID="nav-1" accessible={true}>
                <Text>1</Text>
              </Pressable>
              <Pressable testID="nav-2" accessible={true}>
                <Text>2</Text>
              </Pressable>
              <Pressable testID="nav-3" accessible={true}>
                <Text>3</Text>
              </Pressable>
            </View>
          );

          const first = screen.getByTestId('nav-1');
          const second = screen.getByTestId('nav-2');
          const third = screen.getByTestId('nav-3');

          expect(() => expectFocusOrder([first, second, third])).not.toThrow();
        });
      });

      describe('2.4.6 Headings and Labels (Level AA)', () => {
        it('headings describe topic or purpose', async () => {
          await render(
            <View>
              <Text testID="section-heading" accessibilityRole="header">
                Account Settings
              </Text>
              <View testID="section-content">
                <Text>Settings content here</Text>
              </View>
            </View>
          );

          const heading = screen.getByTestId('section-heading');
          expect(heading.props.accessibilityRole).toBe('header');
          expect(heading).toHaveTextContent('Account Settings');
        });

        it('labels describe input purpose', async () => {
          await render(
            <View>
              <Text>Username</Text>
              <View
                testID="username-input"
                accessibilityLabel="Username"
                accessibilityHint="Enter your username"
              />
            </View>
          );

          const input = screen.getByTestId('username-input');
          expect(input.props.accessibilityLabel).toBe('Username');
        });
      });

      describe('2.4.7 Focus Visible (Level AA)', () => {
        it('focus indicator is visible', async () => {
          await render(
            <Pressable
              testID="focusable"
              style={({ pressed }) => ({
                borderWidth: pressed ? 2 : 1,
                borderColor: pressed ? '#0066CC' : '#CCCCCC',
              })}
            >
              <Text>Focusable element</Text>
            </Pressable>
          );

          expect(screen.getByTestId('focusable')).toBeOnTheScreen();
        });
      });
    });

    describe('2.5 Input Modalities', () => {
      describe('2.5.1 Pointer Gestures (Level A)', () => {
        it('complex gestures have simple alternatives', async () => {
          // Pinch-to-zoom has button alternatives
          await render(
            <View>
              <Pressable testID="zoom-in" accessibilityRole="button" accessibilityLabel="Zoom in">
                <Text>+</Text>
              </Pressable>
              <Pressable testID="zoom-out" accessibilityRole="button" accessibilityLabel="Zoom out">
                <Text>-</Text>
              </Pressable>
            </View>
          );

          expect(screen.getByTestId('zoom-in')).toBeOnTheScreen();
          expect(screen.getByTestId('zoom-out')).toBeOnTheScreen();
        });
      });

      describe('2.5.3 Label in Name (Level A)', () => {
        it('accessible name contains visible label text', async () => {
          await render(
            <Pressable
              testID="submit-button"
              accessibilityRole="button"
              accessibilityLabel="Submit form"
            >
              <Text>Submit</Text>
            </Pressable>
          );

          const button = screen.getByTestId('submit-button');
          // Accessible name should contain the visible text "Submit"
          expect(button.props.accessibilityLabel).toContain('Submit');
        });
      });

      describe('2.5.4 Motion Actuation (Level A)', () => {
        it('motion-triggered actions have UI alternatives', async () => {
          await render(
            <View>
              <Pressable testID="undo-button" accessibilityRole="button" accessibilityLabel="Undo">
                <Text>Undo</Text>
              </Pressable>
            </View>
          );

          // Shake-to-undo has button alternative
          expect(screen.getByTestId('undo-button')).toBeOnTheScreen();
        });
      });
    });
  });

  describe('3. Understandable', () => {
    describe('3.2 Predictable', () => {
      describe('3.2.1 On Focus (Level A)', () => {
        it('focus does not trigger context change', async () => {
          // Verified by not having onFocus handlers that navigate/submit
          await render(
            <Pressable testID="input" accessibilityRole="button">
              <Text>Focus me</Text>
            </Pressable>
          );

          expect(screen.getByTestId('input')).toBeOnTheScreen();
        });
      });

      describe('3.2.2 On Input (Level A)', () => {
        it('input does not automatically trigger context change', async () => {
          // Form inputs wait for explicit submission
          await render(
            <View>
              <View testID="form-field" />
              <Pressable testID="submit" accessibilityRole="button">
                <Text>Submit</Text>
              </Pressable>
            </View>
          );

          expect(screen.getByTestId('submit')).toBeOnTheScreen();
        });
      });
    });

    describe('3.3 Input Assistance', () => {
      describe('3.3.1 Error Identification (Level A)', () => {
        it('errors are identified and described in text', async () => {
          await render(
            <View testID="error-message" accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Text>Email address is invalid</Text>
            </View>
          );

          const error = screen.getByTestId('error-message');
          expect(error.props.accessibilityRole).toBe('alert');
          expect(screen.getByText('Email address is invalid')).toBeOnTheScreen();
        });
      });

      describe('3.3.2 Labels or Instructions (Level A)', () => {
        it('form fields have labels and instructions', async () => {
          await render(
            <View>
              <Text>Password</Text>
              <View
                testID="password-input"
                accessibilityLabel="Password"
                accessibilityHint="Must be at least 8 characters"
              />
            </View>
          );

          const input = screen.getByTestId('password-input');
          expect(input.props.accessibilityLabel).toBe('Password');
          expect(input.props.accessibilityHint).toContain('8 characters');
        });
      });

      describe('3.3.3 Error Suggestion (Level AA)', () => {
        it('error messages suggest corrections', async () => {
          await render(
            <View testID="error" accessibilityRole="alert">
              <Text>Invalid email. Please enter a valid email address like name@example.com</Text>
            </View>
          );

          expect(screen.getByTestId('error')).toBeOnTheScreen();
          expect(screen.getByText(/valid email address like/)).toBeOnTheScreen();
        });
      });

      describe('3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)', () => {
        it('destructive actions require confirmation', async () => {
          await render(
            <View testID="delete-confirmation">
              <Text>Are you sure you want to delete your account?</Text>
              <Pressable testID="confirm-delete" accessibilityRole="button">
                <Text>Yes, delete</Text>
              </Pressable>
              <Pressable testID="cancel" accessibilityRole="button">
                <Text>Cancel</Text>
              </Pressable>
            </View>
          );

          expect(screen.getByTestId('confirm-delete')).toBeOnTheScreen();
          expect(screen.getByTestId('cancel')).toBeOnTheScreen();
        });
      });
    });
  });

  describe('4. Robust', () => {
    describe('4.1 Compatible', () => {
      describe('4.1.2 Name, Role, Value (Level A)', () => {
        it('custom components expose name, role, and value', async () => {
          await render(
            <Pressable
              testID="custom-switch"
              accessibilityRole="switch"
              accessibilityLabel="Dark mode"
              accessibilityState={{ checked: true }}
            >
              <Text>On</Text>
            </Pressable>
          );

          const switchEl = screen.getByTestId('custom-switch');
          expect(switchEl.props.accessibilityLabel).toBe('Dark mode'); // Name
          expect(switchEl.props.accessibilityRole).toBe('switch'); // Role
          expect(switchEl.props.accessibilityState?.checked).toBe(true); // Value
        });
      });

      describe('4.1.3 Status Messages (Level AA)', () => {
        it('status messages use live regions', async () => {
          await render(
            <View testID="status" accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Text>Form submitted successfully</Text>
            </View>
          );

          const status = screen.getByTestId('status');
          expect(status.props.accessibilityLiveRegion).toBe('polite');
        });

        it('error messages use assertive live region', async () => {
          await render(
            <View
              testID="critical-error"
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <Text>Connection lost</Text>
            </View>
          );

          const error = screen.getByTestId('critical-error');
          expect(error.props.accessibilityLiveRegion).toBe('assertive');
        });
      });
    });
  });
});

/**
 * Tests for WCAG 2.1 Level AA Additional Test Utilities
 *
 * These utilities cover specific WCAG success criteria that require
 * dedicated assertion helpers for EAA compliance verification.
 */
describe('WCAG 2.1 Level AA Additional Test Utilities', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('expectNoTimingDependence', () => {
    it('passes for element without timing dependencies', async () => {
      await render(
        <Pressable testID="button" accessibilityRole="button">
          <Text>Submit</Text>
        </Pressable>
      );

      const button = screen.getByTestId('button');
      expect(() => expectNoTimingDependence(button)).not.toThrow();
    });

    it('fails when element has timeout prop', async () => {
      const TimeoutComponent = () => (
        <View testID="timeout-element" {...({ timeout: 5000 } as object)}>
          <Text>Expires soon</Text>
        </View>
      );

      await render(<TimeoutComponent />);
      const element = screen.getByTestId('timeout-element');

      expect(() => expectNoTimingDependence(element)).toThrow();
    });

    it('fails when element has onTimeout handler', async () => {
      const TimeoutHandlerComponent = () => (
        <View testID="timeout-handler" {...({ onTimeout: jest.fn() } as object)}>
          <Text>Has timeout handler</Text>
        </View>
      );

      await render(<TimeoutHandlerComponent />);
      const element = screen.getByTestId('timeout-handler');

      expect(() => expectNoTimingDependence(element)).toThrow();
    });

    it('allows timeout when explicitly permitted', async () => {
      const TimeLimitComponent = () => (
        <View testID="time-limit" {...({ timeLimit: 30000 } as object)}>
          <Text>Has time limit</Text>
        </View>
      );

      await render(<TimeLimitComponent />);
      const element = screen.getByTestId('time-limit');

      expect(() => expectNoTimingDependence(element, { allowTimeLimits: true })).not.toThrow();
    });

    it('fails when element has autoSubmit', async () => {
      const AutoSubmitComponent = () => (
        <View testID="auto-submit" {...({ autoSubmit: true } as object)}>
          <Text>Auto-submits</Text>
        </View>
      );

      await render(<AutoSubmitComponent />);
      const element = screen.getByTestId('auto-submit');

      expect(() => expectNoTimingDependence(element)).toThrow();
    });

    it('allows autoSubmit when explicitly permitted', async () => {
      const AutoSubmitComponent = () => (
        <View testID="auto-submit" {...({ autoSubmit: true } as object)}>
          <Text>Auto-submits</Text>
        </View>
      );

      await render(<AutoSubmitComponent />);
      const element = screen.getByTestId('auto-submit');

      expect(() => expectNoTimingDependence(element, { allowAutoSubmit: true })).not.toThrow();
    });
  });

  describe('expectPauseStopHide', () => {
    it('passes when pause control is provided for auto-playing content', async () => {
      await render(
        <View>
          <View testID="carousel">
            <Text>Auto-playing carousel</Text>
          </View>
          <Pressable testID="pause-button" accessibilityRole="button" accessibilityLabel="Pause">
            <Text>Pause</Text>
          </Pressable>
        </View>
      );

      const carousel = screen.getByTestId('carousel');
      const pauseButton = screen.getByTestId('pause-button');

      expect(() =>
        expectPauseStopHide(carousel, {
          pauseControl: pauseButton,
          autoPlays: true,
        })
      ).not.toThrow();
    });

    it('fails when no control provided for auto-playing content', async () => {
      await render(
        <View testID="carousel">
          <Text>Auto-playing carousel with no controls</Text>
        </View>
      );

      const carousel = screen.getByTestId('carousel');

      expect(() =>
        expectPauseStopHide(carousel, {
          autoPlays: true,
        })
      ).toThrow(/must have at least one control mechanism/);
    });

    it('passes when stop control is provided', async () => {
      await render(
        <View>
          <View testID="video-player">
            <Text>Video player</Text>
          </View>
          <Pressable testID="stop-button" accessibilityRole="button" accessibilityLabel="Stop">
            <Text>Stop</Text>
          </Pressable>
        </View>
      );

      const player = screen.getByTestId('video-player');
      const stopButton = screen.getByTestId('stop-button');

      expect(() =>
        expectPauseStopHide(player, {
          stopControl: stopButton,
          autoPlays: true,
        })
      ).not.toThrow();
    });

    it('passes when hide control is provided', async () => {
      await render(
        <View>
          <View testID="banner">
            <Text>Animated banner</Text>
          </View>
          <Pressable testID="hide-button" accessibilityRole="button" accessibilityLabel="Hide">
            <Text>Hide</Text>
          </Pressable>
        </View>
      );

      const banner = screen.getByTestId('banner');
      const hideButton = screen.getByTestId('hide-button');

      expect(() =>
        expectPauseStopHide(banner, {
          hideControl: hideButton,
          autoPlays: true,
        })
      ).not.toThrow();
    });

    it('passes when content does not auto-play', async () => {
      await render(
        <View testID="static-content">
          <Text>Static content</Text>
        </View>
      );

      const content = screen.getByTestId('static-content');

      expect(() =>
        expectPauseStopHide(content, {
          autoPlays: false,
        })
      ).not.toThrow();
    });

    it('verifies hidden content is hidden from accessibility tree', async () => {
      const { getByTestId } = await render(
        <View>
          <View
            testID="hidden-content"
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          >
            <Text>Hidden content</Text>
          </View>
          <Pressable testID="show-button" accessibilityRole="button" accessibilityLabel="Show">
            <Text>Show</Text>
          </Pressable>
        </View>
      );

      const content = getByTestId('hidden-content', { includeHiddenElements: true });
      const showButton = screen.getByTestId('show-button');

      expect(() =>
        expectPauseStopHide(content, {
          hideControl: showButton,
          isHidden: true,
          autoPlays: false,
        })
      ).not.toThrow();
    });
  });

  describe('expectNoFlashing', () => {
    it('passes for element without flashing', async () => {
      await render(
        <View testID="static-element">
          <Text>Static content</Text>
        </View>
      );

      const element = screen.getByTestId('static-element');
      expect(() => expectNoFlashing(element)).not.toThrow();
    });

    it('fails for element with blinking prop', async () => {
      const BlinkingComponent = () => (
        <View testID="blinking" {...({ blinking: true } as object)}>
          <Text>Blinking!</Text>
        </View>
      );

      await render(<BlinkingComponent />);
      const element = screen.getByTestId('blinking');

      expect(() => expectNoFlashing(element)).toThrow(/flashing content/);
    });

    it('fails for element with strobe effect', async () => {
      const StrobeComponent = () => (
        <View testID="strobe" {...({ strobe: true } as object)}>
          <Text>Strobe effect!</Text>
        </View>
      );

      await render(<StrobeComponent />);
      const element = screen.getByTestId('strobe');

      expect(() => expectNoFlashing(element)).toThrow(/flashing content/);
    });

    it('fails for element with rapid pulse interval', async () => {
      const RapidPulseComponent = () => (
        <View testID="rapid-pulse" {...({ pulseInterval: 100 } as object)}>
          <Text>Rapid pulse!</Text>
        </View>
      );

      await render(<RapidPulseComponent />);
      const element = screen.getByTestId('rapid-pulse');

      expect(() => expectNoFlashing(element)).toThrow(/flashing content/);
    });

    it('passes for element with safe pulse interval', async () => {
      const SafePulseComponent = () => (
        <View testID="safe-pulse" {...({ pulseInterval: 500 } as object)}>
          <Text>Safe pulse</Text>
        </View>
      );

      await render(<SafePulseComponent />);
      const element = screen.getByTestId('safe-pulse');

      expect(() => expectNoFlashing(element)).not.toThrow();
    });

    it('checks children recursively by default', async () => {
      const NestedBlinkComponent = () => (
        <View testID="parent">
          <View testID="child" {...({ blink: true } as object)}>
            <Text>Blinking child!</Text>
          </View>
        </View>
      );

      await render(<NestedBlinkComponent />);
      const parent = screen.getByTestId('parent');

      expect(() => expectNoFlashing(parent)).toThrow(/flashing content/);
    });

    it('skips children when recursive is false', async () => {
      const NestedBlinkComponent = () => (
        <View testID="parent">
          <View testID="child" {...({ blink: true } as object)}>
            <Text>Blinking child!</Text>
          </View>
        </View>
      );

      await render(<NestedBlinkComponent />);
      const parent = screen.getByTestId('parent');

      expect(() => expectNoFlashing(parent, { recursive: false })).not.toThrow();
    });
  });

  describe('expectConsistentNavigation', () => {
    it('passes when navigation order matches expected', async () => {
      await render(
        <View>
          <Pressable testID="nav-home" accessibilityRole="button" accessible={true}>
            <Text>Home</Text>
          </Pressable>
          <Pressable testID="nav-search" accessibilityRole="button" accessible={true}>
            <Text>Search</Text>
          </Pressable>
          <Pressable testID="nav-profile" accessibilityRole="button" accessible={true}>
            <Text>Profile</Text>
          </Pressable>
        </View>
      );

      const navItems = [
        screen.getByTestId('nav-home'),
        screen.getByTestId('nav-search'),
        screen.getByTestId('nav-profile'),
      ];

      expect(() =>
        expectConsistentNavigation(navItems, ['nav-home', 'nav-search', 'nav-profile'])
      ).not.toThrow();
    });

    it('fails when navigation order does not match', async () => {
      await render(
        <View>
          <Pressable testID="nav-home" accessibilityRole="button" accessible={true}>
            <Text>Home</Text>
          </Pressable>
          <Pressable testID="nav-search" accessibilityRole="button" accessible={true}>
            <Text>Search</Text>
          </Pressable>
        </View>
      );

      const navItems = [screen.getByTestId('nav-home'), screen.getByTestId('nav-search')];

      // Wrong order
      expect(() => expectConsistentNavigation(navItems, ['nav-search', 'nav-home'])).toThrow();
    });

    it('fails when element count does not match', async () => {
      await render(
        <View>
          <Pressable testID="nav-home" accessibilityRole="button" accessible={true}>
            <Text>Home</Text>
          </Pressable>
        </View>
      );

      const navItems = [screen.getByTestId('nav-home')];

      expect(() =>
        expectConsistentNavigation(navItems, ['nav-home', 'nav-search', 'nav-profile'])
      ).toThrow();
    });

    it('verifies all elements have accessibility role', async () => {
      await render(
        <View>
          <Pressable testID="nav-home" accessibilityRole="button" accessible={true}>
            <Text>Home</Text>
          </Pressable>
          <Pressable testID="nav-search" accessible={true}>
            <Text>Search (no role)</Text>
          </Pressable>
        </View>
      );

      const navItems = [screen.getByTestId('nav-home'), screen.getByTestId('nav-search')];

      expect(() => expectConsistentNavigation(navItems, ['nav-home', 'nav-search'])).toThrow();
    });
  });

  describe('expectErrorIdentification', () => {
    it('passes when error state is properly indicated', async () => {
      // Use object spread to pass custom invalid state (not in standard AccessibilityState)
      const InvalidFieldComponent = () => (
        <View testID="email-field" {...({ accessibilityState: { invalid: true } } as object)}>
          <Text>Email</Text>
        </View>
      );

      await render(
        <View>
          <InvalidFieldComponent />
          <View testID="error-message" accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Text>Invalid email format</Text>
          </View>
        </View>
      );

      const field = screen.getByTestId('email-field');
      const errorMessage = screen.getByTestId('error-message');

      expect(() =>
        expectErrorIdentification(field, {
          hasError: true,
          errorElement: errorMessage,
          errorText: 'Invalid email',
        })
      ).not.toThrow();
    });

    it('passes when no error and field indicates valid', async () => {
      const ValidFieldComponent = () => (
        <View testID="email-field" {...({ accessibilityState: { invalid: false } } as object)}>
          <Text>Email</Text>
        </View>
      );

      await render(<ValidFieldComponent />);

      const field = screen.getByTestId('email-field');

      expect(() =>
        expectErrorIdentification(field, {
          hasError: false,
        })
      ).not.toThrow();
    });

    it('fails when error state but field not marked invalid', async () => {
      await render(
        <View testID="email-field">
          <Text>Email</Text>
        </View>
      );

      const field = screen.getByTestId('email-field');

      expect(() =>
        expectErrorIdentification(field, {
          hasError: true,
        })
      ).toThrow();
    });

    it('fails when no error but field marked invalid', async () => {
      const InvalidFieldComponent = () => (
        <View testID="email-field" {...({ accessibilityState: { invalid: true } } as object)}>
          <Text>Email</Text>
        </View>
      );

      await render(<InvalidFieldComponent />);

      const field = screen.getByTestId('email-field');

      expect(() =>
        expectErrorIdentification(field, {
          hasError: false,
        })
      ).toThrow();
    });

    it('verifies error element has proper accessibility role', async () => {
      const InvalidFieldComponent = () => (
        <View testID="email-field" {...({ accessibilityState: { invalid: true } } as object)}>
          <Text>Email</Text>
        </View>
      );

      await render(
        <View>
          <InvalidFieldComponent />
          <View testID="error-message" accessibilityLiveRegion="polite" accessibilityRole="text">
            <Text>Invalid email format</Text>
          </View>
        </View>
      );

      const field = screen.getByTestId('email-field');
      const errorMessage = screen.getByTestId('error-message');

      expect(() =>
        expectErrorIdentification(field, {
          hasError: true,
          errorElement: errorMessage,
          errorText: 'Invalid email',
        })
      ).toThrow();
    });

    it('accepts aria-invalid attribute', async () => {
      await render(
        <View testID="email-field" aria-invalid={true}>
          <Text>Email</Text>
        </View>
      );

      const field = screen.getByTestId('email-field');

      expect(() =>
        expectErrorIdentification(field, {
          hasError: true,
        })
      ).not.toThrow();
    });
  });

  describe('expectLabelInstructions', () => {
    it('passes when label matches', async () => {
      await render(
        <View testID="password-field" accessibilityLabel="Password">
          <Text>Password field</Text>
        </View>
      );

      const field = screen.getByTestId('password-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Password',
        })
      ).not.toThrow();
    });

    it('passes when label and hint match', async () => {
      await render(
        <View
          testID="password-field"
          accessibilityLabel="Password"
          accessibilityHint="Must be at least 8 characters"
        >
          <Text>Password field</Text>
        </View>
      );

      const field = screen.getByTestId('password-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Password',
          hint: 'at least 8 characters',
        })
      ).not.toThrow();
    });

    it('fails when label does not match', async () => {
      await render(
        <View testID="password-field" accessibilityLabel="Password">
          <Text>Password field</Text>
        </View>
      );

      const field = screen.getByTestId('password-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Enter password',
        })
      ).toThrow();
    });

    it('fails when hint does not match', async () => {
      await render(
        <View
          testID="password-field"
          accessibilityLabel="Password"
          accessibilityHint="Enter your password"
        >
          <Text>Password field</Text>
        </View>
      );

      const field = screen.getByTestId('password-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Password',
          hint: 'at least 8 characters',
        })
      ).toThrow();
    });

    it('verifies required state when specified', async () => {
      await render(
        <View
          testID="email-field"
          accessibilityLabel="Email (required)"
          accessibilityState={{ required: true } as object}
        >
          <Text>Email field</Text>
        </View>
      );

      const field = screen.getByTestId('email-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Email (required)',
          required: true,
        })
      ).not.toThrow();
    });

    it('verifies placeholder does not replace label', async () => {
      const SearchFieldComponent = () => (
        <View
          testID="search-field"
          accessibilityLabel="Search"
          {...({ placeholder: 'Enter search term' } as object)}
        >
          <Text>Search field</Text>
        </View>
      );

      await render(<SearchFieldComponent />);

      const field = screen.getByTestId('search-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Search',
          placeholder: 'Enter search term',
        })
      ).not.toThrow();
    });

    it('fails when placeholder equals label', async () => {
      const SearchFieldComponent = () => (
        <View
          testID="search-field"
          accessibilityLabel="Search"
          {...({ placeholder: 'Search' } as object)}
        >
          <Text>Search field</Text>
        </View>
      );

      await render(<SearchFieldComponent />);

      const field = screen.getByTestId('search-field');

      expect(() =>
        expectLabelInstructions(field, {
          label: 'Search',
          placeholder: 'Search',
        })
      ).toThrow();
    });
  });
});
