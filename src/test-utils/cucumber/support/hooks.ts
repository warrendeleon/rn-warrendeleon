import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { device } from 'detox';

import { cleanupDetox, detox, setupDetox } from './detox-setup';
import { DetoxWorld } from './world';

BeforeAll({ timeout: 120 * 1000 }, async function () {
  console.log('🚀 Starting Detox E2E tests...');
  await setupDetox();
  await device.launchApp();
});

Before(async function (this: DetoxWorld, { pickle }) {
  // Notify Detox that a test is starting
  await detox.onTestStart({
    title: pickle.name,
    fullName: pickle.name,
    status: 'running',
  });

  // Reload the app for each scenario
  await device.reloadReactNative();
});

After(async function (this: DetoxWorld, { pickle, result }) {
  const testStatus = result?.status === Status.PASSED ? 'passed' : 'failed';

  if (result?.status === Status.FAILED) {
    // Take a screenshot on failure
    const screenshotPath = `detox-artifacts/${pickle.name}.png`;
    console.log(`❌ Test failed: ${pickle.name}. Screenshot saved to ${screenshotPath}`);

    try {
      await device.takeScreenshot(pickle.name);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  }

  // Notify Detox that the test is done
  await detox.onTestDone({
    title: pickle.name,
    fullName: pickle.name,
    status: testStatus,
  });
});

AfterAll(async function () {
  console.log('✅ Detox E2E tests completed.');
  await cleanupDetox();
});
