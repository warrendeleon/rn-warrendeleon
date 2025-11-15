// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { Then, When } from '@cucumber/cucumber';
import { by, device, element, waitFor } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Language switching specific step definitions

When('I restart the app', async function (this: DetoxWorld) {
  await device.launchApp({ newInstance: true });
  // Wait for the home screen to be fully loaded after restart
  const homeScreen = element(by.id('home-screen'));
  await waitFor(homeScreen).toBeVisible().withTimeout(10000);
});

Then('the profile data should be in English', async function (this: DetoxWorld) {
  const jsonElement = element(by.id('profile-data-json'));
  const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
  const text = attributes.text || attributes.label || '';
  if (!text.includes('Senior React Native Developer')) {
    throw new Error(`Expected English headline, but got: ${text.substring(0, 100)}...`);
  }
});

Then('the profile data should be in Spanish', async function (this: DetoxWorld) {
  const jsonElement = element(by.id('profile-data-json'));
  const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
  const text = attributes.text || attributes.label || '';
  if (!text.includes('Desarrollador Senior React Native')) {
    throw new Error(`Expected Spanish headline, but got: ${text.substring(0, 100)}...`);
  }
});

Then('the profile data should be in Catalan', async function (this: DetoxWorld) {
  const jsonElement = element(by.id('profile-data-json'));
  const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
  const text = attributes.text || attributes.label || '';
  if (!text.includes('Desenvolupador Senior React Native')) {
    throw new Error(`Expected Catalan headline, but got: ${text.substring(0, 100)}...`);
  }
});

Then('the profile data should be in Polish', async function (this: DetoxWorld) {
  const jsonElement = element(by.id('profile-data-json'));
  const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
  const text = attributes.text || attributes.label || '';
  if (!text.includes('Starszy Programista React Native')) {
    throw new Error(`Expected Polish headline, but got: ${text.substring(0, 100)}...`);
  }
});

Then('the profile data should be in Tagalog', async function (this: DetoxWorld) {
  const jsonElement = element(by.id('profile-data-json'));
  const attributes = (await jsonElement.getAttributes()) as { text?: string; label?: string };
  const text = attributes.text || attributes.label || '';
  if (!text.includes('Senior React Native Developer')) {
    throw new Error(
      `Expected Tagalog headline (English fallback), but got: ${text.substring(0, 100)}...`
    );
  }
});
