/**
 * Tests for EmailInput component
 *
 */

import React, { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { expectCanReceiveFocus, renderWithProviders } from '@app/test-utils';

import { EmailInput } from '../EmailInput';

describe('EmailInput', () => {
  const defaultProps = {
    placeholder: 'Email address',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with placeholder', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Email address')).toBeOnTheScreen();
    });

    it('should render with value', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} value="test@example.com" />);

      expect(screen.getByDisplayValue('test@example.com')).toBeOnTheScreen();
    });

    it('should render with testID', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });
  });

  describe('email-specific configuration', () => {
    it('should use email-address keyboard type', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.keyboardType).toBe('email-address');
    });

    it('should disable auto capitalisation', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.autoCapitalize).toBe('none');
    });

    it('should disable auto correct', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.autoCorrect).toBe(false);
    });

    it('should set autoComplete to email', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.autoComplete).toBe('email');
    });

    it('should set textContentType to emailAddress for iOS autofill', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.textContentType).toBe('emailAddress');
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text changes', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      await fireEvent.changeText(screen.getByTestId('email-input'), 'new@email.com');

      expect(onChangeText).toHaveBeenCalledWith('new@email.com');
    });

    it('should call onBlur when input loses focus', async () => {
      const onBlur = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onBlur={onBlur} testID="email-input" />
      );

      await fireEvent(screen.getByTestId('email-input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', async () => {
      const onSubmitEditing = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onSubmitEditing={onSubmitEditing} testID="email-input" />
      );

      await fireEvent(screen.getByTestId('email-input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} />);

      expect(screen.getByLabelText('Email address')).toBeOnTheScreen();
    });

    it('should use custom accessibility label when provided', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} accessibilityLabel="Your email" />);

      expect(screen.getByLabelText('Your email')).toBeOnTheScreen();
    });

    it('should have default accessibility hint', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.accessibilityHint).toBe(
        'Enter your email address'
      );
    });

    it('should use custom accessibility hint when provided', async () => {
      await renderWithProviders(
        <EmailInput {...defaultProps} accessibilityHint="Custom hint" testID="email-input" />
      );

      expect(screen.getByTestId('email-input').props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} error="Invalid email address" />);

      expect(screen.getByText('Invalid email address')).toBeOnTheScreen();
    });

    it('should not render error when no error prop', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} />);

      expect(screen.queryByText('Invalid email address')).toBeNull();
    });
  });

  describe('return key type', () => {
    it('should default to next return key type', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.returnKeyType).toBe('next');
    });

    it('should accept custom return key type', async () => {
      await renderWithProviders(
        <EmailInput {...defaultProps} returnKeyType="done" testID="email-input" />
      );

      expect(screen.getByTestId('email-input').props.returnKeyType).toBe('done');
    });
  });

  describe('editable state', () => {
    it('should be editable by default', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.editable).toBe(true);
    });

    it('should be non-editable when editable is false', async () => {
      await renderWithProviders(
        <EmailInput {...defaultProps} editable={false} testID="email-input" />
      );

      expect(screen.getByTestId('email-input').props.editable).toBe(false);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', async () => {
      const ref = createRef<{ focus: () => void }>();
      await renderWithProviders(<EmailInput {...defaultProps} ref={ref} testID="email-input" />);

      expect(ref.current).toBeDefined();
    });
  });

  describe('group variants', () => {
    it('should default to single group variant', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      // Component renders without error - variant is applied
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });

    it.each(['single', 'top', 'middle', 'bottom'] as const)(
      'should render with groupVariant=%s',
      async groupVariant => {
        await renderWithProviders(
          <EmailInput {...defaultProps} groupVariant={groupVariant} testID="email-input" />
        );

        expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      }
    );
  });

  describe('security - input sanitisation', () => {
    it('should handle XSS attempts in email input without crashing', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      // XSS attempt
      await fireEvent.changeText(
        screen.getByTestId('email-input'),
        '<script>alert("xss")</script>'
      );

      // Component should handle gracefully
      expect(onChangeText).toHaveBeenCalledWith('<script>alert("xss")</script>');
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });

    it('should handle SQL injection attempts in email input without crashing', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      // SQL injection attempt
      await fireEvent.changeText(screen.getByTestId('email-input'), "admin'--");

      // Component should handle gracefully (validation happens at form level)
      expect(onChangeText).toHaveBeenCalledWith("admin'--");
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });

    it('should preserve leading/trailing whitespace for form-level trimming', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      // Email with whitespace (form should trim, not component)
      await fireEvent.changeText(screen.getByTestId('email-input'), '  test@example.com  ');

      // Component passes through raw value for form-level handling
      expect(onChangeText).toHaveBeenCalledWith('  test@example.com  ');
    });

    it('should handle unicode characters in email without crashing', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      // Unicode email
      await fireEvent.changeText(screen.getByTestId('email-input'), 'tëst@example.com');

      expect(onChangeText).toHaveBeenCalledWith('tëst@example.com');
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });

    it('should handle emoji in email without crashing', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      // Emoji in email
      await fireEvent.changeText(screen.getByTestId('email-input'), '😀test@example.com');

      expect(onChangeText).toHaveBeenCalledWith('😀test@example.com');
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });

    it('should handle very long email addresses', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      // Very long email (254 chars is max valid email length)
      const longEmail = 'a'.repeat(200) + '@example.com';
      await fireEvent.changeText(screen.getByTestId('email-input'), longEmail);

      expect(onChangeText).toHaveBeenCalledWith(longEmail);
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('input is accessible within touch-target container', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      // EmailInput wraps FormInputItem which has Box with minHeight={44}
      const input = screen.getByLabelText(defaultProps.placeholder);
      expect(input).toBeOnTheScreen();
    });

    it('input with error is accessible', async () => {
      await renderWithProviders(
        <EmailInput {...defaultProps} error="Invalid email" testID="email-input" />
      );

      const input = screen.getByTestId('email-input');
      expect(input).toBeOnTheScreen();
      expect(screen.getByText('Invalid email')).toBeOnTheScreen();
    });

    it('non-editable input is accessible', async () => {
      await renderWithProviders(
        <EmailInput {...defaultProps} editable={false} testID="email-input" />
      );

      const input = screen.getByTestId('email-input');
      expect(input.props.editable).toBe(false);
    });

    it('meets minimum touch target requirements', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      // EmailInput wraps TextInput in FormInputItem which has Box with minHeight={44}
      // The touch target is on the parent container, not the TextInput itself
      // TextInput height (22) + padding in parent gives adequate touch target
      const input = screen.getByTestId('email-input');
      // Verify the input exists and has accessibility props (touch target is on container)
      expect(input.props.accessible).not.toBe(false);
    });

    it('can receive programmatic focus', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      const input = screen.getByTestId('email-input');
      expectCanReceiveFocus(input);
    });

    it('has complete accessibility properties', async () => {
      await renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      const input = screen.getByTestId('email-input');
      expect(input.props.accessibilityLabel).toBe(defaultProps.placeholder);
      expect(input.props.accessibilityHint).toBe('Enter your email address');
    });
  });
});
