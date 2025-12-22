/**
 * Hook for detecting user's reduced motion preference
 *
 * EAA (European Accessibility Act) compliance requires respecting user preferences
 * for reduced motion (WCAG 2.1 Level AA - 2.3.3 Animation from Interactions).
 *
 * When enabled:
 * - Animations should be disabled or minimal
 * - Transitions should be instant or very short
 * - Auto-playing content should stop
 * - Parallax effects should be disabled
 */

import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export interface UseReducedMotionResult {
  /** Whether the user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether the check is still loading */
  isLoading: boolean;
}

/**
 * Hook that detects if the user has enabled "Reduce Motion" in their device settings.
 *
 * On iOS, this corresponds to Settings > Accessibility > Motion > Reduce Motion
 * On Android, this corresponds to Settings > Accessibility > Remove Animations
 *
 * @returns Object with prefersReducedMotion boolean and loading state
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useReducedMotion();
 *
 * return (
 *   <View style={prefersReducedMotion ? styles.static : styles.animated}>
 *     {prefersReducedMotion ? <StaticContent /> : <AnimatedContent />}
 *   </View>
 * );
 * ```
 */
export function useReducedMotion(): UseReducedMotionResult {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkReducedMotion = useCallback(async () => {
    try {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setPrefersReducedMotion(isReduceMotionEnabled);
    } catch {
      // Default to false if check fails
      setPrefersReducedMotion(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkReducedMotion();

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        setPrefersReducedMotion(isEnabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [checkReducedMotion]);

  return {
    prefersReducedMotion,
    isLoading,
  };
}
