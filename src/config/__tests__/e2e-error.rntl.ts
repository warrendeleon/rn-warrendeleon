/**
 * Tests for E2E error configuration
 * @jest-environment node
 */

import {
  createE2EError,
  type E2EErrorMode,
  getE2EErrorConfig,
  getRetryAttempts,
  incrementRetryAttempts,
  resetRetryAttempts,
  shouldEndpointFail,
} from '../e2e-error';

// Mock e2e module
jest.mock('../e2e', () => ({
  isE2EMockEnabled: jest.fn(),
}));

// Mock react-native-launch-arguments
jest.mock('react-native-launch-arguments', () => ({
  LaunchArguments: {
    value: jest.fn(),
  },
}));

import { LaunchArguments } from 'react-native-launch-arguments';

import { isE2EMockEnabled } from '../e2e';

const mockIsE2EMockEnabled = isE2EMockEnabled as jest.MockedFunction<typeof isE2EMockEnabled>;
const mockLaunchArgumentsValue = LaunchArguments.value as jest.MockedFunction<
  typeof LaunchArguments.value
>;

describe('e2e-error config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRetryAttempts();
    mockIsE2EMockEnabled.mockReturnValue(false);
    mockLaunchArgumentsValue.mockReturnValue({});
  });

  describe('retry attempts tracking', () => {
    it('should start with 0 retry attempts', () => {
      expect(getRetryAttempts()).toBe(0);
    });

    it('should increment retry attempts', () => {
      incrementRetryAttempts();
      expect(getRetryAttempts()).toBe(1);

      incrementRetryAttempts();
      expect(getRetryAttempts()).toBe(2);
    });

    it('should reset retry attempts to 0', () => {
      incrementRetryAttempts();
      incrementRetryAttempts();
      expect(getRetryAttempts()).toBe(2);

      resetRetryAttempts();
      expect(getRetryAttempts()).toBe(0);
    });
  });

  describe('getE2EErrorConfig', () => {
    it('should return disabled config when E2E mock is disabled', () => {
      mockIsE2EMockEnabled.mockReturnValue(false);

      const config = getE2EErrorConfig();

      expect(config).toEqual({
        enabled: false,
        errorMode: 'none',
        errorEndpoint: 'all',
      });
    });

    it('should return config from launch arguments when E2E mock is enabled', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockReturnValue({
        errorMode: 'network',
        errorEndpoint: 'profile',
      });

      const config = getE2EErrorConfig();

      expect(config).toEqual({
        enabled: true,
        errorMode: 'network',
        errorEndpoint: 'profile',
      });
    });

    it('should return default values when launch arguments are empty', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockReturnValue({});

      const config = getE2EErrorConfig();

      expect(config).toEqual({
        enabled: false,
        errorMode: 'none',
        errorEndpoint: 'all',
      });
    });

    it('should handle launch arguments error gracefully', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockImplementation(() => {
        throw new Error('Launch arguments not available');
      });

      const config = getE2EErrorConfig();

      expect(config).toEqual({
        enabled: false,
        errorMode: 'none',
        errorEndpoint: 'all',
      });
    });

    it.each([
      ['network', true],
      ['server-500', true],
      ['not-found-404', true],
      ['timeout', true],
      ['none', false],
    ] as [E2EErrorMode, boolean][])(
      'should set enabled=%s for errorMode=%s',
      (errorMode, expectedEnabled) => {
        mockIsE2EMockEnabled.mockReturnValue(true);
        mockLaunchArgumentsValue.mockReturnValue({ errorMode });

        const config = getE2EErrorConfig();

        expect(config.enabled).toBe(expectedEnabled);
        expect(config.errorMode).toBe(errorMode);
      }
    );
  });

  describe('shouldEndpointFail', () => {
    it('should return false when error simulation is disabled', () => {
      mockIsE2EMockEnabled.mockReturnValue(false);

      expect(shouldEndpointFail('profile')).toBe(false);
      expect(shouldEndpointFail('education')).toBe(false);
      expect(shouldEndpointFail('workExperience')).toBe(false);
    });

    it('should return true for all endpoints when errorEndpoint is "all"', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockReturnValue({
        errorMode: 'network',
        errorEndpoint: 'all',
      });

      expect(shouldEndpointFail('profile')).toBe(true);
      expect(shouldEndpointFail('education')).toBe(true);
      expect(shouldEndpointFail('workExperience')).toBe(true);
    });

    it('should return true only for matching endpoint', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockReturnValue({
        errorMode: 'network',
        errorEndpoint: 'profile',
      });

      expect(shouldEndpointFail('profile')).toBe(true);
      expect(shouldEndpointFail('education')).toBe(false);
      expect(shouldEndpointFail('workExperience')).toBe(false);
    });

    it('should return false after retry attempts', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockReturnValue({
        errorMode: 'network',
        errorEndpoint: 'all',
      });

      expect(shouldEndpointFail('profile')).toBe(true);

      incrementRetryAttempts();

      expect(shouldEndpointFail('profile')).toBe(false);
    });
  });

  describe('createE2EError', () => {
    it('should return null when error simulation is disabled', () => {
      mockIsE2EMockEnabled.mockReturnValue(false);

      expect(createE2EError()).toBeNull();
    });

    it('should return null for errorMode "none"', () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      mockLaunchArgumentsValue.mockReturnValue({ errorMode: 'none' });

      expect(createE2EError()).toBeNull();
    });

    it.each([
      ['network', 'Network request failed'],
      ['server-500', 'Internal server error'],
      ['not-found-404', 'Resource not found'],
      ['timeout', 'Request timeout'],
    ] as [E2EErrorMode, string][])(
      'should create error with message for mode %s',
      (errorMode, expectedMessage) => {
        mockIsE2EMockEnabled.mockReturnValue(true);
        mockLaunchArgumentsValue.mockReturnValue({ errorMode });

        const error = createE2EError();

        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toBe(expectedMessage);
      }
    );
  });
});
