// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.cucumber';

import { Then } from '@cucumber/cucumber';
import { by, element, waitFor } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// MockStatus specific step definitions

Then(
  'the {string} should contain text {string}',
  async function (this: DetoxWorld, testID: string, expectedText: string) {
    // Wait for element to be visible first
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(5000);

    // Verify the element contains the expected text (exact match to avoid false positives)
    const elem = element(by.id(testID));
    const attributes = (await elem.getAttributes()) as { label?: string; text?: string };
    const text = (attributes.text || attributes.label || '').trim();

    // Check for exact match (not just contains) to avoid "Not Mocked" matching "Mocked"
    if (text !== expectedText) {
      throw new Error(
        `Expected "${testID}" to have exact text "${expectedText}", but actual text is: "${text}"`
      );
    }
  }
);
