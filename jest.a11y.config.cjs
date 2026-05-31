// Accessibility test config: the same harness as jest.config.cjs, but it runs only the
// *.a11y.rntl test files and adds the reporter that writes accessibility-report.md. The a11y
// tests still run as part of the normal `yarn test`; this config is the on-demand run that also
// produces the WCAG coverage report, so the main suite stays free of report-writing side effects.
const base = require('./jest.config.cjs');

module.exports = {
  ...base,
  testMatch: ['**/__tests__/**/*.a11y.rntl.[jt]s?(x)'],
  reporters: ['default', '<rootDir>/src/test-utils/a11y/reporter.cjs'],
};
