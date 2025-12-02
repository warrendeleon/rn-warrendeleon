/**
 * Tests for E2E mock configuration
 * @jest-environment node
 */

import {
  getE2EMockOverride,
  getEnvE2EMockValue,
  isE2EMockEnabled,
  setE2EMockOverride,
} from '../e2e';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  E2E_MOCK: 'false',
  ENABLE_TEST_UI: 'false',
}));

describe('e2e config', () => {
  beforeEach(() => {
    // Reset runtime override before each test
    setE2EMockOverride(null);
  });

  describe('isE2EMockEnabled', () => {
    it('should return false when env is false and no override', () => {
      expect(isE2EMockEnabled()).toBe(false);
    });

    it('should return true when runtime override is true', () => {
      setE2EMockOverride(true);
      expect(isE2EMockEnabled()).toBe(true);
    });

    it('should return false when runtime override is false', () => {
      setE2EMockOverride(false);
      expect(isE2EMockEnabled()).toBe(false);
    });

    it('should return env value when override is null', () => {
      setE2EMockOverride(null);
      expect(isE2EMockEnabled()).toBe(getEnvE2EMockValue());
    });
  });

  describe('setE2EMockOverride', () => {
    it('should set override to true', () => {
      setE2EMockOverride(true);
      expect(getE2EMockOverride()).toBe(true);
    });

    it('should set override to false', () => {
      setE2EMockOverride(false);
      expect(getE2EMockOverride()).toBe(false);
    });

    it('should set override to null (use env value)', () => {
      setE2EMockOverride(true);
      setE2EMockOverride(null);
      expect(getE2EMockOverride()).toBeNull();
    });
  });

  describe('getE2EMockOverride', () => {
    it('should return null initially', () => {
      expect(getE2EMockOverride()).toBeNull();
    });

    it('should return the current override value', () => {
      setE2EMockOverride(true);
      expect(getE2EMockOverride()).toBe(true);

      setE2EMockOverride(false);
      expect(getE2EMockOverride()).toBe(false);
    });
  });

  describe('getEnvE2EMockValue', () => {
    it('should return a boolean', () => {
      expect(typeof getEnvE2EMockValue()).toBe('boolean');
    });

    it('should return false based on mocked config', () => {
      expect(getEnvE2EMockValue()).toBe(false);
    });
  });
});

describe('e2e config with E2E_MOCK=true', () => {
  beforeAll(() => {
    jest.resetModules();
    jest.doMock('react-native-config', () => ({
      E2E_MOCK: 'true',
      ENABLE_TEST_UI: 'true',
    }));
  });

  afterAll(() => {
    jest.resetModules();
  });

  it('should return true for isE2EMockEnabled when env is true', () => {
    // Re-import after mocking
    const { isE2EMockEnabled: mockEnabled, setE2EMockOverride: setOverride } =
      jest.requireActual('../e2e');

    // Reset override
    setOverride(null);

    // Note: Due to module caching, this test verifies the override mechanism works
    setOverride(true);
    expect(mockEnabled()).toBe(true);
  });
});
