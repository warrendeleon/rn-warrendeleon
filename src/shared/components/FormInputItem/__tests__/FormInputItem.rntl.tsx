/**
 * Tests for FormInputItem component
 *
 */

import React, { createRef } from 'react';
import { Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { FormInputItem } from '../FormInputItem';

describe('FormInputItem', () => {
  const defaultProps = {
    placeholder: 'Enter text',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with placeholder', () => {
      renderWithProviders(<FormInputItem {...defaultProps} />);

      expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should render with value', () => {
      renderWithProviders(<FormInputItem {...defaultProps} value="Test value" />);

      expect(screen.getByDisplayValue('Test value')).toBeTruthy();
    });

    it('should render with testID', () => {
      renderWithProviders(<FormInputItem {...defaultProps} testID="form-input" />);

      expect(screen.getByTestId('form-input')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <FormInputItem {...defaultProps} onChangeText={onChangeText} testID="input" />
      );

      fireEvent.changeText(screen.getByTestId('input'), 'new value');

      expect(onChangeText).toHaveBeenCalledWith('new value');
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      renderWithProviders(<FormInputItem {...defaultProps} onBlur={onBlur} testID="input" />);

      fireEvent(screen.getByTestId('input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', () => {
      const onSubmitEditing = jest.fn();
      renderWithProviders(
        <FormInputItem {...defaultProps} onSubmitEditing={onSubmitEditing} testID="input" />
      );

      fireEvent(screen.getByTestId('input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('secure text entry', () => {
    it('should hide text when secureTextEntry is true', () => {
      renderWithProviders(<FormInputItem {...defaultProps} secureTextEntry testID="input" />);

      expect(screen.getByTestId('input').props.secureTextEntry).toBe(true);
    });

    it('should show text when secureTextEntry is true but isSecureVisible is true', () => {
      renderWithProviders(
        <FormInputItem {...defaultProps} secureTextEntry isSecureVisible testID="input" />
      );

      expect(screen.getByTestId('input').props.secureTextEntry).toBe(false);
    });

    it('should render show/hide toggle when showSecureToggle is true', () => {
      renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          onToggleSecure={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Show password')).toBeTruthy();
    });

    it('should show "Hide password" label when password is visible', () => {
      renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          isSecureVisible
          onToggleSecure={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Hide password')).toBeTruthy();
    });

    it('should call onToggleSecure when toggle is pressed', () => {
      const onToggleSecure = jest.fn();
      renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          onToggleSecure={onToggleSecure}
        />
      );

      fireEvent.press(screen.getByLabelText('Show password'));

      expect(onToggleSecure).toHaveBeenCalled();
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', () => {
      renderWithProviders(<FormInputItem {...defaultProps} error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeTruthy();
    });

    it('should not render error box when no error', () => {
      renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      expect(screen.queryByText(/required/)).toBeNull();
    });
  });

  describe('left content', () => {
    it('should render left content when provided', () => {
      renderWithProviders(
        <FormInputItem {...defaultProps} leftContent={<Text testID="left-content">+44</Text>} />
      );

      expect(screen.getByTestId('left-content')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', () => {
      renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      expect(screen.getByLabelText('Enter text')).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      renderWithProviders(
        <FormInputItem {...defaultProps} accessibilityLabel="Custom label" testID="input" />
      );

      expect(screen.getByLabelText('Custom label')).toBeTruthy();
    });

    it('should include accessibility hint when provided', () => {
      renderWithProviders(
        <FormInputItem
          {...defaultProps}
          accessibilityHint="Enter your email address"
          testID="input"
        />
      );

      expect(screen.getByTestId('input').props.accessibilityHint).toBe('Enter your email address');
    });
  });

  describe('keyboard and input types', () => {
    it('should apply keyboard type', () => {
      renderWithProviders(
        <FormInputItem {...defaultProps} keyboardType="email-address" testID="input" />
      );

      expect(screen.getByTestId('input').props.keyboardType).toBe('email-address');
    });

    it('should apply return key type', () => {
      renderWithProviders(<FormInputItem {...defaultProps} returnKeyType="done" testID="input" />);

      expect(screen.getByTestId('input').props.returnKeyType).toBe('done');
    });

    it('should disable auto capitalisation when specified', () => {
      renderWithProviders(<FormInputItem {...defaultProps} autoCapitalize="none" testID="input" />);

      expect(screen.getByTestId('input').props.autoCapitalize).toBe('none');
    });

    it('should disable auto correct when specified', () => {
      renderWithProviders(<FormInputItem {...defaultProps} autoCorrect={false} testID="input" />);

      expect(screen.getByTestId('input').props.autoCorrect).toBe(false);
    });
  });

  describe('editable state', () => {
    it('should be editable by default', () => {
      renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      expect(screen.getByTestId('input').props.editable).toBe(true);
    });

    it('should be non-editable when editable is false', () => {
      renderWithProviders(<FormInputItem {...defaultProps} editable={false} testID="input" />);

      expect(screen.getByTestId('input').props.editable).toBe(false);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', () => {
      const ref = createRef<{ focus: () => void }>();
      renderWithProviders(<FormInputItem {...defaultProps} ref={ref} testID="input" />);

      // The ref should be assigned
      expect(ref.current).toBeTruthy();
    });
  });

  describe('group variants', () => {
    it.each(['single', 'top', 'middle', 'bottom'] as const)(
      'should render with groupVariant=%s',
      groupVariant => {
        renderWithProviders(
          <FormInputItem {...defaultProps} groupVariant={groupVariant} testID="input" />
        );

        expect(screen.getByTestId('input')).toBeTruthy();
      }
    );
  });
});
