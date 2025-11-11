import { Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

import { DetoxWorld } from '../support/world';

// Common Given steps

Given('the app is launched', async function (this: DetoxWorld) {
  await device.launchApp({ newInstance: true });
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
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id(testID)).tap();
});

When('I scroll down', async function (this: DetoxWorld) {
  await element(by.type('RCTScrollView')).scrollTo('bottom');
});

When('I scroll up', async function (this: DetoxWorld) {
  await element(by.type('RCTScrollView')).scrollTo('top');
});

When(
  'I type {string} into the input with testID {string}',
  async function (this: DetoxWorld, text: string, testID: string) {
    await element(by.id(testID)).typeText(text);
  }
);

When('I wait for {int} seconds', async function (this: DetoxWorld, seconds: number) {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

// Common Then steps

Then('I should see the {string} screen', async function (this: DetoxWorld, screenName: string) {
  const testID = `${screenName.toLowerCase().replace(/\s+/g, '-')}-screen`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});

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

Then(
  'the element with testID {string} should be disabled',
  async function (this: DetoxWorld, testID: string) {
    await detoxExpect(element(by.id(testID))).not.toBeVisible();
  }
);

Then(
  'the element with testID {string} should be enabled',
  async function (this: DetoxWorld, testID: string) {
    await detoxExpect(element(by.id(testID))).toBeVisible();
  }
);
