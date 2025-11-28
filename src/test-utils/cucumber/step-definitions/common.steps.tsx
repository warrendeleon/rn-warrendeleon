import { Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

import { DetoxWorld } from '../support/world';

// Common Given steps

Given('the app is launched', { timeout: 60000 }, async function (this: DetoxWorld) {
  // Clear iOS Keychain to reset auth tokens (survives app uninstall)
  await device.clearKeychain();
  // Launch app with fresh state (delete: true clears AsyncStorage)
  await device.launchApp({ newInstance: true, delete: true });
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
    try {
      await waitFor(element(by.id(testID)))
        .toBeVisible()
        .whileElement(by.type('RCTScrollView'))
        .scroll(200, 'down');
    } catch {
      // Final attempt with longer timeout
      await waitFor(element(by.id(testID)))
        .toBeVisible()
        .withTimeout(3000);
    }
  }
  await element(by.id(testID)).tap();
});

When('I scroll down', async function (this: DetoxWorld) {
  // Try to find ScrollView by type first, fall back to finding by scrollable trait
  try {
    await element(by.type('RCTScrollView')).atIndex(0).scrollTo('bottom');
  } catch {
    // For GlueStack ScrollView, use traits
    await element(by.traits(['scrollable']))
      .atIndex(0)
      .scrollTo('bottom');
  }
});

When('I scroll up', async function (this: DetoxWorld) {
  try {
    await element(by.type('RCTScrollView')).atIndex(0).scrollTo('top');
  } catch {
    await element(by.traits(['scrollable']))
      .atIndex(0)
      .scrollTo('top');
  }
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
    try {
      await waitFor(element(by.id(testID)))
        .toBeVisible()
        .whileElement(by.type('RCTScrollView'))
        .scroll(100, 'up');
    } catch {
      // Element might already be visible
    }

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
  { timeout: 15000 },
  async function (this: DetoxWorld, screenName: string) {
    const testID = `${screenName.toLowerCase().replace(/\s+/g, '-')}-screen`;
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(10000);
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

Then('I should see the text {string}', async function (this: DetoxWorld, text: string) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(5000);
});

Then(
  'I should see the element with testID {string}',
  async function (this: DetoxWorld, testID: string) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);
  }
);

Then(
  'the element with testID {string} should contain text {string}',
  async function (this: DetoxWorld, testID: string, text: string) {
    await detoxExpect(element(by.id(testID))).toHaveText(text);
  }
);

Then(
  'the element with testID {string} should be disabled',
  async function (this: DetoxWorld, testID: string) {
    // On iOS, disabled elements have the 'notEnabled' accessibility trait
    // We use both by.id and by.traits to match a disabled element with the testID
    await waitFor(element(by.id(testID).and(by.traits(['notEnabled']))))
      .toBeVisible()
      .withTimeout(5000);
  }
);

Then(
  'the element with testID {string} should be enabled',
  async function (this: DetoxWorld, testID: string) {
    // Wait for element to be visible
    await waitFor(element(by.id(testID)))
      .toBeVisible()
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

// Alert handling steps

When('I tap {string} on the alert', async function (this: DetoxWorld, buttonText: string) {
  // Wait for the alert to be visible and tap the button
  await waitFor(element(by.text(buttonText)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.text(buttonText)).tap();
});

Then('I should see an alert with title {string}', async function (this: DetoxWorld, title: string) {
  await waitFor(element(by.text(title)))
    .toBeVisible()
    .withTimeout(5000);
});
