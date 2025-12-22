/**
 * useHapticFeedback Hook
 *
 * Provides haptic feedback utilities as an accessibility alternative
 * to visual/audio feedback. Respects system preferences and device capabilities.
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';

import { useReducedMotion } from './useReducedMotion';

/**
 * Haptic feedback type mapping for semantic feedback actions
 */
export type HapticFeedbackAction =
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'impact'
  | 'notification';

/**
 * Default haptic options
 */
const DEFAULT_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Maps semantic actions to platform-specific haptic types
 */
const ACTION_TO_HAPTIC_TYPE: Record<HapticFeedbackAction, HapticFeedbackTypes> = {
  success:
    Platform.OS === 'ios'
      ? HapticFeedbackTypes.notificationSuccess
      : HapticFeedbackTypes.notificationSuccess,
  error:
    Platform.OS === 'ios'
      ? HapticFeedbackTypes.notificationError
      : HapticFeedbackTypes.notificationError,
  warning:
    Platform.OS === 'ios'
      ? HapticFeedbackTypes.notificationWarning
      : HapticFeedbackTypes.notificationWarning,
  selection: Platform.OS === 'ios' ? HapticFeedbackTypes.selection : HapticFeedbackTypes.selection,
  impact:
    Platform.OS === 'ios' ? HapticFeedbackTypes.impactLight : HapticFeedbackTypes.impactMedium,
  notification:
    Platform.OS === 'ios' ? HapticFeedbackTypes.impactMedium : HapticFeedbackTypes.impactMedium,
};

export interface UseHapticFeedbackOptions {
  /** Whether to respect reduced motion settings (default: true) */
  respectReducedMotion?: boolean;
  /** Enable vibrate fallback on devices without haptic engine */
  enableVibrateFallback?: boolean;
  /** Whether to ignore Android system haptic settings */
  ignoreAndroidSystemSettings?: boolean;
}

export interface UseHapticFeedbackResult {
  /** Trigger haptic feedback for a semantic action */
  trigger: (action: HapticFeedbackAction) => void;
  /** Trigger raw haptic feedback type */
  triggerRaw: (type: HapticFeedbackTypes) => void;
  /** Whether haptic feedback is enabled */
  isEnabled: boolean;
}

/**
 * Hook for triggering haptic feedback as an accessibility feature.
 *
 * Provides semantic haptic feedback (success, error, warning) that serves
 * as an alternative feedback mechanism for users who may not rely on
 * visual or audio cues.
 *
 * @example
 * ```tsx
 * const { trigger } = useHapticFeedback();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await submitForm();
 *     trigger('success');
 *   } catch {
 *     trigger('error');
 *   }
 * };
 * ```
 */
export const useHapticFeedback = (
  options: UseHapticFeedbackOptions = {}
): UseHapticFeedbackResult => {
  const {
    respectReducedMotion = true,
    enableVibrateFallback = DEFAULT_OPTIONS.enableVibrateFallback,
    ignoreAndroidSystemSettings = DEFAULT_OPTIONS.ignoreAndroidSystemSettings,
  } = options;

  const { prefersReducedMotion } = useReducedMotion();

  // Disable haptics if user prefers reduced motion and we respect that
  const isEnabled = !(respectReducedMotion && prefersReducedMotion);

  const triggerRaw = useCallback(
    (type: HapticFeedbackTypes) => {
      if (!isEnabled) {
        return;
      }

      ReactNativeHapticFeedback.trigger(type, {
        enableVibrateFallback,
        ignoreAndroidSystemSettings,
      });
    },
    [isEnabled, enableVibrateFallback, ignoreAndroidSystemSettings]
  );

  const trigger = useCallback(
    (action: HapticFeedbackAction) => {
      const hapticType = ACTION_TO_HAPTIC_TYPE[action];
      triggerRaw(hapticType);
    },
    [triggerRaw]
  );

  return {
    trigger,
    triggerRaw,
    isEnabled,
  };
};
