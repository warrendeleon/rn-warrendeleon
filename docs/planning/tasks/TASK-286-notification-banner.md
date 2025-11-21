# TASK-286: NotificationBanner Component

**ID**: TASK-286 | **Epic**: [EPIC-026](../epics/EPIC-026-push-notifications.md) | **User Story**: [US-050](../stories/US-050-fcm-setup-permission-handling.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create a notification banner component to display in-app notifications when the app is in the foreground. Support different notification types (chat message, security alert, general), auto-dismiss, swipe-to-dismiss, and tap-to-navigate. Include animations for enter/exit and proper accessibility support.

---

## Acceptance Criteria

- [ ] NotificationBanner component created in `src/components/notifications/NotificationBanner.tsx`
- [ ] Support different notification types (chat, security, general)
- [ ] Auto-dismiss after configurable timeout (default 5 seconds)
- [ ] Swipe-to-dismiss gesture
- [ ] Tap to navigate to notification destination
- [ ] Animated enter/exit transitions
- [ ] Different colors/icons per type
- [ ] EAA compliant with proper accessibility props
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### NotificationBanner Component

```typescript
// src/components/notifications/NotificationBanner.tsx

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Box, HStack, VStack, Text } from '@gluestack-ui/themed';
import { Icon } from '../common/Icon';

export type NotificationType = 'chat' | 'security' | 'general';

export interface NotificationBannerProps {
  /**
   * Notification title
   */
  title: string;

  /**
   * Notification body text
   */
  body: string;

  /**
   * Notification type (affects color and icon)
   */
  type?: NotificationType;

  /**
   * Auto-dismiss duration in milliseconds (0 to disable)
   * @default 5000
   */
  duration?: number;

  /**
   * Called when banner is dismissed
   */
  onDismiss?: () => void;

  /**
   * Called when banner is tapped
   */
  onPress?: () => void;

  /**
   * Whether banner is visible
   */
  visible: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}

const BANNER_HEIGHT = 80;
const SWIPE_THRESHOLD = 50;

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title,
  body,
  type = 'general',
  duration = 5000,
  onDismiss,
  onPress,
  visible,
  testID = 'notification-banner',
}) => {
  const { width } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  /**
   * Auto-dismiss timer
   */
  useEffect(() => {
    if (visible && duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  /**
   * Slide in/out animation
   */
  useEffect(() => {
    if (visible) {
      slideIn();
    } else {
      slideOut();
    }
  }, [visible]);

  /**
   * Slide in animation
   */
  const slideIn = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  /**
   * Slide out animation
   */
  const slideOut = () => {
    Animated.timing(translateY, {
      toValue: -BANNER_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Handle dismiss
   */
  const handleDismiss = () => {
    slideOut();
    setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, 250);
  };

  /**
   * Handle press
   */
  const handlePress = () => {
    if (onPress) {
      onPress();
      handleDismiss();
    }
  };

  /**
   * Pan responder for swipe-to-dismiss
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow horizontal swipe
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Dismiss if swiped beyond threshold
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? width : -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleDismiss();
            translateX.setValue(0);
          });
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  /**
   * Get notification config based on type
   */
  const getNotificationConfig = () => {
    switch (type) {
      case 'chat':
        return {
          backgroundColor: '$blue500',
          icon: 'message-circle',
          accessibilityLabel: `Chat notification: ${title}`,
        };
      case 'security':
        return {
          backgroundColor: '$red500',
          icon: 'alert-triangle',
          accessibilityLabel: `Security alert: ${title}`,
        };
      case 'general':
      default:
        return {
          backgroundColor: '$coolGray700',
          icon: 'bell',
          accessibilityLabel: `Notification: ${title}`,
        };
    }
  };

  const config = getNotificationConfig();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { translateX }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={config.accessibilityLabel}
        accessibilityHint={onPress ? 'Tap to view notification details' : undefined}
        testID={testID}
      >
        <Box
          backgroundColor={config.backgroundColor}
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderRadius="$md"
          marginHorizontal="$3"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
          elevation={5}
          testID={`${testID}-container`}
        >
          <HStack space="md" alignItems="center">
            {/* Icon */}
            <Box testID={`${testID}-icon`}>
              <Icon name={config.icon} size={24} color="$white" />
            </Box>

            {/* Content */}
            <VStack flex={1} space="xs">
              <Text
                color="$white"
                fontSize="$md"
                fontWeight="$semibold"
                numberOfLines={1}
                testID={`${testID}-title`}
              >
                {title}
              </Text>
              <Text
                color="$coolGray100"
                fontSize="$sm"
                numberOfLines={2}
                testID={`${testID}-body`}
              >
                {body}
              </Text>
            </VStack>

            {/* Dismiss button */}
            <Pressable
              onPress={handleDismiss}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              testID={`${testID}-dismiss-button`}
            >
              <Icon name="x" size={20} color="$white" />
            </Pressable>
          </HStack>
        </Box>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
```

---

### Usage Hook

```typescript
// src/hooks/notifications/useNotificationBanner.ts

import { useState, useCallback, useRef } from 'react';
import { NotificationType } from '../../components/notifications/NotificationBanner';

export interface NotificationBannerState {
  visible: boolean;
  title: string;
  body: string;
  type: NotificationType;
  onPress?: () => void;
}

export interface UseNotificationBannerReturn {
  bannerState: NotificationBannerState;
  showBanner: (title: string, body: string, type: NotificationType, onPress?: () => void) => void;
  hideBanner: () => void;
}

export const useNotificationBanner = (): UseNotificationBannerReturn => {
  const [bannerState, setBannerState] = useState<NotificationBannerState>({
    visible: false,
    title: '',
    body: '',
    type: 'general',
  });

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Show notification banner
   */
  const showBanner = useCallback(
    (title: string, body: string, type: NotificationType = 'general', onPress?: () => void) => {
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      setBannerState({
        visible: true,
        title,
        body,
        type,
        onPress,
      });
    },
    []
  );

  /**
   * Hide notification banner
   */
  const hideBanner = useCallback(() => {
    setBannerState(prev => ({
      ...prev,
      visible: false,
    }));

    // Clear state after animation completes
    hideTimeoutRef.current = setTimeout(() => {
      setBannerState({
        visible: false,
        title: '',
        body: '',
        type: 'general',
      });
    }, 300);
  }, []);

  return {
    bannerState,
    showBanner,
    hideBanner,
  };
};
```

---

### Integration Example

```typescript
// src/App.tsx

import React, { useEffect } from 'react';
import { NotificationBanner } from './components/notifications/NotificationBanner';
import { useNotificationBanner } from './hooks/notifications/useNotificationBanner';
import { onNotification } from './services/notifications/fcmService';
import { useNavigation } from '@react-navigation/native';

export const App: React.FC = () => {
  const { bannerState, showBanner, hideBanner } = useNotificationBanner();
  const navigation = useNavigation();

  /**
   * Handle foreground notifications
   */
  useEffect(() => {
    const unsubscribe = onNotification((remoteMessage) => {
      const notificationType =
        (remoteMessage.data?.type as NotificationType) || 'general';

      showBanner(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || '',
        notificationType,
        () => {
          // Navigate to appropriate screen based on notification data
          if (remoteMessage.data?.conversationId) {
            navigation.navigate('Chat', {
              conversationId: remoteMessage.data.conversationId,
            });
          }
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [showBanner, navigation]);

  return (
    <>
      {/* App content */}
      <NavigationContainer>
        {/* Routes */}
      </NavigationContainer>

      {/* Notification banner overlay */}
      <NotificationBanner
        visible={bannerState.visible}
        title={bannerState.title}
        body={bannerState.body}
        type={bannerState.type}
        onPress={bannerState.onPress}
        onDismiss={hideBanner}
      />
    </>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/notifications/__tests__/NotificationBanner.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationBanner } from '../NotificationBanner';

jest.useFakeTimers();

describe('NotificationBanner', () => {
  const defaultProps = {
    visible: true,
    title: 'Test Notification',
    body: 'This is a test notification',
    onDismiss: jest.fn(),
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible', () => {
      const { getByTestId } = render(<NotificationBanner {...defaultProps} />);

      expect(getByTestId('notification-banner')).toBeTruthy();
      expect(getByTestId('notification-banner-title')).toHaveTextContent(
        'Test Notification'
      );
      expect(getByTestId('notification-banner-body')).toHaveTextContent(
        'This is a test notification'
      );
    });

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <NotificationBanner {...defaultProps} visible={false} />
      );

      expect(queryByTestId('notification-banner')).toBeNull();
    });

    it('should render chat notification with correct styling', () => {
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} type="chat" />
      );

      expect(getByTestId('notification-banner-icon')).toBeTruthy();
      expect(getByTestId('notification-banner-container')).toHaveStyle({
        backgroundColor: '$blue500',
      });
    });

    it('should render security notification with correct styling', () => {
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} type="security" />
      );

      expect(getByTestId('notification-banner-container')).toHaveStyle({
        backgroundColor: '$red500',
      });
    });

    it('should render general notification with correct styling', () => {
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} type="general" />
      );

      expect(getByTestId('notification-banner-container')).toHaveStyle({
        backgroundColor: '$coolGray700',
      });
    });
  });

  describe('Interactions', () => {
    it('should call onPress when banner is tapped', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('notification-banner'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when dismiss button is pressed', () => {
      const mockOnDismiss = jest.fn();
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('notification-banner-dismiss-button'));

      jest.runAllTimers();

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after duration', () => {
      const mockOnDismiss = jest.fn();
      render(
        <NotificationBanner
          {...defaultProps}
          duration={5000}
          onDismiss={mockOnDismiss}
        />
      );

      jest.advanceTimersByTime(5000);
      jest.runAllTimers();

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const mockOnDismiss = jest.fn();
      render(
        <NotificationBanner
          {...defaultProps}
          duration={0}
          onDismiss={mockOnDismiss}
        />
      );

      jest.advanceTimersByTime(10000);

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('should dismiss and call onPress when tapped', async () => {
      const mockOnPress = jest.fn();
      const mockOnDismiss = jest.fn();
      const { getByTestId } = render(
        <NotificationBanner
          {...defaultProps}
          onPress={mockOnPress}
          onDismiss={mockOnDismiss}
        />
      );

      fireEvent.press(getByTestId('notification-banner'));

      jest.runAllTimers();

      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility props for chat notification', () => {
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} type="chat" />
      );

      const banner = getByTestId('notification-banner');
      expect(banner).toHaveProp('accessibilityRole', 'button');
      expect(banner).toHaveProp(
        'accessibilityLabel',
        'Chat notification: Test Notification'
      );
      expect(banner).toHaveProp(
        'accessibilityHint',
        'Tap to view notification details'
      );
    });

    it('should have proper accessibility props for security notification', () => {
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} type="security" />
      );

      const banner = getByTestId('notification-banner');
      expect(banner).toHaveProp(
        'accessibilityLabel',
        'Security alert: Test Notification'
      );
    });

    it('should have proper accessibility props for general notification', () => {
      const { getByTestId } = render(
        <NotificationBanner {...defaultProps} type="general" />
      );

      const banner = getByTestId('notification-banner');
      expect(banner).toHaveProp(
        'accessibilityLabel',
        'Notification: Test Notification'
      );
    });

    it('should have dismiss button with proper accessibility', () => {
      const { getByTestId } = render(<NotificationBanner {...defaultProps} />);

      const dismissButton = getByTestId('notification-banner-dismiss-button');
      expect(dismissButton).toHaveProp('accessibilityRole', 'button');
      expect(dismissButton).toHaveProp('accessibilityLabel', 'Dismiss notification');
    });
  });

  describe('Hook - useNotificationBanner', () => {
    it('should show and hide banner', () => {
      const { result } = renderHook(() => useNotificationBanner());

      expect(result.current.bannerState.visible).toBe(false);

      act(() => {
        result.current.showBanner('Title', 'Body', 'chat');
      });

      expect(result.current.bannerState.visible).toBe(true);
      expect(result.current.bannerState.title).toBe('Title');
      expect(result.current.bannerState.body).toBe('Body');
      expect(result.current.bannerState.type).toBe('chat');

      act(() => {
        result.current.hideBanner();
      });

      expect(result.current.bannerState.visible).toBe(false);
    });

    it('should handle onPress callback', () => {
      const mockOnPress = jest.fn();
      const { result } = renderHook(() => useNotificationBanner());

      act(() => {
        result.current.showBanner('Title', 'Body', 'general', mockOnPress);
      });

      expect(result.current.bannerState.onPress).toBe(mockOnPress);
    });

    it('should clear previous timeout when showing new banner', () => {
      const { result } = renderHook(() => useNotificationBanner());

      act(() => {
        result.current.showBanner('Title 1', 'Body 1', 'chat');
      });

      act(() => {
        result.current.showBanner('Title 2', 'Body 2', 'security');
      });

      expect(result.current.bannerState.title).toBe('Title 2');
      expect(result.current.bannerState.body).toBe('Body 2');
      expect(result.current.bannerState.type).toBe('security');
    });
  });
});
```

---

## Dependencies

- React Native
- @gluestack-ui/themed
- React Navigation (for navigation integration)
- fcmService (TASK-283)

---

## Definition of Done

- [ ] NotificationBanner component implemented
- [ ] Support all notification types (chat, security, general)
- [ ] Auto-dismiss working
- [ ] Swipe-to-dismiss gesture implemented
- [ ] Tap-to-navigate working
- [ ] Animations smooth and performant
- [ ] EAA compliant with proper accessibility
- [ ] useNotificationBanner hook implemented
- [ ] Integration example documented
- [ ] All unit tests passing
- [ ] 100% code coverage achieved
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-050](../stories/US-050-fcm-setup-permission-handling.md), [TASK-283](TASK-283-fcm-service-setup.md)
