/**
 * Tests for PasswordInput component
 *
 */

import React, { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { PasswordInput } from '../PasswordInput';

describe('PasswordInput', () => {
  const defaultProps = {
    placeholder: 'Password',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with placeholder', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Password')).toBeOnTheScreen();
    });

    it('should render with value', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} value="secret123" />);

      expect(screen.getByDisplayValue('secret123')).toBeOnTheScreen();
    });

    it('should render with testID', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input')).toBeOnTheScreen();
    });
  });

  describe('password-specific configuration', () => {
    it('should enable secure text entry by default', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // When not visible, secureTextEntry should be true
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
    });

    it('should disable auto capitalisation', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.autoCapitalize).toBe('none');
    });

    it('should disable auto correct', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.autoCorrect).toBe(false);
    });

    it('should set autoComplete to current-password by default', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.autoComplete).toBe('current-password');
    });

    it('should set autoComplete to new-password when isNewPassword is true', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} isNewPassword testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.autoComplete).toBe('new-password');
    });

    it('should set textContentType to password by default', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.textContentType).toBe('password');
    });

    it('should set textContentType to newPassword when isNewPassword is true', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} isNewPassword testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.textContentType).toBe('newPassword');
    });
  });

  describe('show/hide toggle (internal state)', () => {
    it('should render show password toggle', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.getByLabelText('Show password')).toBeOnTheScreen();
    });

    it('should toggle visibility when pressed', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // Initially hidden
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
      expect(screen.getByLabelText('Show password')).toBeOnTheScreen();

      // Press toggle
      await fireEvent.press(screen.getByLabelText('Show password'));

      // Now visible
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false);
      expect(screen.getByLabelText('Hide password')).toBeOnTheScreen();
    });

    it('should toggle back to hidden when pressed again', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // Show password
      await fireEvent.press(screen.getByLabelText('Show password'));
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false);

      // Hide password again
      await fireEvent.press(screen.getByLabelText('Hide password'));
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
    });

    it('should have accessible touch target on toggle button', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      const toggle = screen.getByLabelText('Show password');
      // Toggle inherits hitSlop and padding from FormInputItem for EAA compliance
      expect(toggle.props.accessibilityRole).toBe('button');
      expect(toggle.props.hitSlop).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
    });
  });

  describe('show/hide toggle (external control)', () => {
    it('should use external visibility state when provided', async () => {
      await renderWithProviders(
        <PasswordInput
          {...defaultProps}
          isSecureVisible
          onToggleSecure={jest.fn()}
          testID="password-input"
        />
      );

      // External state says visible
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false);
    });

    it('should call external toggle handler when provided', async () => {
      const onToggleSecure = jest.fn();
      await renderWithProviders(
        <PasswordInput {...defaultProps} isSecureVisible={false} onToggleSecure={onToggleSecure} />
      );

      await fireEvent.press(screen.getByLabelText('Show password'));

      expect(onToggleSecure).toHaveBeenCalled();
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text changes', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <PasswordInput {...defaultProps} onChangeText={onChangeText} testID="password-input" />
      );

      await fireEvent.changeText(screen.getByTestId('password-input'), 'newpassword');

      expect(onChangeText).toHaveBeenCalledWith('newpassword');
    });

    it('should call onBlur when input loses focus', async () => {
      const onBlur = jest.fn();
      await renderWithProviders(
        <PasswordInput {...defaultProps} onBlur={onBlur} testID="password-input" />
      );

      await fireEvent(screen.getByTestId('password-input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', async () => {
      const onSubmitEditing = jest.fn();
      await renderWithProviders(
        <PasswordInput
          {...defaultProps}
          onSubmitEditing={onSubmitEditing}
          testID="password-input"
        />
      );

      await fireEvent(screen.getByTestId('password-input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    });

    it('should use custom accessibility label when provided', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} accessibilityLabel="Your password" />
      );

      expect(screen.getByLabelText('Your password')).toBeOnTheScreen();
    });

    it('should have default accessibility hint', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.accessibilityHint).toBe(
        'Enter your password'
      );
    });

    it('should use custom accessibility hint when provided', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} accessibilityHint="Custom hint" testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} error="Password is too weak" />);

      expect(screen.getByText('Password is too weak')).toBeOnTheScreen();
    });

    it('should not render error when no error prop', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.queryByText('Password is too weak')).toBeNull();
    });
  });

  describe('return key type', () => {
    it('should default to done return key type', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.returnKeyType).toBe('done');
    });

    it('should accept custom return key type', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} returnKeyType="next" testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.returnKeyType).toBe('next');
    });
  });

  describe('editable state', () => {
    it('should be editable by default', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.readOnly).toBe(false);
    });

    it('should be non-editable when editable is false', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} editable={false} testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.readOnly).toBe(true);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', async () => {
      const ref = createRef<{ focus: () => void }>();
      await renderWithProviders(
        <PasswordInput {...defaultProps} ref={ref} testID="password-input" />
      );

      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.focus).toBe('function');
    });
  });

  describe('group variants', () => {
    it('should default to single group variant', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input')).toBeOnTheScreen();
    });

    it.each(['single', 'top', 'middle', 'bottom'] as const)(
      'should render with groupVariant=%s',
      async groupVariant => {
        await renderWithProviders(
          <PasswordInput {...defaultProps} groupVariant={groupVariant} testID="password-input" />
        );

        expect(screen.getByTestId('password-input')).toBeOnTheScreen();
      }
    );
  });

  describe('EAA Accessibility Compliance', () => {
    it('input is accessible within touch-target container', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // PasswordInput wraps FormInputItem which has Box with minHeight={44}
      const input = screen.getByLabelText(defaultProps.placeholder);
      expect(input).toBeOnTheScreen();
    });

    it('toggle button has accessible touch target', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      const toggle = screen.getByLabelText('Show password');
      expectMinTouchTarget(toggle);
    });

    it('input with error is accessible', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} error="Password is too weak" testID="password-input" />
      );

      const input = screen.getByTestId('password-input');
      expect(input).toBeOnTheScreen();
      expect(screen.getByText('Password is too weak')).toBeOnTheScreen();
    });

    it('new password input is accessible', async () => {
      await renderWithProviders(
        <PasswordInput {...defaultProps} isNewPassword testID="password-input" />
      );

      const input = screen.getByTestId('password-input');
      expect(input.props.autoComplete).toBe('new-password');
      expect(input.props.textContentType).toBe('newPassword');
    });

    it('toggle button maintains accessible touch target when visible', async () => {
      await renderWithProviders(<PasswordInput {...defaultProps} />);

      // Show password first
      await fireEvent.press(screen.getByLabelText('Show password'));

      const toggle = screen.getByLabelText('Hide password');
      expectMinTouchTarget(toggle);
    });
  });
});
