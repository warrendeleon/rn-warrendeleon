import { Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

import { DetoxWorld } from '../support/world';

// Common Given steps

Given('the app is launched', { timeout: 60000 }, async function (this: DetoxWorld) {
  // Terminate any running instance first to ensure clean state
  try {
    await device.terminateApp();
  } catch {
    // App might not be running, ignore
  }
  // Clear iOS Keychain to reset auth tokens (survives app uninstall)
  await device.clearKeychain(); // iOS only: silent no-op on Android (use launchApp({ delete: true }) there)
  // Launch app with fresh state (delete: true clears AsyncStorage).
  // Synchronisation is disabled for the launch itself and re-enabled after,
  // the same sequence BeforeAll uses: Detox's idle tracking can latch onto a
  // timer created during bundle evaluation and wait on it forever, timing
  // the whole step out while the app sits idle on the Home screen.
  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { detoxEnableSynchronization: 0 },
  });
  // Wait for app to fully initialize before starting test
  await new Promise(resolve => setTimeout(resolve, 500));
  await device.enableSynchronization();
});

Given('I am on the {string} screen', async function (this: DetoxWorld, screenName: string) {
  const testID = `${screenName.toLowerCase().replace(/\s+/g, '-')}-screen`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});

// Common When steps

When('I tap the {string} button', async function (this: DetoxWorld, buttonName: string) {
  const testID = `${buttonName.toLowerCase().replace(/\s+/g, '-')}-button`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id(testID)).tap();
});

When('I tap the element with testID {string}', async function (this: DetoxWorld, testID: string) {
  // First try to find the element as visible
  try {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(2000);
  } catch {
    // Element not visible, try scrolling to find it
    await scrollIntoView(testID);
    // Final attempt with longer timeout
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(3000);
  }
  try {
    await element(by.id(testID)).tap();
  } catch {
    // The software keyboard can cover the target (the hit-test lands on the
    // keyboard, not the control). The scroll views use
    // keyboardShouldPersistTaps='handled', so a tap on non-interactive
    // content near the top dismisses the keyboard; then retry once.
    try {
      await element(by.type('RCTScrollViewComponentView')).atIndex(0).tap({ x: 20, y: 10 });
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch {
      // No scroll view on this screen; let the retry surface the real error
    }
    await element(by.id(testID)).tap();
  }
  // Wait for navigation/interaction animation to settle before subsequent steps
  // Increased from 300ms to 500ms for better stability in parallel execution
  await new Promise(resolve => setTimeout(resolve, 500));
});

When('I scroll down', async function (this: DetoxWorld) {
  // Use swipe gesture for reliable scrolling across different ScrollView implementations
  // Swipe up on element to scroll content down (reveal more content below)
  // Try multiple ScrollView type names for compatibility across RN versions
  // Start the swipe from the centre of the element: the default start point
  // sits near its bottom edge, and when the software keyboard is up the
  // hit-test lands on the keyboard instead of the scroll view.
  try {
    await element(by.type('RCTScrollView')).atIndex(0).swipe('up', 'fast', 0.5, 0.5, 0.5);
  } catch {
    // Fallback to UIScrollView (native iOS type)
    await element(by.type('UIScrollView')).atIndex(0).swipe('up', 'fast', 0.5, 0.5, 0.5);
  }
  // Wait for scroll animation to settle before subsequent interactions
  // Increased from 300ms to 500ms for better stability in parallel execution
  await new Promise(resolve => setTimeout(resolve, 500));
});

When('I scroll up', async function (this: DetoxWorld) {
  // Use swipe gesture for reliable scrolling across different ScrollView implementations
  // Swipe down on element to scroll content up (reveal content above)
  // Try multiple ScrollView type names for compatibility across RN versions
  try {
    await element(by.type('RCTScrollView')).atIndex(0).swipe('down', 'fast', 0.5);
  } catch {
    // Fallback to UIScrollView (native iOS type)
    await element(by.type('UIScrollView')).atIndex(0).swipe('down', 'fast', 0.5);
  }
  // Wait for scroll animation to settle before subsequent interactions
  await new Promise(resolve => setTimeout(resolve, 300));
});

When('I scroll down on the {string} screen', async function (this: DetoxWorld, screenName: string) {
  const testID = `${screenName.toLowerCase().replace(/\s+/g, '-')}-screen`;
  await element(by.id(testID)).scrollTo('bottom');
});

When(
  'I type {string} into the input with testID {string}',
  async function (this: DetoxWorld, text: string, testID: string) {
    // Dismiss keyboard by sending the Return key to the currently focused element
    // This moves focus to next field or dismisses keyboard
    try {
      await element(by.type('UITextField')).atIndex(0).tapReturnKey();
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch {
      // No focused text field, continue
    }

    // Scroll to make the element visible if needed
    await scrollIntoView(testID);

    // Wait for element to be visible
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(3000);

    // Use replaceText to set the text (works even with keyboard visible)
    await element(by.id(testID)).replaceText(text);
  }
);

When('I wait for {int} seconds', async function (this: DetoxWorld, seconds: number) {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

When('I dismiss the keyboard', async function (this: DetoxWorld) {
  // Dismiss keyboard by tapping outside the focused element
  try {
    // Try to tap return key on any focused text field first
    await element(by.type('UITextField')).atIndex(0).tapReturnKey();
  } catch {
    // No text field focused, try scrolling to dismiss
    try {
      await element(by.type('RCTScrollView')).atIndex(0).scroll(50, 'down');
      await element(by.type('RCTScrollView')).atIndex(0).scroll(50, 'up');
    } catch {
      // No scroll view, just wait a moment
    }
  }
  await new Promise(resolve => setTimeout(resolve, 500));
});

When('I go back', async function (this: DetoxWorld) {
  // Navigate back using custom header back button with testID
  await waitFor(element(by.id('header-back-button')))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id('header-back-button')).tap();
});

When(
  'I dismiss the React Native error screen',
  { timeout: 30000 },
  async function (this: DetoxWorld) {
    // In development mode, React Native shows error screens (red) and warning boxes (yellow)
    // Both have "Dismiss" buttons that need to be tapped
    // Multiple errors/warnings can stack, requiring multiple dismisses (typically 3-4)
    // We need to tap "Dismiss" repeatedly until all are cleared
    // and the ErrorBoundary FallbackUI is revealed underneath

    const MAX_DISMISS_ATTEMPTS = 10;
    let dismissCount = 0;

    for (let attempt = 0; attempt < MAX_DISMISS_ATTEMPTS; attempt++) {
      try {
        // Try to find and tap the "Dismiss" button
        await waitFor(element(by.text('Dismiss')))
          .toBeVisible()
          .withTimeout(1000);

        // Dismiss button found - tap it
        await element(by.text('Dismiss')).tap();
        dismissCount++;

        // Wait for the error/warning to dismiss before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch {
        // "Dismiss" button not found - all errors/warnings have been cleared
        console.log(`Successfully dismissed ${dismissCount} error(s)/warning(s)`);
        return;
      }
    }

    // If we get here, we hit max attempts and still see errors/warnings
    throw new Error(
      `Failed to clear error/warning screens after ${MAX_DISMISS_ATTEMPTS} attempts. ` +
        `ErrorBoundary FallbackUI may not be working correctly.`
    );
  }
);

// Common Then steps

Then(
  'I should see the {string} screen',
  { timeout: 25000 },
  async function (this: DetoxWorld, screenName: string) {
    const testID = `${screenName.toLowerCase().replace(/\s+/g, '-')}-screen`;
    // Wait briefly for navigation animation to complete before checking
    // This is especially important for parallel execution where animations may be slower
    await new Promise(resolve => setTimeout(resolve, 500));
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(20000);
  }
);

Then('I should see the {string} button', async function (this: DetoxWorld, buttonName: string) {
  const testID = `${buttonName.toLowerCase().replace(/\s+/g, '-')}-button`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});

Then(
  'I should see an element with testID {string}',
  async function (this: DetoxWorld, testID: string) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);
  }
);

Then(
  'I should not see an element with testID {string}',
  async function (this: DetoxWorld, testID: string) {
    await waitFor(element(by.id(testID)))
      .not.toBeVisible()
      .withTimeout(5000);
  }
);

Then('I should see text {string}', async function (this: DetoxWorld, text: string) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(5000);
});

Then(
  'the element with testID {string} should contain text {string}',
  async function (this: DetoxWorld, testID: string, text: string) {
    await detoxExpect(element(by.id(testID))).toHaveText(text);
  }
);

/**
 * Best-effort scroll to bring an input into view before typing (the
 * KeyboardAvoidingView shrinks the scroll view, so targets can be reached
 * without dismissing the keyboard — a Return-key dismissal is not safe here
 * because some fields submit on Return).
 */
const scrollIntoView = async (testID: string): Promise<void> => {
  // Old architecture exposes RCTScrollView; the new architecture's class is
  // RCTScrollViewComponentView (the UIScrollView base class is no use here:
  // whileElement needs a unique match and text fields carry internal
  // UIScrollViews). Detox's scroll 'down' reveals content below the
  // viewport (where a form's submit button usually sits); 'up' covers
  // targets above it.
  for (const scrollableType of ['RCTScrollView', 'RCTScrollViewComponentView']) {
    for (const direction of ['down', 'up'] as const) {
      try {
        // Start the drag from the centre of the scroll view: the default
        // start point sits near its bottom edge, which the software
        // keyboard covers, and Detox refuses to scroll from a covered point.
        await waitFor(element(by.id(testID)))
          .toBeVisible()
          .whileElement(by.type(scrollableType))
          .scroll(100, direction, 0.5, 0.5);
        return;
      } catch {
        // Unknown class on this architecture, scroll exhausted without a
        // match, or the screen has no scroll view: try the next strategy.
      }
    }
  }
};

/*
 * The enabled/disabled checks assert accessibility state, not screen
 * position, so they match on existence rather than visibility: on devices
 * showing the software keyboard the control can sit behind it (validation
 * banners push it further down still), and a visibility assertion fails on
 * occlusion even though the state under test is correct.
 */
Then(
  'the element with testID {string} should be disabled',
  async function (this: DetoxWorld, testID: string) {
    // On iOS, disabled elements have the 'notEnabled' accessibility trait
    // We use both by.id and by.traits to match a disabled element with the testID
    await waitFor(element(by.id(testID).and(by.traits(['notEnabled']))))
      .toExist()
      .withTimeout(5000);
  }
);

Then(
  'the element with testID {string} should be enabled',
  async function (this: DetoxWorld, testID: string) {
    // Wait for the element to be present
    await waitFor(element(by.id(testID)))
      .toExist()
      .withTimeout(5000);
    // Verify it does NOT have notEnabled trait by checking it doesn't match the disabled matcher
    await detoxExpect(element(by.id(testID).and(by.traits(['notEnabled'])))).not.toExist();
  }
);

// Tap by text (for nested Text components where testID doesn't work)

When('I tap the text {string}', async function (this: DetoxWorld, text: string) {
  // Try multiple strategies for finding text elements
  // Strategy 1: by.text() for simple text elements
  try {
    await waitFor(element(by.text(text)))
      .toBeVisible()
      .withTimeout(2000);
    await element(by.text(text)).tap();
    return;
  } catch {
    // Strategy 2: by.label() for elements with accessibilityLabel
    try {
      await waitFor(element(by.label(text)))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.label(text)).tap();
      return;
    } catch {
      // Strategy 3: by.id() using kebab-case version of text
      const testID = `${text.toLowerCase().replace(/\s+/g, '-')}-link`;
      await waitFor(element(by.id(testID)))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id(testID)).tap();
    }
  }
});

// Alert/Dialog handling steps
// Custom ConfirmDialog component is used instead of native Alert.alert()
// because native iOS alerts can't be reliably tested with Detox

When(
  'I tap {string} on the alert',
  { timeout: 10000 },
  async function (this: DetoxWorld, buttonTestID: string) {
    // Find button by testID within the dialog
    await waitFor(element(by.id(buttonTestID)))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id(buttonTestID)).tap();
  }
);

Then(
  'I should see an alert with title {string}',
  { timeout: 10000 },
  async function (this: DetoxWorld, dialogTestID: string) {
    // ConfirmDialog title uses testID pattern: ${dialogTestID}-title
    await waitFor(element(by.id(`${dialogTestID}-title`)))
      .toBeVisible()
      .withTimeout(5000);
  }
);
