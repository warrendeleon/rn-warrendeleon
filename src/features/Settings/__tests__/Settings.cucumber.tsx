// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { Then } from '@cucumber/cucumber';
import { by, element, waitFor } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Settings specific step definitions

Then(
  'the {string} should show {string} as end label',
  async function (this: DetoxWorld, testID: string, expectedLabel: string) {
    // Find the element by testID
    // Wait for element to be visible first
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);

    // Then verify the accessibility label contains the expected text
    // SettingsItem combines label + endLabel in accessibilityLabel
    const elem = element(by.id(testID));
    const attributes = (await elem.getAttributes()) as { label?: string; text?: string };
    const label = attributes.label || attributes.text || '';

    if (!label.includes(expectedLabel)) {
      throw new Error(
        `Expected "${testID}" to show "${expectedLabel}" as end label, but accessibilityLabel is: "${label}"`
      );
    }
  }
);
