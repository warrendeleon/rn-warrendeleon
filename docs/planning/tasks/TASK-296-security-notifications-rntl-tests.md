# TASK-296: Security Notifications RNTL Tests

**ID**: TASK-296 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-052](../stories/US-052-security-alert-notifications.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Write comprehensive React Native Testing Library tests for security alert notification functionality. Test security alert handler, deep linking for security screens, and SecurityAlert screen components. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for securityAlertHandler
- [ ] Complete tests for security deep linking
- [ ] Complete tests for SecurityAlert screens
- [ ] Edge cases tested (critical events, invalid data, navigation errors)
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Comprehensive RNTL Test Suite

```typescript
// src/services/notifications/__tests__/SecurityAlertIntegration.test.ts

import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import {
  handleSecurityAlert,
  parseSecurityAlertData,
  handleSecurityAlertPress,
  getSecurityEventIcon,
} from '../securityAlertHandler';
import {
  navigateFromSecurityAlert,
  canNavigateToSecurityScreen,
} from '../../navigation/securityAlertNavigation';
import { parseDeepLink } from '../../utils/deepLinking';
import { getAccessToken } from '../../services/auth/tokenService';

jest.mock('@react-native-firebase/messaging');
jest.mock('react-native/Libraries/Alert/Alert');
jest.mock('../../services/auth/tokenService');

describe('Security Alert Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-End Security Alert Flow', () => {
    it('should complete full failed login alert flow', async () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const remoteMessage = {
        messageId: 'sec-123',
        notification: {
          title: 'Failed Login Attempt',
          body: 'Someone attempted to log in from New York',
        },
        data: {
          type: 'security_alert',
          eventType: 'failed_login',
          eventId: 'event-123',
          eventData: JSON.stringify({ location: 'New York, USA' }),
        },
      };

      // Handle foreground security alert
      handleSecurityAlert(
        remoteMessage as any,
        mockShowBanner,
        mockNavigate
      );

      // Verify banner shown
      expect(mockShowBanner).toHaveBeenCalledWith(
        'Failed Login Attempt',
        'Someone attempted to log in from New York',
        'security',
        expect.any(Function)
      );

      // Wait for system alert (critical event)
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Failed Login Attempt',
        expect.stringContaining('Someone attempted to log in'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Review Now' }),
          expect.objectContaining({ text: 'Later' }),
        ])
      );

      // Simulate user tapping banner
      const onPress = mockShowBanner.mock.calls[0][3];
      onPress();

      // Verify navigation to SecuritySettings
      expect(mockNavigate).toHaveBeenCalledWith('SecuritySettings');
    });

    it('should complete full password change alert flow', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const remoteMessage = {
        messageId: 'sec-456',
        notification: {
          title: 'Password Changed',
          body: 'Your password was recently changed',
        },
        data: {
          type: 'security_alert',
          eventType: 'password_change',
          eventId: 'event-456',
          eventData: '{}',
        },
      };

      handleSecurityAlert(
        remoteMessage as any,
        mockShowBanner,
        mockNavigate
      );

      expect(mockShowBanner).toHaveBeenCalledWith(
        'Password Changed',
        'Your password was recently changed',
        'security',
        expect.any(Function)
      );

      // Tap banner
      const onPress = mockShowBanner.mock.calls[0][3];
      onPress();

      // Should navigate to ChangePassword
      expect(mockNavigate).toHaveBeenCalledWith('ChangePassword');
    });

    it('should complete full suspicious activity alert flow', async () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const remoteMessage = {
        messageId: 'sec-789',
        notification: {
          title: 'Suspicious Activity Detected',
          body: 'Unusual activity detected on your account',
        },
        data: {
          type: 'security_alert',
          eventType: 'suspicious_activity',
          eventId: 'event-789',
          eventData: '{}',
        },
      };

      handleSecurityAlert(
        remoteMessage as any,
        mockShowBanner,
        mockNavigate
      );

      // Critical event should show system alert
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Deep Linking for Security Alerts', () => {
    it('should parse and navigate from failed login deep link', () => {
      const url = 'warrendeleon://security/failed-login?eventId=event-123';

      // Parse deep link
      const parsed = parseDeepLink(url);
      expect(parsed).toEqual({
        screen: 'SecurityAlertFailedLogin',
        params: { eventId: 'event-123' },
      });
    });

    it('should navigate to correct screen for password change', () => {
      const mockNavigation = {
        isReady: jest.fn().mockReturnValue(true),
        navigate: jest.fn(),
      };

      navigateFromSecurityAlert(
        mockNavigation as any,
        'password_change',
        'event-456'
      );

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'SecurityAlertPasswordChange',
        { eventId: 'event-456' }
      );
    });

    it('should navigate to correct screen for PIN change', () => {
      const mockNavigation = {
        isReady: jest.fn().mockReturnValue(true),
        navigate: jest.fn(),
      };

      navigateFromSecurityAlert(
        mockNavigation as any,
        'pin_change',
        'event-789'
      );

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'SecurityAlertPinChange',
        { eventId: 'event-789' }
      );
    });
  });

  describe('All Security Event Types', () => {
    const mockShowBanner = jest.fn();
    const mockNavigate = jest.fn();

    const eventTypes = [
      { type: 'failed_login', expectedIcon: 'alert-circle' },
      { type: 'password_change', expectedIcon: 'key' },
      { type: 'suspicious_activity', expectedIcon: 'alert-triangle' },
      { type: 'account_locked', expectedIcon: 'lock' },
      { type: 'new_device_login', expectedIcon: 'smartphone' },
      { type: 'pin_change', expectedIcon: 'shield' },
    ];

    eventTypes.forEach(({ type, expectedIcon }) => {
      it(`should handle ${type} event`, () => {
        const message = {
          notification: { title: 'Security Alert', body: 'Test' },
          data: {
            type: 'security_alert',
            eventType: type,
            eventId: 'event-123',
            eventData: '{}',
          },
        };

        handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

        expect(mockShowBanner).toHaveBeenCalledWith(
          'Security Alert',
          'Test',
          'security',
          expect.any(Function)
        );

        // Verify correct icon
        expect(getSecurityEventIcon(type as any)).toBe(expectedIcon);
      });
    });
  });

  describe('Critical vs Non-Critical Events', () => {
    const criticalEvents = [
      'failed_login',
      'suspicious_activity',
      'account_locked',
      'new_device_login',
    ];

    const nonCriticalEvents = ['password_change', 'pin_change'];

    criticalEvents.forEach((eventType) => {
      it(`should show system alert for critical event: ${eventType}`, async (done) => {
        const mockShowBanner = jest.fn();
        const mockNavigate = jest.fn();

        const message = {
          notification: { title: 'Alert', body: 'Message' },
          data: {
            type: 'security_alert',
            eventType,
            eventId: 'event-123',
            eventData: '{}',
          },
        };

        handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

        setTimeout(() => {
          expect(Alert.alert).toHaveBeenCalled();
          done();
        }, 600);
      });
    });

    nonCriticalEvents.forEach((eventType) => {
      it(`should not show system alert for non-critical event: ${eventType}`, async (done) => {
        const mockShowBanner = jest.fn();
        const mockNavigate = jest.fn();

        const message = {
          notification: { title: 'Alert', body: 'Message' },
          data: {
            type: 'security_alert',
            eventType,
            eventId: 'event-123',
            eventData: '{}',
          },
        };

        handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

        setTimeout(() => {
          expect(Alert.alert).not.toHaveBeenCalled();
          done();
        }, 600);
      });
    });
  });

  describe('Authentication Check', () => {
    it('should allow navigation when authenticated', async () => {
      (getAccessToken as jest.Mock).mockResolvedValue('mock-token');

      const canNavigate = await canNavigateToSecurityScreen();

      expect(canNavigate).toBe(true);
    });

    it('should prevent navigation when not authenticated', async () => {
      (getAccessToken as jest.Mock).mockResolvedValue(null);

      const canNavigate = await canNavigateToSecurityScreen();

      expect(canNavigate).toBe(false);
    });

    it('should prevent navigation on auth error', async () => {
      (getAccessToken as jest.Mock).mockRejectedValue(new Error('Auth failed'));

      const canNavigate = await canNavigateToSecurityScreen();

      expect(canNavigate).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle security alert without notification title', () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        data: {
          type: 'security_alert',
          eventType: 'failed_login',
          eventId: 'event-123',
          eventData: '{}',
        },
      };

      handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

      expect(mockShowBanner).toHaveBeenCalledWith(
        'Security Alert',
        '',
        'security',
        expect.any(Function)
      );
    });

    it('should handle malformed eventData', () => {
      const data = {
        type: 'security_alert',
        eventType: 'failed_login',
        eventId: 'event-123',
        eventData: 'invalid json',
      };

      const parsed = parseSecurityAlertData(data);

      expect(parsed).toBeNull();
    });

    it('should handle navigation when not ready', () => {
      const mockNavigation = {
        isReady: jest.fn().mockReturnValue(false),
        navigate: jest.fn(),
      };

      navigateFromSecurityAlert(mockNavigation as any, 'failed_login');

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('should default to SecuritySettings for unknown event type', () => {
      const mockNavigate = jest.fn();

      handleSecurityAlertPress('unknown' as any, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith('SecuritySettings');
    });

    it('should handle navigation from system alert', async () => {
      const mockShowBanner = jest.fn();
      const mockNavigate = jest.fn();

      const message = {
        notification: { title: 'Alert', body: 'Message' },
        data: {
          type: 'security_alert',
          eventType: 'failed_login',
          eventId: 'event-123',
          eventData: '{}',
        },
      };

      handleSecurityAlert(message as any, mockShowBanner, mockNavigate);

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Get the Review Now button handler
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const reviewNowButton = alertCall[2].find(
        (button: any) => button.text === 'Review Now'
      );

      reviewNowButton.onPress();

      expect(mockNavigate).toHaveBeenCalledWith('SecuritySettings');
    });
  });

  describe('Screen Component Tests', () => {
    it('should render SecurityAlertFailedLoginScreen', async () => {
      const { getByTestId } = render(<SecurityAlertFailedLoginScreen />);

      await waitFor(() => {
        expect(getByTestId('security-alert-failed-login-screen')).toBeTruthy();
      });
    });

    it('should navigate to ChangePassword from SecurityAlertScreen', async () => {
      const mockNavigate = jest.fn();

      jest.mock('@react-navigation/native', () => ({
        useNavigation: () => ({ navigate: mockNavigate }),
        useRoute: () => ({ params: { eventId: 'event-123' } }),
      }));

      const { getByTestId } = render(<SecurityAlertFailedLoginScreen />);

      await waitFor(() => {
        expect(getByTestId('change-password-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('change-password-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ChangePassword');
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- securityAlertHandler (TASK-294)
- securityAlertNavigation (TASK-295)
- SecurityAlert screens (TASK-295)

---

## Definition of Done

- [ ] All security alert handler tests passing
- [ ] All security deep linking tests passing
- [ ] All SecurityAlert screen tests passing
- [ ] End-to-end security alert flows tested
- [ ] All event types tested
- [ ] Critical vs non-critical events tested
- [ ] Authentication check tested
- [ ] Navigation tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-052](../stories/US-052-security-alert-notifications.md), [TASK-294](TASK-294-security-notification-handler.md), [TASK-295](TASK-295-security-deep-link.md)
