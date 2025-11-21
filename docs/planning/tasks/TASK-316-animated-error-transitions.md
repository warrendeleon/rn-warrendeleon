# TASK-316: Animated Error Transitions

**ID**: TASK-316 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-056](../stories/US-056-accessible-error-messages.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Implement smooth animated transitions for error messages appearing and disappearing. Use React Native Animated API for fade-in/fade-out, slide-in/slide-out, and height expansion/collapse. Ensure animations respect reduced motion preferences for accessibility.

---

## Acceptance Criteria

- [ ] Animated error entry (fade + slide)
- [ ] Animated error exit (fade + slide)
- [ ] Height expansion/collapse animations
- [ ] Respect prefers-reduced-motion setting
- [ ] Smooth 60fps performance
- [ ] Configurable animation durations
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Animated Error Message

````typescript
// src/components/validation/AnimatedErrorMessage.tsx

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { Icon } from '@gluestack-ui/themed';
import { AlertCircle } from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnimatedErrorMessageProps {
  message?: string;
  duration?: number;
  respectReducedMotion?: boolean;
  testID?: string;
}

/**
 * Animated error message component
 * Smoothly animates in/out when error appears/disappears
 *
 * @example
 * ```tsx
 * <AnimatedErrorMessage
 *   message={errors.email?.message}
 *   duration={200}
 * />
 * ```
 */
export const AnimatedErrorMessage: React.FC<AnimatedErrorMessageProps> = ({
  message,
  duration = 200,
  respectReducedMotion = true,
  testID = 'animated-error',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (respectReducedMotion) {
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        setIsReducedMotion(enabled);
      });
    }
  }, [respectReducedMotion]);

  // Animate in/out when message changes
  useEffect(() => {
    if (message) {
      // Animate in
      if (isReducedMotion) {
        // Instant appearance for reduced motion
        fadeAnim.setValue(1);
        slideAnim.setValue(0);
        heightAnim.setValue(1);
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(heightAnim, {
            toValue: 1,
            duration,
            useNativeDriver: false, // height can't use native driver
          }),
        ]).start();
      }
    } else {
      // Animate out
      if (isReducedMotion) {
        // Instant disappearance for reduced motion
        fadeAnim.setValue(0);
        slideAnim.setValue(-10);
        heightAnim.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(heightAnim, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }
  }, [message, duration, fadeAnim, slideAnim, heightAnim, isReducedMotion]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100], // Adjust based on content
          }),
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <View style={styles.content}>
        <Icon
          as={AlertCircle}
          size="xs"
          color="#DC2626"
          style={styles.icon}
          accessibilityElementsHidden
        />
        <Text style={styles.message} accessibilityRole="text">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
    color: '#DC2626',
    flex: 1,
  },
});
````

---

### Layout Animation Hook

````typescript
// src/hooks/useLayoutAnimation.ts

import { useEffect } from 'react';
import { LayoutAnimation, AccessibilityInfo, Platform } from 'react-native';

/**
 * Layout animation presets
 */
export const LayoutAnimationPresets = {
  easeInEaseOut: {
    duration: 200,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },
  spring: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.7,
    },
  },
};

/**
 * Hook to trigger layout animations with accessibility support
 *
 * @example
 * ```typescript
 * const animateLayout = useLayoutAnimation();
 *
 * const addError = () => {
 *   animateLayout();
 *   setError('Email is required');
 * };
 * ```
 */
export function useLayoutAnimation(
  preset: keyof typeof LayoutAnimationPresets = 'easeInEaseOut'
): () => void {
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setIsReducedMotion(enabled);
    });
  }, []);

  return () => {
    if (!isReducedMotion) {
      LayoutAnimation.configureNext(LayoutAnimationPresets[preset]);
    }
  };
}
````

---

### Collapsible Error Container

````typescript
// src/components/validation/CollapsibleErrorContainer.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface CollapsibleErrorContainerProps {
  isVisible: boolean;
  duration?: number;
  children: React.ReactNode;
  testID?: string;
}

/**
 * Collapsible container for error messages
 * Animates height expansion/collapse
 *
 * @example
 * ```tsx
 * <CollapsibleErrorContainer isVisible={!!error}>
 *   <ErrorMessage message={error} />
 * </CollapsibleErrorContainer>
 * ```
 */
export const CollapsibleErrorContainer: React.FC<
  CollapsibleErrorContainerProps
> = ({ isVisible, duration = 200, children, testID = 'collapsible-error' }) => {
  const heightAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isVisible ? 1 : 0,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, duration, heightAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200], // Adjust based on content
          }),
          opacity: opacityAnim,
        },
      ]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
````

---

### Usage Examples

```typescript
// Example 1: Animated error in form field
import { AnimatedErrorMessage } from '@/components/validation/AnimatedErrorMessage';

function EmailField() {
  const [error, setError] = useState('');

  return (
    <View>
      <TextInput onBlur={() => setError('Email is required')} />
      <AnimatedErrorMessage message={error} duration={200} />
    </View>
  );
}

// Example 2: Using layout animation hook
import { useLayoutAnimation } from '@/hooks/useLayoutAnimation';

function Form() {
  const animateLayout = useLayoutAnimation('spring');
  const [errors, setErrors] = useState<string[]>([]);

  const addError = () => {
    animateLayout(); // Trigger animation
    setErrors([...errors, 'New error']);
  };

  return (
    <View>
      {errors.map((error, index) => (
        <ErrorMessage key={index} message={error} />
      ))}
    </View>
  );
}

// Example 3: Collapsible error container
import { CollapsibleErrorContainer } from '@/components/validation/CollapsibleErrorContainer';

function ValidatedInput() {
  const [error, setError] = useState('');

  return (
    <View>
      <TextInput />
      <CollapsibleErrorContainer isVisible={!!error}>
        <ErrorMessage message={error} />
      </CollapsibleErrorContainer>
    </View>
  );
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/validation/__tests__/AnimatedErrorMessage.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { AnimatedErrorMessage } from '../AnimatedErrorMessage';
import { AccessibilityInfo } from 'react-native';

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo');

describe('AnimatedErrorMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(
      false
    );
  });

  it('should render message when provided', async () => {
    render(<AnimatedErrorMessage message="Email is required" />);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeTruthy();
    });
  });

  it('should not render when message is undefined', () => {
    render(<AnimatedErrorMessage message={undefined} />);

    expect(screen.queryByTestId('animated-error')).toBeNull();
  });

  it('should respect reduced motion preference', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(
      true
    );

    const { rerender } = render(<AnimatedErrorMessage message={undefined} />);

    rerender(<AnimatedErrorMessage message="Error" />);

    await waitFor(() => {
      // Should appear without animation
      expect(screen.getByText('Error')).toBeTruthy();
    });
  });

  it('should have proper accessibility attributes', async () => {
    render(<AnimatedErrorMessage message="Error" />);

    await waitFor(() => {
      const container = screen.getByTestId('animated-error');
      expect(container.props.accessibilityRole).toBe('alert');
      expect(container.props.accessibilityLiveRegion).toBe('polite');
    });
  });
});
```

---

## Dependencies

- React
- React Native Animated API
- AccessibilityInfo (React Native)

---

## Definition of Done

- [ ] AnimatedErrorMessage component implemented
- [ ] Fade + slide animations working
- [ ] Height expansion/collapse working
- [ ] Reduced motion support implemented
- [ ] useLayoutAnimation hook created
- [ ] CollapsibleErrorContainer component created
- [ ] 60fps performance achieved
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-056](../stories/US-056-accessible-error-messages.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-313](TASK-313-error-message-component.md), [TASK-315](TASK-315-error-message-styling.md)
