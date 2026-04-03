# TASK-398: Fix accessibility touch target validation for GlueStack components

**Task ID**: TASK-398
**Title**: Fix expectMinTouchTarget to support GlueStack props and enforce strict validation
**Status**: 🔲 To Do
**Priority**: High
**Created**: 2026-04-03
**Assigned To**: Warren de Leon
**Category**: Accessibility / Testing

---

## Context

`expectMinTouchTarget` in `src/test-utils/accessibility.ts` only reads dimensions from `StyleSheet.flatten(element.props.style)`. GlueStack UI components pass dimensions as direct props (`minHeight={50}`, `w="$full"`, `h="$12"`), not via the `style` prop. In the Jest test environment, GlueStack props don't resolve to React Native styles because NativeWind is mocked.

The current function silently passes when no measurable size is found, hiding real accessibility issues.

## Problem

1. **GlueStack props invisible to tests.** Components using `minHeight={50}` or `h="$12"` as GlueStack props pass the touch target check silently because `StyleSheet.flatten` finds nothing.
2. **Silent pass on missing sizes.** When no size is found, the function exits without failing. Elements with no measurable touch target pass the test by default.
3. **~40 components affected.** Buttons, list items, cards, settings items, permission screens all rely on parent layout for width with no explicit sizing.
4. **`style={{}}` used instead of GlueStack props.** Several Auth screen buttons use `style={{ minHeight: 50 }}` instead of `minHeight={50}`.

## Solution

### Part 1: Upgrade `expectMinTouchTarget` in `src/test-utils/accessibility.ts`

Replace the current implementation with one that:

1. **Checks direct props as fallback.** Read `element.props.minWidth`, `element.props.minHeight`, `element.props.width`, `element.props.height`, `element.props.w`, `element.props.h` when `StyleSheet.flatten` finds nothing.

2. **Resolves GlueStack tokens.** Map tokens like `"$12"` to pixel values (48px) using the GlueStack space scale:

```typescript
const GLUESTACK_SPACE_TOKENS: Record<string, number> = {
  '$0': 0, '$0.5': 2, '$1': 4, '$1.5': 6, '$2': 8, '$2.5': 10,
  '$3': 12, '$3.5': 14, '$4': 16, '$4.5': 18, '$5': 20, '$6': 24,
  '$7': 28, '$8': 32, '$9': 36, '$10': 40, '$11': 44, '$12': 48,
  '$16': 64, '$20': 80, '$24': 96, '$32': 128, '$40': 160, '$48': 192,
  '$56': 224, '$64': 256, '$72': 288, '$80': 320, '$96': 384,
};
```

3. **Recognise full-size values.** Treat `"$full"`, `"100%"`, and fractional tokens (`"$1/2"`, `"$3/4"`, etc.) as always passing since they fill their container.

4. **Throw on missing sizes.** When no measurable size exists AND no `hitSlop` is set, throw an error instead of silently passing:

```typescript
throw new Error(
  `Element with testID "${element.props.testID}" has no measurable width. ` +
    'Set minWidth, width, or hitSlop to meet EAA touch target requirements.'
);
```

5. **Update `expectAccessibilityComplete`.** Simplify the touch target section to call `expectMinTouchTarget` directly instead of duplicating size detection logic.

### Part 2: Fix components to use GlueStack props

Convert all `style={{ minHeight: 50 }}` to `minHeight={50}` as a GlueStack prop. Add `w="$full"` to full-width buttons.

**Files to update:**

| File | Change |
|---|---|
| `src/features/Auth/LoginScreen.tsx` | `minHeight={50}` `w="$full"` |
| `src/features/Auth/ResetPasswordScreen.tsx` (x2) | `minHeight={50}` |
| `src/features/Auth/RegistrationScreen.tsx` | `minHeight={50}` |
| `src/features/Auth/ForgotPasswordScreen.tsx` (x2) | `minHeight={50}` |
| `src/features/Auth/EmailVerificationScreen.tsx` (x2) | `minHeight={50}` |
| `src/features/Profile/ChangePasswordScreen.tsx` | `minHeight={50}` |
| `src/features/Profile/ProfileScreen.tsx` | `minHeight={TOUCH_TARGET_SIZE.height}` (keep `style` until utility supports props) |

### Part 3: Fix remaining ~40 components with no measurable touch target

These components currently pass silently. After the utility upgrade, they will fail. Each needs either:
- An explicit `minHeight` and `minWidth` or `w="$full"` as GlueStack props
- Or `hitSlop` if the visual size is intentionally small

**Components to fix (from test failures):**

- `settings-item`, `icon-item`, `dark-item`, `language-item`, `pressable-item`, `single-item`, `selected-item`
- `profile-card`, `profile-item`, `custom-profile`, `user-card`, `custom-user-card`
- `picker-item`, `country-selector`, `option-1`
- `dialog-button-0`, `dialog-button-1`
- `error-go-home-button`, `error-try-again-button`, `test-error-button`
- `permission-denied-back-button`, `permission-denied-settings-button`
- `camera-permission-continue-button`, `camera-permission-skip-button`
- `photo-library-permission-continue-button`, `photo-library-permission-skip-button`
- `profile-picture-action-*` buttons, `profile-picture-preview-*` buttons
- `save-button`, `change-password-button`, `reset-password-button`, `resend-email-button`, `back-to-login-button`
- `first-name-input`
- `appearance-option-system`
- `button-1`

### Part 4: Update self-tests

Update `src/test-utils/__tests__/accessibility.rntl.tsx`:
- Change "should not fail for element without explicit sizes" to expect a throw
- Add test for hitSlop fallback (no size but hitSlop set should pass)
- Add test for GlueStack token resolution (`h="$12"` should resolve to 48)
- Add test for full-size values (`w="$full"` should pass)
- Update padding test to include a base size

## Acceptance Criteria

- [ ] `expectMinTouchTarget` reads GlueStack props as fallback
- [ ] GlueStack tokens (`$12`, `$11`, etc.) resolve to pixel values
- [ ] Full-size values (`$full`, `100%`) always pass
- [ ] Missing sizes throw instead of silently passing
- [ ] All `style={{ minHeight }}` converted to GlueStack props on buttons
- [ ] All ~40 affected components have explicit sizing or hitSlop
- [ ] All 5280+ tests pass
- [ ] No `style={{}}` used for dimensions that can be GlueStack props
