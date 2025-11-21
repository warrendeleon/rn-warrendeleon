# TASK-317: Accessible Error RNTL Tests

**ID**: TASK-317 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-056](../stories/US-056-accessible-error-messages.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create comprehensive React Native Testing Library tests for accessible error messages. Test ErrorMessage component, error announcements, styling, animations, accessibility attributes, screen reader behavior, and EAA compliance. Ensure 100% coverage of accessible error functionality.

---

## Acceptance Criteria

- [ ] RNTL tests for ErrorMessage component
- [ ] Test accessibility attributes (role, live region, labels)
- [ ] Test error announcements to screen readers
- [ ] Test styling and color contrast
- [ ] Test animations and transitions
- [ ] Test FormErrorAnnouncer behavior
- [ ] Test reduced motion support
- [ ] 100% code coverage
- [ ] All tests passing
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### ErrorMessage Component Tests

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

  it('should have role="alert"', () => {
    render(<ErrorMessage message="Error" />);

    const container = screen.getByTestId('error-message');
    expect(container.props.accessibilityRole).toBe('alert');
  });

  it('should have aria-live="polite"', () => {
    render(<ErrorMessage message="Error" />);

    const container = screen.getByTestId('error-message');
    expect(container.props.accessibilityLiveRegion).toBe('polite');
  });

  it('should include severity in accessibility label', () => {
    render(<ErrorMessage message="Test error" severity="error" />);

    const container = screen.getByTestId('error-message');
    expect(container.props.accessibilityLabel).toContain('Error:');
    expect(container.props.accessibilityLabel).toContain('Test error');
  });

  it('should render with error severity by default', () => {
    render(<ErrorMessage message="Error" />);

    const text = screen.getByTestId('error-message-text');
    expect(text.props.style).toContainEqual(
      expect.objectContaining({ color: '#DC2626' })
    );
  });

  it('should render with warning severity', () => {
    render(<ErrorMessage message="Warning" severity="warning" />);

    const text = screen.getByTestId('error-message-text');
    expect(text.props.style).toContainEqual(
      expect.objectContaining({ color: '#D97706' })
    );
  });

  it('should render with info severity', () => {
    render(<ErrorMessage message="Info" severity="info" />);

    const text = screen.getByTestId('error-message-text');
    expect(text.props.style).toContainEqual(
      expect.objectContaining({ color: '#2563EB' })
    );
  });

  it('should display icon by default', () => {
    render(<ErrorMessage message="Error" />);

    expect(screen.getByTestId('error-message-icon')).toBeTruthy();
  });

  it('should hide icon when showIcon is false', () => {
    render(<ErrorMessage message="Error" showIcon={false} />);

    expect(screen.queryByTestId('error-message-icon')).toBeNull();
  });

  it('should use custom testID', () => {
    render(<ErrorMessage message="Error" testID="custom-error" />);

    expect(screen.getByTestId('custom-error')).toBeTruthy();
    expect(screen.getByTestId('custom-error-icon')).toBeTruthy();
    expect(screen.getByTestId('custom-error-text')).toBeTruthy();
  });
});
```

---

### FormErrorAnnouncer Tests

```typescript
// src/components/validation/__tests__/FormErrorAnnouncer.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import { FormErrorAnnouncer } from '../FormErrorAnnouncer';
import { AccessibilityInfo } from 'react-native';

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo');

describe('FormErrorAnnouncer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should announce errors when they change', () => {
    const errors = {
      email: { message: 'Email is required' },
      password: { message: 'Password is required' },
    };

    render(<FormErrorAnnouncer errors={errors} />);

    jest.advanceTimersByTime(300);

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Form has 2 errors')
    );
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Email is required')
    );
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Password is required')
    );
  });

  it('should not announce when errors are empty', () => {
    render(<FormErrorAnnouncer errors={{}} />);

    jest.advanceTimersByTime(300);

    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('should debounce announcements', () => {
    const { rerender } = render(<FormErrorAnnouncer errors={{}} debounceMs={300} />);

    // Rapid error changes
    rerender(<FormErrorAnnouncer errors={{ email: { message: 'Error 1' } }} debounceMs={300} />);
    rerender(<FormErrorAnnouncer errors={{ email: { message: 'Error 2' } }} debounceMs={300} />);
    rerender(<FormErrorAnnouncer errors={{ email: { message: 'Error 3' } }} debounceMs={300} />);

    // Should not announce yet
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();

    // Fast-forward debounce
    jest.advanceTimersByTime(300);

    // Should announce only once
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
  });

  it('should announce single error correctly', () => {
    const errors = {
      email: { message: 'Email is required' },
    };

    render(<FormErrorAnnouncer errors={errors} />);

    jest.advanceTimersByTime(300);

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Form has 1 error')
    );
  });

  it('should not re-announce identical errors', () => {
    const errors = {
      email: { message: 'Email is required' },
    };

    const { rerender } = render(<FormErrorAnnouncer errors={errors} />);

    jest.advanceTimersByTime(300);

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);

    // Rerender with same errors
    rerender(<FormErrorAnnouncer errors={errors} />);

    jest.advanceTimersByTime(300);

    // Should not announce again
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
  });
});
```

---

### Animated Error Tests

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

  it('should render when message is empty string', () => {
    render(<AnimatedErrorMessage message="" />);

    expect(screen.queryByTestId('animated-error')).toBeNull();
  });

  it('should have accessibility attributes', async () => {
    render(<AnimatedErrorMessage message="Error" />);

    await waitFor(() => {
      const container = screen.getByTestId('animated-error');
      expect(container.props.accessibilityRole).toBe('alert');
      expect(container.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  it('should respect reduced motion preference', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(
      true
    );

    const { rerender } = render(<AnimatedErrorMessage message={undefined} />);

    rerender(<AnimatedErrorMessage message="Error" />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
    });

    // Animation should be skipped (instant appearance)
  });

  it('should handle message changes', async () => {
    const { rerender } = render(
      <AnimatedErrorMessage message="First error" />
    );

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeTruthy();
    });

    rerender(<AnimatedErrorMessage message="Second error" />);

    await waitFor(() => {
      expect(screen.getByText('Second error')).toBeTruthy();
      expect(screen.queryByText('First error')).toBeNull();
    });
  });

  it('should handle message removal', async () => {
    const { rerender } = render(<AnimatedErrorMessage message="Error" />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
    });

    rerender(<AnimatedErrorMessage message={undefined} />);

    await waitFor(() => {
      expect(screen.queryByTestId('animated-error')).toBeNull();
    });
  });

  it('should use custom duration', async () => {
    render(<AnimatedErrorMessage message="Error" duration={500} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
    });

    // Animation duration should be 500ms
  });
});
```

---

### Styling Tests

```typescript
// src/components/validation/__tests__/StyledErrorMessage.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StyledErrorMessage } from '../StyledErrorMessage';

describe('StyledErrorMessage', () => {
  it('should render with default variant', () => {
    render(<StyledErrorMessage message="Error" />);

    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('should render with inline variant', () => {
    render(<StyledErrorMessage message="Error" variant="inline" />);

    const container = screen.getByTestId('styled-error');
    expect(container).toBeTruthy();
  });

  it('should render with boxed variant', () => {
    render(<StyledErrorMessage message="Error" variant="boxed" />);

    const container = screen.getByTestId('styled-error');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({ borderRadius: 8 })
    );
  });

  it('should have proper text color for light mode', () => {
    render(<StyledErrorMessage message="Error" />);

    const text = screen.getByTestId('styled-error-text');
    expect(text.props.style).toContainEqual(
      expect.objectContaining({ color: '#DC2626' })
    );
  });

  it('should display icon', () => {
    render(<StyledErrorMessage message="Error" />);

    expect(screen.getByTestId('styled-error-icon')).toBeTruthy();
  });

  it('should have accessibility attributes', () => {
    render(<StyledErrorMessage message="Error" />);

    const container = screen.getByTestId('styled-error');
    expect(container.props.accessibilityRole).toBe('alert');
    expect(container.props.accessibilityLiveRegion).toBe('polite');
  });
});
```

---

### Integration Tests

```typescript
// src/components/forms/__tests__/ValidatedInputIntegration.test.tsx

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ValidatedTextInput } from '@/components/forms/ValidatedTextInput';
import { ErrorMessage } from '@/components/validation/ErrorMessage';
import * as Yup from 'yup';

describe('Validated Input Integration with Error Messages', () => {
  it('should show error message on validation failure', async () => {
    const schema = Yup.string().email('Invalid email');

    render(
      <ValidatedTextInput
        label="Email"
        value="invalid-email"
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeTruthy();
    });
  });

  it('should clear error message on valid input', async () => {
    const schema = Yup.string().email();

    function TestComponent() {
      const [value, setValue] = useState('invalid');

      return (
        <ValidatedTextInput
          label="Email"
          value={value}
          onChangeText={setValue}
          validation={{ schema, debounceMs: 0 }}
        />
      );
    }

    render(<TestComponent />);

    const input = screen.getByTestId('validated-input-input');

    // Trigger error
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.getByTestId('validated-input-error')).toBeTruthy();
    });

    // Fix error
    fireEvent.changeText(input, 'test@example.com');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.queryByTestId('validated-input-error')).toBeNull();
    });
  });

  it('should announce error to screen readers', async () => {
    const schema = Yup.string().required('Email is required');

    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      const error = screen.getByTestId('validated-input-error');
      expect(error.props.accessibilityRole).toBe('alert');
      expect(error.props.accessibilityLiveRegion).toBe('polite');
    });
  });
});
```

---

## Testing Requirements

### Coverage Requirements

- [ ] 100% line coverage for ErrorMessage component
- [ ] 100% line coverage for FormErrorAnnouncer
- [ ] 100% line coverage for AnimatedErrorMessage
- [ ] 100% line coverage for StyledErrorMessage
- [ ] All edge cases tested
- [ ] All accessibility attributes tested

### Test Scenarios

**ErrorMessage Component**:

- [ ] Rendering with different severities
- [ ] Accessibility attributes
- [ ] Icon display
- [ ] Custom testIDs

**Announcements**:

- [ ] Screen reader announcements
- [ ] Debouncing
- [ ] Error change detection
- [ ] Priority handling

**Animations**:

- [ ] Fade in/out
- [ ] Slide in/out
- [ ] Reduced motion support
- [ ] Message changes

**Styling**:

- [ ] Color contrast
- [ ] Variants (default, inline, boxed)
- [ ] Dark mode support

---

## Dependencies

- React Native Testing Library
- Jest
- React
- All error message components

---

## Definition of Done

- [ ] All ErrorMessage tests implemented
- [ ] All FormErrorAnnouncer tests implemented
- [ ] All animation tests implemented
- [ ] All styling tests implemented
- [ ] Integration tests complete
- [ ] Accessibility attributes tested
- [ ] Screen reader behavior tested
- [ ] Reduced motion support tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-056](../stories/US-056-accessible-error-messages.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-313](TASK-313-error-message-component.md), [TASK-314](TASK-314-accessible-error-announcements.md), [TASK-315](TASK-315-error-message-styling.md), [TASK-316](TASK-316-animated-error-transitions.md)
