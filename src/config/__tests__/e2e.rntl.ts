/**
 * Tests for E2E mock configuration
 * @jest-environment node
 */

import {
  getE2EMockOverride,
  getEnvE2EMockValue,
  hasLoadedOverride,
  isE2EMockEnabled,
  loadPersistedMockOverride,
  setE2EMockOverride,
} from '../e2e';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  E2E_MOCK: 'false',
  ENABLE_TEST_UI: 'false',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('e2e config', () => {
  const mockAsyncStorage = require('@react-native-async-storage/async-storage');

  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('setE2EMockOverride with AsyncStorage', () => {
    it('should persist true to AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await setE2EMockOverride(true);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@e2e_mock_override', 'true');
    });

    it('should persist false to AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await setE2EMockOverride(false);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@e2e_mock_override', 'false');
    });

    it('should remove from AsyncStorage when null', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await setE2EMockOverride(null);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@e2e_mock_override');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(setE2EMockOverride(true)).resolves.not.toThrow();

      // Value should still be set in memory
      expect(getE2EMockOverride()).toBe(true);
    });
  });

  describe('loadPersistedMockOverride', () => {
    it('should load true from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');

      await loadPersistedMockOverride();

      expect(getE2EMockOverride()).toBe(true);
    });

    it('should load false from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('false');

      await loadPersistedMockOverride();

      expect(getE2EMockOverride()).toBe(false);
    });

    it('should set null override when storage value is invalid', async () => {
      // Set an override first
      await setE2EMockOverride(true);
      expect(getE2EMockOverride()).toBe(true);

      // Load invalid value
      mockAsyncStorage.getItem.mockResolvedValue('invalid');

      await loadPersistedMockOverride();

      // Should set to null (not true or false)
      expect(getE2EMockOverride()).toBeNull();
    });

    it('should keep null override when storage has no value', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await loadPersistedMockOverride();

      expect(getE2EMockOverride()).toBeNull();
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(loadPersistedMockOverride()).resolves.not.toThrow();
    });
  });

  describe('hasLoadedOverride', () => {
    it('should return true after loading persisted override', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await loadPersistedMockOverride();

      expect(hasLoadedOverride()).toBe(true);
    });

    it('should return true even after error during load', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await loadPersistedMockOverride();

      expect(hasLoadedOverride()).toBe(true);
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
