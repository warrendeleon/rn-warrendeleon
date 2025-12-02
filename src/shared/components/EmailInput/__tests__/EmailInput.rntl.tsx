/**
 * Tests for EmailInput component
 *
 */

import React, { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

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
    it('should render with placeholder', () => {
      renderWithProviders(<EmailInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Email address')).toBeTruthy();
    });

    it('should render with value', () => {
      renderWithProviders(<EmailInput {...defaultProps} value="test@example.com" />);

      expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('should render with testID', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input')).toBeTruthy();
    });
  });

  describe('email-specific configuration', () => {
    it('should use email-address keyboard type', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.keyboardType).toBe('email-address');
    });

    it('should disable auto capitalisation', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.autoCapitalize).toBe('none');
    });

    it('should disable auto correct', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.autoCorrect).toBe(false);
    });

    it('should set autoComplete to email', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.autoComplete).toBe('email');
    });

    it('should set textContentType to emailAddress for iOS autofill', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.textContentType).toBe('emailAddress');
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <EmailInput {...defaultProps} onChangeText={onChangeText} testID="email-input" />
      );

      fireEvent.changeText(screen.getByTestId('email-input'), 'new@email.com');

      expect(onChangeText).toHaveBeenCalledWith('new@email.com');
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      renderWithProviders(<EmailInput {...defaultProps} onBlur={onBlur} testID="email-input" />);

      fireEvent(screen.getByTestId('email-input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', () => {
      const onSubmitEditing = jest.fn();
      renderWithProviders(
        <EmailInput {...defaultProps} onSubmitEditing={onSubmitEditing} testID="email-input" />
      );

      fireEvent(screen.getByTestId('email-input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', () => {
      renderWithProviders(<EmailInput {...defaultProps} />);

      expect(screen.getByLabelText('Email address')).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      renderWithProviders(<EmailInput {...defaultProps} accessibilityLabel="Your email" />);

      expect(screen.getByLabelText('Your email')).toBeTruthy();
    });

    it('should have default accessibility hint', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.accessibilityHint).toBe(
        'Enter your email address'
      );
    });

    it('should use custom accessibility hint when provided', () => {
      renderWithProviders(
        <EmailInput {...defaultProps} accessibilityHint="Custom hint" testID="email-input" />
      );

      expect(screen.getByTestId('email-input').props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', () => {
      renderWithProviders(<EmailInput {...defaultProps} error="Invalid email address" />);

      expect(screen.getByText('Invalid email address')).toBeTruthy();
    });

    it('should not render error when no error prop', () => {
      renderWithProviders(<EmailInput {...defaultProps} />);

      expect(screen.queryByText('Invalid email address')).toBeNull();
    });
  });

  describe('return key type', () => {
    it('should default to next return key type', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.returnKeyType).toBe('next');
    });

    it('should accept custom return key type', () => {
      renderWithProviders(
        <EmailInput {...defaultProps} returnKeyType="done" testID="email-input" />
      );

      expect(screen.getByTestId('email-input').props.returnKeyType).toBe('done');
    });
  });

  describe('editable state', () => {
    it('should be editable by default', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.editable).toBe(true);
    });

    it('should be non-editable when editable is false', () => {
      renderWithProviders(<EmailInput {...defaultProps} editable={false} testID="email-input" />);

      expect(screen.getByTestId('email-input').props.editable).toBe(false);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', () => {
      const ref = createRef<{ focus: () => void }>();
      renderWithProviders(<EmailInput {...defaultProps} ref={ref} testID="email-input" />);

      expect(ref.current).toBeTruthy();
    });
  });

  describe('group variants', () => {
    it('should default to single group variant', () => {
      renderWithProviders(<EmailInput {...defaultProps} testID="email-input" />);

      // Component renders without error - variant is applied
      expect(screen.getByTestId('email-input')).toBeTruthy();
    });

    it.each(['single', 'top', 'middle', 'bottom'] as const)(
      'should render with groupVariant=%s',
      groupVariant => {
        renderWithProviders(
          <EmailInput {...defaultProps} groupVariant={groupVariant} testID="email-input" />
        );

        expect(screen.getByTestId('email-input')).toBeTruthy();
      }
    );
  });
});
