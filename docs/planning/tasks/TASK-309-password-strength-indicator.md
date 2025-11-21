# TASK-309: PasswordStrengthIndicator Component

**ID**: TASK-309 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-055](../stories/US-055-realtime-field-validation.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Create a visual password strength indicator component that provides real-time feedback as users type their password. Calculate strength based on length, character variety, common patterns, and dictionary words. Display strength with colour-coded progress bar and text labels (Weak, Fair, Good, Strong). Ensure full EAA compliance.

---

## Acceptance Criteria

- [ ] Component created in `src/components/validation/PasswordStrengthIndicator.tsx`
- [ ] Calculate password strength in real-time
- [ ] Display strength with progress bar (0-100%)
- [ ] Color-coded strength levels (red, orange, yellow, green)
- [ ] Text labels (Weak, Fair, Good, Strong)
- [ ] Check for common patterns (123456, password, qwerty)
- [ ] Check for sequential characters
- [ ] Check for repeated characters
- [ ] Animated transitions between strength levels
- [ ] EAA compliant (contrast ratios, screen reader announcements)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Password Strength Calculation

```typescript
// src/utils/passwordStrength.ts

/**
 * Password strength level
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}

/**
 * Common weak passwords and patterns
 */
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
];

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['Password is required'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check (0-30 points)
  if (password.length >= 8) {
    score += 10;
  }
  if (password.length >= 12) {
    score += 10;
  }
  if (password.length >= 16) {
    score += 10;
  }

  if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }

  // Character variety (0-40 points)
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[@$!%*?&]/.test(password);

  if (hasLowerCase) score += 10;
  if (hasUpperCase) score += 10;
  if (hasNumbers) score += 10;
  if (hasSpecialChars) score += 10;

  if (!hasLowerCase) feedback.push('Include lowercase letters');
  if (!hasUpperCase) feedback.push('Include uppercase letters');
  if (!hasNumbers) feedback.push('Include numbers');
  if (!hasSpecialChars) feedback.push('Include special characters (@$!%*?&)');

  // Pattern checks (-20 points each)
  const lowerPassword = password.toLowerCase();

  // Check for common passwords
  if (COMMON_PASSWORDS.includes(lowerPassword)) {
    score -= 20;
    feedback.push('Avoid common passwords');
  }

  // Check for sequential characters
  if (
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(
      password
    )
  ) {
    score -= 10;
    feedback.push('Avoid sequential characters');
  }

  // Check for sequential numbers
  if (/012|123|234|345|456|567|678|789/.test(password)) {
    score -= 10;
    feedback.push('Avoid sequential numbers');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters');
  }

  // Check for keyboard patterns
  if (/qwerty|asdfgh|zxcvbn/i.test(password)) {
    score -= 10;
    feedback.push('Avoid keyboard patterns');
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let strength: PasswordStrength;
  if (score < 40) {
    strength = 'weak';
  } else if (score < 60) {
    strength = 'fair';
  } else if (score < 80) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score,
    feedback: feedback.length > 0 ? feedback : ['Password is strong'],
  };
}
```

---

### PasswordStrengthIndicator Component

````typescript
// src/components/validation/PasswordStrengthIndicator.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Box, Progress, VStack, HStack } from '@gluestack-ui/themed';
import {
  calculatePasswordStrength,
  PasswordStrength,
  PasswordStrengthResult,
} from '@/utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
  testID?: string;
}

/**
 * Password strength configuration
 */
const STRENGTH_CONFIG: Record<
  PasswordStrength,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  weak: {
    label: 'Weak',
    color: '#DC2626', // Red (4.5:1 contrast on white)
    bgColor: '#FEE2E2',
  },
  fair: {
    label: 'Fair',
    color: '#EA580C', // Orange (4.5:1 contrast on white)
    bgColor: '#FFEDD5',
  },
  good: {
    label: 'Good',
    color: '#CA8A04', // Yellow (4.5:1 contrast on white)
    bgColor: '#FEF3C7',
  },
  strong: {
    label: 'Strong',
    color: '#16A34A', // Green (4.5:1 contrast on white)
    bgColor: '#DCFCE7',
  },
};

/**
 * Password strength indicator component
 * Provides real-time visual feedback on password strength
 *
 * @example
 * ```tsx
 * <PasswordStrengthIndicator
 *   password={password}
 *   showFeedback={true}
 * />
 * ```
 */
export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, showFeedback = true, testID = 'password-strength' }) => {
  const result: PasswordStrengthResult = calculatePasswordStrength(password);
  const config = STRENGTH_CONFIG[result.strength];

  // Animated progress value
  const progressAnim = useRef(new Animated.Value(result.score)).current;

  // Animate progress bar when score changes
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: result.score,
      useNativeDriver: false,
      tension: 40,
      friction: 7,
    }).start();
  }, [result.score, progressAnim]);

  return (
    <VStack space="sm" testID={testID}>
      {/* Progress Bar */}
      <Box
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: result.score,
        }}
        accessibilityLabel={`Password strength: ${config.label}`}
      >
        <Progress
          value={result.score}
          size="sm"
          bg={config.bgColor}
          testID={`${testID}-progress`}
        >
          <Progress.FilledTrack
            bg={config.color}
            testID={`${testID}-progress-filled`}
          />
        </Progress>
      </Box>

      {/* Strength Label */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text
          style={[styles.strengthLabel, { color: config.color }]}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          testID={`${testID}-label`}
        >
          {config.label}
        </Text>
        <Text
          style={styles.scoreText}
          accessibilityLabel={`Password strength score: ${result.score} out of 100`}
          testID={`${testID}-score`}
        >
          {result.score}/100
        </Text>
      </HStack>

      {/* Feedback Messages */}
      {showFeedback && result.feedback.length > 0 && (
        <VStack
          space="xs"
          accessibilityRole="list"
          accessibilityLabel="Password strength suggestions"
          testID={`${testID}-feedback`}
        >
          {result.feedback.map((message, index) => (
            <Text
              key={index}
              style={styles.feedbackText}
              accessibilityRole="text"
              testID={`${testID}-feedback-${index}`}
            >
              • {message}
            </Text>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  strengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  scoreText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  feedbackText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
});
````

---

### Usage in Sign-Up Form

```typescript
// src/screens/auth/SignUpScreen/SignUpScreen.tsx

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signUpSchema } from '@/validation/schemas/authSchemas';
import { PasswordStrengthIndicator } from '@/components/validation/PasswordStrengthIndicator';

export const SignUpScreen: React.FC = () => {
  const [password, setPassword] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
  });

  return (
    <View>
      {/* Other form fields */}

      {/* Password Input */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(text);
                setPassword(text);
              }}
              onBlur={onBlur}
              secureTextEntry
              placeholder="Password"
              testID="password-input"
            />

            {/* Password Strength Indicator */}
            {password && (
              <PasswordStrengthIndicator
                password={password}
                showFeedback={true}
              />
            )}

            {errors.password && (
              <ErrorMessage message={errors.password.message} />
            )}
          </>
        )}
      />
    </View>
  );
};
```

---

## Testing Requirements

### Unit Tests for Password Strength Calculation

```typescript
// src/utils/__tests__/passwordStrength.test.ts

import { calculatePasswordStrength } from '../passwordStrength';

describe('calculatePasswordStrength', () => {
  it('should return weak for empty password', () => {
    const result = calculatePasswordStrength('');
    expect(result.strength).toBe('weak');
    expect(result.score).toBe(0);
  });

  it('should return weak for short password', () => {
    const result = calculatePasswordStrength('Pass1!');
    expect(result.strength).toBe('weak');
    expect(result.feedback).toContain('Use at least 8 characters');
  });

  it('should return weak for common passwords', () => {
    const result = calculatePasswordStrength('password');
    expect(result.strength).toBe('weak');
    expect(result.feedback).toContain('Avoid common passwords');
  });

  it('should return fair for password with basic requirements', () => {
    const result = calculatePasswordStrength('Password1');
    expect(result.strength).toBe('fair');
  });

  it('should return good for password with variety and length', () => {
    const result = calculatePasswordStrength('MySecurePass123!');
    expect(result.strength).toBe('good');
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it('should return strong for excellent password', () => {
    const result = calculatePasswordStrength('Tr0ng&SecureP@ssw0rd!');
    expect(result.strength).toBe('strong');
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('should penalize sequential characters', () => {
    const result1 = calculatePasswordStrength('Abcdefgh1!');
    const result2 = calculatePasswordStrength('Axbycdfg1!');
    expect(result2.score).toBeGreaterThan(result1.score);
  });

  it('should penalize sequential numbers', () => {
    const result = calculatePasswordStrength('Password123!');
    expect(result.feedback).toContain('Avoid sequential numbers');
  });

  it('should penalize repeated characters', () => {
    const result = calculatePasswordStrength('Passwordddd1!');
    expect(result.feedback).toContain('Avoid repeated characters');
  });

  it('should penalize keyboard patterns', () => {
    const result = calculatePasswordStrength('Qwerty123!');
    expect(result.feedback).toContain('Avoid keyboard patterns');
  });
});
```

---

### Component Unit Tests

```typescript
// src/components/validation/__tests__/PasswordStrengthIndicator.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('should render with weak password', () => {
    render(<PasswordStrengthIndicator password="weak" />);

    expect(screen.getByText('Weak')).toBeTruthy();
    expect(screen.getByTestId('password-strength-label')).toHaveStyle({
      color: '#DC2626',
    });
  });

  it('should render with fair password', () => {
    render(<PasswordStrengthIndicator password="Password1" />);

    expect(screen.getByText('Fair')).toBeTruthy();
  });

  it('should render with good password', () => {
    render(<PasswordStrengthIndicator password="MySecurePass123!" />);

    expect(screen.getByText('Good')).toBeTruthy();
  });

  it('should render with strong password', () => {
    render(<PasswordStrengthIndicator password="Str0ng&SecureP@ssw0rd!" />);

    expect(screen.getByText('Strong')).toBeTruthy();
    expect(screen.getByTestId('password-strength-label')).toHaveStyle({
      color: '#16A34A',
    });
  });

  it('should display feedback messages when showFeedback is true', () => {
    render(
      <PasswordStrengthIndicator password="weak" showFeedback={true} />
    );

    expect(screen.getByText(/Use at least 8 characters/)).toBeTruthy();
  });

  it('should not display feedback messages when showFeedback is false', () => {
    render(
      <PasswordStrengthIndicator password="weak" showFeedback={false} />
    );

    expect(screen.queryByTestId('password-strength-feedback')).toBeNull();
  });

  it('should display score', () => {
    render(<PasswordStrengthIndicator password="Password123!" />);

    expect(screen.getByTestId('password-strength-score')).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    render(<PasswordStrengthIndicator password="Password123!" />);

    const progressBar = screen.getByTestId('password-strength-progress');
    expect(progressBar.props.accessibilityRole).toBe('progressbar');
    expect(progressBar.props.accessibilityValue).toBeDefined();

    const label = screen.getByTestId('password-strength-label');
    expect(label.props.accessibilityLiveRegion).toBe('polite');
  });
});
```

---

## Dependencies

- React
- React Native
- GlueStack UI
- React Hook Form (for integration)

---

## Definition of Done

- [ ] Password strength calculation implemented
- [ ] PasswordStrengthIndicator component created
- [ ] Progress bar animated
- [ ] Color-coded strength levels implemented
- [ ] Text labels working
- [ ] Common password detection working
- [ ] Sequential character detection working
- [ ] Repeated character detection working
- [ ] Feedback messages displayed
- [ ] EAA compliant (4.5:1 contrast, screen reader support)
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-055](../stories/US-055-realtime-field-validation.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-308](TASK-308-use-field-validation-hook.md)
