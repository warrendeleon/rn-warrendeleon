import { Given, Then, When } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

Given('I am on the HomeScreen', async () => {
  await detoxExpect(element(by.text('Home'))).toBeVisible();
});

When('I tap the My CV button', async () => {
  await element(by.id('home-cv-button')).tap();
});

Then('I should see the PDF viewer screen', async () => {
  await detoxExpect(element(by.text('CV'))).toBeVisible();
});

Then('the PDF should load successfully', async () => {
  // Wait for PDF to render (check for share button as proxy)
  await waitFor(element(by.id('pdf-share-button')))
    .toBeVisible()
    .withTimeout(5000);
});

When('I wait for the PDF to load', async () => {
  await waitFor(element(by.id('pdf-share-button')))
    .toBeVisible()
    .withTimeout(5000);
});

When('I tap the share button', async () => {
  await element(by.id('pdf-share-button')).tap();
});

Then('the native share sheet should appear', async () => {
  // Platform-specific validation
  if (device.getPlatform() === 'ios') {
    await detoxExpect(element(by.label('Share'))).toBeVisible();
  } else {
    await detoxExpect(element(by.text('Share'))).toBeVisible();
  }
});

When('I cancel the share sheet', async () => {
  if (device.getPlatform() === 'ios') {
    await element(by.label('Cancel')).tap();
  } else {
    await device.pressBack();
  }
});

Then('I should return to the PDF viewer', async () => {
  await detoxExpect(element(by.text('CV'))).toBeVisible();
});

When('I tap the back button', async () => {
  if (device.getPlatform() === 'ios') {
    await element(by.id('back-button')).tap();
  } else {
    await device.pressBack();
  }
});

Then('I should return to the HomeScreen', async () => {
  await detoxExpect(element(by.text('Home'))).toBeVisible();
});
