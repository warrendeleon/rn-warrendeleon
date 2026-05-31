/**
 * Performance Benchmarking Utilities
 *
 * Provides tools for measuring and asserting component render performance.
 * Use these utilities to prevent performance regressions and ensure
 * components meet performance targets.
 */

import { RenderResult } from '@testing-library/react-native';

/**
 * Performance measurement result from benchmarking a render operation.
 */
export interface PerformanceResult {
  /** Arithmetic mean of all render times in milliseconds */
  mean: number;
  /** 95th percentile render time in milliseconds */
  p95: number;
  /** Maximum render time in milliseconds */
  max: number;
  /** Minimum render time in milliseconds */
  min: number;
  /** Standard deviation of render times */
  stdDev: number;
  /** Total number of iterations performed */
  iterations: number;
  /** Individual render times (for analysis) */
  samples: number[];
}

/**
 * Performance thresholds for different component categories.
 * Based on React Native performance best practices.
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Simple components with minimal logic (e.g., Button, Icon) */
  SIMPLE_COMPONENT: 50,
  /** Form inputs with validation (e.g., TextInput, EmailInput) */
  FORM_INPUT: 75,
  /** Medium complexity screens (e.g., LoginScreen, SettingsScreen) */
  SCREEN_SIMPLE: 100,
  /** Complex screens with data (e.g., ProfileScreen with loaded data) */
  SCREEN_COMPLEX: 150,
  /** List rendering with multiple items */
  LIST_SMALL: 100,
  /** Large list rendering (100+ items) */
  LIST_LARGE: 200,
  /** Form validation operations */
  VALIDATION: 50,
} as const;

/**
 * Calculates statistical metrics from an array of samples.
 *
 * @param samples - Array of timing measurements
 * @returns Statistical metrics
 */
function calculateStatistics(samples: number[]): {
  mean: number;
  p95: number;
  max: number;
  min: number;
  stdDev: number;
} {
  if (samples.length === 0) {
    return { mean: 0, p95: 0, max: 0, min: 0, stdDev: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const sum = samples.reduce((acc, val) => acc + val, 0);
  const mean = sum / samples.length;

  // Calculate standard deviation
  const squaredDiffs = samples.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / samples.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  // Calculate p95 (95th percentile)
  const p95Index = Math.floor(samples.length * 0.95);
  const p95 = sorted[Math.min(p95Index, samples.length - 1)] ?? 0;

  return {
    mean,
    p95,
    max: sorted[sorted.length - 1] ?? 0,
    min: sorted[0] ?? 0,
    stdDev,
  };
}

/**
 * Measures the render time of a component over multiple iterations.
 *
 * @param renderFn - Function that renders the component and returns RenderResult
 * @param iterations - Number of render iterations (default: 10)
 * @returns Performance metrics from the benchmark
 *
 * @example
 * ```typescript
 * it('LoginScreen renders under 100ms', () => {
 *   const result = measureRenderTime(
 *     () => renderWithProviders(<LoginScreen />),
 *     10
 *   );
 *   expect(result.mean).toBeLessThan(100);
 * });
 * ```
 */
export async function measureRenderTime(
  renderFn: () => Promise<RenderResult>,
  iterations: number = 10
): Promise<PerformanceResult> {
  const samples: number[] = [];

  // Warm-up render (not counted)
  const warmup = await renderFn();
  await warmup.unmount();

  // Actual measurements - each render is awaited (RNTL 14 render is async)
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const result = await renderFn();
    const endTime = performance.now();

    samples.push(endTime - startTime);
    await result.unmount();
  }

  const stats = calculateStatistics(samples);

  return {
    ...stats,
    iterations,
    samples,
  };
}

/**
 * Measures the time taken for a synchronous operation.
 *
 * @param operation - The operation to measure
 * @param iterations - Number of iterations
 * @returns Performance metrics
 *
 * @example
 * ```typescript
 * it('form validation completes under 50ms', () => {
 *   const result = measureSyncOperation(
 *     () => validateLoginForm({ email: 'test@example.com', password: 'Test123!' }),
 *     20
 *   );
 *   expect(result.mean).toBeLessThan(50);
 * });
 * ```
 */
export function measureSyncOperation(
  operation: () => void,
  iterations: number = 20
): PerformanceResult {
  const samples: number[] = [];

  // Warm-up
  operation();

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    operation();
    const endTime = performance.now();

    samples.push(endTime - startTime);
  }

  const stats = calculateStatistics(samples);

  return {
    ...stats,
    iterations,
    samples,
  };
}

/**
 * Measures the time taken for an async operation.
 *
 * @param operation - The async operation to measure
 * @param iterations - Number of iterations
 * @returns Performance metrics
 */
export async function measureAsyncOperation(
  operation: () => Promise<void>,
  iterations: number = 10
): Promise<PerformanceResult> {
  const samples: number[] = [];

  // Warm-up
  await operation();

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await operation();
    const endTime = performance.now();

    samples.push(endTime - startTime);
  }

  const stats = calculateStatistics(samples);

  return {
    ...stats,
    iterations,
    samples,
  };
}

/**
 * Jest assertion helper for render time threshold.
 *
 * @param ms - Maximum allowed render time in milliseconds
 * @returns Jest custom matcher result
 *
 * @example
 * ```typescript
 * it('renders under threshold', async () => {
 *   const result = await measureRenderTime(() => render(<Component />));
 *   expectRenderUnder(result, 100);
 * });
 * ```
 */
export function expectRenderUnder(result: PerformanceResult, thresholdMs: number): void {
  expect(result.mean).toBeLessThan(thresholdMs);

  // Also check p95 isn't too high (allowing 50% margin)
  expect(result.p95).toBeLessThan(thresholdMs * 1.5);
}

/**
 * Creates a performance test suite for a component.
 *
 * @param componentName - Name of the component being tested
 * @param renderFn - Function that renders the component
 * @param thresholdMs - Maximum allowed render time
 *
 * @example
 * ```typescript
 * describePerformance('Button', () => render(<Button />), 50);
 * ```
 */
export function describePerformance(
  componentName: string,
  renderFn: () => Promise<RenderResult>,
  thresholdMs: number
): void {
  describe(`${componentName} Performance`, () => {
    it(`renders under ${thresholdMs}ms (mean)`, async () => {
      const result = await measureRenderTime(renderFn, 10);
      expect(result.mean).toBeLessThan(thresholdMs);
    });

    it(`95th percentile under ${thresholdMs * 1.5}ms`, async () => {
      const result = await measureRenderTime(renderFn, 10);
      expect(result.p95).toBeLessThan(thresholdMs * 1.5);
    });

    it('has consistent render times (low variance)', async () => {
      const result = await measureRenderTime(renderFn, 10);
      // Standard deviation should be less than 50% of mean
      const coefficientOfVariation = result.stdDev / result.mean;
      expect(coefficientOfVariation).toBeLessThan(0.5);
    });
  });
}

/**
 * Formats a performance result for logging/reporting.
 *
 * @param result - The performance result to format
 * @param componentName - Name for the report
 * @returns Formatted string
 */
export function formatPerformanceReport(result: PerformanceResult, componentName: string): string {
  return [
    `Performance Report: ${componentName}`,
    `  Iterations: ${result.iterations}`,
    `  Mean: ${result.mean.toFixed(2)}ms`,
    `  P95: ${result.p95.toFixed(2)}ms`,
    `  Max: ${result.max.toFixed(2)}ms`,
    `  Min: ${result.min.toFixed(2)}ms`,
    `  Std Dev: ${result.stdDev.toFixed(2)}ms`,
  ].join('\n');
}

/**
 * Regression detection result type
 */
export interface RegressionResult {
  /** Whether a regression was detected */
  hasRegression: boolean;
  /** Percentage change from baseline (negative = improvement) */
  percentChange: number;
  /** Human-readable description of the result */
  details: string;
}

/**
 * Compares two performance results to detect regression.
 *
 * @param baseline - The baseline performance result
 * @param current - The current performance result
 * @param regressionThreshold - Percentage increase that counts as regression (default: 20%)
 * @returns Regression detection result
 */
export function detectRegression(
  baseline: PerformanceResult,
  current: PerformanceResult,
  regressionThreshold: number = 0.2
): RegressionResult {
  const percentChange = (current.mean - baseline.mean) / baseline.mean;
  const hasRegression = percentChange > regressionThreshold;

  const details = hasRegression
    ? `Performance regression detected: ${(percentChange * 100).toFixed(1)}% increase (threshold: ${(regressionThreshold * 100).toFixed(0)}%)`
    : `No regression: ${(percentChange * 100).toFixed(1)}% change`;

  return {
    hasRegression,
    percentChange,
    details,
  };
}

/**
 * Asserts no performance regression from baseline.
 *
 * Use this for automated performance regression testing.
 *
 * @param current - Current performance result
 * @param baseline - Baseline to compare against
 * @param threshold - Maximum allowed regression percentage (default: 20%)
 *
 * @example
 * ```typescript
 * it('does not regress from baseline', () => {
 *   const baseline = { mean: 50, p95: 75, max: 100, min: 30, stdDev: 10, iterations: 10, samples: [] };
 *   const current = measureRenderTime(() => renderWithProviders(<Component />));
 *   assertNoRegression(current, baseline, 0.2);
 * });
 * ```
 */
export function assertNoRegression(
  current: PerformanceResult,
  baseline: PerformanceResult,
  threshold: number = 0.2
): void {
  const result = detectRegression(baseline, current, threshold);
  expect(result.hasRegression).toBe(false);
}

/**
 * CI Performance Threshold Categories
 *
 * Extended thresholds for CI enforcement with more granular categories.
 * These thresholds are used to fail tests when performance regresses.
 */
export const CI_PERFORMANCE_THRESHOLDS = {
  /** Simple components: Button, Icon, Badge */
  SIMPLE_COMPONENT_RENDER: 50,
  /** Form inputs: TextInput, EmailInput, PasswordInput */
  FORM_INPUT_RENDER: 100,
  /** Simple screens: SettingsScreen, LanguageScreen */
  SCREEN_INITIAL_RENDER: 200,
  /** Complex screens: ProfileScreen with data, HomeScreen */
  COMPLEX_SCREEN_RENDER: 500,
  /** List with 100 items */
  LIST_100_ITEMS_RENDER: 300,
  /** Navigation between screens */
  NAVIGATION_TRANSITION: 150,
  /** Form validation operation */
  FORM_VALIDATION: 50,
  /** Redux action dispatch + state update */
  REDUX_STATE_UPDATE: 30,
  /** Async data fetch (mocked) */
  ASYNC_OPERATION: 200,
} as const;

export type CIPerformanceCategory = keyof typeof CI_PERFORMANCE_THRESHOLDS;

/**
 * Asserts that a measured performance value is below the CI threshold.
 *
 * Use this in tests to enforce performance budgets. If the threshold is exceeded,
 * the test will fail with a descriptive error message.
 *
 * @param category - The performance category from CI_PERFORMANCE_THRESHOLDS
 * @param actualMs - The actual measured time in milliseconds
 * @throws Error if actualMs exceeds the threshold for the category
 *
 * @example
 * ```typescript
 * it('LoginScreen renders under threshold', () => {
 *   const { mean } = measureRenderTime(() => renderWithProviders(<LoginScreen />));
 *   assertPerformanceThreshold('SCREEN_INITIAL_RENDER', mean);
 * });
 * ```
 */
export function assertPerformanceThreshold(
  category: CIPerformanceCategory,
  actualMs: number
): void {
  const threshold = CI_PERFORMANCE_THRESHOLDS[category];

  if (actualMs > threshold) {
    throw new Error(
      `Performance regression detected for ${category}: ` +
        `${actualMs.toFixed(2)}ms exceeds threshold of ${threshold}ms`
    );
  }
}

/**
 * Creates a performance budget test for a component.
 *
 * Provides a convenient way to enforce performance budgets in tests.
 *
 * @param componentName - Name for error messages
 * @param category - Performance category
 * @param renderFn - Function that renders and returns render time
 *
 * @example
 * ```typescript
 * describe('Button Performance', () => {
 *   testPerformanceBudget('Button', 'SIMPLE_COMPONENT_RENDER', () => {
 *     const start = performance.now();
 *     renderWithProviders(<Button />);
 *     return performance.now() - start;
 *   });
 * });
 * ```
 */
export function testPerformanceBudget(
  componentName: string,
  category: CIPerformanceCategory,
  measureFn: () => number
): void {
  const threshold = CI_PERFORMANCE_THRESHOLDS[category];

  it(`${componentName} renders under ${threshold}ms budget (${category})`, () => {
    const actualMs = measureFn();
    assertPerformanceThreshold(category, actualMs);
  });
}

/**
 * Batch performance assertion for multiple measurements.
 *
 * Useful for asserting performance across multiple scenarios in a single test.
 *
 * @param measurements - Array of category/measurement pairs
 * @returns Object with pass/fail status and details
 */
export function assertAllPerformanceThresholds(
  measurements: Array<{ category: CIPerformanceCategory; actualMs: number; label?: string }>
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  for (const { category, actualMs, label } of measurements) {
    const threshold = CI_PERFORMANCE_THRESHOLDS[category];
    if (actualMs > threshold) {
      const name = label || category;
      failures.push(`${name}: ${actualMs.toFixed(2)}ms > ${threshold}ms`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Performance thresholds exceeded:\n${failures.map(f => `  - ${f}`).join('\n')}`
    );
  }

  return { passed: true, failures: [] };
}
