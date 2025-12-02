import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react-native';

import { useAppColorScheme } from '@app/shared/hooks';

/**
 * Toast types supported by the ToastProvider
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast position on screen
 */
export type ToastPosition = 'top' | 'bottom';

/**
 * Action button configuration for toasts
 */
export interface ToastAction {
  label: string;
  onPress: () => void;
  testID?: string;
}

/**
 * Toast configuration options
 */
export interface ToastConfig {
  /** Main message to display */
  message: string;
  /** Optional title displayed above the message */
  title?: string;
  /** Toast type affects styling and default duration */
  type?: ToastType;
  /** Duration in milliseconds (defaults based on type) */
  duration?: number;
  /** Position on screen */
  position?: ToastPosition;
  /** Whether user can dismiss the toast */
  dismissible?: boolean;
  /** Optional action button */
  action?: ToastAction;
  /** TestID for the toast container */
  testID?: string;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Default durations by toast type (in milliseconds)
 * - Success: 4 seconds (brief acknowledgment)
 * - Info: 5 seconds (user needs to read)
 * - Warning: 6 seconds (more important)
 * - Error: 7 seconds (user needs to understand)
 */
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  info: 5000,
  warning: 6000,
  error: 7000,
};

/**
 * GlueStack UI token-based color configurations for each toast type
 * Uses semantic color tokens that automatically adapt to light/dark mode
 */
const TOAST_STYLES: Record<
  ToastType,
  {
    light: { bg: string; text: string; iconColor: string };
    dark: { bg: string; text: string; iconColor: string };
  }
> = {
  success: {
    light: { bg: '$success100', text: '$success700', iconColor: '$success500' },
    dark: { bg: '$success900', text: '$success200', iconColor: '$success300' },
  },
  error: {
    light: { bg: '$error100', text: '$error700', iconColor: '$error500' },
    dark: { bg: '$error900', text: '$error200', iconColor: '$error300' },
  },
  info: {
    light: { bg: '$info100', text: '$info700', iconColor: '$info500' },
    dark: { bg: '$info900', text: '$info200', iconColor: '$info300' },
  },
  warning: {
    light: { bg: '$warning100', text: '$warning700', iconColor: '$warning500' },
    dark: { bg: '$warning900', text: '$warning200', iconColor: '$warning300' },
  },
};

/**
 * Hex color values needed for lucide-react-native icons
 * Icons require hex colors, not GlueStack tokens
 */
const ICON_COLORS: Record<ToastType, { light: string; dark: string }> = {
  success: { light: '#22C55E', dark: '#86EFAC' },
  error: { light: '#EF4444', dark: '#FCA5A5' },
  info: { light: '#3B82F6', dark: '#93C5FD' },
  warning: { light: '#F59E0B', dark: '#FDE68A' },
};

interface ToastIconProps {
  type: ToastType;
  isDark: boolean;
}

const ToastIcon: React.FC<ToastIconProps> = ({ type, isDark }) => {
  const color = ICON_COLORS[type][isDark ? 'dark' : 'light'];

  switch (type) {
    case 'success':
      return <CheckCircle size={20} color={color} testID="toast-icon-success" />;
    case 'error':
      return <AlertCircle size={20} color={color} testID="toast-icon-error" />;
    case 'info':
      return <Info size={20} color={color} testID="toast-icon-info" />;
    case 'warning':
      return <AlertTriangle size={20} color={color} testID="toast-icon-warning" />;
  }
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setToastConfig(null);
    });
  }, [opacity]);

  const showToast = useCallback(
    (config: ToastConfig) => {
      // Clear any existing toast
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Apply defaults
      const type = config.type ?? 'success';
      const fullConfig: ToastConfig = {
        ...config,
        type,
        position: config.position ?? 'top',
        dismissible: config.dismissible ?? true,
      };

      setToastConfig(fullConfig);
      setVisible(true);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss using type-specific duration or custom duration
      const duration = config.duration ?? DEFAULT_DURATIONS[type];
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [opacity, hideToast]
  );

  const type = toastConfig?.type ?? 'success';
  const styles = TOAST_STYLES[type][isDark ? 'dark' : 'light'];
  const position = toastConfig?.position ?? 'top';
  const dismissible = toastConfig?.dismissible ?? true;

  // Calculate position style
  const positionStyle =
    position === 'top' ? { top: insets.top + 8 } : { bottom: insets.bottom + 8 };

  // Build accessibility label including title if present
  const accessibilityLabel = toastConfig?.title
    ? `${toastConfig.title}: ${toastConfig.message}`
    : (toastConfig?.message ?? '');

  const iconColor = ICON_COLORS[type][isDark ? 'dark' : 'light'];

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && toastConfig && (
        <Animated.View
          style={[containerStyles.container, positionStyle, { opacity }]}
          testID={toastConfig.testID ?? 'toast-container'}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={accessibilityLabel}
        >
          <Box
            bg={styles.bg}
            borderRadius="$xl"
            p="$3"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.15}
            shadowRadius={8}
            elevation={5}
            testID="toast-content"
          >
            <HStack space="sm" alignItems="center" flex={1}>
              <ToastIcon type={type} isDark={isDark} />
              <VStack flex={1} space="xs">
                {toastConfig.title && (
                  <Text color={styles.text} fontSize="$sm" fontWeight="$bold" testID="toast-title">
                    {toastConfig.title}
                  </Text>
                )}
                <Text
                  color={styles.text}
                  fontSize="$sm"
                  fontWeight="$medium"
                  testID="toast-message"
                >
                  {toastConfig.message}
                </Text>
                {toastConfig.action && (
                  <Pressable
                    onPress={() => {
                      toastConfig.action?.onPress();
                      hideToast();
                    }}
                    minHeight={44}
                    justifyContent="center"
                    mt="$1"
                    accessibilityRole="button"
                    accessibilityLabel={toastConfig.action.label}
                    testID={toastConfig.action.testID ?? 'toast-action-button'}
                  >
                    <Text
                      color={styles.text}
                      fontSize="$sm"
                      fontWeight="$bold"
                      textDecorationLine="underline"
                    >
                      {toastConfig.action.label}
                    </Text>
                  </Pressable>
                )}
              </VStack>
              {dismissible && (
                <Pressable
                  onPress={hideToast}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss notification"
                  accessibilityHint="Double tap to dismiss this notification"
                  p="$1"
                  minWidth={44}
                  minHeight={44}
                  justifyContent="center"
                  alignItems="center"
                  testID="toast-dismiss-button"
                >
                  <X size={18} color={iconColor} />
                </Pressable>
              )}
            </HStack>
          </Box>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Only keep minimal StyleSheet for Animated.View positioning
// All other styles use GlueStack UI tokens
const containerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});
