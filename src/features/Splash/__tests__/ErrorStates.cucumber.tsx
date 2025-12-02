// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.cucumber';

import { Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, waitFor } from 'detox';

import type { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Error States specific steps

Given(
  'the app is launched with E2E mocking enabled',
  { timeout: 60000 },
  async function (this: DetoxWorld) {
    // Launch app with E2E mocking but no error
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        // No error mode - normal E2E mock behaviour
      },
    });
  }
);

Given(
  'the app is launched with error mode {string}',
  { timeout: 60000 },
  async function (this: DetoxWorld, errorMode: string) {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        errorMode,
        errorEndpoint: 'all',
      },
    });
  }
);

Given(
  'the app is launched with error mode {string} that clears on retry',
  { timeout: 60000 },
  async function (this: DetoxWorld, errorMode: string) {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        errorMode,
        errorEndpoint: 'all',
      },
    });
  }
);

Given(
  'the app is launched with error mode {string} for endpoint {string}',
  { timeout: 60000 },
  async function (this: DetoxWorld, errorMode: string, endpoint: string) {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        errorMode,
        errorEndpoint: endpoint,
      },
    });
  }
);

// Step to handle retry button with recovery
When(
  'I tap the retry button and recovery succeeds',
  { timeout: 30000 },
  async function (this: DetoxWorld) {
    // Tap the retry button
    await waitFor(element(by.id('splash-retry-button')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('splash-retry-button')).tap();

    // For recovery scenario, the retry mechanism should work because
    // retryAttempts counter allows success after first failure
    // Wait for the app to process the retry
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
);

// Splash error screen specific assertions

Then('I should see the splash error screen', { timeout: 15000 }, async function (this: DetoxWorld) {
  await waitFor(element(by.id('splash-error-screen')))
    .toBeVisible()
    .withTimeout(10000);
});

Then('I should see the retry button', { timeout: 10000 }, async function (this: DetoxWorld) {
  await waitFor(element(by.id('splash-retry-button')))
    .toBeVisible()
    .withTimeout(5000);
});
