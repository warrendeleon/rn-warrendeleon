// Configure ts-node to handle TSX files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    jsx: 'react',
  },
});

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
    format: ['progress-bar', 'json:cucumber-report.json', 'html:cucumber-report.html'],

    // Publish results
    publish: false,

    // Parallel execution
    parallel: 1,

    // Retry failed scenarios
    retry: 0,

    // Strict mode (fail on undefined or pending steps)
    strict: true,

    // Fail fast (stop on first failure)
    failFast: false,

    // Dry run (validate without executing)
    dryRun: false,
  },
};
