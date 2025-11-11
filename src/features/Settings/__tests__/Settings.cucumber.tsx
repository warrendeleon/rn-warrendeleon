// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { Then } from '@cucumber/cucumber';
import { by, element, expect } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Settings specific step definitions

Then(
  'the {string} should show {string} as end label',
  async function (this: DetoxWorld, testID: string, expectedLabel: string) {
    // Find the element by testID and verify it contains the expected text
    await expect(element(by.id(testID).withDescendant(by.text(expectedLabel)))).toBeVisible();
  }
);
