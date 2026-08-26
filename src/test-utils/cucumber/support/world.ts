import { IWorldOptions, setDefaultTimeout, setWorldConstructor, World } from '@cucumber/cucumber';
import { device } from 'detox';

// The step definitions wait up to 20s through Detox (waitFor().withTimeout),
// and scroll-while searches can take longer still. Cucumber's default step
// timeout is 5s, which kills those waits before Detox finishes; lift it so
// the runner's cap sits above the longest intended Detox wait.
setDefaultTimeout(60 * 1000);

export interface CustomWorld extends World {
  device: typeof device;
  testID: string | null;
}

export class DetoxWorld extends World implements CustomWorld {
  device: typeof device;
  testID: string | null;

  constructor(options: IWorldOptions) {
    super(options);
    this.device = device;
    this.testID = null;
  }

  setTestID(id: string): void {
    this.testID = id;
  }

  getTestID(): string {
    if (!this.testID) {
      throw new Error('No testID has been set');
    }
    return this.testID;
  }
}

setWorldConstructor(DetoxWorld);
