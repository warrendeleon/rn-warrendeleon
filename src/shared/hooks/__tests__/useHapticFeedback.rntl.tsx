/**
 * useHapticFeedback Hook Tests
 *
 * Tests for haptic feedback as an accessibility alternative to visual/audio feedback.
 * Validates feedback triggering, system preference respect, and platform behaviour.
 */

import { Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { act, renderHook } from '@testing-library/react-native';

import { HapticFeedbackAction, useHapticFeedback } from '../useHapticFeedback';

// Mock useReducedMotion
const mockPrefersReducedMotion = jest.fn(() => false);
jest.mock('../useReducedMotion', () => ({
  useReducedMotion: () => ({
    prefersReducedMotion: mockPrefersReducedMotion(),
  }),
}));

describe('useHapticFeedback', () => {
  const mockTrigger = ReactNativeHapticFeedback.trigger as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefersReducedMotion.mockReturnValue(false);
  });

  describe('Feedback Triggering', () => {
    it('should trigger success haptic on form submission success', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
    });

    it('should trigger error haptic on validation failure', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('error');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationError', expect.any(Object));
    });

    it('should trigger warning haptic on destructive action', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('warning');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationWarning', expect.any(Object));
    });

    it('should trigger selection haptic on picker change', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('selection');
      });

      expect(mockTrigger).toHaveBeenCalledWith('selection', expect.any(Object));
    });

    it('should trigger impact haptic for general feedback', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('impact');
      });

      const expectedType = Platform.OS === 'ios' ? 'impactLight' : 'impactMedium';
      expect(mockTrigger).toHaveBeenCalledWith(expectedType, expect.any(Object));
    });

    it('should trigger notification haptic for alerts', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('notification');
      });

      expect(mockTrigger).toHaveBeenCalledWith('impactMedium', expect.any(Object));
    });

    it('should allow raw haptic type triggering', async () => {
      const { result } = await renderHook(() => useHapticFeedback());
      const { HapticFeedbackTypes } = require('react-native-haptic-feedback');

      await act(() => {
        result.current.triggerRaw(HapticFeedbackTypes.impactHeavy);
      });

      expect(mockTrigger).toHaveBeenCalledWith(HapticFeedbackTypes.impactHeavy, expect.any(Object));
    });

    it('should trigger multiple haptics in sequence', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('selection');
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledTimes(2);
      expect(mockTrigger).toHaveBeenNthCalledWith(1, 'selection', expect.any(Object));
      expect(mockTrigger).toHaveBeenNthCalledWith(2, 'notificationSuccess', expect.any(Object));
    });
  });

  describe('Accessibility Integration', () => {
    it('should be enabled by default when reduced motion is not preferred', async () => {
      mockPrefersReducedMotion.mockReturnValue(false);

      const { result } = await renderHook(() => useHapticFeedback());

      expect(result.current.isEnabled).toBe(true);
    });

    it('should respect system reduced motion preferences by default', async () => {
      mockPrefersReducedMotion.mockReturnValue(true);

      const { result } = await renderHook(() => useHapticFeedback());

      expect(result.current.isEnabled).toBe(false);

      await act(() => {
        result.current.trigger('success');
      });

      // Should not trigger when reduced motion is preferred
      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should allow ignoring reduced motion setting when specified', async () => {
      mockPrefersReducedMotion.mockReturnValue(true);

      const { result } = await renderHook(() => useHapticFeedback({ respectReducedMotion: false }));

      expect(result.current.isEnabled).toBe(true);

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalled();
    });

    it('should not trigger haptic when disabled due to reduced motion', async () => {
      mockPrefersReducedMotion.mockReturnValue(true);

      const { result } = await renderHook(() => useHapticFeedback());

      const allActions: HapticFeedbackAction[] = [
        'success',
        'error',
        'warning',
        'selection',
        'impact',
        'notification',
      ];

      await act(() => {
        allActions.forEach(action => result.current.trigger(action));
      });

      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('System Settings', () => {
    it('should enable vibrate fallback by default', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enableVibrateFallback: true,
        })
      );
    });

    it('should allow disabling vibrate fallback', async () => {
      const { result } = await renderHook(() =>
        useHapticFeedback({ enableVibrateFallback: false })
      );

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enableVibrateFallback: false,
        })
      );
    });

    it('should not ignore Android system settings by default', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ignoreAndroidSystemSettings: false,
        })
      );
    });

    it('should allow ignoring Android system settings', async () => {
      const { result } = await renderHook(() =>
        useHapticFeedback({ ignoreAndroidSystemSettings: true })
      );

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ignoreAndroidSystemSettings: true,
        })
      );
    });
  });

  describe('Hook Stability', () => {
    it('should maintain stable function references across renders', async () => {
      const { result, rerender } = await renderHook(() => useHapticFeedback());

      const initialTrigger = result.current.trigger;
      const initialTriggerRaw = result.current.triggerRaw;

      await rerender({});

      expect(result.current.trigger).toBe(initialTrigger);
      expect(result.current.triggerRaw).toBe(initialTriggerRaw);
    });

    it('should update functions when options change', async () => {
      const { result, rerender } = await renderHook(
        (props: { options: { enableVibrateFallback: boolean } }) =>
          useHapticFeedback(props.options),
        { initialProps: { options: { enableVibrateFallback: true } } }
      );

      const initialTrigger = result.current.trigger;

      await rerender({ options: { enableVibrateFallback: false } });

      // Function reference should change when options change
      expect(result.current.trigger).not.toBe(initialTrigger);
    });

    it('should handle rapid trigger calls without errors', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await expect(
        act(() => {
          for (let i = 0; i < 100; i++) {
            result.current.trigger('selection');
          }
        })
      ).resolves.toBeUndefined();

      expect(mockTrigger).toHaveBeenCalledTimes(100);
    });
  });

  describe('All Action Types', () => {
    const actionTypes: HapticFeedbackAction[] = [
      'success',
      'error',
      'warning',
      'selection',
      'impact',
      'notification',
    ];

    it.each(actionTypes)('should handle "%s" action type', async action => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger(action);
      });

      expect(mockTrigger).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should work when called immediately after mounting', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      // Call trigger synchronously after render
      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalled();
    });

    it('should handle unmount gracefully', async () => {
      const { result, unmount } = await renderHook(() => useHapticFeedback());

      const { trigger } = result.current;

      await unmount();

      // Should not throw when called after unmount
      await expect(
        act(() => {
          trigger('success');
        })
      ).resolves.toBeUndefined();
    });

    it('should return consistent isEnabled value', async () => {
      mockPrefersReducedMotion.mockReturnValue(false);

      const { result, rerender } = await renderHook(() => useHapticFeedback());

      expect(result.current.isEnabled).toBe(true);

      // Rerender multiple times
      await rerender({});
      await rerender({});
      await rerender({});

      expect(result.current.isEnabled).toBe(true);
    });

    it('should handle concurrent triggers without race conditions', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      // Trigger multiple haptics in same act block
      await act(() => {
        result.current.trigger('success');
        result.current.trigger('error');
        result.current.trigger('selection');
      });

      expect(mockTrigger).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid sequential triggers correctly', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        // Rapid triggers of the same type
        result.current.trigger('selection');
      });

      await act(() => {
        result.current.trigger('selection');
      });

      await act(() => {
        result.current.trigger('selection');
      });

      // All triggers should fire
      expect(mockTrigger).toHaveBeenCalledTimes(3);
    });

    it('should handle different action types in sequence', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('success');
      });

      await act(() => {
        result.current.trigger('error');
      });

      await act(() => {
        result.current.trigger('warning');
      });

      expect(mockTrigger).toHaveBeenCalledTimes(3);
      expect(mockTrigger).toHaveBeenNthCalledWith(1, 'notificationSuccess', expect.any(Object));
      expect(mockTrigger).toHaveBeenNthCalledWith(2, 'notificationError', expect.any(Object));
      expect(mockTrigger).toHaveBeenNthCalledWith(3, 'notificationWarning', expect.any(Object));
    });
  });

  describe('Platform-Specific Behaviour', () => {
    it('should trigger haptic regardless of platform', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
    });

    it('should use impact type based on current platform', async () => {
      const { result } = await renderHook(() => useHapticFeedback());

      await act(() => {
        result.current.trigger('impact');
      });

      // Platform.OS is mocked to 'ios' by default in jest setup
      expect(mockTrigger).toHaveBeenCalledWith(
        expect.stringMatching(/^impact(Light|Medium)$/),
        expect.any(Object)
      );
    });

    it('should apply options to all platform triggers', async () => {
      const { result } = await renderHook(() =>
        useHapticFeedback({ enableVibrateFallback: false, ignoreAndroidSystemSettings: true })
      );

      await act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: true,
      });
    });
  });
});
