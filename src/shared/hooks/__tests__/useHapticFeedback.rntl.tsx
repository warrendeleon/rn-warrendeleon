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
    it('should trigger success haptic on form submission success', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
    });

    it('should trigger error haptic on validation failure', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('error');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationError', expect.any(Object));
    });

    it('should trigger warning haptic on destructive action', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('warning');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationWarning', expect.any(Object));
    });

    it('should trigger selection haptic on picker change', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('selection');
      });

      expect(mockTrigger).toHaveBeenCalledWith('selection', expect.any(Object));
    });

    it('should trigger impact haptic for general feedback', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('impact');
      });

      const expectedType = Platform.OS === 'ios' ? 'impactLight' : 'impactMedium';
      expect(mockTrigger).toHaveBeenCalledWith(expectedType, expect.any(Object));
    });

    it('should trigger notification haptic for alerts', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('notification');
      });

      expect(mockTrigger).toHaveBeenCalledWith('impactMedium', expect.any(Object));
    });

    it('should allow raw haptic type triggering', () => {
      const { result } = renderHook(() => useHapticFeedback());
      const { HapticFeedbackTypes } = require('react-native-haptic-feedback');

      act(() => {
        result.current.triggerRaw(HapticFeedbackTypes.impactHeavy);
      });

      expect(mockTrigger).toHaveBeenCalledWith(HapticFeedbackTypes.impactHeavy, expect.any(Object));
    });

    it('should trigger multiple haptics in sequence', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('selection');
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledTimes(2);
      expect(mockTrigger).toHaveBeenNthCalledWith(1, 'selection', expect.any(Object));
      expect(mockTrigger).toHaveBeenNthCalledWith(2, 'notificationSuccess', expect.any(Object));
    });
  });

  describe('Accessibility Integration', () => {
    it('should be enabled by default when reduced motion is not preferred', () => {
      mockPrefersReducedMotion.mockReturnValue(false);

      const { result } = renderHook(() => useHapticFeedback());

      expect(result.current.isEnabled).toBe(true);
    });

    it('should respect system reduced motion preferences by default', () => {
      mockPrefersReducedMotion.mockReturnValue(true);

      const { result } = renderHook(() => useHapticFeedback());

      expect(result.current.isEnabled).toBe(false);

      act(() => {
        result.current.trigger('success');
      });

      // Should not trigger when reduced motion is preferred
      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should allow ignoring reduced motion setting when specified', () => {
      mockPrefersReducedMotion.mockReturnValue(true);

      const { result } = renderHook(() => useHapticFeedback({ respectReducedMotion: false }));

      expect(result.current.isEnabled).toBe(true);

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalled();
    });

    it('should not trigger haptic when disabled due to reduced motion', () => {
      mockPrefersReducedMotion.mockReturnValue(true);

      const { result } = renderHook(() => useHapticFeedback());

      const allActions: HapticFeedbackAction[] = [
        'success',
        'error',
        'warning',
        'selection',
        'impact',
        'notification',
      ];

      act(() => {
        allActions.forEach(action => result.current.trigger(action));
      });

      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('System Settings', () => {
    it('should enable vibrate fallback by default', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enableVibrateFallback: true,
        })
      );
    });

    it('should allow disabling vibrate fallback', () => {
      const { result } = renderHook(() => useHapticFeedback({ enableVibrateFallback: false }));

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enableVibrateFallback: false,
        })
      );
    });

    it('should not ignore Android system settings by default', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ignoreAndroidSystemSettings: false,
        })
      );
    });

    it('should allow ignoring Android system settings', () => {
      const { result } = renderHook(() => useHapticFeedback({ ignoreAndroidSystemSettings: true }));

      act(() => {
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
    it('should maintain stable function references across renders', () => {
      const { result, rerender } = renderHook(() => useHapticFeedback());

      const initialTrigger = result.current.trigger;
      const initialTriggerRaw = result.current.triggerRaw;

      rerender({});

      expect(result.current.trigger).toBe(initialTrigger);
      expect(result.current.triggerRaw).toBe(initialTriggerRaw);
    });

    it('should update functions when options change', () => {
      const { result, rerender } = renderHook(
        (props: { options: { enableVibrateFallback: boolean } }) =>
          useHapticFeedback(props.options),
        { initialProps: { options: { enableVibrateFallback: true } } }
      );

      const initialTrigger = result.current.trigger;

      rerender({ options: { enableVibrateFallback: false } });

      // Function reference should change when options change
      expect(result.current.trigger).not.toBe(initialTrigger);
    });

    it('should handle rapid trigger calls without errors', () => {
      const { result } = renderHook(() => useHapticFeedback());

      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            result.current.trigger('selection');
          }
        });
      }).not.toThrow();

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

    it.each(actionTypes)('should handle "%s" action type', action => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger(action);
      });

      expect(mockTrigger).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should work when called immediately after mounting', () => {
      const { result } = renderHook(() => useHapticFeedback());

      // Call trigger synchronously after render
      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalled();
    });

    it('should handle unmount gracefully', () => {
      const { result, unmount } = renderHook(() => useHapticFeedback());

      const { trigger } = result.current;

      unmount();

      // Should not throw when called after unmount
      expect(() => {
        act(() => {
          trigger('success');
        });
      }).not.toThrow();
    });

    it('should return consistent isEnabled value', () => {
      mockPrefersReducedMotion.mockReturnValue(false);

      const { result, rerender } = renderHook(() => useHapticFeedback());

      expect(result.current.isEnabled).toBe(true);

      // Rerender multiple times
      rerender({});
      rerender({});
      rerender({});

      expect(result.current.isEnabled).toBe(true);
    });

    it('should handle concurrent triggers without race conditions', () => {
      const { result } = renderHook(() => useHapticFeedback());

      // Trigger multiple haptics in same act block
      act(() => {
        result.current.trigger('success');
        result.current.trigger('error');
        result.current.trigger('selection');
      });

      expect(mockTrigger).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid sequential triggers correctly', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        // Rapid triggers of the same type
        result.current.trigger('selection');
      });

      act(() => {
        result.current.trigger('selection');
      });

      act(() => {
        result.current.trigger('selection');
      });

      // All triggers should fire
      expect(mockTrigger).toHaveBeenCalledTimes(3);
    });

    it('should handle different action types in sequence', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('success');
      });

      act(() => {
        result.current.trigger('error');
      });

      act(() => {
        result.current.trigger('warning');
      });

      expect(mockTrigger).toHaveBeenCalledTimes(3);
      expect(mockTrigger).toHaveBeenNthCalledWith(1, 'notificationSuccess', expect.any(Object));
      expect(mockTrigger).toHaveBeenNthCalledWith(2, 'notificationError', expect.any(Object));
      expect(mockTrigger).toHaveBeenNthCalledWith(3, 'notificationWarning', expect.any(Object));
    });
  });

  describe('Platform-Specific Behaviour', () => {
    it('should trigger haptic regardless of platform', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
    });

    it('should use impact type based on current platform', () => {
      const { result } = renderHook(() => useHapticFeedback());

      act(() => {
        result.current.trigger('impact');
      });

      // Platform.OS is mocked to 'ios' by default in jest setup
      expect(mockTrigger).toHaveBeenCalledWith(
        expect.stringMatching(/^impact(Light|Medium)$/),
        expect.any(Object)
      );
    });

    it('should apply options to all platform triggers', () => {
      const { result } = renderHook(() =>
        useHapticFeedback({ enableVibrateFallback: false, ignoreAndroidSystemSettings: true })
      );

      act(() => {
        result.current.trigger('success');
      });

      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: true,
      });
    });
  });
});
