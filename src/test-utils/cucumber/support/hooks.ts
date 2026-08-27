import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { execSync } from 'child_process';
import { device } from 'detox';

import { cleanupDetox, detox, setupDetox } from './detox-setup';
import { DetoxWorld } from './world';

/**
 * Gets the worker ID from Cucumber's parallel execution environment
 * Returns '0' for sequential execution
 */
const getWorkerId = (): string => {
  return process.env.CUCUMBER_WORKER_ID ?? '0';
};

/**
 * iOS 17+ simulators show a system "Save Password?" sheet after any password
 * form submission. It sits above the app, Detox cannot reach system sheets,
 * and every wait after login times out behind it. Writing this preference is
 * what the Settings toggle (General > AutoFill & Passwords) writes, and it
 * stops the sheet appearing. Simulator-only; a failure here must not kill the
 * run, so it only warns.
 */
const disablePasswordAutofill = (): void => {
  if (device.getPlatform() !== 'ios') return;
  try {
    execSync(
      `xcrun simctl spawn ${device.id} defaults write com.apple.WebUI AutoFillPasswords -bool false`,
      { stdio: 'ignore' }
    );
  } catch {
    console.warn('⚠️ Could not disable simulator password autofill');
  }
};

BeforeAll({ timeout: 180 * 1000 }, async function () {
  const workerId = getWorkerId();
  console.log(`🚀 Starting Detox E2E tests (worker ${workerId})...`);

  console.log('📱 Setting up Detox...');
  await setupDetox(workerId);
  console.log('✅ Detox setup complete');

  disablePasswordAutofill();

  console.log('🚀 Launching app...');
  await device.launchApp({
    newInstance: true,
    launchArgs: {
      // Disable synchronization initially to help with connection
      detoxEnableSynchronization: 0,
    },
  });
  console.log('✅ App launched successfully');

  // Re-enable synchronization after launch
  await device.enableSynchronization();
});

Before({ timeout: 30000 }, async function (this: DetoxWorld, { pickle }) {
  // Notify Detox that a test is starting
  await detox.onTestStart({
    title: pickle.name,
    fullName: pickle.name,
    status: 'running',
  });

  // Reload the app for each scenario. Synchronisation is suspended around
  // the reload for the same reason BeforeAll launches with it disabled:
  // Detox's idle tracking can latch onto a timer created during bundle
  // evaluation and wait on it forever.
  await device.disableSynchronization();
  await device.reloadReactNative();
  await new Promise(resolve => setTimeout(resolve, 500));
  await device.enableSynchronization();
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
