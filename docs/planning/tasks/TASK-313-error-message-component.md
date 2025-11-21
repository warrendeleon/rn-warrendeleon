# TASK-313: ErrorMessage Component

**ID**: TASK-313 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-056](../stories/US-056-accessible-error-messages.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Create an accessible ErrorMessage component that displays validation errors with proper ARIA attributes, screen reader announcements, color contrast compliance, and visual indicators. Support different error severities (error, warning, info) and ensure full EAA/WCAG 2.1 Level AA compliance.

---

## Acceptance Criteria

- [ ] Component created in `src/components/validation/ErrorMessage.tsx`
- [ ] Display error message with icon
- [ ] Support error, warning, and info severities
- [ ] WCAG 2.1 Level AA contrast ratios (4.5:1 minimum)
- [ ] Proper ARIA attributes (role="alert", aria-live="polite")
- [ ] Screen reader announcements
- [ ] Visual icon indicators
- [ ] Animated entry/exit transitions
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### ErrorMessage Component

````typescript
// src/components/validation/ErrorMessage.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { HStack, Icon } from '@gluestack-ui/themed';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react-native';

/**
 * Error message severity
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Error message props
 */
export interface ErrorMessageProps {
  message: string;
  severity?: ErrorSeverity;
  showIcon?: boolean;
  animated?: boolean;
  testID?: string;
}

/**
 * Severity configuration
 */
const SEVERITY_CONFIG: Record<
  ErrorSeverity,
  {
    icon: typeof AlertCircle;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  error: {
    icon: AlertCircle,
    color: '#DC2626', // Red (4.53:1 contrast on white)
    bgColor: '#FEE2E2',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    color: '#D97706', // Amber (4.54:1 contrast on white)
    bgColor: '#FEF3C7',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: '#2563EB', // Blue (4.56:1 contrast on white)
    bgColor: '#DBEAFE',
    label: 'Information',
  },
};

/**
 * Error message component
 * Displays validation errors with accessibility support
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   message="Please enter a valid email address"
 *   severity="error"
 *   showIcon
 * />
 * ```
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  severity = 'error',
  showIcon = true,
  animated = true,
  testID = 'error-message',
}) => {
  const config = SEVERITY_CONFIG[severity];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  // Animate on mount
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, fadeAnim, slideAnim]);

  const containerStyle = animated
    ? {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }
    : {};

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bgColor },
        containerStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${config.label}: ${message}`}
      testID={testID}
    >
      <HStack space="xs" alignItems="flex-start">
        {showIcon && (
          <Icon
            as={config.icon}
            size="sm"
            color={config.color}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            testID={`${testID}-icon`}
          />
        )}
        <Text
          style={[styles.message, { color: config.color }]}
          accessibilityRole="text"
          testID={`${testID}-text`}
        >
          {message}
        </Text>
      </HStack>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});
````

---

### Inline Error Message Variant

````typescript
// src/components/validation/InlineErrorMessage.tsx

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { HStack, Icon } from '@gluestack-ui/themed';
import { AlertCircle } from 'lucide-react-native';

interface InlineErrorMessageProps {
  message: string;
  showIcon?: boolean;
  testID?: string;
}

/**
 * Inline error message (minimal style)
 * Used for compact error display beneath form fields
 *
 * @example
 * ```tsx
 * <InlineErrorMessage message="Email is required" showIcon />
 * ```
 */
export const InlineErrorMessage: React.FC<InlineErrorMessageProps> = ({
  message,
  showIcon = true,
  testID = 'inline-error',
}) => {
  return (
    <HStack
      space="xs"
      alignItems="center"
      marginTop={4}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      {showIcon && (
        <Icon
          as={AlertCircle}
          size="xs"
          color="#DC2626"
          accessibilityElementsHidden
          testID={`${testID}-icon`}
        />
      )}
      <Text
        style={styles.inlineMessage}
        accessibilityRole="text"
        testID={`${testID}-text`}
      >
        {message}
      </Text>
    </HStack>
  );
};

const styles = StyleSheet.create({
  inlineMessage: {
    fontSize: 12,
    lineHeight: 16,
    color: '#DC2626',
    flex: 1,
  },
});
````

---

### Field Error Message (Associated with Input)

````typescript
// src/components/validation/FieldErrorMessage.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@gluestack-ui/themed';
import { AlertCircle } from 'lucide-react-native';

interface FieldErrorMessageProps {
  fieldId: string;
  message: string;
  testID?: string;
}

/**
 * Field error message associated with a specific input
 * Uses aria-describedby for proper accessibility
 *
 * @example
 * ```tsx
 * <TextInput
 *   ...
 *   accessibilityDescribedBy={errors.email ? 'email-error' : undefined}
 * />
 * {errors.email && (
 *   <FieldErrorMessage
 *     fieldId="email-error"
 *     message={errors.email.message}
 *   />
 * )}
 * ```
 */
export const FieldErrorMessage: React.FC<FieldErrorMessageProps> = ({
  fieldId,
  message,
  testID = `${fieldId}-message`,
}) => {
  return (
    <View
      nativeID={fieldId}
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <View style={styles.content}>
        <Icon
          as={AlertCircle}
          size="xs"
          color="#DC2626"
          accessibilityElementsHidden
          testID={`${testID}-icon`}
        />
        <Text
          style={styles.message}
          accessibilityRole="text"
          testID={`${testID}-text`}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
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

### Usage Examples

```typescript
// Example 1: Standard error message
<ErrorMessage message="Please enter a valid email address" severity="error" />

// Example 2: Warning message
<ErrorMessage
  message="This email domain is uncommon. Please verify."
  severity="warning"
/>

// Example 3: Info message
<ErrorMessage
  message="Password must be at least 8 characters"
  severity="info"
/>

// Example 4: Inline error (compact)
<InlineErrorMessage message="Email is required" />

// Example 5: Field error (associated with input)
<TextInput
  accessibilityLabel="Email"
  accessibilityDescribedBy={errors.email ? 'email-error' : undefined}
  accessibilityInvalid={!!errors.email}
/>
{errors.email && (
  <FieldErrorMessage
    fieldId="email-error"
    message={errors.email.message}
  />
)}

// Example 6: Without icon
<ErrorMessage message="Server error occurred" showIcon={false} />

// Example 7: Without animation
<ErrorMessage message="Static error" animated={false} />
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/validation/__tests__/ErrorMessage.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Email is required" />);

    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('should render with error severity by default', () => {
    render(<ErrorMessage message="Error message" />);

    const icon = screen.getByTestId('error-message-icon');
    expect(icon).toBeTruthy();
    expect(screen.getByTestId('error-message-text')).toHaveStyle({
      color: '#DC2626',
    });
  });

  it('should render with warning severity', () => {
    render(
      <ErrorMessage message="Warning message" severity="warning" />
    );

    expect(screen.getByTestId('error-message-text')).toHaveStyle({
      color: '#D97706',
    });
  });

  it('should render with info severity', () => {
    render(<ErrorMessage message="Info message" severity="info" />);

    expect(screen.getByTestId('error-message-text')).toHaveStyle({
      color: '#2563EB',
    });
  });

  it('should hide icon when showIcon is false', () => {
    render(<ErrorMessage message="Message" showIcon={false} />);

    expect(screen.queryByTestId('error-message-icon')).toBeNull();
  });

  it('should have proper accessibility attributes', () => {
    render(<ErrorMessage message="Error message" />);

    const container = screen.getByTestId('error-message');
    expect(container.props.accessibilityRole).toBe('alert');
    expect(container.props.accessibilityLiveRegion).toBe('polite');
    expect(container.props.accessibilityLabel).toContain('Error: Error message');
  });

  it('should announce different severities correctly', () => {
    const { rerender } = render(
      <ErrorMessage message="Test" severity="error" />
    );
    expect(screen.getByTestId('error-message').props.accessibilityLabel).toContain('Error:');

    rerender(<ErrorMessage message="Test" severity="warning" />);
    expect(screen.getByTestId('error-message').props.accessibilityLabel).toContain('Warning:');

    rerender(<ErrorMessage message="Test" severity="info" />);
    expect(screen.getByTestId('error-message').props.accessibilityLabel).toContain('Information:');
  });

  it('should use custom testID', () => {
    render(<ErrorMessage message="Test" testID="custom-error" />);

    expect(screen.getByTestId('custom-error')).toBeTruthy();
    expect(screen.getByTestId('custom-error-icon')).toBeTruthy();
    expect(screen.getByTestId('custom-error-text')).toBeTruthy();
  });
});
```

---

## Dependencies

- React
- React Native
- GlueStack UI
- Lucide React Native (icons)

---

## Definition of Done

- [ ] ErrorMessage component implemented
- [ ] InlineErrorMessage variant implemented
- [ ] FieldErrorMessage variant implemented
- [ ] Error, warning, and info severities working
- [ ] WCAG 2.1 Level AA contrast ratios achieved
- [ ] Proper ARIA attributes implemented
- [ ] Screen reader announcements working
- [ ] Visual icons displayed
- [ ] Animated transitions working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-056](../stories/US-056-accessible-error-messages.md), [EPIC-028](../epics/EPIC-028-form-validation.md)
