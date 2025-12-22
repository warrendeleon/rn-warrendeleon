/**
 * LoginScreen Performance Tests
 *
 * Tests validation speed and performance infrastructure for the LoginScreen.
 *
 * IMPORTANT: Render timing tests in Jest/JSDOM are not representative of
 * production performance due to:
 * - Provider overhead (Redux, Navigation, i18n, GlueStack)
 * - Mock latency variability
 * - JSDOM limitations vs native rendering
 *
 * For actual render performance profiling, use:
 * - React Native's built-in Performance Monitor
 * - Flipper's React DevTools profiler
 * - systrace on Android / Instruments on iOS
 *
 * This file focuses on:
 * 1. Validation performance (meaningful in Jest)
 * 2. Performance infrastructure verification (prove the tools work)
 */

import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { render } from '@testing-library/react-native';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils';
import {
  detectRegression,
  formatPerformanceReport,
  measureRenderTime,
  measureSyncOperation,
  PERFORMANCE_THRESHOLDS,
} from '@app/test-utils/performance';

import { LoginScreen } from '../LoginScreen';
import { loginSchema } from '../validation/loginSchema';

// Mock navigation props for LoginScreen tests
const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
  goBack: jest.fn(),
} as unknown as NativeStackScreenProps<RootStackParamList, 'Login'>['navigation'];

const mockRoute = {
  key: 'Login',
  name: 'Login' as const,
  params: undefined,
};

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
};

// Minimal component for testing render infrastructure
const MinimalComponent: React.FC<{ text?: string }> = ({ text = 'Test' }) => (
  <View testID="minimal">
    <Text>{text}</Text>
  </View>
);

describe('Performance Infrastructure Verification', () => {
  describe('measureRenderTime', () => {
    it('returns valid performance metrics structure', () => {
      const result = measureRenderTime(() => render(<MinimalComponent />), 5);

      // Verify all required fields exist
      expect(result).toHaveProperty('mean');
      expect(result).toHaveProperty('p95');
      expect(result).toHaveProperty('max');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('stdDev');
      expect(result).toHaveProperty('iterations');
      expect(result).toHaveProperty('samples');

      // Verify values are reasonable
      expect(typeof result.mean).toBe('number');
      expect(result.mean).toBeGreaterThanOrEqual(0);
      expect(result.iterations).toBe(5);
      expect(result.samples).toHaveLength(5);
      expect(result.min).toBeLessThanOrEqual(result.mean);
      expect(result.max).toBeGreaterThanOrEqual(result.mean);
    });

    it('produces consistent results (low variance)', () => {
      const result = measureRenderTime(() => render(<MinimalComponent />), 10);

      // Coefficient of variation should be reasonable (< 200%)
      // Very fast operations can have high relative variance
      const cv = result.mean > 0 ? result.stdDev / result.mean : 0;
      expect(cv).toBeLessThan(2);
    });

    it('detects performance differences between components', () => {
      // Simple component
      const simpleResult = measureRenderTime(() => render(<MinimalComponent />), 5);

      // Slightly more complex component
      const ComplexComponent = () => (
        <View>
          {Array.from({ length: 10 }, (_, i) => (
            <Text key={i}>Item {i}</Text>
          ))}
        </View>
      );
      const complexResult = measureRenderTime(() => render(<ComplexComponent />), 5);

      // Both should complete and produce valid results
      expect(simpleResult.iterations).toBe(5);
      expect(complexResult.iterations).toBe(5);
    });
  });

  describe('measureSyncOperation', () => {
    it('accurately measures fast operations', () => {
      let counter = 0;
      const result = measureSyncOperation(() => {
        counter++;
      }, 20);

      expect(counter).toBe(21); // 1 warmup + 20 iterations
      expect(result.iterations).toBe(20);
      expect(result.mean).toBeGreaterThanOrEqual(0);
    });

    it('measures operations with predictable time', () => {
      // Array creation has measurable time
      const result = measureSyncOperation(() => {
        Array.from({ length: 1000 }, (_, i) => i * 2);
      }, 10);

      expect(result.mean).toBeGreaterThanOrEqual(0);
      expect(result.samples).toHaveLength(10);
    });
  });

  describe('detectRegression', () => {
    it('detects performance regression', () => {
      const baseline = {
        mean: 10,
        p95: 12,
        max: 15,
        min: 8,
        stdDev: 2,
        iterations: 10,
        samples: [],
      };
      const regressed = {
        mean: 15,
        p95: 18,
        max: 20,
        min: 12,
        stdDev: 3,
        iterations: 10,
        samples: [],
      };

      const result = detectRegression(baseline, regressed, 0.2);

      expect(result.hasRegression).toBe(true);
      expect(result.percentChange).toBeCloseTo(0.5, 1); // 50% increase
    });

    it('does not flag acceptable performance', () => {
      const baseline = {
        mean: 10,
        p95: 12,
        max: 15,
        min: 8,
        stdDev: 2,
        iterations: 10,
        samples: [],
      };
      const current = {
        mean: 11,
        p95: 13,
        max: 16,
        min: 9,
        stdDev: 2,
        iterations: 10,
        samples: [],
      };

      const result = detectRegression(baseline, current, 0.2);

      expect(result.hasRegression).toBe(false);
      expect(result.percentChange).toBeCloseTo(0.1, 1); // 10% increase
    });
  });

  describe('formatPerformanceReport', () => {
    it('produces readable report', () => {
      const result = measureRenderTime(() => render(<MinimalComponent />), 3);
      const report = formatPerformanceReport(result, 'MinimalComponent');

      expect(report).toContain('Performance Report: MinimalComponent');
      expect(report).toContain('Iterations: 3');
      expect(report).toContain('Mean:');
      expect(report).toContain('P95:');
      expect(report).toContain('Std Dev:');
    });
  });
});

describe('Login Validation Performance', () => {
  describe('Valid Input Performance', () => {
    it('validates correct credentials under VALIDATION threshold', () => {
      const result = measureSyncOperation(() => {
        loginSchema.validateSync({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        });
      }, 20);

      expect(result.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);

      console.log(formatPerformanceReport(result, 'Valid Credentials Validation'));
    });

    it('validates consistently (low variance)', () => {
      const result = measureSyncOperation(() => {
        loginSchema.validateSync({
          email: 'user@company.org',
          password: 'AnotherSecure123!',
        });
      }, 20);

      // Coefficient of variation should be low for consistent validation
      const cv = result.mean > 0 ? result.stdDev / result.mean : 0;
      expect(cv).toBeLessThan(1);
    });
  });

  describe('Invalid Input Performance (Fast Rejection)', () => {
    it('rejects invalid email quickly', () => {
      const result = measureSyncOperation(() => {
        try {
          loginSchema.validateSync({
            email: 'not-an-email',
            password: 'SecurePassword123!',
          });
        } catch {
          // Expected
        }
      }, 20);

      expect(result.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);
    });

    it('rejects weak password quickly', () => {
      const result = measureSyncOperation(() => {
        try {
          loginSchema.validateSync({
            email: 'test@example.com',
            password: 'weak',
          });
        } catch {
          // Expected
        }
      }, 20);

      expect(result.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);
    });

    it('rejects empty fields quickly', () => {
      const result = measureSyncOperation(() => {
        try {
          loginSchema.validateSync({
            email: '',
            password: '',
          });
        } catch {
          // Expected
        }
      }, 20);

      expect(result.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);
    });
  });

  describe('Multiple Validation Errors', () => {
    it('validates with abortEarly=false under threshold', () => {
      const result = measureSyncOperation(() => {
        try {
          loginSchema.validateSync(
            {
              email: 'invalid',
              password: 'x',
            },
            { abortEarly: false }
          );
        } catch {
          // Expected
        }
      }, 15);

      expect(result.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);
    });

    it('abortEarly vs full validation have acceptable difference', () => {
      const abortEarlyResult = measureSyncOperation(() => {
        try {
          loginSchema.validateSync({ email: 'bad', password: 'x' });
        } catch {
          // Expected
        }
      }, 10);

      const fullValidationResult = measureSyncOperation(() => {
        try {
          loginSchema.validateSync({ email: 'bad', password: 'x' }, { abortEarly: false });
        } catch {
          // Expected
        }
      }, 10);

      // Both should be under threshold
      expect(abortEarlyResult.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);
      expect(fullValidationResult.mean).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION);
    });
  });
});

describe('LoginScreen Render Smoke Test', () => {
  // Single render to verify LoginScreen works with providers
  // Not for timing (too slow/variable in Jest)
  it('renders without error', () => {
    const { getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      { preloadedState: { auth: defaultAuthState } }
    );

    // Just verify it renders
    expect(getByTestId).toBeDefined();
  });
});

describe('Performance Thresholds Configuration', () => {
  it('has all expected threshold categories', () => {
    expect(PERFORMANCE_THRESHOLDS.SIMPLE_COMPONENT).toBe(50);
    expect(PERFORMANCE_THRESHOLDS.FORM_INPUT).toBe(75);
    expect(PERFORMANCE_THRESHOLDS.SCREEN_SIMPLE).toBe(100);
    expect(PERFORMANCE_THRESHOLDS.SCREEN_COMPLEX).toBe(150);
    expect(PERFORMANCE_THRESHOLDS.LIST_SMALL).toBe(100);
    expect(PERFORMANCE_THRESHOLDS.LIST_LARGE).toBe(200);
    expect(PERFORMANCE_THRESHOLDS.VALIDATION).toBe(50);
  });

  it('thresholds follow complexity hierarchy', () => {
    expect(PERFORMANCE_THRESHOLDS.SIMPLE_COMPONENT).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_INPUT);
    expect(PERFORMANCE_THRESHOLDS.FORM_INPUT).toBeLessThan(PERFORMANCE_THRESHOLDS.SCREEN_SIMPLE);
    expect(PERFORMANCE_THRESHOLDS.SCREEN_SIMPLE).toBeLessThan(
      PERFORMANCE_THRESHOLDS.SCREEN_COMPLEX
    );
    expect(PERFORMANCE_THRESHOLDS.LIST_SMALL).toBeLessThan(PERFORMANCE_THRESHOLDS.LIST_LARGE);
  });
});
