// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { After } from '@cucumber/cucumber';
import { device } from 'detox';

/**
 * Splash screen E2E test step definitions
 *
 * Splash flow:
 * 1. App launches → Splash screen displays
 * 2. Logo animation plays (Lottie)
 * 3. Background data fetches (profile, work experience, education via MSW)
 * 4. After 4.5 seconds → auto-transitions to Home screen
 *
 * EAA Compliance:
 * ✅ splash-screen has accessibilityLabel="Loading splash screen"
 * ✅ Logo component receives testID prop
 *
 * Testing strategy:
 * - Verify splash screen elements appear on launch
 * - Verify automatic transition to Home after timeout
 * - MSW mocks GitHub API calls (already configured in hooks.ts)
 * - No user interaction required (fully automatic flow)
 *
 * Note: All common steps (Given/When/Then) are imported from common.steps.tsx
 * This file only needs custom steps specific to Splash screen if needed.
 */

// Cleanup hook: Ensure app is in clean state after splash tests
After({ tags: '@splash' }, async () => {
  try {
    // Reload app to reset state for next test
    await device.reloadReactNative();
  } catch {
    // Ignore errors if app already reloaded
  }
});
