# Accessibility Testing Quick Reference

EAA/WCAG 2.1 Level AA accessibility testing utilities for RNTL tests.

## Import

```typescript
import {
  expectMinTouchTarget,
  expectMinHitSlop,
  expectAccessibilityProps,
  expectAccessibilityComplete,
  expectColorContrast,
  expectFocusOrder,
  expectScreenReaderAnnouncement,
  expectLiveRegionContent,
  expectNoTimingDependence,
  expectPauseStopHide,
  expectNoFlashing,
  expectConsistentNavigation,
  expectErrorIdentification,
  expectLabelInstructions,
  TOUCH_TARGET_SIZES,
  CONTRAST_RATIOS,
  calculateContrastRatio,
} from '@app/test-utils';
```

---

## Touch Targets

### `expectMinTouchTarget(element, minWidth?, minHeight?)`

Check interactive elements meet minimum touch target size.

**Requirements**: 44×44 points (iOS), 48×48 dp (Android)

```typescript
it('submit button meets touch target requirements', () => {
  const { getByTestId } = renderWithProviders(<LoginForm />);
  const button = getByTestId('submit-button');

  expectMinTouchTarget(button); // Uses 44×44 default
  expectMinTouchTarget(button, 48, 48); // Android requirement
});
```

### `expectMinHitSlop(element, minHitSlop?)`

Check small visual elements have adequate hitSlop.

```typescript
it('icon button extends touch area with hitSlop', () => {
  const { getByTestId } = renderWithProviders(<IconButton />);
  const button = getByTestId('close-icon');

  expectMinHitSlop(button, 12); // 12pt hitSlop on all sides
});
```

---

## Accessibility Props

### `expectAccessibilityProps(element, options)`

Flexible check for accessibility properties (allows truthy values).

```typescript
it('button has required a11y props', () => {
  const button = getByTestId('submit-button');

  expectAccessibilityProps(button, {
    role: 'button',
    label: true, // Just check it exists
    hint: true, // Just check it exists
    state: { disabled: false },
  });
});
```

### `expectAccessibilityComplete(element, options)` — Strict

Strict check requiring exact values (not just truthy).

```typescript
it('button has complete a11y properties', () => {
  const button = getByTestId('submit-button');

  expectAccessibilityComplete(button, {
    role: 'button',
    label: 'Submit form', // Exact match required
    hint: 'Saves your changes', // Exact match required
    state: { disabled: false },
    touchTarget: true, // Also checks touch target
  });
});
```

---

## Colour Contrast

### `expectColorContrast(foreground, background, options?)`

WCAG 2.1 colour contrast ratio verification.

**Requirements**:

- Normal text (< 18pt): **4.5:1**
- Large text (≥ 18pt or ≥ 14pt bold): **3.0:1**
- UI components: **3.0:1**

```typescript
it('text meets 4.5:1 contrast for normal text', () => {
  expectColorContrast('#333333', '#FFFFFF', { type: 'normalText' });
});

it('heading meets 3:1 contrast for large text', () => {
  expectColorContrast('#666666', '#FFFFFF', { type: 'largeText' });
});

it('button border meets 3:1 contrast', () => {
  expectColorContrast('#888888', '#FFFFFF', { type: 'uiComponents' });
});

it('custom contrast ratio check', () => {
  expectColorContrast('#444444', '#F5F5F5', { minRatio: 5.0 });
});
```

### `calculateContrastRatio(foreground, background)`

Get the actual contrast ratio between two colours.

```typescript
const ratio = calculateContrastRatio('#333333', '#FFFFFF');
console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`); // "Contrast ratio: 12.63:1"
```

---

## Focus Order & Navigation

### `expectFocusOrder(elements)`

Check focusable elements appear in correct order.

```typescript
it('form fields in correct focus order', () => {
  const email = getByTestId('email-input');
  const password = getByTestId('password-input');
  const submit = getByTestId('submit-button');

  expectFocusOrder([email, password, submit]);
});
```

### `expectCanReceiveFocus(element, options?)`

Check element can receive programmatic focus.

```typescript
it('first input can receive focus after navigation', () => {
  const input = getByTestId('first-input');

  expectCanReceiveFocus(input);
  expectCanReceiveFocus(input, { autoFocus: true }); // Also check autoFocus
});
```

### `expectConsistentNavigation(elements, expectedOrder)`

WCAG 3.2.3: Navigation in same order across screens.

```typescript
it('bottom nav maintains consistent order', () => {
  const navItems = [getByTestId('nav-home'), getByTestId('nav-search'), getByTestId('nav-profile')];

  expectConsistentNavigation(navItems, ['nav-home', 'nav-search', 'nav-profile']);
});
```

---

## Screen Reader Announcements

### `expectScreenReaderAnnouncement(element, options)`

Check dynamic content announces to screen readers.

```typescript
it('error message announces to screen reader', () => {
  const alert = getByTestId('error-alert');

  expectScreenReaderAnnouncement(alert, {
    liveRegion: 'polite', // or 'assertive' for urgent
    role: 'alert',
  });
});
```

### `expectLiveRegionContent(element, expectedContent, options)`

Check live region has specific content.

```typescript
it('announces error message changes', () => {
  const alert = getByTestId('alert-box');

  expectLiveRegionContent(alert, 'Invalid email address', {
    liveRegion: 'polite',
    role: 'alert',
  });
});
```

---

## Form Accessibility

### `expectErrorIdentification(element, options)` — WCAG 3.3.1

Check errors are properly identified and described.

```typescript
it('email field shows error state correctly', () => {
  const field = getByTestId('email-field');
  const errorMessage = getByTestId('email-error');

  expectErrorIdentification(field, {
    hasError: true,
    errorElement: errorMessage,
    errorText: 'Invalid email address',
  });
});

it('valid field has no error state', () => {
  const field = getByTestId('email-field');

  expectErrorIdentification(field, { hasError: false });
});
```

### `expectLabelInstructions(element, options)` — WCAG 3.3.2

Check form fields have proper labels and instructions.

```typescript
it('password field has proper labels', () => {
  const field = getByTestId('password-field');

  expectLabelInstructions(field, {
    label: 'Password',
    hint: 'Must be at least 8 characters',
    required: true,
    placeholder: 'Enter password', // Optional
  });
});
```

---

## Timing & Motion

### `expectNoTimingDependence(element, options?)` — WCAG 2.2.1

Check interactions don't depend on timing.

```typescript
it('form has no time-based requirements', () => {
  const submitButton = getByTestId('submit-button');

  expectNoTimingDependence(submitButton);
});

// Allow specific patterns if needed
it('session timeout is adjustable', () => {
  const form = getByTestId('form');

  expectNoTimingDependence(form, {
    allowTimeLimits: true, // You've implemented timeout extension
    maxTimeout: 900000, // 15 minutes max
  });
});
```

### `expectPauseStopHide(element, controls)` — WCAG 2.2.2

Check auto-updating content has pause/stop/hide controls.

```typescript
it('carousel can be paused', () => {
  const carousel = getByTestId('news-carousel');
  const pauseButton = getByTestId('pause-button');

  expectPauseStopHide(carousel, {
    pauseControl: pauseButton,
    autoPlays: true,
    isPaused: false,
  });
});
```

### `expectNoFlashing(element, options?)` — WCAG 2.3.1

Check content doesn't flash more than 3 times/second.

```typescript
it('alert banner does not flash dangerously', () => {
  const banner = getByTestId('alert-banner');

  expectNoFlashing(banner);
  expectNoFlashing(banner, { recursive: true }); // Check children too
});
```

---

## Constants

### Touch Target Sizes

```typescript
import { TOUCH_TARGET_SIZES } from '@app/test-utils';

TOUCH_TARGET_SIZES.ios; // { minWidth: 44, minHeight: 44 }
TOUCH_TARGET_SIZES.android; // { minWidth: 48, minHeight: 48 }
TOUCH_TARGET_SIZES.default; // { minWidth: 44, minHeight: 44 }
```

### Contrast Ratios

```typescript
import { CONTRAST_RATIOS } from '@app/test-utils';

CONTRAST_RATIOS.normalText; // 4.5
CONTRAST_RATIOS.largeText; // 3.0
CONTRAST_RATIOS.uiComponents; // 3.0
```

---

## Complete Example

Testing a login form for EAA compliance:

```typescript
describe('LoginScreen EAA Compliance', () => {
  it('email field meets all accessibility requirements', () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />);
    const emailField = getByTestId('email-input');

    // Touch target
    expectMinTouchTarget(emailField);

    // Labels and instructions
    expectLabelInstructions(emailField, {
      label: 'Email address',
      hint: 'Enter your registered email',
      required: true,
    });
  });

  it('submit button meets all accessibility requirements', () => {
    const button = getByTestId('submit-button');

    // Complete a11y check
    expectAccessibilityComplete(button, {
      role: 'button',
      label: 'Sign in',
      hint: 'Submits your credentials',
      touchTarget: true,
    });
  });

  it('error messages are accessible', () => {
    // Trigger validation error
    fireEvent.press(getByTestId('submit-button'));

    const errorMessage = getByTestId('email-error');

    expectScreenReaderAnnouncement(errorMessage, {
      liveRegion: 'polite',
      role: 'alert',
    });
  });

  it('form fields in correct focus order', () => {
    const email = getByTestId('email-input');
    const password = getByTestId('password-input');
    const submit = getByTestId('submit-button');

    expectFocusOrder([email, password, submit]);
  });

  it('no timing dependencies', () => {
    const form = getByTestId('login-form');
    expectNoTimingDependence(form);
  });
});
```

---

## See Also

- **EAA Requirements**: `.claude/docs/accessibility-guide.md`
- **WCAG 2.1 Level AA**: [W3C Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- **React Native Accessibility**: [RN Accessibility Guide](https://reactnative.dev/docs/accessibility)
