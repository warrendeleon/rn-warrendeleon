# TASK-285: Save Token to Supabase

**ID**: TASK-285 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-050](../stories/US-050-fcm-setup-permission-handling.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create service to save and manage FCM tokens in Supabase database. Support token registration, updates, deletion, and device management. Ensure tokens are always up-to-date for reliable push notification delivery.

---

## Acceptance Criteria

- [ ] Token service created in `src/services/notifications/tokenService.ts`
- [ ] Save FCM token to Supabase
- [ ] Update token on refresh
- [ ] Delete token on logout
- [ ] Handle device information (platform, version)
- [ ] Custom REST API integration (no SDK)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Token Service

```typescript
// src/services/notifications/tokenService.ts

import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getAccessToken } from '../../utils/storage/secureStorage';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

/**
 * FCM Token record schema
 */
const FCMTokenSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  fcm_token: z.string(),
  device_id: z.string(),
  device_platform: z.enum(['ios', 'android']),
  device_model: z.string().nullable(),
  os_version: z.string().nullable(),
  app_version: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  last_used_at: z.string().nullable(),
});

type FCMToken = z.infer<typeof FCMTokenSchema>;

const FCMTokensResponseSchema = z.array(FCMTokenSchema);

/**
 * Get device information
 */
const getDeviceInfo = async () => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceModel = DeviceInfo.getModel();
    const osVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();

    return {
      device_id: deviceId,
      device_platform: Platform.OS as 'ios' | 'android',
      device_model: deviceModel,
      os_version: osVersion,
      app_version: appVersion,
    };
  } catch (error) {
    console.error('Failed to get device info:', error);
    throw new Error('Failed to get device information');
  }
};

/**
 * Save FCM token to Supabase
 */
export const saveTokenToSupabase = async (fcmToken: string): Promise<FCMToken> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const deviceInfo = await getDeviceInfo();

    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/fcm_tokens`,
      {
        fcm_token: fcmToken,
        ...deviceInfo,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation,resolution=merge-duplicates',
        },
        timeout: 10000,
      }
    );

    const tokens = FCMTokensResponseSchema.parse(response.data);
    return tokens[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to save FCM token');
    }

    throw error;
  }
};

/**
 * Update FCM token in Supabase
 */
export const updateTokenInSupabase = async (
  oldToken: string,
  newToken: string
): Promise<FCMToken> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const deviceInfo = await getDeviceInfo();

    const response = await axios.patch(
      `${SUPABASE_URL}/rest/v1/fcm_tokens`,
      {
        fcm_token: newToken,
        ...deviceInfo,
        updated_at: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        params: {
          fcm_token: `eq.${oldToken}`,
        },
        timeout: 10000,
      }
    );

    const tokens = FCMTokensResponseSchema.parse(response.data);
    return tokens[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      if (axiosError.response?.status === 404) {
        // Token doesn't exist, save as new
        return await saveTokenToSupabase(newToken);
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to update FCM token');
    }

    throw error;
  }
};

/**
 * Delete FCM token from Supabase
 */
export const deleteTokenFromSupabase = async (fcmToken: string): Promise<void> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    await axios.delete(`${SUPABASE_URL}/rest/v1/fcm_tokens`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      params: {
        fcm_token: `eq.${fcmToken}`,
      },
      timeout: 10000,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      if (axiosError.response?.status === 404) {
        // Token doesn't exist, ignore
        return;
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to delete FCM token');
    }

    throw error;
  }
};

/**
 * Delete all tokens for current device
 */
export const deleteAllDeviceTokens = async (): Promise<void> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const deviceInfo = await getDeviceInfo();

    await axios.delete(`${SUPABASE_URL}/rest/v1/fcm_tokens`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      params: {
        device_id: `eq.${deviceInfo.device_id}`,
      },
      timeout: 10000,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to delete device tokens');
    }

    throw error;
  }
};

/**
 * Update last used timestamp
 */
export const updateTokenLastUsed = async (fcmToken: string): Promise<void> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/fcm_tokens`,
      {
        last_used_at: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        params: {
          fcm_token: `eq.${fcmToken}`,
        },
        timeout: 10000,
      }
    );
  } catch (error) {
    // Silently fail for last_used_at updates
    console.error('Failed to update token last used:', error);
  }
};

/**
 * Get all tokens for current user
 */
export const getUserTokens = async (): Promise<FCMToken[]> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(`${SUPABASE_URL}/rest/v1/fcm_tokens`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      timeout: 10000,
    });

    const tokens = FCMTokensResponseSchema.parse(response.data);
    return tokens;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to get user tokens');
    }

    throw error;
  }
};
```

---

### Usage Hook

```typescript
// src/hooks/notifications/useTokenManagement.ts

import { useEffect, useCallback } from 'react';
import {
  saveTokenToSupabase,
  updateTokenInSupabase,
  deleteTokenFromSupabase,
} from '../../services/notifications/tokenService';
import { getFCMToken, onTokenRefresh } from '../../services/notifications/fcmService';

export interface UseTokenManagementReturn {
  registerToken: () => Promise<void>;
  unregisterToken: () => Promise<void>;
}

export const useTokenManagement = (): UseTokenManagementReturn => {
  /**
   * Register token on mount
   */
  useEffect(() => {
    const register = async () => {
      try {
        const token = await getFCMToken();
        await saveTokenToSupabase(token);
      } catch (error) {
        console.error('Failed to register FCM token:', error);
      }
    };

    register();
  }, []);

  /**
   * Listen for token refresh
   */
  useEffect(() => {
    const unsubscribe = onTokenRefresh(async newToken => {
      try {
        const oldToken = await getFCMToken();
        await updateTokenInSupabase(oldToken, newToken);
      } catch (error) {
        console.error('Failed to update FCM token:', error);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Register token manually
   */
  const registerToken = useCallback(async () => {
    try {
      const token = await getFCMToken();
      await saveTokenToSupabase(token);
    } catch (error) {
      console.error('Failed to register token:', error);
      throw error;
    }
  }, []);

  /**
   * Unregister token
   */
  const unregisterToken = useCallback(async () => {
    try {
      const token = await getFCMToken();
      await deleteTokenFromSupabase(token);
    } catch (error) {
      console.error('Failed to unregister token:', error);
      throw error;
    }
  }, []);

  return {
    registerToken,
    unregisterToken,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/notifications/__tests__/tokenService.test.ts

import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import {
  saveTokenToSupabase,
  updateTokenInSupabase,
  deleteTokenFromSupabase,
  deleteAllDeviceTokens,
  getUserTokens,
} from '../tokenService';
import * as secureStorage from '../../../utils/storage/secureStorage';

jest.mock('axios');
jest.mock('react-native-device-info');
jest.mock('../../../utils/storage/secureStorage');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockDeviceInfo = DeviceInfo as jest.Mocked<typeof DeviceInfo>;
const mockGetAccessToken = secureStorage.getAccessToken as jest.MockedFunction<
  typeof secureStorage.getAccessToken
>;

describe('tokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('mock-access-token');

    mockDeviceInfo.getUniqueId.mockResolvedValue('device-123');
    mockDeviceInfo.getModel.mockReturnValue('iPhone 12');
    mockDeviceInfo.getSystemVersion.mockReturnValue('14.5');
    mockDeviceInfo.getVersion.mockReturnValue('1.0.0');
  });

  describe('saveTokenToSupabase', () => {
    it('should save FCM token successfully', async () => {
      const mockToken = {
        id: 'token-1',
        user_id: 'user-1',
        fcm_token: 'fcm-token-123',
        device_id: 'device-123',
        device_platform: 'ios',
        device_model: 'iPhone 12',
        os_version: '14.5',
        app_version: '1.0.0',
        created_at: '2025-01-21T10:00:00Z',
        updated_at: '2025-01-21T10:00:00Z',
        last_used_at: null,
      };

      mockAxios.post.mockResolvedValue({ data: [mockToken] });

      const result = await saveTokenToSupabase('fcm-token-123');

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/fcm_tokens'),
        expect.objectContaining({
          fcm_token: 'fcm-token-123',
          device_id: 'device-123',
          device_platform: 'ios',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        })
      );

      expect(result).toEqual(mockToken);
    });

    it('should throw error when not authenticated', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      await expect(saveTokenToSupabase('fcm-token-123')).rejects.toThrow('Not authenticated');
    });

    it('should throw error on save failure', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      });

      await expect(saveTokenToSupabase('fcm-token-123')).rejects.toThrow();
    });
  });

  describe('updateTokenInSupabase', () => {
    it('should update FCM token successfully', async () => {
      const mockToken = {
        id: 'token-1',
        user_id: 'user-1',
        fcm_token: 'new-fcm-token-456',
        device_id: 'device-123',
        device_platform: 'ios',
        device_model: 'iPhone 12',
        os_version: '14.5',
        app_version: '1.0.0',
        created_at: '2025-01-21T10:00:00Z',
        updated_at: '2025-01-21T10:05:00Z',
        last_used_at: null,
      };

      mockAxios.patch.mockResolvedValue({ data: [mockToken] });

      const result = await updateTokenInSupabase('old-fcm-token-123', 'new-fcm-token-456');

      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/fcm_tokens'),
        expect.objectContaining({
          fcm_token: 'new-fcm-token-456',
        }),
        expect.objectContaining({
          params: { fcm_token: 'eq.old-fcm-token-123' },
        })
      );

      expect(result).toEqual(mockToken);
    });

    it('should save as new token if old token not found', async () => {
      mockAxios.patch.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });

      const mockNewToken = {
        id: 'token-2',
        user_id: 'user-1',
        fcm_token: 'new-fcm-token-456',
        device_id: 'device-123',
        device_platform: 'ios',
        device_model: 'iPhone 12',
        os_version: '14.5',
        app_version: '1.0.0',
        created_at: '2025-01-21T10:00:00Z',
        updated_at: '2025-01-21T10:00:00Z',
        last_used_at: null,
      };

      mockAxios.post.mockResolvedValue({ data: [mockNewToken] });

      const result = await updateTokenInSupabase('old-fcm-token-123', 'new-fcm-token-456');

      expect(mockAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockNewToken);
    });
  });

  describe('deleteTokenFromSupabase', () => {
    it('should delete FCM token successfully', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await deleteTokenFromSupabase('fcm-token-123');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/fcm_tokens'),
        expect.objectContaining({
          params: { fcm_token: 'eq.fcm-token-123' },
        })
      );
    });

    it('should ignore 404 errors', async () => {
      mockAxios.delete.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });

      await expect(deleteTokenFromSupabase('fcm-token-123')).resolves.not.toThrow();
    });
  });

  describe('deleteAllDeviceTokens', () => {
    it('should delete all tokens for current device', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await deleteAllDeviceTokens();

      expect(mockAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/fcm_tokens'),
        expect.objectContaining({
          params: { device_id: 'eq.device-123' },
        })
      );
    });
  });

  describe('getUserTokens', () => {
    it('should get all tokens for current user', async () => {
      const mockTokens = [
        {
          id: 'token-1',
          user_id: 'user-1',
          fcm_token: 'fcm-token-123',
          device_id: 'device-123',
          device_platform: 'ios',
          device_model: 'iPhone 12',
          os_version: '14.5',
          app_version: '1.0.0',
          created_at: '2025-01-21T10:00:00Z',
          updated_at: '2025-01-21T10:00:00Z',
          last_used_at: null,
        },
      ];

      mockAxios.get.mockResolvedValue({ data: mockTokens });

      const result = await getUserTokens();

      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/fcm_tokens'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        })
      );

      expect(result).toEqual(mockTokens);
    });
  });
});
```

---

## Dependencies

- Axios (HTTP client)
- Zod (runtime validation)
- react-native-device-info (device information)
- secureStorage utility (access token retrieval)

---

## Definition of Done

- [ ] Token service implemented
- [ ] Save token working
- [ ] Update token working
- [ ] Delete token working
- [ ] Device information captured
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-050](../stories/US-050-fcm-setup-permission-handling.md), [TASK-283](TASK-283-fcm-service-setup.md), [TASK-284](TASK-284-permission-handling.md)
