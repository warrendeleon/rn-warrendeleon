import detox from 'detox/internals';

/**
 * Detox setup for Cucumber
 * Initializes Detox for E2E testing with optional parallel worker support
 */
export const setupDetox = async (workerId: string = '0'): Promise<void> => {
  const config = process.env.DETOX_CONFIGURATION;
  if (!config) {
    throw new Error(
      'DETOX_CONFIGURATION environment variable is not set. Please set it to your desired configuration (e.g., ios.sim.debug)'
    );
  }
  console.log(`🚀 Starting Detox E2E tests with configuration: ${config}, worker: ${workerId}`);
  await detox.init({
    workerId: `cucumber-worker-${workerId}`,
  });
};

export const cleanupDetox = async (): Promise<void> => {
  console.log('✅ Detox E2E tests completed');
  await detox.cleanup();
};

export { detox };
