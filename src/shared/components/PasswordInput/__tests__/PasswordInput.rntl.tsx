/**
 * Tests for PasswordInput component
 *
 */

import React, { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

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
    it('should render with placeholder', () => {
      renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should render with value', () => {
      renderWithProviders(<PasswordInput {...defaultProps} value="secret123" />);

      expect(screen.getByDisplayValue('secret123')).toBeTruthy();
    });

    it('should render with testID', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input')).toBeTruthy();
    });
  });

  describe('password-specific configuration', () => {
    it('should enable secure text entry by default', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // When not visible, secureTextEntry should be true
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
    });

    it('should disable auto capitalisation', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.autoCapitalize).toBe('none');
    });

    it('should disable auto correct', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.autoCorrect).toBe(false);
    });

    it('should set autoComplete to current-password by default', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.autoComplete).toBe('current-password');
    });

    it('should set autoComplete to new-password when isNewPassword is true', () => {
      renderWithProviders(
        <PasswordInput {...defaultProps} isNewPassword testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.autoComplete).toBe('new-password');
    });

    it('should set textContentType to password by default', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.textContentType).toBe('password');
    });

    it('should set textContentType to newPassword when isNewPassword is true', () => {
      renderWithProviders(
        <PasswordInput {...defaultProps} isNewPassword testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.textContentType).toBe('newPassword');
    });
  });

  describe('show/hide toggle (internal state)', () => {
    it('should render show password toggle', () => {
      renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.getByLabelText('Show password')).toBeTruthy();
    });

    it('should toggle visibility when pressed', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // Initially hidden
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
      expect(screen.getByLabelText('Show password')).toBeTruthy();

      // Press toggle
      fireEvent.press(screen.getByLabelText('Show password'));

      // Now visible
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false);
      expect(screen.getByLabelText('Hide password')).toBeTruthy();
    });

    it('should toggle back to hidden when pressed again', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      // Show password
      fireEvent.press(screen.getByLabelText('Show password'));
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false);

      // Hide password again
      fireEvent.press(screen.getByLabelText('Hide password'));
      expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
    });
  });

  describe('show/hide toggle (external control)', () => {
    it('should use external visibility state when provided', () => {
      renderWithProviders(
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

    it('should call external toggle handler when provided', () => {
      const onToggleSecure = jest.fn();
      renderWithProviders(
        <PasswordInput {...defaultProps} isSecureVisible={false} onToggleSecure={onToggleSecure} />
      );

      fireEvent.press(screen.getByLabelText('Show password'));

      expect(onToggleSecure).toHaveBeenCalled();
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <PasswordInput {...defaultProps} onChangeText={onChangeText} testID="password-input" />
      );

      fireEvent.changeText(screen.getByTestId('password-input'), 'newpassword');

      expect(onChangeText).toHaveBeenCalledWith('newpassword');
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      renderWithProviders(
        <PasswordInput {...defaultProps} onBlur={onBlur} testID="password-input" />
      );

      fireEvent(screen.getByTestId('password-input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', () => {
      const onSubmitEditing = jest.fn();
      renderWithProviders(
        <PasswordInput
          {...defaultProps}
          onSubmitEditing={onSubmitEditing}
          testID="password-input"
        />
      );

      fireEvent(screen.getByTestId('password-input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', () => {
      renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.getByLabelText('Password')).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      renderWithProviders(<PasswordInput {...defaultProps} accessibilityLabel="Your password" />);

      expect(screen.getByLabelText('Your password')).toBeTruthy();
    });

    it('should have default accessibility hint', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.accessibilityHint).toBe(
        'Enter your password'
      );
    });

    it('should use custom accessibility hint when provided', () => {
      renderWithProviders(
        <PasswordInput {...defaultProps} accessibilityHint="Custom hint" testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', () => {
      renderWithProviders(<PasswordInput {...defaultProps} error="Password is too weak" />);

      expect(screen.getByText('Password is too weak')).toBeTruthy();
    });

    it('should not render error when no error prop', () => {
      renderWithProviders(<PasswordInput {...defaultProps} />);

      expect(screen.queryByText('Password is too weak')).toBeNull();
    });
  });

  describe('return key type', () => {
    it('should default to done return key type', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.returnKeyType).toBe('done');
    });

    it('should accept custom return key type', () => {
      renderWithProviders(
        <PasswordInput {...defaultProps} returnKeyType="next" testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.returnKeyType).toBe('next');
    });
  });

  describe('editable state', () => {
    it('should be editable by default', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input').props.editable).toBe(true);
    });

    it('should be non-editable when editable is false', () => {
      renderWithProviders(
        <PasswordInput {...defaultProps} editable={false} testID="password-input" />
      );

      expect(screen.getByTestId('password-input').props.editable).toBe(false);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', () => {
      const ref = createRef<{ focus: () => void }>();
      renderWithProviders(<PasswordInput {...defaultProps} ref={ref} testID="password-input" />);

      expect(ref.current).toBeTruthy();
    });
  });

  describe('group variants', () => {
    it('should default to single group variant', () => {
      renderWithProviders(<PasswordInput {...defaultProps} testID="password-input" />);

      expect(screen.getByTestId('password-input')).toBeTruthy();
    });

    it.each(['single', 'top', 'middle', 'bottom'] as const)(
      'should render with groupVariant=%s',
      groupVariant => {
        renderWithProviders(
          <PasswordInput {...defaultProps} groupVariant={groupVariant} testID="password-input" />
        );

        expect(screen.getByTestId('password-input')).toBeTruthy();
      }
    );
  });
});
