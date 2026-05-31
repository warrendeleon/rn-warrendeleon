/**
 * Tests for FormInputItem component
 *
 */

import React, { createRef } from 'react';
import { Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

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
    it('should render with placeholder', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} />);

      expect(screen.getByPlaceholderText('Enter text')).toBeOnTheScreen();
    });

    it('should render with value', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} value="Test value" />);

      expect(screen.getByDisplayValue('Test value')).toBeOnTheScreen();
    });

    it('should render with testID', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} testID="form-input" />);

      expect(screen.getByTestId('form-input')).toBeOnTheScreen();
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text changes', async () => {
      const onChangeText = jest.fn();
      await renderWithProviders(
        <FormInputItem {...defaultProps} onChangeText={onChangeText} testID="input" />
      );

      await fireEvent.changeText(screen.getByTestId('input'), 'new value');

      expect(onChangeText).toHaveBeenCalledWith('new value');
    });

    it('should call onBlur when input loses focus', async () => {
      const onBlur = jest.fn();
      await renderWithProviders(<FormInputItem {...defaultProps} onBlur={onBlur} testID="input" />);

      await fireEvent(screen.getByTestId('input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', async () => {
      const onSubmitEditing = jest.fn();
      await renderWithProviders(
        <FormInputItem {...defaultProps} onSubmitEditing={onSubmitEditing} testID="input" />
      );

      await fireEvent(screen.getByTestId('input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('secure text entry', () => {
    it('should hide text when secureTextEntry is true', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} secureTextEntry testID="input" />);

      expect(screen.getByTestId('input').props.secureTextEntry).toBe(true);
    });

    it('should show text when secureTextEntry is true but isSecureVisible is true', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} secureTextEntry isSecureVisible testID="input" />
      );

      expect(screen.getByTestId('input').props.secureTextEntry).toBe(false);
    });

    it('should render show/hide toggle when showSecureToggle is true', async () => {
      await renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          onToggleSecure={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Show password')).toBeOnTheScreen();
    });

    it('should show "Hide password" label when password is visible', async () => {
      await renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          isSecureVisible
          onToggleSecure={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Hide password')).toBeOnTheScreen();
    });

    it('should call onToggleSecure when toggle is pressed', async () => {
      const onToggleSecure = jest.fn();
      await renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          onToggleSecure={onToggleSecure}
        />
      );

      await fireEvent.press(screen.getByLabelText('Show password'));

      expect(onToggleSecure).toHaveBeenCalled();
    });

    it('should have accessible touch target on show/hide toggle', async () => {
      await renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          onToggleSecure={jest.fn()}
        />
      );

      const toggle = screen.getByLabelText('Show password');
      // Toggle has hitSlop (10 each side) + padding (8) which provides adequate touch area
      expect(toggle.props.accessibilityRole).toBe('button');
      expect(toggle.props.hitSlop).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeOnTheScreen();
    });

    it('should not render error box when no error', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      expect(screen.queryByText(/required/)).toBeNull();
    });
  });

  describe('left content', () => {
    it('should render left content when provided', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} leftContent={<Text testID="left-content">+44</Text>} />
      );

      expect(screen.getByTestId('left-content')).toBeOnTheScreen();
      expect(screen.getByText('+44')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      expect(screen.getByLabelText('Enter text')).toBeOnTheScreen();
    });

    it('should use custom accessibility label when provided', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} accessibilityLabel="Custom label" testID="input" />
      );

      expect(screen.getByLabelText('Custom label')).toBeOnTheScreen();
    });

    it('should include accessibility hint when provided', async () => {
      await renderWithProviders(
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
    it('should apply keyboard type', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} keyboardType="email-address" testID="input" />
      );

      expect(screen.getByTestId('input').props.keyboardType).toBe('email-address');
    });

    it('should apply return key type', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} returnKeyType="done" testID="input" />
      );

      expect(screen.getByTestId('input').props.returnKeyType).toBe('done');
    });

    it('should disable auto capitalisation when specified', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} autoCapitalize="none" testID="input" />
      );

      expect(screen.getByTestId('input').props.autoCapitalize).toBe('none');
    });

    it('should disable auto correct when specified', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} autoCorrect={false} testID="input" />
      );

      expect(screen.getByTestId('input').props.autoCorrect).toBe(false);
    });
  });

  describe('editable state', () => {
    it('should be editable by default', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      // v2 InputField maps `editable` to RN's `readOnly`; editable by default => readOnly false.
      expect(screen.getByTestId('input').props.readOnly).toBe(false);
    });

    it('should be non-editable when editable is false', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} editable={false} testID="input" />
      );

      expect(screen.getByTestId('input').props.readOnly).toBe(true);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', async () => {
      const ref = createRef<{ focus: () => void }>();
      await renderWithProviders(<FormInputItem {...defaultProps} ref={ref} testID="input" />);

      // The ref should be assigned with focus method
      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.focus).toBe('function');
    });
  });

  describe('group variants', () => {
    it.each(['single', 'top', 'middle', 'bottom'] as const)(
      'should render with groupVariant=%s',
      async groupVariant => {
        await renderWithProviders(
          <FormInputItem {...defaultProps} groupVariant={groupVariant} testID="input" />
        );

        expect(screen.getByTestId('input')).toBeOnTheScreen();
      }
    );
  });

  describe('EAA Accessibility Compliance', () => {
    it('input is accessible within touch-target container', async () => {
      await renderWithProviders(<FormInputItem {...defaultProps} testID="input" />);

      // FormInputItem has Box wrapper with minHeight={44} for EAA compliance
      const input = screen.getByLabelText(defaultProps.placeholder);
      expect(input).toBeOnTheScreen();
    });

    it('secure toggle button has accessible touch target', async () => {
      await renderWithProviders(
        <FormInputItem
          {...defaultProps}
          secureTextEntry
          showSecureToggle
          onToggleSecure={jest.fn()}
        />
      );

      const toggle = screen.getByLabelText('Show password');
      expectMinTouchTarget(toggle);
    });

    it('input with error is accessible', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} error="This field is required" testID="input" />
      );

      const input = screen.getByTestId('input');
      expect(input).toBeOnTheScreen();
      expect(screen.getByText('This field is required')).toBeOnTheScreen();
    });

    it('input with left content is accessible', async () => {
      await renderWithProviders(
        <FormInputItem {...defaultProps} leftContent={<Text>+44</Text>} testID="input" />
      );

      const input = screen.getByTestId('input');
      expect(input).toBeOnTheScreen();
      expect(screen.getByText('+44')).toBeOnTheScreen();
    });
  });
});
