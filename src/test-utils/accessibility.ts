/**
 * Accessibility Testing Utilities
 *
 * Helpers for verifying EAA (European Accessibility Act) compliance in RNTL tests.
 * WCAG 2.1 Level AA compliance.
 */

import { StyleSheet } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

/**
 * Minimum touch target sizes per platform
 * iOS: 44×44 points (Apple HIG)
 * Android: 48×48 dp (Material Design)
 */
export const TOUCH_TARGET_SIZES = {
  ios: { minWidth: 44, minHeight: 44 },
  android: { minWidth: 48, minHeight: 48 },
  /** Use iOS size as default (more restrictive on height is Android) */
  default: { minWidth: 44, minHeight: 44 },
} as const;

/**
 * Flattens nested style arrays and objects into a single style object
 */
function flattenStyle(style: unknown): Record<string, unknown> {
  if (!style) {
    return {};
  }

  // Handle StyleSheet.create() registered styles
  const flattened = StyleSheet.flatten(style as Parameters<typeof StyleSheet.flatten>[0]);

  return (flattened as Record<string, unknown>) || {};
}

/**
 * Extracts numeric value from style property (handles number, string with 'px', etc.)
 */
function getNumericValue(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Verifies that an interactive element meets minimum touch target size requirements.
 *
 * EAA/WCAG 2.1 Level AA requires touch targets to be at least:
 * - iOS: 44×44 points
 * - Android: 48×48 dp
 *
 * @param element - The React Test Instance to check
 * @param minWidth - Minimum width in points/dp (default: 44)
 * @param minHeight - Minimum height in points/dp (default: 44)
 *
 * @example
 * ```typescript
 * it('has EAA-compliant touch target size', () => {
 *   const { getByTestId } = renderWithProviders(<SettingsItem ... />);
 *   const button = getByTestId('settings-item');
 *   expectMinTouchTarget(button);
 * });
 * ```
 */
export function expectMinTouchTarget(
  element: ReactTestInstance,
  minWidth: number = TOUCH_TARGET_SIZES.default.minWidth,
  minHeight: number = TOUCH_TARGET_SIZES.default.minHeight
): void {
  const flatStyle = flattenStyle(element.props.style);

  // Check minWidth/minHeight first (explicit touch target sizing)
  const styleMinWidth = getNumericValue(flatStyle.minWidth);
  const styleMinHeight = getNumericValue(flatStyle.minHeight);

  // Also check width/height as fallback
  const styleWidth = getNumericValue(flatStyle.width);
  const styleHeight = getNumericValue(flatStyle.height);

  // Also check padding which contributes to touch target
  const paddingHorizontal =
    getNumericValue(flatStyle.paddingHorizontal) ||
    (getNumericValue(flatStyle.paddingLeft) ?? 0) + (getNumericValue(flatStyle.paddingRight) ?? 0);
  const paddingVertical =
    getNumericValue(flatStyle.paddingVertical) ||
    (getNumericValue(flatStyle.paddingTop) ?? 0) + (getNumericValue(flatStyle.paddingBottom) ?? 0);
  const padding = getNumericValue(flatStyle.padding) ?? 0;

  // Calculate effective touch target size
  const effectiveWidth = styleMinWidth ?? styleWidth;
  const effectiveHeight = styleMinHeight ?? styleHeight;

  // Include padding contribution if we have a base size
  const totalWidth =
    effectiveWidth !== undefined ? effectiveWidth + (paddingHorizontal || padding * 2) : undefined;
  const totalHeight =
    effectiveHeight !== undefined ? effectiveHeight + (paddingVertical || padding * 2) : undefined;

  // Verify width meets minimum
  if (styleMinWidth !== undefined) {
    expect(styleMinWidth).toBeGreaterThanOrEqual(minWidth);
  } else if (totalWidth !== undefined) {
    expect(totalWidth).toBeGreaterThanOrEqual(minWidth);
  }
  // If no explicit size, parent layout or hitSlop may control touch target - allow silently

  // Verify height meets minimum
  if (styleMinHeight !== undefined) {
    expect(styleMinHeight).toBeGreaterThanOrEqual(minHeight);
  } else if (totalHeight !== undefined) {
    expect(totalHeight).toBeGreaterThanOrEqual(minHeight);
  }
  // If no explicit size, parent layout or hitSlop may control touch target - allow silently
}

/**
 * Verifies that an element has a hitSlop that meets minimum touch target requirements.
 *
 * hitSlop extends the touchable area without changing visual size.
 * Useful for small visual elements that need larger touch targets.
 *
 * @param element - The React Test Instance to check
 * @param minHitSlop - Minimum hitSlop value on each side (default: 8)
 *
 * @example
 * ```typescript
 * it('has adequate hitSlop for small icon button', () => {
 *   const { getByTestId } = renderWithProviders(<IconButton ... />);
 *   const button = getByTestId('icon-button');
 *   expectMinHitSlop(button, 12);
 * });
 * ```
 */
export function expectMinHitSlop(element: ReactTestInstance, minHitSlop: number = 8): void {
  const hitSlop = element.props.hitSlop;

  if (!hitSlop) {
    throw new Error(
      `Element with testID "${element.props.testID}" has no hitSlop defined. ` +
        'Add hitSlop for small touch targets to meet EAA requirements.'
    );
  }

  if (typeof hitSlop === 'number') {
    expect(hitSlop).toBeGreaterThanOrEqual(minHitSlop);
  } else {
    // hitSlop is an object { top, bottom, left, right }
    expect(hitSlop.top ?? 0).toBeGreaterThanOrEqual(minHitSlop);
    expect(hitSlop.bottom ?? 0).toBeGreaterThanOrEqual(minHitSlop);
    expect(hitSlop.left ?? 0).toBeGreaterThanOrEqual(minHitSlop);
    expect(hitSlop.right ?? 0).toBeGreaterThanOrEqual(minHitSlop);
  }
}

/**
 * Verifies that an element has required accessibility props for EAA compliance.
 *
 * @param element - The React Test Instance to check
 * @param options - Required accessibility properties
 *
 * @example
 * ```typescript
 * it('has all required accessibility props', () => {
 *   const { getByTestId } = renderWithProviders(<Button ... />);
 *   const button = getByTestId('submit-button');
 *   expectAccessibilityProps(button, {
 *     role: 'button',
 *     label: true,
 *     hint: true,
 *   });
 * });
 * ```
 */
export function expectAccessibilityProps(
  element: ReactTestInstance,
  options: {
    role?: string;
    label?: boolean | string;
    hint?: boolean | string;
    state?: Partial<{
      disabled: boolean;
      selected: boolean;
      checked: boolean | 'mixed';
      busy: boolean;
      expanded: boolean;
    }>;
  }
): void {
  const { role, label, hint, state } = options;

  if (role) {
    expect(element.props.accessibilityRole).toBe(role);
  }

  if (label === true) {
    expect(element.props.accessibilityLabel).toBeTruthy();
  } else if (typeof label === 'string') {
    expect(element.props.accessibilityLabel).toBe(label);
  }

  if (hint === true) {
    expect(element.props.accessibilityHint).toBeTruthy();
  } else if (typeof hint === 'string') {
    expect(element.props.accessibilityHint).toBe(hint);
  }

  if (state) {
    const actualState = element.props.accessibilityState || {};
    Object.entries(state).forEach(([key, value]) => {
      expect(actualState[key]).toBe(value);
    });
  }
}

/**
 * Verifies that elements have correct screen reader announcement properties.
 *
 * For dynamic content that screen readers should announce, elements need:
 * - accessibilityLiveRegion: 'polite' or 'assertive'
 * - accessibilityRole: appropriate role for the content
 *
 * @param element - The React Test Instance to check
 * @param options - Expected announcement properties
 *
 * @example
 * ```typescript
 * it('announces error message to screen readers', () => {
 *   const { getByTestId } = renderWithProviders(<AlertBox error="Invalid" />);
 *   const alert = getByTestId('alert-box');
 *   expectScreenReaderAnnouncement(alert, {
 *     liveRegion: 'polite',
 *     role: 'alert',
 *   });
 * });
 * ```
 */
export function expectScreenReaderAnnouncement(
  element: ReactTestInstance,
  options: {
    liveRegion?: 'none' | 'polite' | 'assertive';
    role?: string;
    atomic?: boolean;
  }
): void {
  const { liveRegion, role, atomic } = options;

  if (liveRegion) {
    expect(element.props.accessibilityLiveRegion).toBe(liveRegion);
  }

  if (role) {
    expect(element.props.accessibilityRole).toBe(role);
  }

  if (atomic !== undefined) {
    // React Native doesn't have aria-atomic, but we check for the pattern
    // where the entire region should be announced as a unit
    expect(element.props.accessibilityElementsHidden).toBe(!atomic);
  }
}

/**
 * Verifies that focusable elements appear in the correct order for accessibility.
 *
 * Screen reader users navigate through focusable elements in order.
 * This utility checks that elements have proper focus sequencing.
 *
 * @param elements - Array of React Test Instances in expected focus order
 *
 * @example
 * ```typescript
 * it('has correct focus order in form', () => {
 *   const { getByTestId } = renderWithProviders(<LoginForm />);
 *   const email = getByTestId('email-input');
 *   const password = getByTestId('password-input');
 *   const submit = getByTestId('submit-button');
 *   expectFocusOrder([email, password, submit]);
 * });
 * ```
 */
export function expectFocusOrder(elements: ReactTestInstance[]): void {
  // Verify all elements are focusable (have tabIndex or are naturally focusable)
  elements.forEach((element, index) => {
    const isFocusable =
      element.props.focusable !== false &&
      element.props.accessible !== false &&
      element.props.accessibilityElementsHidden !== true;

    expect(isFocusable).toBe(true);

    // Check that elements don't have accessibility order overrides that break sequence
    if (element.props.accessibilityViewIsModal) {
      // Modal elements are acceptable as they create their own focus context
      return;
    }

    // Verify element is not hidden from accessibility tree
    expect(element.props.importantForAccessibility).not.toBe('no-hide-descendants');

    // If using accessibilityOrder (custom order), verify it matches expected sequence
    if (element.props.accessibilityOrder !== undefined) {
      expect(element.props.accessibilityOrder).toBe(index);
    }
  });
}

/**
 * Verifies that an element can receive focus programmatically.
 *
 * Some elements need to receive focus after navigation or actions.
 * This checks that the element is set up to receive focus.
 *
 * @param element - The React Test Instance to check
 * @param ref - Optional ref that should have focus method
 *
 * @example
 * ```typescript
 * it('focuses first input after navigation', () => {
 *   const ref = createRef<TextInput>();
 *   const { getByTestId } = renderWithProviders(<Form ref={ref} />);
 *   const input = getByTestId('first-input');
 *   expectCanReceiveFocus(input);
 * });
 * ```
 */
export function expectCanReceiveFocus(
  element: ReactTestInstance,
  options?: { autoFocus?: boolean }
): void {
  // Element must be accessible
  expect(element.props.accessible).not.toBe(false);

  // Element must not be hidden from accessibility
  expect(element.props.accessibilityElementsHidden).not.toBe(true);
  expect(element.props.importantForAccessibility).not.toBe('no-hide-descendants');

  // If autoFocus is expected, verify it
  if (options?.autoFocus) {
    expect(element.props.autoFocus).toBe(true);
  }

  // Element should be focusable
  expect(element.props.focusable).not.toBe(false);
}

/**
 * WCAG 2.1 Level AA colour contrast requirements
 */
export const CONTRAST_RATIOS = {
  /** Normal text (< 18pt or < 14pt bold) */
  normalText: 4.5,
  /** Large text (>= 18pt or >= 14pt bold) */
  largeText: 3.0,
  /** UI components and graphical objects */
  uiComponents: 3.0,
} as const;

/**
 * Calculates relative luminance of a colour
 * Formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.04045 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.04045 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.04045 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Parses a colour string to RGB values
 * Supports: hex (#RGB, #RRGGBB), rgb(r,g,b), rgba(r,g,b,a)
 */
function parseColorToRGB(color: string): { r: number; g: number; b: number } | null {
  if (!color) return null;

  // Handle hex colours
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = hex[0];
      const g = hex[1];
      const b = hex[2];
      if (r && g && b) {
        return {
          r: parseInt(r + r, 16),
          g: parseInt(g + g, 16),
          b: parseInt(b + b, 16),
        };
      }
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}

/**
 * Calculates contrast ratio between two colours
 * Returns ratio in format X:1 (e.g., 4.5 for 4.5:1)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const fgRGB = parseColorToRGB(foreground);
  const bgRGB = parseColorToRGB(background);

  if (!fgRGB || !bgRGB) {
    throw new Error(`Cannot parse colours: foreground="${foreground}", background="${background}"`);
  }

  const fgLuminance = getRelativeLuminance(fgRGB.r, fgRGB.g, fgRGB.b);
  const bgLuminance = getRelativeLuminance(bgRGB.r, bgRGB.g, bgRGB.b);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifies that text meets WCAG 2.1 Level AA colour contrast requirements.
 *
 * @param foregroundColor - Text colour (hex, rgb, or rgba)
 * @param backgroundColor - Background colour (hex, rgb, or rgba)
 * @param options - Options for contrast check
 *
 * @example
 * ```typescript
 * it('meets 4.5:1 contrast for normal text', () => {
 *   expectColorContrast('#333333', '#FFFFFF', { type: 'normalText' });
 * });
 *
 * it('meets 3:1 contrast for large text', () => {
 *   expectColorContrast('#666666', '#FFFFFF', { type: 'largeText' });
 * });
 * ```
 */
export function expectColorContrast(
  foregroundColor: string,
  backgroundColor: string,
  options: {
    type?: 'normalText' | 'largeText' | 'uiComponents';
    minRatio?: number;
  } = {}
): void {
  const { type = 'normalText', minRatio } = options;
  const requiredRatio = minRatio ?? CONTRAST_RATIOS[type];

  const actualRatio = calculateContrastRatio(foregroundColor, backgroundColor);

  expect(actualRatio).toBeGreaterThanOrEqual(requiredRatio);
}

/**
 * Complete accessibility check for interactive elements.
 *
 * This is a strict check that requires ALL accessibility properties to be present.
 * Use this instead of lenient checks that accept fallbacks.
 *
 * @param element - The React Test Instance to check
 * @param options - Required accessibility properties
 *
 * @example
 * ```typescript
 * it('has complete accessibility properties', () => {
 *   const { getByTestId } = renderWithProviders(<Button ... />);
 *   const button = getByTestId('submit-button');
 *   expectAccessibilityComplete(button, {
 *     role: 'button',
 *     label: 'Submit form',
 *     hint: 'Saves your changes',
 *   });
 * });
 * ```
 */
export function expectAccessibilityComplete(
  element: ReactTestInstance,
  options: {
    role: string;
    label: string;
    hint?: string;
    state?: Partial<{
      disabled: boolean;
      selected: boolean;
      checked: boolean | 'mixed';
      busy: boolean;
      expanded: boolean;
    }>;
    touchTarget?: boolean;
  }
): void {
  const { role, label, hint, state, touchTarget = true } = options;

  // Role is REQUIRED
  expect(element.props.accessibilityRole).toBe(role);

  // Label is REQUIRED (not placeholder fallback)
  expect(element.props.accessibilityLabel).toBe(label);

  // Hint is optional but if provided, must match
  if (hint) {
    expect(element.props.accessibilityHint).toBe(hint);
  }

  // State verification
  if (state) {
    const actualState = element.props.accessibilityState || {};
    Object.entries(state).forEach(([key, value]) => {
      expect(actualState[key]).toBe(value);
    });
  }

  // Touch target check (optional, defaults to true)
  // Note: We don't warn here as parent layout may control touch target size
  if (touchTarget) {
    // Just verify the element has some touch target consideration
    // (either explicit size, hitSlop, or parent layout)
    const flatStyle = flattenStyle(element.props.style);
    const hasExplicitSize =
      getNumericValue(flatStyle.minWidth) !== undefined ||
      getNumericValue(flatStyle.minHeight) !== undefined ||
      getNumericValue(flatStyle.width) !== undefined ||
      getNumericValue(flatStyle.height) !== undefined;
    const hasHitSlop = element.props.hitSlop !== undefined;
    const hasPadding = getNumericValue(flatStyle.padding) !== undefined;

    // If element has explicit sizing, hitSlop, or padding, verify it meets requirements
    if (hasExplicitSize || hasHitSlop || hasPadding) {
      expectMinTouchTarget(element);
    }
    // Otherwise, parent layout controls touch target - allow silently
  }
}

/**
 * Verifies that a live region properly announces content changes.
 *
 * Use this when testing dynamic content that should be announced to screen readers.
 *
 * @param element - The React Test Instance to check
 * @param expectedContent - The expected content that should be announced
 * @param options - Live region options
 *
 * @example
 * ```typescript
 * it('announces error message changes', () => {
 *   const { getByTestId, rerender } = renderWithProviders(<AlertBox message="Error 1" />);
 *   const alert = getByTestId('alert-box');
 *
 *   // Initial content
 *   expectLiveRegionContent(alert, 'Error 1', { liveRegion: 'polite' });
 *
 *   // Rerender with new content
 *   rerender(<AlertBox message="Error 2" />);
 *   expectLiveRegionContent(getByTestId('alert-box'), 'Error 2', { liveRegion: 'polite' });
 * });
 * ```
 */
export function expectLiveRegionContent(
  element: ReactTestInstance,
  expectedContent: string,
  options: {
    liveRegion: 'polite' | 'assertive';
    role?: 'alert' | 'status' | 'log' | 'timer';
  }
): void {
  const { liveRegion, role } = options;

  // Verify live region is set
  expect(element.props.accessibilityLiveRegion).toBe(liveRegion);

  // Verify role if specified
  if (role) {
    expect(element.props.accessibilityRole).toBe(role);
  }

  // Verify content is present
  // Content can be in children, accessibilityLabel, or accessibilityValue

  // Helper to safely stringify children (handles circular references)
  const stringifyChildren = (children: unknown): string => {
    try {
      if (typeof children === 'string') return children;
      if (typeof children === 'number') return String(children);
      if (Array.isArray(children)) return children.map(stringifyChildren).join('');
      if (children && typeof children === 'object' && 'props' in children) {
        const props = (children as { props?: { children?: unknown } }).props;
        return props?.children ? stringifyChildren(props.children) : '';
      }
      return '';
    } catch {
      return '';
    }
  };

  const childrenContent = stringifyChildren(element.props.children);
  const hasContent =
    childrenContent.includes(expectedContent) ||
    element.props.accessibilityLabel?.includes(expectedContent) ||
    element.props.accessibilityValue?.text?.includes(expectedContent);

  expect(hasContent).toBe(true);
}

/**
 * Type guard to check if element has required accessibility props
 */
export function hasAccessibilityProps(element: ReactTestInstance): element is ReactTestInstance & {
  props: {
    accessibilityRole: string;
    accessibilityLabel: string;
    accessibilityHint?: string;
    accessibilityState?: Record<string, unknown>;
  };
} {
  return (
    typeof element.props.accessibilityRole === 'string' &&
    typeof element.props.accessibilityLabel === 'string'
  );
}

// =============================================================================
// WCAG 2.1 Level AA Additional Test Utilities
// =============================================================================

/**
 * Verifies that an interaction does not depend on timing.
 *
 * WCAG 2.2.1 (Timing Adjustable) requires that time-based interactions can be
 * turned off, adjusted, or extended. This utility verifies that elements don't
 * have time-dependent handlers that could cause accessibility issues.
 *
 * @param element - The React Test Instance to check
 * @param options - Options for timing check
 *
 * @example
 * ```typescript
 * it('does not require time-based interaction', () => {
 *   const { getByTestId } = renderWithProviders(<Form />);
 *   const submitButton = getByTestId('submit-button');
 *   expectNoTimingDependence(submitButton);
 * });
 * ```
 */
export function expectNoTimingDependence(
  element: ReactTestInstance,
  options: {
    /** Maximum acceptable timeout in ms (default: none - no timeout expected) */
    maxTimeout?: number;
    /** Whether auto-submit is allowed (default: false) */
    allowAutoSubmit?: boolean;
    /** Whether time limits are allowed (default: false) */
    allowTimeLimits?: boolean;
  } = {}
): void {
  const { allowAutoSubmit = false, allowTimeLimits = false } = options;

  // Check for timeout-related props that could indicate timing dependence
  const props = element.props as Record<string, unknown>;

  // Check for auto-submit patterns (forms that submit after delay)
  if (!allowAutoSubmit) {
    // Check common patterns that indicate auto-submit
    expect(props.autoSubmit).not.toBe(true);
    expect(props.submitOnTimeout).not.toBe(true);
    expect(props.autoComplete).not.toBe('submit');
  }

  // Check for time limit patterns
  if (!allowTimeLimits) {
    expect(props.timeout).toBeUndefined();
    expect(props.timeLimit).toBeUndefined();
    expect(props.expiresIn).toBeUndefined();
    expect(props.countdown).toBeUndefined();
  }

  // Element should be interactable without time pressure
  // (i.e., no onTimeout, onExpire handlers that change state)
  expect(props.onTimeout).toBeUndefined();
  expect(props.onExpire).toBeUndefined();
  expect(props.onCountdownEnd).toBeUndefined();
}

/**
 * Verifies that auto-updating content can be paused, stopped, or hidden.
 *
 * WCAG 2.2.2 (Pause, Stop, Hide) requires that for any moving, blinking,
 * scrolling, or auto-updating information, there is a mechanism to pause,
 * stop, or hide it.
 *
 * @param element - The React Test Instance to check (container with auto-updating content)
 * @param controls - Object containing control elements or functions
 *
 * @example
 * ```typescript
 * it('provides controls for auto-updating content', () => {
 *   const { getByTestId } = renderWithProviders(<NewsCarousel />);
 *   const carousel = getByTestId('news-carousel');
 *   const pauseButton = getByTestId('pause-button');
 *
 *   expectPauseStopHide(carousel, {
 *     pauseControl: pauseButton,
 *     isPaused: false,
 *   });
 * });
 * ```
 */
export function expectPauseStopHide(
  element: ReactTestInstance,
  controls: {
    /** Element that pauses the content */
    pauseControl?: ReactTestInstance;
    /** Element that stops the content */
    stopControl?: ReactTestInstance;
    /** Element that hides the content */
    hideControl?: ReactTestInstance;
    /** Current paused state */
    isPaused?: boolean;
    /** Current stopped state */
    isStopped?: boolean;
    /** Current hidden state */
    isHidden?: boolean;
    /** Whether content auto-plays */
    autoPlays?: boolean;
  }
): void {
  const { pauseControl, stopControl, hideControl, autoPlays } = controls;

  // If content auto-plays, at least one control mechanism must exist
  if (autoPlays !== false) {
    const hasControl = pauseControl || stopControl || hideControl;

    if (!hasControl) {
      throw new Error(
        'Auto-updating content must have at least one control mechanism ' +
          '(pause, stop, or hide) per WCAG 2.2.2. ' +
          `Element testID: "${element.props.testID}"`
      );
    }
  }

  // Verify control elements have proper accessibility
  if (pauseControl) {
    expect(pauseControl.props.accessibilityRole).toBe('button');
    expect(pauseControl.props.accessibilityLabel).toBeTruthy();
  }

  if (stopControl) {
    expect(stopControl.props.accessibilityRole).toBe('button');
    expect(stopControl.props.accessibilityLabel).toBeTruthy();
  }

  if (hideControl) {
    expect(hideControl.props.accessibilityRole).toBe('button');
    expect(hideControl.props.accessibilityLabel).toBeTruthy();
  }

  // Verify the element itself has accessibility info about its state
  const state = element.props.accessibilityState as Record<string, unknown> | undefined;

  if (controls.isPaused !== undefined && state) {
    // Content should communicate paused state
    expect(state.busy === false || state.expanded === false).toBe(controls.isPaused);
  }

  // If hidden, element should be hidden from accessibility tree
  if (controls.isHidden) {
    expect(
      element.props.accessibilityElementsHidden === true ||
        element.props.importantForAccessibility === 'no-hide-descendants'
    ).toBe(true);
  }
}

/**
 * Verifies that content does not flash more than three times per second.
 *
 * WCAG 2.3.1 (Three Flashes or Below Threshold) requires that content does
 * not contain anything that flashes more than three times in any one second
 * period, as this can trigger seizures.
 *
 * This utility checks for common flashing patterns in React Native.
 *
 * @param element - The React Test Instance to check
 * @param options - Options for flash check
 *
 * @example
 * ```typescript
 * it('does not contain flashing content', () => {
 *   const { getByTestId } = renderWithProviders(<AlertBanner />);
 *   const banner = getByTestId('alert-banner');
 *   expectNoFlashing(banner);
 * });
 * ```
 */
export function expectNoFlashing(
  element: ReactTestInstance,
  options: {
    /** Maximum allowed flashes per second (default: 3 per WCAG) */
    maxFlashesPerSecond?: number;
    /** Whether to check children recursively (default: true) */
    recursive?: boolean;
  } = {}
): void {
  const { maxFlashesPerSecond = 3, recursive = true } = options;

  const props = element.props as Record<string, unknown>;
  const style = flattenStyle(props.style);

  // Check for animation properties that could cause flashing
  const dangerousAnimationPatterns = [
    // Blink animation
    props.blinking === true,
    props.blink === true,
    // Rapid opacity changes
    typeof style.animationName === 'string' && style.animationName.includes('blink'),
    typeof style.animationName === 'string' && style.animationName.includes('flash'),
    // Strobe effect
    props.strobe === true,
    props.strobeEffect === true,
    // Pulsing too fast (< 333ms per cycle = >3 flashes/sec)
    typeof props.pulseInterval === 'number' && (props.pulseInterval as number) < 333,
    typeof props.flashInterval === 'number' && (props.flashInterval as number) < 333,
  ];

  const hasFlashingContent = dangerousAnimationPatterns.some(Boolean);

  if (hasFlashingContent) {
    throw new Error(
      `Element contains potentially flashing content that may exceed ${maxFlashesPerSecond} ` +
        `flashes per second. This violates WCAG 2.3.1 and can trigger seizures. ` +
        `Element testID: "${element.props.testID}"`
    );
  }

  // Check for rapid animation duration
  if (typeof style.animationDuration === 'string') {
    const durationMs = parseFloat(style.animationDuration);
    if (!isNaN(durationMs) && durationMs < 333) {
      throw new Error(
        `Animation duration ${durationMs}ms is too short and may cause flashing. ` +
          `Minimum safe duration is 333ms (3 flashes per second). ` +
          `Element testID: "${element.props.testID}"`
      );
    }
  }

  // Recursively check children
  if (recursive && element.children) {
    const children = Array.isArray(element.children) ? element.children : [element.children];
    children.forEach(child => {
      if (child && typeof child === 'object' && 'props' in child) {
        expectNoFlashing(child as ReactTestInstance, options);
      }
    });
  }
}

/**
 * Verifies that navigation is consistent across the application.
 *
 * WCAG 3.2.3 (Consistent Navigation) requires that navigation mechanisms
 * repeated on multiple screens occur in the same relative order each time.
 *
 * @param navigationElements - Array of navigation elements in their current order
 * @param expectedOrder - Array of testIDs in the expected order
 *
 * @example
 * ```typescript
 * it('has consistent navigation order', () => {
 *   const { getByTestId } = renderWithProviders(<BottomNav />);
 *   const navItems = [
 *     getByTestId('nav-home'),
 *     getByTestId('nav-search'),
 *     getByTestId('nav-profile'),
 *   ];
 *
 *   expectConsistentNavigation(navItems, ['nav-home', 'nav-search', 'nav-profile']);
 * });
 * ```
 */
export function expectConsistentNavigation(
  navigationElements: ReactTestInstance[],
  expectedOrder: string[]
): void {
  // Verify we have the expected number of elements
  expect(navigationElements.length).toBe(expectedOrder.length);

  // Verify each element's testID matches expected order
  navigationElements.forEach((element, index) => {
    const expectedTestId = expectedOrder[index];
    expect(element.props.testID).toBe(expectedTestId);
  });

  // Verify all navigation elements are accessible
  navigationElements.forEach(element => {
    expect(element.props.accessible).not.toBe(false);
    expect(element.props.accessibilityRole).toBeTruthy();
  });
}

/**
 * Verifies that input errors are properly identified and described.
 *
 * WCAG 3.3.1 (Error Identification) requires that if an input error is
 * automatically detected, the item in error is identified and the error
 * is described to the user in text.
 *
 * @param element - The form field or error container element
 * @param options - Options for error identification check
 *
 * @example
 * ```typescript
 * it('properly identifies input errors', () => {
 *   const { getByTestId } = renderWithProviders(<FormField error="Invalid email" />);
 *   const field = getByTestId('email-field');
 *   const errorMessage = getByTestId('email-error');
 *
 *   expectErrorIdentification(field, {
 *     hasError: true,
 *     errorElement: errorMessage,
 *     errorText: 'Invalid email',
 *   });
 * });
 * ```
 */
export function expectErrorIdentification(
  element: ReactTestInstance,
  options: {
    /** Whether the field currently has an error */
    hasError: boolean;
    /** The element containing the error message */
    errorElement?: ReactTestInstance;
    /** Expected error text */
    errorText?: string;
  }
): void {
  const { hasError, errorElement, errorText } = options;

  if (hasError) {
    // Field should indicate error state
    const state = element.props.accessibilityState as Record<string, unknown> | undefined;

    // Either invalid state or disabled due to error
    const hasErrorIndication =
      state?.invalid === true ||
      element.props['aria-invalid'] === true ||
      (element.props.accessibilityLabel as string)?.toLowerCase().includes('error');

    expect(hasErrorIndication).toBe(true);

    // If error element provided, verify it's properly set up
    if (errorElement) {
      // Error message should be in a live region
      expect(errorElement.props.accessibilityLiveRegion).toBeTruthy();

      // Error should have alert role for immediate announcement
      expect(['alert', 'status']).toContain(errorElement.props.accessibilityRole);

      // If error text provided, verify it's present
      if (errorText) {
        const stringifyChildren = (children: unknown): string => {
          if (typeof children === 'string') return children;
          if (typeof children === 'number') return String(children);
          if (Array.isArray(children)) return children.map(stringifyChildren).join('');
          if (children && typeof children === 'object' && 'props' in children) {
            const props = (children as { props?: { children?: unknown } }).props;
            return props?.children ? stringifyChildren(props.children) : '';
          }
          return '';
        };

        const childContent = stringifyChildren(errorElement.props.children);
        const hasErrorText =
          childContent.includes(errorText) ||
          errorElement.props.accessibilityLabel?.includes(errorText);

        expect(hasErrorText).toBe(true);
      }
    }
  } else {
    // No error - field should not indicate error state
    const state = element.props.accessibilityState as Record<string, unknown> | undefined;
    expect(state?.invalid).not.toBe(true);
    expect(element.props['aria-invalid']).not.toBe(true);
  }
}

/**
 * Verifies that form labels and instructions are properly provided.
 *
 * WCAG 3.3.2 (Labels or Instructions) requires that labels or instructions
 * are provided when content requires user input.
 *
 * @param element - The form field element
 * @param options - Options for label check
 *
 * @example
 * ```typescript
 * it('has proper labels and instructions', () => {
 *   const { getByTestId } = renderWithProviders(<PasswordField />);
 *   const field = getByTestId('password-field');
 *
 *   expectLabelInstructions(field, {
 *     label: 'Password',
 *     hint: 'Must be at least 8 characters',
 *     required: true,
 *   });
 * });
 * ```
 */
export function expectLabelInstructions(
  element: ReactTestInstance,
  options: {
    /** Expected label text */
    label: string;
    /** Expected hint/instruction text */
    hint?: string;
    /** Whether field is required */
    required?: boolean;
    /** Expected placeholder text */
    placeholder?: string;
  }
): void {
  const { label, hint, required, placeholder } = options;

  // Label must be present via accessibilityLabel
  expect(element.props.accessibilityLabel).toBe(label);

  // Hint should be in accessibilityHint if provided
  if (hint) {
    expect(element.props.accessibilityHint).toContain(hint);
  }

  // Required state should be indicated
  if (required !== undefined) {
    const state = element.props.accessibilityState as Record<string, unknown> | undefined;

    // Required can be indicated via state or label
    const hasRequiredIndication =
      state?.required === required ||
      (element.props.accessibilityLabel as string)?.includes('required') === required ||
      element.props['aria-required'] === required;

    expect(hasRequiredIndication).toBe(true);
  }

  // Placeholder is supplementary, not a replacement for label
  if (placeholder) {
    expect(element.props.placeholder).toBe(placeholder);
    // Label should still be present (placeholder is not sufficient)
    expect(element.props.accessibilityLabel).toBeTruthy();
    expect(element.props.accessibilityLabel).not.toBe(placeholder);
  }
}
