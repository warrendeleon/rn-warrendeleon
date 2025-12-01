// Configure ts-node to handle TSX files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    jsx: 'react',
  },
});

/**
 * Determines number of parallel workers based on environment and platform
 * - DETOX_PARALLEL=false: Force sequential execution
 * - DETOX_WORKERS=N: Explicit worker count
 * - Default: Platform-based (iOS: 2 local/3 CI, Android: 1 local/2 CI)
 */
const getParallelWorkers = () => {
  // Force sequential if explicitly disabled
  if (process.env.DETOX_PARALLEL === 'false') return 1;

  // Use explicit worker count if provided
  if (process.env.DETOX_WORKERS) {
    return parseInt(process.env.DETOX_WORKERS, 10);
  }

  // Platform-based defaults
  const config = process.env.DETOX_CONFIGURATION || '';
  const isCI = Boolean(process.env.CI);

  if (config.includes('ios')) {
    return isCI ? 3 : 2;
  }
  if (config.includes('android')) {
    return isCI ? 2 : 1;
  }

  // Sequential by default for unknown configurations
  return 1;
};

module.exports = {
  default: {
    // Feature file locations (co-located in __tests__ folders)
    paths: ['src/features/**/__tests__/*.feature'],

    // Step definition and support files
    require: [
      'src/test-utils/cucumber/support/**/*.ts',
      'src/test-utils/cucumber/step-definitions/**/*.{ts,tsx}',
      'src/**/__tests__/**/*.cucumber.{ts,tsx}',
    ],

    // Format output
    format: [
      './src/test-utils/cucumber/formatters/CheckmarkFormatter.js',
      'json:cucumber-report.json',
      'html:cucumber-report.html',
    ],
    formatOptions: {
      colorsEnabled: true,
    },

    // Publish results
    publish: false,

    // Parallel execution - dynamic based on platform and environment
    parallel: getParallelWorkers(),

    // Retry failed scenarios (helps with flaky tests in parallel)
    retry: process.env.DETOX_PARALLEL === 'false' ? 0 : 1,

    // Strict mode (fail on undefined or pending steps)
    strict: true,

    // Fail fast (stop on first failure) - disabled for parallel
    failFast: getParallelWorkers() === 1,

    // Dry run (validate without executing)
    dryRun: false,
  },
};
