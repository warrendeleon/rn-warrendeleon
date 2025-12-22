export * from './fixtures';
export { renderWithProviders } from './renderWithProviders';

// Test constants
export {
  HTTP_STATUS,
  INVALID_CREDENTIALS,
  MOCK_TOKENS,
  MOCK_UUIDS,
  SECURITY_TEST_VALUES,
  TEST_CREDENTIALS,
  TEST_DEBOUNCE,
  TEST_ERROR_MESSAGES,
  TEST_LIMITS,
  TEST_TIMEOUTS,
  TOKEN_EXPIRY,
  TOUCH_TARGETS,
} from './constants';

// Test helper functions
export type { MockStorage, WaitOptions } from './helpers';
export {
  createMockStorage,
  DEFAULT_WAIT_OPTIONS,
  expectAsyncError,
  expectAsyncSuccess,
  expectButtonBusy,
  expectButtonDisabled,
  expectElementVisible,
  expectErrorMessage,
  expectFieldValidationState,
  expectNavigatedTo,
  expectRendersSuccessfully,
  expectStoryRenders,
  expectTextVisible,
  expectValidationError,
  fillField,
  fillFields,
  fillFormAndSubmit,
  pressAndExpectNavigation,
  submitForm,
  waitForElement,
  waitForElementToDisappear,
  waitForLoadingComplete,
  waitForText,
  waitForWithTimeout,
} from './helpers';

// MSW utilities for testing
export { errorHandlers, handlers, offlineHandlers, timeoutHandlers } from './msw/handlers';
export * from './msw/mockData';
export { server } from './msw/server';

// MSW debug handlers for request/response logging
export type { RequestLogEntry, RequestLogger, ResponseLogEntry } from './msw/debugHandlers';
export {
  createDelayHandler,
  createFlakyHandler,
  createRequestCounter,
  createRequestLogger,
  enableMSWLogging,
  formatStatus,
} from './msw/debugHandlers';

// Test factories for creating mock data
export * from './factories';

// Navigation mocks for screen tests
export {
  createMockScreenProps,
  getMockNavigation,
  getMockRoute,
  mockNavigation,
  navigationMock,
  resetNavigationMocks,
} from './mocks/react-navigation';

// Accessibility testing utilities (EAA compliance)
export {
  calculateContrastRatio,
  CONTRAST_RATIOS,
  expectAccessibilityComplete,
  expectAccessibilityProps,
  expectCanReceiveFocus,
  expectColorContrast,
  expectConsistentNavigation,
  expectErrorIdentification,
  expectFocusOrder,
  expectLabelInstructions,
  expectLiveRegionContent,
  expectMinHitSlop,
  expectMinTouchTarget,
  expectNoFlashing,
  expectNoTimingDependence,
  expectPauseStopHide,
  expectScreenReaderAnnouncement,
  hasAccessibilityProps,
  TOUCH_TARGET_SIZES,
} from './accessibility';

// Performance testing utilities
export type { CIPerformanceCategory, PerformanceResult, RegressionResult } from './performance';
export {
  assertAllPerformanceThresholds,
  assertNoRegression,
  assertPerformanceThreshold,
  CI_PERFORMANCE_THRESHOLDS,
  describePerformance,
  detectRegression,
  expectRenderUnder,
  formatPerformanceReport,
  measureAsyncOperation,
  measureRenderTime,
  measureSyncOperation,
  PERFORMANCE_THRESHOLDS,
  testPerformanceBudget,
} from './performance';

// Snapshot testing utilities
export type { SnapshotOptions, SnapshotSerializer } from './snapshot';
export {
  cleanSnapshotProps,
  createSnapshotSerializer,
  describeSnapshots,
  expectMatchesSnapshot,
  expectSnapshotMatch,
  instanceToSnapshot,
  SNAPSHOT_EXCLUDED_PROPS,
  snapshotConfig,
} from './snapshot';

// Form input test helper (reduces duplication in EmailInput, PasswordInput, PhoneInput tests)
export type { FormInputTestConfig } from './formInputTestHelper';
export { testFormInputComponent } from './formInputTestHelper';
