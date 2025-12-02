/**
 * Shared AsyncStorage mock for tests that need mock control
 *
 * Use this when you need to:
 * - Set specific return values (mockResolvedValue)
 * - Set specific implementations (mockImplementation)
 * - Assert on calls (toHaveBeenCalledWith)
 *
 * Usage:
 * ```typescript
 * import {
 *   mockAsyncStorage,
 *   mockGetItem,
 *   mockSetItem,
 *   setupDefaultAsyncStorageMocks,
 * } from '@app/test-utils/mocks/asyncStorage';
 *
 * jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
 *
 * beforeEach(() => {
 *   jest.clearAllMocks();
 *   setupDefaultAsyncStorageMocks();
 * });
 * ```
 */

// Exported mock functions for test control
export const mockGetItem = jest.fn();
export const mockSetItem = jest.fn();
export const mockRemoveItem = jest.fn();
export const mockGetAllKeys = jest.fn();
export const mockMultiRemove = jest.fn();
export const mockClear = jest.fn();
export const mockMultiGet = jest.fn();
export const mockMultiSet = jest.fn();

/**
 * AsyncStorage mock factory for jest.mock()
 *
 * Uses wrapper functions to delegate to the exported mock functions,
 * which allows the mocks to be configured after jest.mock() hoisting.
 *
 * Note: Named with `mock` prefix for Jest's variable hoisting rules.
 */
export const mockAsyncStorage = {
  __esModule: true,
  default: {
    getItem: (...args: unknown[]) => mockGetItem(...args),
    setItem: (...args: unknown[]) => mockSetItem(...args),
    removeItem: (...args: unknown[]) => mockRemoveItem(...args),
    getAllKeys: (...args: unknown[]) => mockGetAllKeys(...args),
    multiRemove: (...args: unknown[]) => mockMultiRemove(...args),
    clear: (...args: unknown[]) => mockClear(...args),
    multiGet: (...args: unknown[]) => mockMultiGet(...args),
    multiSet: (...args: unknown[]) => mockMultiSet(...args),
  },
};

/**
 * Reset all AsyncStorage mocks to initial state
 * Call this in beforeEach() to ensure clean state between tests
 */
export const resetAsyncStorageMocks = () => {
  mockGetItem.mockReset();
  mockSetItem.mockReset();
  mockRemoveItem.mockReset();
  mockGetAllKeys.mockReset();
  mockMultiRemove.mockReset();
  mockClear.mockReset();
  mockMultiGet.mockReset();
  mockMultiSet.mockReset();
};

/**
 * Set up default resolved values for all mocks
 * Useful as a starting point in beforeEach()
 */
export const setupDefaultAsyncStorageMocks = () => {
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
  mockRemoveItem.mockResolvedValue(undefined);
  mockGetAllKeys.mockResolvedValue([]);
  mockMultiRemove.mockResolvedValue(undefined);
  mockClear.mockResolvedValue(undefined);
  mockMultiGet.mockResolvedValue([]);
  mockMultiSet.mockResolvedValue(undefined);
};
