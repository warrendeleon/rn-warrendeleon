// Import common steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.steps';

import { When } from '@cucumber/cucumber';
import { by, device, element } from 'detox';

import { DetoxWorld } from '@app/test-utils/cucumber/support/world';

// Navigation step (should ideally be in common.steps.tsx)
When('I go back', async function (this: DetoxWorld) {
  // Navigate back using device back button (Android) or header back button (iOS)
  if (device.getPlatform() === 'android') {
    await device.pressBack();
  } else {
    // iOS: Find the back button by traits (first button in navigation bar)
    await element(by.traits(['button']).and(by.label('Back'))).tap();
  }
});
