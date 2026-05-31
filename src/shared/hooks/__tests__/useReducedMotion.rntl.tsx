/**
 * Tests for useReducedMotion hook
 *
 * EAA (European Accessibility Act) compliance tests for reduced motion preference detection.
 * WCAG 2.1 Level AA - 2.3.3 Animation from Interactions
 */

import React from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react-native';

import { useReducedMotion } from '../useReducedMotion';

// Create typed mock functions
const mockIsReduceMotionEnabled = jest.fn<Promise<boolean>, []>();
const mockAddEventListener = jest.fn<
  { remove: () => void },
  [string, (isEnabled: boolean) => void]
>();
const mockRemove = jest.fn();

// Override AccessibilityInfo methods
beforeEach(() => {
  jest.clearAllMocks();

  // Set default mock implementations
  mockIsReduceMotionEnabled.mockResolvedValue(false);
  mockAddEventListener.mockReturnValue({ remove: mockRemove });

  // Apply mocks to AccessibilityInfo
  (AccessibilityInfo.isReduceMotionEnabled as jest.Mock) = mockIsReduceMotionEnabled;
  (AccessibilityInfo.addEventListener as jest.Mock) = mockAddEventListener;
});

describe('useReducedMotion', () => {
  let reduceMotionChangeHandler: ((isEnabled: boolean) => void) | null;

  beforeEach(() => {
    reduceMotionChangeHandler = null;

    // Capture the handler when addEventListener is called
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'reduceMotionChanged') {
        reduceMotionChangeHandler = handler;
      }
      return { remove: mockRemove };
    });
  });

  describe('initial state', () => {
    it('starts with loading true', async () => {
      mockIsReduceMotionEnabled.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = await renderHook(() => useReducedMotion());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.prefersReducedMotion).toBe(false);
    });

    it('sets loading to false after initial check', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('reduced motion detection', () => {
    it('detects when reduced motion is enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.prefersReducedMotion).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('detects when reduced motion is disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.prefersReducedMotion).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('event listener', () => {
    it('subscribes to reduceMotionChanged event on mount', async () => {
      await renderHook(() => useReducedMotion());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'reduceMotionChanged',
        expect.any(Function)
      );
    });

    it('unsubscribes on unmount', async () => {
      const { unmount } = await renderHook(() => useReducedMotion());

      await unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('updates state when reduced motion changes to enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(false);

      // Simulate user enabling reduced motion
      await act(() => {
        reduceMotionChangeHandler?.(true);
      });

      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('updates state when reduced motion changes to disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(true);

      // Simulate user disabling reduced motion
      await act(() => {
        reduceMotionChangeHandler?.(false);
      });

      expect(result.current.prefersReducedMotion).toBe(false);
    });
  });

  describe('error handling', () => {
    it('defaults to false when AccessibilityInfo check fails', async () => {
      mockIsReduceMotionEnabled.mockRejectedValue(new Error('AccessibilityInfo not available'));

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(false);
    });

    it('sets loading to false even after error', async () => {
      mockIsReduceMotionEnabled.mockRejectedValue(new Error('Test error'));

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('integration with component', () => {
    const MotionAwareComponent = () => {
      const { prefersReducedMotion, isLoading } = useReducedMotion();

      if (isLoading) {
        return (
          <View testID="loading">
            <Text>Loading...</Text>
          </View>
        );
      }

      return (
        <View testID="content">
          <Text testID="motion-status">
            {prefersReducedMotion ? 'Animations disabled' : 'Animations enabled'}
          </Text>
        </View>
      );
    };

    it('renders loading state initially', async () => {
      mockIsReduceMotionEnabled.mockReturnValue(new Promise(() => {})); // Never resolves

      await render(<MotionAwareComponent />);

      expect(screen.getByTestId('loading')).toBeOnTheScreen();
    });

    it('shows animations disabled when reduced motion is enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<MotionAwareComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('motion-status')).toHaveTextContent('Animations disabled');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows animations enabled when reduced motion is disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<MotionAwareComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('motion-status')).toHaveTextContent('Animations enabled');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('updates UI when preference changes at runtime', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<MotionAwareComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('motion-status')).toHaveTextContent('Animations enabled');
        },
        { timeout: 3000, interval: 100 }
      );

      // Simulate preference change
      await act(() => {
        reduceMotionChangeHandler?.(true);
      });

      expect(screen.getByTestId('motion-status')).toHaveTextContent('Animations disabled');
    });
  });
});

describe('useReducedMotion EAA compliance scenarios', () => {
  beforeEach(() => {
    mockAddEventListener.mockImplementation(() => {
      return { remove: mockRemove };
    });
  });

  describe('animation behaviour based on preference', () => {
    it('hook returns true when user has enabled Reduce Motion (iOS)', async () => {
      // iOS: Settings > Accessibility > Motion > Reduce Motion
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('hook returns true when user has enabled Remove Animations (Android)', async () => {
      // Android: Settings > Accessibility > Remove Animations
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('hook returns false by default when preference not set', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(false);
    });
  });

  describe('essential animations preserved', () => {
    /**
     * Per WCAG 2.3.3, essential animations should still work.
     * This test verifies the hook allows components to distinguish
     * between essential and decorative animations.
     */
    const AnimatedComponent = ({ essentialAnimation }: { essentialAnimation?: boolean }) => {
      const { prefersReducedMotion } = useReducedMotion();

      // Essential animations should work even with reduced motion
      const shouldAnimate = essentialAnimation || !prefersReducedMotion;

      return (
        <View testID="animated-view">
          <Text testID="animation-status">{shouldAnimate ? 'Animated' : 'Static'}</Text>
        </View>
      );
    };

    it('allows essential animations when reduced motion is enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<AnimatedComponent essentialAnimation={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-status')).toHaveTextContent('Animated');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('disables decorative animations when reduced motion is enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<AnimatedComponent essentialAnimation={false} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-status')).toHaveTextContent('Static');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('allows all animations when reduced motion is disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<AnimatedComponent essentialAnimation={false} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-status')).toHaveTextContent('Animated');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('animation alternatives', () => {
    /**
     * When reduced motion is enabled, provide alternatives:
     * - Fade instead of slide
     * - Instant instead of animated
     * - Static instead of parallax
     */
    const TransitionComponent = () => {
      const { prefersReducedMotion } = useReducedMotion();

      const transitionType = prefersReducedMotion ? 'fade' : 'slide';
      const duration = prefersReducedMotion ? 0 : 300;

      return (
        <View testID="transition-view">
          <Text testID="transition-type">{transitionType}</Text>
          <Text testID="duration">{duration}</Text>
        </View>
      );
    };

    it('uses fade transition instead of slide when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<TransitionComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('transition-type')).toHaveTextContent('fade');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses instant duration (0) when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<TransitionComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('duration')).toHaveTextContent('0');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses slide transition when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<TransitionComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('transition-type')).toHaveTextContent('slide');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses animated duration (300) when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<TransitionComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('duration')).toHaveTextContent('300');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('auto-playing content', () => {
    /**
     * WCAG 2.2.2 requires auto-playing content to be pausable/stoppable
     * With reduced motion, auto-playing content should be stopped by default
     */
    const AutoPlayingContent = () => {
      const { prefersReducedMotion } = useReducedMotion();

      const isPlaying = !prefersReducedMotion;

      return (
        <View testID="auto-content">
          <Text testID="play-state">{isPlaying ? 'Playing' : 'Stopped'}</Text>
        </View>
      );
    };

    it('stops auto-playing content when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<AutoPlayingContent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('play-state')).toHaveTextContent('Stopped');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('allows auto-playing when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<AutoPlayingContent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('play-state')).toHaveTextContent('Playing');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('parallax effects', () => {
    /**
     * Parallax scrolling can cause motion sickness.
     * With reduced motion, parallax should be disabled.
     */
    const ParallaxComponent = () => {
      const { prefersReducedMotion } = useReducedMotion();

      return (
        <View testID="parallax-container">
          <Text testID="parallax-enabled">
            {prefersReducedMotion ? 'Parallax disabled' : 'Parallax enabled'}
          </Text>
        </View>
      );
    };

    it('disables parallax when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<ParallaxComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('parallax-enabled')).toHaveTextContent('Parallax disabled');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('enables parallax when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<ParallaxComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('parallax-enabled')).toHaveTextContent('Parallax enabled');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});

describe('useReducedMotion advanced motion preference tests', () => {
  beforeEach(() => {
    mockAddEventListener.mockImplementation(() => {
      return { remove: mockRemove };
    });
  });

  describe('prefers-reduced-motion system setting detection', () => {
    /**
     * Tests for detecting and respecting the system's prefers-reduced-motion setting.
     * WCAG 2.3.3 - Animation from Interactions (Level AAA, but recommended for EAA)
     */
    it('detects iOS Reduce Motion system setting', async () => {
      // iOS: Settings > Accessibility > Motion > Reduce Motion = ON
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Should detect iOS Reduce Motion setting
      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('detects Android Remove Animations system setting', async () => {
      // Android: Settings > Accessibility > Remove Animations = ON
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Should detect Android Remove Animations setting
      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('correctly reports when motion preference is not set', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(false);
    });

    it('handles rapid preference changes', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);
      let changeHandler: ((isEnabled: boolean) => void) | null = null;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'reduceMotionChanged') {
          changeHandler = handler;
        }
        return { remove: mockRemove };
      });

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Simulate rapid changes (user toggling setting multiple times)
      await act(() => {
        changeHandler?.(true);
      });
      expect(result.current.prefersReducedMotion).toBe(true);

      await act(() => {
        changeHandler?.(false);
      });
      expect(result.current.prefersReducedMotion).toBe(false);

      await act(() => {
        changeHandler?.(true);
      });
      expect(result.current.prefersReducedMotion).toBe(true);
    });
  });

  describe('static feedback alternatives', () => {
    /**
     * When reduced motion is enabled, provide non-animated alternatives
     * that still communicate the same information effectively.
     */
    const FeedbackComponent = () => {
      const { prefersReducedMotion } = useReducedMotion();

      return (
        <View testID="feedback-container">
          <Text testID="loading-indicator">
            {prefersReducedMotion ? 'Loading...' : 'Loading (animated spinner)'}
          </Text>
          <Text testID="success-indicator">
            {prefersReducedMotion ? '✓ Success' : 'Success (animated checkmark)'}
          </Text>
          <Text testID="error-indicator">
            {prefersReducedMotion ? '✗ Error occurred' : 'Error (shake animation)'}
          </Text>
        </View>
      );
    };

    it('provides static text for loading indicator when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<FeedbackComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Loading...');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('provides static checkmark for success when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<FeedbackComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('success-indicator')).toHaveTextContent('✓ Success');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('provides static error indicator when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<FeedbackComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('error-indicator')).toHaveTextContent('✗ Error occurred');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows animated indicators when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<FeedbackComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-indicator')).toHaveTextContent(
            'Loading (animated spinner)'
          );
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('navigation transition alternatives', () => {
    /**
     * Navigation transitions should use fade/none instead of slide
     * when reduced motion is enabled.
     */
    const NavigationTransition = ({ isNavigating }: { isNavigating: boolean }) => {
      const { prefersReducedMotion } = useReducedMotion();

      const animationType = prefersReducedMotion ? 'none' : 'slide_from_right';
      const animationDuration = prefersReducedMotion ? 0 : 350;

      return (
        <View testID="nav-transition">
          <Text testID="animation-type">{animationType}</Text>
          <Text testID="animation-duration">{animationDuration}</Text>
          <Text testID="is-navigating">{isNavigating ? 'Navigating' : 'Idle'}</Text>
        </View>
      );
    };

    it('uses no animation for navigation when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<NavigationTransition isNavigating={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-type')).toHaveTextContent('none');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses zero duration for transitions when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<NavigationTransition isNavigating={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-duration')).toHaveTextContent('0');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses slide animation when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<NavigationTransition isNavigating={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-type')).toHaveTextContent('slide_from_right');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('loading state alternatives', () => {
    /**
     * Loading states should use static indicators instead of spinning
     * or pulsing animations when reduced motion is enabled.
     */
    const LoadingStateComponent = ({ isLoading }: { isLoading: boolean }) => {
      const { prefersReducedMotion } = useReducedMotion();

      if (!isLoading) {
        return <Text testID="content">Content loaded</Text>;
      }

      return (
        <View testID="loading-state">
          <Text testID="loading-type">
            {prefersReducedMotion ? 'static-text' : 'animated-spinner'}
          </Text>
          <Text testID="loading-message">
            {prefersReducedMotion ? 'Please wait, loading...' : ''}
          </Text>
          <View
            testID="loading-indicator"
            accessibilityRole="progressbar"
            accessibilityLabel={prefersReducedMotion ? 'Loading in progress' : 'Loading animation'}
          />
        </View>
      );
    };

    it('displays static text loading indicator when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<LoadingStateComponent isLoading={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-type')).toHaveTextContent('static-text');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows descriptive loading message when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<LoadingStateComponent isLoading={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-message')).toHaveTextContent(
            'Please wait, loading...'
          );
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses appropriate accessibility label for loading indicator', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<LoadingStateComponent isLoading={true} />);

      await waitFor(
        () => {
          const indicator = screen.getByTestId('loading-indicator');
          expect(indicator.props.accessibilityLabel).toBe('Loading in progress');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('gesture feedback alternatives', () => {
    /**
     * Gesture feedback (like swipe actions) should provide
     * non-animated alternatives when reduced motion is enabled.
     */
    const SwipeableItem = () => {
      const { prefersReducedMotion } = useReducedMotion();

      const feedbackType = prefersReducedMotion ? 'highlight' : 'slide-reveal';

      return (
        <View testID="swipeable-item">
          <Text testID="feedback-type">{feedbackType}</Text>
          <Text testID="action-visibility">
            {prefersReducedMotion ? 'Actions always visible' : 'Swipe to reveal actions'}
          </Text>
        </View>
      );
    };

    it('uses highlight feedback instead of slide when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<SwipeableItem />);

      await waitFor(
        () => {
          expect(screen.getByTestId('feedback-type')).toHaveTextContent('highlight');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('makes actions always visible when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<SwipeableItem />);

      await waitFor(
        () => {
          expect(screen.getByTestId('action-visibility')).toHaveTextContent(
            'Actions always visible'
          );
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses slide-reveal feedback when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<SwipeableItem />);

      await waitFor(
        () => {
          expect(screen.getByTestId('feedback-type')).toHaveTextContent('slide-reveal');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('skeleton loading alternatives', () => {
    /**
     * Skeleton loading states often use shimmer animations.
     * With reduced motion, use static placeholders instead.
     */
    const SkeletonLoader = () => {
      const { prefersReducedMotion } = useReducedMotion();

      return (
        <View testID="skeleton-container">
          <View
            testID="skeleton-element"
            style={{
              backgroundColor: prefersReducedMotion ? '#E0E0E0' : undefined,
            }}
          >
            <Text testID="skeleton-type">
              {prefersReducedMotion ? 'static-placeholder' : 'shimmer-animation'}
            </Text>
          </View>
          <Text testID="skeleton-aria">
            {prefersReducedMotion ? 'Loading content' : 'Loading content (animated)'}
          </Text>
        </View>
      );
    };

    it('uses static placeholder when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<SkeletonLoader />);

      await waitFor(
        () => {
          expect(screen.getByTestId('skeleton-type')).toHaveTextContent('static-placeholder');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses static background colour for skeleton when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<SkeletonLoader />);

      await waitFor(
        () => {
          const element = screen.getByTestId('skeleton-element');
          expect(element.props.style.backgroundColor).toBe('#E0E0E0');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('provides descriptive aria label for loading state', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<SkeletonLoader />);

      await waitFor(
        () => {
          expect(screen.getByTestId('skeleton-aria')).toHaveTextContent('Loading content');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses shimmer animation when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<SkeletonLoader />);

      await waitFor(
        () => {
          expect(screen.getByTestId('skeleton-type')).toHaveTextContent('shimmer-animation');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('micro-interaction alternatives', () => {
    /**
     * Micro-interactions (button press feedback, toggle switches, etc.)
     * should have instant state changes when reduced motion is enabled.
     */
    const ToggleSwitch = () => {
      const { prefersReducedMotion } = useReducedMotion();

      return (
        <View testID="toggle-container">
          <Text testID="transition-duration">{prefersReducedMotion ? '0ms' : '200ms'}</Text>
          <Text testID="transition-type">{prefersReducedMotion ? 'instant' : 'spring'}</Text>
          <Text testID="visual-feedback">
            {prefersReducedMotion ? 'colour-change-only' : 'animated-knob'}
          </Text>
        </View>
      );
    };

    it('uses instant transitions when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<ToggleSwitch />);

      await waitFor(
        () => {
          expect(screen.getByTestId('transition-duration')).toHaveTextContent('0ms');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses instant transition type when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<ToggleSwitch />);

      await waitFor(
        () => {
          expect(screen.getByTestId('transition-type')).toHaveTextContent('instant');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses colour change only for feedback when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      await render(<ToggleSwitch />);

      await waitFor(
        () => {
          expect(screen.getByTestId('visual-feedback')).toHaveTextContent('colour-change-only');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('uses spring animation when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      await render(<ToggleSwitch />);

      await waitFor(
        () => {
          expect(screen.getByTestId('transition-type')).toHaveTextContent('spring');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});

describe('useReducedMotion edge cases and timing', () => {
  beforeEach(() => {
    mockAddEventListener.mockImplementation(() => {
      return { remove: mockRemove };
    });
  });

  describe('timing behaviour', () => {
    it('should handle slow AccessibilityInfo response', async () => {
      // Simulate slow response from system
      mockIsReduceMotionEnabled.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 500))
      );

      const { result } = await renderHook(() => useReducedMotion());

      expect(result.current.isLoading).toBe(true);

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('should handle very rapid initial checks', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      // Mount and unmount rapidly
      const { unmount: unmount1 } = await renderHook(() => useReducedMotion());
      const { unmount: unmount2 } = await renderHook(() => useReducedMotion());
      const { result: result3 } = await renderHook(() => useReducedMotion());

      await unmount1();
      await unmount2();

      await waitFor(
        () => {
          expect(result3.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should resolve loading state even with delayed response', async () => {
      let resolvePromise: (value: boolean) => void;
      mockIsReduceMotionEnabled.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve;
          })
      );

      const { result } = await renderHook(() => useReducedMotion());

      expect(result.current.isLoading).toBe(true);

      // Resolve after a delay
      await act(() => {
        resolvePromise!(true);
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('memory leak prevention', () => {
    it('should not update state after unmount', async () => {
      let changeHandler: ((isEnabled: boolean) => void) | null = null;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'reduceMotionChanged') {
          changeHandler = handler;
        }
        return { remove: mockRemove };
      });

      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { unmount } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(mockAddEventListener).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );

      await unmount();

      // Should not throw when handler is called after unmount
      expect(() => {
        changeHandler?.(true);
      }).not.toThrow();
    });

    it('should clean up subscription on unmount', async () => {
      const { unmount } = await renderHook(() => useReducedMotion());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'reduceMotionChanged',
        expect.any(Function)
      );

      await unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('should handle multiple mounts and unmounts cleanly', async () => {
      const { unmount: unmount1 } = await renderHook(() => useReducedMotion());
      const { unmount: unmount2 } = await renderHook(() => useReducedMotion());
      const { unmount: unmount3 } = await renderHook(() => useReducedMotion());

      await unmount1();
      await unmount2();
      await unmount3();

      expect(mockRemove).toHaveBeenCalledTimes(3);
    });
  });

  describe('state consistency', () => {
    it('should maintain consistent state across rerenders', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result, rerender } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      const initialValue = result.current.prefersReducedMotion;

      await rerender({});
      await rerender({});
      await rerender({});

      expect(result.current.prefersReducedMotion).toBe(initialValue);
    });

    it('should not flicker between states', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const states: boolean[] = [];

      const { result, rerender } = await renderHook(() => {
        const hook = useReducedMotion();
        if (!hook.isLoading) {
          states.push(hook.prefersReducedMotion);
        }
        return hook;
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await rerender({});
      await rerender({});

      // All non-loading states should be the same (no flickering)
      const uniqueStates = [...new Set(states)];
      expect(uniqueStates.length).toBe(1);
    });

    it('should handle transition from loading to loaded smoothly', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.prefersReducedMotion).toBe(false); // Default value

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // After loading, should still be false (consistent with resolved value)
      expect(result.current.prefersReducedMotion).toBe(false);
    });
  });

  describe('AccessibilityInfo API edge cases', () => {
    it('should handle AccessibilityInfo returning falsy values as false', async () => {
      // When API returns a falsy value, treat as "no reduced motion"
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(false);
    });

    it('should handle AccessibilityInfo returning truthy values as true', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('should recover from initial API error gracefully', async () => {
      // After an error, the hook should still resolve to a stable state
      mockIsReduceMotionEnabled.mockRejectedValueOnce(new Error('API unavailable'));

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Should default to false after error
      expect(result.current.prefersReducedMotion).toBe(false);
    });

    it('should maintain subscription after initial load', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      const { result } = await renderHook(() => useReducedMotion());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Subscription should have been created
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'reduceMotionChanged',
        expect.any(Function)
      );
    });
  });

  describe('concurrent usage', () => {
    it('should handle multiple hooks in same component', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const MultiHookComponent = () => {
        const hook1 = useReducedMotion();
        const hook2 = useReducedMotion();
        const hook3 = useReducedMotion();

        return (
          <View testID="multi-hook">
            <Text testID="hook1">{hook1.prefersReducedMotion ? 'yes' : 'no'}</Text>
            <Text testID="hook2">{hook2.prefersReducedMotion ? 'yes' : 'no'}</Text>
            <Text testID="hook3">{hook3.prefersReducedMotion ? 'yes' : 'no'}</Text>
          </View>
        );
      };

      await render(<MultiHookComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('hook1')).toHaveTextContent('yes');
          expect(screen.getByTestId('hook2')).toHaveTextContent('yes');
          expect(screen.getByTestId('hook3')).toHaveTextContent('yes');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle hooks in nested components', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      const ChildComponent = () => {
        const { prefersReducedMotion } = useReducedMotion();
        return <Text testID="child">{prefersReducedMotion ? 'yes' : 'no'}</Text>;
      };

      const ParentComponent = () => {
        const { prefersReducedMotion } = useReducedMotion();
        return (
          <View testID="parent">
            <Text testID="parent-text">{prefersReducedMotion ? 'yes' : 'no'}</Text>
            <ChildComponent />
          </View>
        );
      };

      await render(<ParentComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('parent-text')).toHaveTextContent('yes');
          expect(screen.getByTestId('child')).toHaveTextContent('yes');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
