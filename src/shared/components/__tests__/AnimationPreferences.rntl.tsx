/**
 * Tests for Animation Preferences component patterns
 *
 * Tests demonstrating how components should respect animation preferences
 * for EAA (European Accessibility Act) compliance.
 * WCAG 2.1 Level AA - 2.3.3 Animation from Interactions
 */

import React from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';

import { useReducedMotion } from '../../hooks/useReducedMotion';

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

  mockIsReduceMotionEnabled.mockResolvedValue(false);
  mockAddEventListener.mockReturnValue({ remove: mockRemove });

  (AccessibilityInfo.isReduceMotionEnabled as jest.Mock) = mockIsReduceMotionEnabled;
  (AccessibilityInfo.addEventListener as jest.Mock) = mockAddEventListener;
});

/**
 * Example animation-aware loading indicator component
 */
const AnimatedLoadingIndicator = () => {
  const { prefersReducedMotion, isLoading } = useReducedMotion();

  if (isLoading) {
    // Essential: Show non-animated loading while checking preferences
    return (
      <View testID="loading-indicator">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View testID="loading-indicator">
      <Text testID="animation-type">
        {prefersReducedMotion ? 'Static indicator' : 'Spinning indicator'}
      </Text>
    </View>
  );
};

/**
 * Example page transition component
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { prefersReducedMotion } = useReducedMotion();

  const transitionConfig = {
    type: prefersReducedMotion ? 'fade' : 'slide',
    duration: prefersReducedMotion ? 0 : 300,
    easing: prefersReducedMotion ? 'linear' : 'ease-out',
  };

  return (
    <View testID="page-transition" accessibilityLabel={`Page transition: ${transitionConfig.type}`}>
      <Text testID="transition-type">{transitionConfig.type}</Text>
      <Text testID="transition-duration">{transitionConfig.duration}ms</Text>
      <Text testID="transition-easing">{transitionConfig.easing}</Text>
      {children}
    </View>
  );
};

/**
 * Example carousel component with auto-play
 */
const AutoPlayCarousel = () => {
  const { prefersReducedMotion } = useReducedMotion();

  // Auto-play should be disabled when reduced motion is preferred
  const autoPlayEnabled = !prefersReducedMotion;

  return (
    <View testID="carousel">
      <Text testID="auto-play-status">Auto-play: {autoPlayEnabled ? 'enabled' : 'disabled'}</Text>
      <Text testID="transition-effect">Effect: {prefersReducedMotion ? 'instant' : 'slide'}</Text>
    </View>
  );
};

/**
 * Example success animation component
 */
const SuccessAnimation = () => {
  const { prefersReducedMotion } = useReducedMotion();

  return (
    <View testID="success-container" accessibilityRole="alert" accessibilityLiveRegion="polite">
      {prefersReducedMotion ? (
        // Static checkmark for reduced motion
        <Text testID="success-indicator">✓ Success</Text>
      ) : (
        // Animated checkmark for normal motion
        <View testID="animated-success">
          <Text testID="success-indicator">✓ Success (animated)</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Example skeleton loader component
 */
const SkeletonLoader = () => {
  const { prefersReducedMotion } = useReducedMotion();

  return (
    <View testID="skeleton-loader">
      <Text testID="skeleton-animation">
        {prefersReducedMotion ? 'Static skeleton' : 'Shimmer animation'}
      </Text>
    </View>
  );
};

/**
 * Example toast notification component
 */
const ToastNotification = ({ message }: { message: string }) => {
  const { prefersReducedMotion } = useReducedMotion();

  return (
    <View
      testID="toast"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <Text testID="toast-animation">
        {prefersReducedMotion ? 'Instant appearance' : 'Slide-in animation'}
      </Text>
      <Text testID="toast-message">{message}</Text>
    </View>
  );
};

describe('AnimatedLoadingIndicator', () => {
  it('shows spinning indicator when reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    render(<AnimatedLoadingIndicator />);

    await waitFor(
      () => {
        expect(screen.getByTestId('animation-type')).toHaveTextContent('Spinning indicator');
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('shows static indicator when reduced motion enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<AnimatedLoadingIndicator />);

    await waitFor(
      () => {
        expect(screen.getByTestId('animation-type')).toHaveTextContent('Static indicator');
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('shows loading state while checking preferences', async () => {
    mockIsReduceMotionEnabled.mockReturnValue(new Promise(() => {}));

    render(<AnimatedLoadingIndicator />);

    expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen();
    expect(screen.getByText('Loading...')).toBeOnTheScreen();
  });
});

describe('PageTransition', () => {
  it('uses slide transition when reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    render(
      <PageTransition>
        <Text>Page Content</Text>
      </PageTransition>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('transition-type')).toHaveTextContent('slide');
      },
      { timeout: 3000, interval: 100 }
    );
    expect(screen.getByTestId('transition-duration')).toHaveTextContent('300ms');
    expect(screen.getByTestId('transition-easing')).toHaveTextContent('ease-out');
  });

  it('uses fade transition with zero duration when reduced motion enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(
      <PageTransition>
        <Text>Page Content</Text>
      </PageTransition>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('transition-type')).toHaveTextContent('fade');
      },
      { timeout: 3000, interval: 100 }
    );
    expect(screen.getByTestId('transition-duration')).toHaveTextContent('0ms');
    expect(screen.getByTestId('transition-easing')).toHaveTextContent('linear');
  });

  it('has accessible transition label', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(
      <PageTransition>
        <Text>Page Content</Text>
      </PageTransition>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('page-transition')).toHaveAccessibleName('Page transition: fade');
      },
      { timeout: 3000, interval: 100 }
    );
  });
});

describe('AutoPlayCarousel', () => {
  it('enables auto-play when reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    render(<AutoPlayCarousel />);

    await waitFor(
      () => {
        expect(screen.getByTestId('auto-play-status')).toHaveTextContent('Auto-play: enabled');
      },
      { timeout: 3000, interval: 100 }
    );
    expect(screen.getByTestId('transition-effect')).toHaveTextContent('Effect: slide');
  });

  it('disables auto-play when reduced motion enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<AutoPlayCarousel />);

    await waitFor(
      () => {
        expect(screen.getByTestId('auto-play-status')).toHaveTextContent('Auto-play: disabled');
      },
      { timeout: 3000, interval: 100 }
    );
    expect(screen.getByTestId('transition-effect')).toHaveTextContent('Effect: instant');
  });
});

describe('SuccessAnimation', () => {
  it('shows animated success when reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    render(<SuccessAnimation />);

    await waitFor(
      () => {
        expect(screen.getByTestId('animated-success')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );
    expect(screen.getByTestId('success-indicator')).toHaveTextContent('✓ Success (animated)');
  });

  it('shows static success when reduced motion enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<SuccessAnimation />);

    await waitFor(
      () => {
        expect(screen.getByTestId('success-indicator')).toHaveTextContent('✓ Success');
      },
      { timeout: 3000, interval: 100 }
    );
    expect(screen.queryByTestId('animated-success')).not.toBeOnTheScreen();
  });

  it('has proper accessibility role and live region', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<SuccessAnimation />);

    await waitFor(
      () => {
        const container = screen.getByTestId('success-container');
        expect(container.props.accessibilityRole).toBe('alert');
        expect(container.props.accessibilityLiveRegion).toBe('polite');
      },
      { timeout: 3000, interval: 100 }
    );
  });
});

describe('SkeletonLoader', () => {
  it('shows shimmer animation when reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    render(<SkeletonLoader />);

    await waitFor(
      () => {
        expect(screen.getByTestId('skeleton-animation')).toHaveTextContent('Shimmer animation');
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('shows static skeleton when reduced motion enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<SkeletonLoader />);

    await waitFor(
      () => {
        expect(screen.getByTestId('skeleton-animation')).toHaveTextContent('Static skeleton');
      },
      { timeout: 3000, interval: 100 }
    );
  });
});

describe('ToastNotification', () => {
  it('uses slide animation when reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    render(<ToastNotification message="Operation successful" />);

    await waitFor(
      () => {
        expect(screen.getByTestId('toast-animation')).toHaveTextContent('Slide-in animation');
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('appears instantly when reduced motion enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<ToastNotification message="Operation successful" />);

    await waitFor(
      () => {
        expect(screen.getByTestId('toast-animation')).toHaveTextContent('Instant appearance');
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('has proper accessibility attributes for screen readers', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    render(<ToastNotification message="Operation successful" />);

    await waitFor(
      () => {
        const toast = screen.getByTestId('toast');
        expect(toast.props.accessibilityRole).toBe('alert');
        expect(toast.props.accessibilityLiveRegion).toBe('polite');
        expect(toast.props.accessibilityLabel).toBe('Operation successful');
      },
      { timeout: 3000, interval: 100 }
    );
  });
});

describe('Animation preferences EAA compliance patterns', () => {
  /**
   * WCAG 2.3.3 requires that motion animation triggered by interaction
   * can be disabled, unless the animation is essential.
   */
  describe('essential vs decorative animations', () => {
    const ProgressBar = ({
      progress,
      isEssential,
    }: {
      progress: number;
      isEssential?: boolean;
    }) => {
      const { prefersReducedMotion } = useReducedMotion();

      // Essential animations should work even with reduced motion
      // (e.g., progress indicators showing actual progress)
      const shouldAnimate = isEssential || !prefersReducedMotion;

      return (
        <View
          testID="progress-bar"
          accessibilityRole="progressbar"
          accessibilityValue={{ now: progress, min: 0, max: 100 }}
        >
          <Text testID="animation-state">{shouldAnimate ? 'Animated' : 'Static'}</Text>
          <Text testID="progress-value">{progress}%</Text>
        </View>
      );
    };

    it('animates essential progress when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      render(<ProgressBar progress={50} isEssential={true} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-state')).toHaveTextContent('Animated');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('does not animate decorative progress when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      render(<ProgressBar progress={50} isEssential={false} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('animation-state')).toHaveTextContent('Static');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has proper progressbar accessibility role', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      render(<ProgressBar progress={75} />);

      await waitFor(
        () => {
          const progressBar = screen.getByTestId('progress-bar');
          expect(progressBar.props.accessibilityRole).toBe('progressbar');
          expect(progressBar.props.accessibilityValue).toEqual({
            now: 75,
            min: 0,
            max: 100,
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('motion sickness prevention', () => {
    /**
     * Large-scale motion animations can trigger vestibular disorders.
     * Examples: parallax scrolling, zoom transitions, spinning.
     */
    const MotionIntensiveComponent = () => {
      const { prefersReducedMotion } = useReducedMotion();

      return (
        <View testID="motion-component">
          <Text testID="parallax">{prefersReducedMotion ? 'disabled' : 'enabled'}</Text>
          <Text testID="zoom">{prefersReducedMotion ? 'disabled' : 'enabled'}</Text>
          <Text testID="spin">{prefersReducedMotion ? 'disabled' : 'enabled'}</Text>
        </View>
      );
    };

    it('disables all vestibular-triggering animations when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      render(<MotionIntensiveComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('parallax')).toHaveTextContent('disabled');
        },
        { timeout: 3000, interval: 100 }
      );
      expect(screen.getByTestId('zoom')).toHaveTextContent('disabled');
      expect(screen.getByTestId('spin')).toHaveTextContent('disabled');
    });

    it('enables all animations when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      render(<MotionIntensiveComponent />);

      await waitFor(
        () => {
          expect(screen.getByTestId('parallax')).toHaveTextContent('enabled');
        },
        { timeout: 3000, interval: 100 }
      );
      expect(screen.getByTestId('zoom')).toHaveTextContent('enabled');
      expect(screen.getByTestId('spin')).toHaveTextContent('enabled');
    });
  });

  describe('flashing content prevention', () => {
    /**
     * WCAG 2.3.1: Content must not flash more than 3 times per second.
     * With reduced motion, flashing should be completely disabled.
     */
    const NotificationBadge = ({ count }: { count: number }) => {
      const { prefersReducedMotion } = useReducedMotion();

      return (
        <View testID="badge" accessibilityLabel={`${count} notifications`}>
          <Text testID="flash-state">{prefersReducedMotion ? 'No flash' : 'Pulsing'}</Text>
          <Text testID="badge-count">{count}</Text>
        </View>
      );
    };

    it('shows pulsing badge when reduced motion disabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(false);

      render(<NotificationBadge count={5} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('flash-state')).toHaveTextContent('Pulsing');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows static badge when reduced motion enabled', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      render(<NotificationBadge count={5} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('flash-state')).toHaveTextContent('No flash');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has proper accessibility label with count', async () => {
      mockIsReduceMotionEnabled.mockResolvedValue(true);

      render(<NotificationBadge count={5} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('badge')).toHaveAccessibleName('5 notifications');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
