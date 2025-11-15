// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { Then } from '@cucumber/cucumber';
import { by, element, waitFor } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Data loading specific step definitions

Then(
  'the profile data should contain {string}',
  async function (this: DetoxWorld, expectedText: string) {
    const jsonElement = element(by.id('profile-data-json'));
    const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
    const text = attributes.text || attributes.label || '';
    if (!text.includes(expectedText)) {
      throw new Error(
        `Expected profile data to contain "${expectedText}", but got: ${text.substring(0, 100)}...`
      );
    }
  }
);

Then(
  'the workxp data should contain {string}',
  async function (this: DetoxWorld, expectedText: string) {
    // Wait longer for WorkXP data to load (array can take more time)
    const jsonElement = element(by.id('workxp-data-json'));
    await waitFor(jsonElement).toBeVisible().withTimeout(10000);

    const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
    const text = attributes.text || attributes.label || '';
    if (!text.includes(expectedText)) {
      throw new Error(
        `Expected workxp data to contain "${expectedText}", but got: ${text.substring(0, 100)}...`
      );
    }
  }
);

Then(
  'the education data should contain {string}',
  async function (this: DetoxWorld, expectedText: string) {
    const jsonElement = element(by.id('education-data-json'));
    const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
    const text = attributes.text || attributes.label || '';
    if (!text.includes(expectedText)) {
      throw new Error(
        `Expected education data to contain "${expectedText}", but got: ${text.substring(0, 100)}...`
      );
    }
  }
);
