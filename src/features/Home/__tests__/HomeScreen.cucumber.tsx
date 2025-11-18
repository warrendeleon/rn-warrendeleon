// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { Given, Then } from '@cucumber/cucumber';
import { by, element, waitFor } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Home Screen specific steps

Given('I am viewing the home screen', async function (this: DetoxWorld) {
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);
});

Then('the home screen should display the settings button', async function (this: DetoxWorld) {
  await waitFor(element(by.id('home-settings-button')))
    .toBeVisible()
    .withTimeout(5000);
});

// You can add more Home-specific step definitions here
// For example:
//
// When('I tap on a specific home feature', async function(this: DetoxWorld) {
//   await element(by.id('feature-button')).tap();
// });
//
// Then('I should see the feature details', async function(this: DetoxWorld) {
//   await waitFor(element(by.id('feature-details')))
//     .toBeVisible()
//     .withTimeout(5000);
// });
