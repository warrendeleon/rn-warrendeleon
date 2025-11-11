import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { device } from 'detox';

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
