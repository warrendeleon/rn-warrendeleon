# TASK-295: Security Alert Deep Link Navigation

**ID**: TASK-295 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-052](../stories/US-052-security-alert-notifications.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Extend deep linking configuration to support security alert navigation paths. Add routes for security settings, change password, and change PIN screens. Handle navigation from security alert notifications with proper state preservation.

---

## Acceptance Criteria

- [ ] Deep link paths added for security screens
- [ ] Navigate to SecuritySettings from security alerts
- [ ] Navigate to ChangePassword from password change alerts
- [ ] Navigate to ChangePIN from PIN change alerts
- [ ] Preserve navigation state when navigating from killed app
- [ ] Handle edge cases (user not authenticated, invalid paths)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Updated Linking Configuration

```typescript
// src/navigation/linking.ts (updated)

import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['warrendeleon://', 'https://warrendeleon.com'],
  config: {
    screens: {
      // Auth screens
      SignIn: 'auth/sign-in',
      SignUp: 'auth/sign-up',
      ForgotPassword: 'auth/forgot-password',
      ResetPassword: 'auth/reset-password',

      // Main app screens
      Home: 'home',

      // Chat
      ChatList: 'chat',
      Chat: {
        path: 'chat/:conversationId',
        parse: {
          conversationId: (conversationId: string) => conversationId,
        },
      },

      // Settings
      Settings: 'settings',
      SecuritySettings: 'settings/security',
      NotificationPreferences: 'settings/notifications',
      ChangePassword: 'settings/change-password',
      ChangePin: 'settings/change-pin',
      BiometricToggle: 'settings/biometric',
      UpdateProfilePicture: 'settings/profile-picture',

      // Security alerts (specific paths)
      SecurityAlertFailedLogin: 'security/failed-login',
      SecurityAlertPasswordChange: 'security/password-change',
      SecurityAlertSuspiciousActivity: 'security/suspicious-activity',
      SecurityAlertAccountLocked: 'security/account-locked',
      SecurityAlertNewDevice: 'security/new-device',
      SecurityAlertPinChange: 'security/pin-change',

      // Portfolio
      Portfolio: 'portfolio',
      WorkExperience: 'portfolio/work-experience',
      WorkExperienceDetail: {
        path: 'portfolio/work-experience/:experienceId',
        parse: {
          experienceId: (experienceId: string) => experienceId,
        },
      },
      Education: 'portfolio/education',
      Projects: 'portfolio/projects',
      Certifications: 'portfolio/certifications',

      // Not found
      NotFound: '*',
    },
  },
};
```

---

### Security Alert Navigation Handler

```typescript
// src/navigation/securityAlertNavigation.ts

import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { SecurityEventType } from '../services/notifications/securityAlertHandler';

/**
 * Navigate to appropriate screen based on security event type
 */
export const navigateFromSecurityAlert = (
  navigation: NavigationContainerRef<RootStackParamList>,
  eventType: SecurityEventType,
  eventId?: string
): void => {
  if (!navigation.isReady()) {
    console.warn('Navigation not ready');
    return;
  }

  switch (eventType) {
    case 'failed_login':
      navigation.navigate('SecurityAlertFailedLogin', { eventId });
      break;

    case 'password_change':
      navigation.navigate('SecurityAlertPasswordChange', { eventId });
      break;

    case 'suspicious_activity':
      navigation.navigate('SecurityAlertSuspiciousActivity', { eventId });
      break;

    case 'account_locked':
      navigation.navigate('SecurityAlertAccountLocked', { eventId });
      break;

    case 'new_device_login':
      navigation.navigate('SecurityAlertNewDevice', { eventId });
      break;

    case 'pin_change':
      navigation.navigate('SecurityAlertPinChange', { eventId });
      break;

    default:
      navigation.navigate('SecuritySettings');
      break;
  }
};

/**
 * Check if user is authenticated before navigation
 */
export const canNavigateToSecurityScreen = async (): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error('Failed to check authentication:', error);
    return false;
  }
};
```

---

### Security Alert Screens

```typescript
// src/screens/security/SecurityAlertFailedLoginScreen.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Box, VStack, Text, Button } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSecurityEventDetails } from '../../services/security/securityEventService';

export const SecurityAlertFailedLoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const eventId = (route.params as any)?.eventId;

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    try {
      const details = await getSecurityEventDetails(eventId);
      setEventDetails(details);
    } catch (error) {
      console.error('Failed to load event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} testID="security-alert-failed-login-screen">
      <ScrollView>
        <Box padding="$4">
          <VStack space="lg">
            {/* Header */}
            <VStack space="xs">
              <Text fontSize="$2xl" fontWeight="$bold" color="$red600">
                Failed Login Attempt
              </Text>
              <Text fontSize="$sm" color="$coolGray600">
                Someone attempted to log in to your account
              </Text>
            </VStack>

            {/* Event details */}
            {!isLoading && eventDetails && (
              <Box
                backgroundColor="$red50"
                padding="$4"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$red200"
              >
                <VStack space="sm">
                  <Text fontSize="$md" fontWeight="$semibold">
                    Details:
                  </Text>
                  <Text fontSize="$sm">
                    Location: {eventDetails.event_data?.location || 'Unknown'}
                  </Text>
                  <Text fontSize="$sm">
                    Device: {eventDetails.event_data?.device || 'Unknown'}
                  </Text>
                  <Text fontSize="$sm">
                    Time: {new Date(eventDetails.created_at).toLocaleString()}
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Actions */}
            <VStack space="md">
              <Button
                onPress={() => navigation.navigate('ChangePassword' as never)}
                backgroundColor="$red600"
                testID="change-password-button"
              >
                <Text color="$white">Change Password</Text>
              </Button>

              <Button
                onPress={() => navigation.navigate('SecuritySettings' as never)}
                variant="outline"
                borderColor="$coolGray400"
                testID="security-settings-button"
              >
                <Text color="$coolGray900">Review Security Settings</Text>
              </Button>

              <Button
                onPress={() => navigation.goBack()}
                variant="link"
                testID="dismiss-button"
              >
                <Text color="$coolGray600">Dismiss</Text>
              </Button>
            </VStack>

            {/* Info */}
            <Box
              backgroundColor="$blue50"
              padding="$3"
              borderRadius="$md"
            >
              <Text fontSize="$sm" color="$blue900">
                If you didn't attempt to log in, we recommend changing your
                password immediately and reviewing your security settings.
              </Text>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

### Updated Deep Link Helper

```typescript
// src/utils/deepLinking.ts (updated)

/**
 * Parse deep link URL to get screen and params
 */
export const parseDeepLink = (
  url: string
): { screen: string; params?: Record<string, string> } | null => {
  try {
    // Remove scheme prefix
    const cleanUrl = url.replace(/^warrendeleon:\/\//, '');

    // Split path and query
    const [path, query] = cleanUrl.split('?');

    // Parse path to screen name
    const pathParts = path.split('/');

    // Parse query params
    const params: Record<string, string> = {};
    if (query) {
      query.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
      });
    }

    // Map security alert paths
    if (path === 'security/failed-login') {
      return { screen: 'SecurityAlertFailedLogin', params };
    }
    if (path === 'security/password-change') {
      return { screen: 'SecurityAlertPasswordChange', params };
    }
    if (path === 'security/suspicious-activity') {
      return { screen: 'SecurityAlertSuspiciousActivity', params };
    }
    if (path === 'security/account-locked') {
      return { screen: 'SecurityAlertAccountLocked', params };
    }
    if (path === 'security/new-device') {
      return { screen: 'SecurityAlertNewDevice', params };
    }
    if (path === 'security/pin-change') {
      return { screen: 'SecurityAlertPinChange', params };
    }

    // Map other paths (existing logic)
    if (path === 'home') {
      return { screen: 'Home' };
    }

    if (path.startsWith('chat/')) {
      const conversationId = pathParts[1];
      return {
        screen: 'Chat',
        params: { conversationId },
      };
    }

    if (path === 'settings/security') {
      return { screen: 'SecuritySettings' };
    }

    if (path === 'settings/notifications') {
      return { screen: 'NotificationPreferences' };
    }

    if (path === 'settings/change-password') {
      return { screen: 'ChangePassword' };
    }

    if (path === 'settings/change-pin') {
      return { screen: 'ChangePin' };
    }

    // Default
    return { screen: 'Home' };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/utils/__tests__/securityDeepLinking.test.ts

import { parseDeepLink } from '../deepLinking';
import {
  navigateFromSecurityAlert,
  canNavigateToSecurityScreen,
} from '../../navigation/securityAlertNavigation';
import { getAccessToken } from '../../services/auth/tokenService';

jest.mock('../../services/auth/tokenService');

describe('Security Deep Linking', () => {
  describe('parseDeepLink - security alerts', () => {
    it('should parse failed login deep link', () => {
      const result = parseDeepLink('warrendeleon://security/failed-login');

      expect(result).toEqual({ screen: 'SecurityAlertFailedLogin', params: {} });
    });

    it('should parse password change deep link', () => {
      const result = parseDeepLink('warrendeleon://security/password-change');

      expect(result).toEqual({
        screen: 'SecurityAlertPasswordChange',
        params: {},
      });
    });

    it('should parse suspicious activity deep link', () => {
      const result = parseDeepLink('warrendeleon://security/suspicious-activity');

      expect(result).toEqual({
        screen: 'SecurityAlertSuspiciousActivity',
        params: {},
      });
    });

    it('should parse deep link with eventId param', () => {
      const result = parseDeepLink('warrendeleon://security/failed-login?eventId=event-123');

      expect(result).toEqual({
        screen: 'SecurityAlertFailedLogin',
        params: { eventId: 'event-123' },
      });
    });
  });

  describe('navigateFromSecurityAlert', () => {
    const mockNavigation = {
      isReady: jest.fn().mockReturnValue(true),
      navigate: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should navigate to failed login screen', () => {
      navigateFromSecurityAlert(mockNavigation as any, 'failed_login', 'event-123');

      expect(mockNavigation.navigate).toHaveBeenCalledWith('SecurityAlertFailedLogin', {
        eventId: 'event-123',
      });
    });

    it('should navigate to password change screen', () => {
      navigateFromSecurityAlert(mockNavigation as any, 'password_change');

      expect(mockNavigation.navigate).toHaveBeenCalledWith('SecurityAlertPasswordChange', {
        eventId: undefined,
      });
    });

    it('should navigate to default SecuritySettings for unknown type', () => {
      navigateFromSecurityAlert(mockNavigation as any, 'unknown' as any);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('SecuritySettings');
    });

    it('should not navigate if navigation is not ready', () => {
      mockNavigation.isReady.mockReturnValue(false);

      navigateFromSecurityAlert(mockNavigation as any, 'failed_login');

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('canNavigateToSecurityScreen', () => {
    it('should return true when user is authenticated', async () => {
      (getAccessToken as jest.Mock).mockResolvedValue('mock-token');

      const canNavigate = await canNavigateToSecurityScreen();

      expect(canNavigate).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      (getAccessToken as jest.Mock).mockResolvedValue(null);

      const canNavigate = await canNavigateToSecurityScreen();

      expect(canNavigate).toBe(false);
    });

    it('should return false on error', async () => {
      (getAccessToken as jest.Mock).mockRejectedValue(new Error('Token error'));

      const canNavigate = await canNavigateToSecurityScreen();

      expect(canNavigate).toBe(false);
    });
  });
});
```

---

## Dependencies

- React Navigation
- @react-navigation/native
- @react-navigation/native-stack
- securityAlertHandler (TASK-294)
- tokenService (for authentication check)

---

## Definition of Done

- [ ] Deep link paths added for all security screens
- [ ] Navigation working from security alerts
- [ ] EventId param passing correctly
- [ ] Authentication check before navigation
- [ ] SecurityAlert screens implemented
- [ ] Navigation state preserved from killed app
- [ ] Edge cases handled (not authenticated, invalid paths)
- [ ] All unit tests passing
- [ ] 100% code coverage achieved
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-052](../stories/US-052-security-alert-notifications.md), [TASK-294](TASK-294-security-notification-handler.md), [TASK-290](TASK-290-deep-link-navigation.md)
