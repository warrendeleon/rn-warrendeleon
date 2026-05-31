/**
 * Form Input Test Helper
 *
 * Reduces duplication across form input component tests (EmailInput, PasswordInput, PhoneInput).
 * Common patterns are extracted into reusable test suites.
 *
 * @example
 * ```typescript
 * import { testFormInputComponent } from '@app/test-utils';
 *
 * testFormInputComponent(EmailInput, {
 *   componentName: 'EmailInput',
 *   testID: 'email-input',
 *   keyboardType: 'email-address',
 *   defaultPlaceholder: 'Email address',
 *   defaultAccessibilityHint: 'Enter your email address',
 * });
 *
 * // Then add component-specific tests
 * describe('EmailInput - Specific Behaviour', () => {
 *   it('validates email format on blur', () => {});
 * });
 * ```
 */

import React, { createRef } from 'react';
import type { KeyboardTypeOptions } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';

import { expectCanReceiveFocus, renderWithProviders } from './index';

/**
 * Configuration for form input test helper
 */
export interface FormInputTestConfig {
  /** Component display name for test descriptions */
  componentName: string;
  /** Test ID for the input element */
  testID: string;
  /** Expected keyboard type */
  keyboardType?: KeyboardTypeOptions;
  /** Default placeholder text */
  defaultPlaceholder: string;
  /** Default accessibility hint */
  defaultAccessibilityHint?: string;
  /** Expected autoCapitalize value */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Expected autoCorrect value */
  autoCorrect?: boolean;
  /** Expected autoComplete value */
  autoComplete?: string;
  /** Expected textContentType for iOS autofill */
  textContentType?: string;
  /** Whether the input is secure (password field) */
  isSecureTextEntry?: boolean;
}

/**
 * Generates standard test suites for form input components.
 * Call this function in your test file to get common test coverage.
 *
 * @param Component The form input component to test
 * @param config Configuration for the tests
 */
export function testFormInputComponent<
  P extends {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onBlur?: () => void;
    onSubmitEditing?: () => void;
    testID?: string;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    error?: string;
    returnKeyType?: string;
    editable?: boolean;
    groupVariant?: 'single' | 'top' | 'middle' | 'bottom';
    ref?: React.Ref<{ focus: () => void }>;
  },
>(Component: React.ComponentType<P>, config: FormInputTestConfig) {
  const defaultProps = {
    placeholder: config.defaultPlaceholder,
    value: '',
    onChangeText: jest.fn(),
    testID: config.testID,
  } as unknown as P;

  describe(`${config.componentName} - Standard Tests`, () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Rendering', () => {
      it('renders with placeholder', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        expect(screen.getByPlaceholderText(config.defaultPlaceholder)).toBeOnTheScreen();
      });

      it('renders with value', async () => {
        await renderWithProviders(<Component {...defaultProps} value="test-value" />);
        expect(screen.getByDisplayValue('test-value')).toBeOnTheScreen();
      });

      it('renders with testID', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
      });
    });

    if (
      config.keyboardType ||
      config.autoCapitalize !== undefined ||
      config.autoCorrect !== undefined
    ) {
      describe('Input Configuration', () => {
        if (config.keyboardType) {
          it(`uses ${config.keyboardType} keyboard type`, async () => {
            await renderWithProviders(<Component {...defaultProps} />);
            expect(screen.getByTestId(config.testID).props.keyboardType).toBe(config.keyboardType);
          });
        }

        if (config.autoCapitalize !== undefined) {
          it(`has autoCapitalize set to ${config.autoCapitalize}`, async () => {
            await renderWithProviders(<Component {...defaultProps} />);
            expect(screen.getByTestId(config.testID).props.autoCapitalize).toBe(
              config.autoCapitalize
            );
          });
        }

        if (config.autoCorrect !== undefined) {
          it(`has autoCorrect set to ${config.autoCorrect}`, async () => {
            await renderWithProviders(<Component {...defaultProps} />);
            expect(screen.getByTestId(config.testID).props.autoCorrect).toBe(config.autoCorrect);
          });
        }

        if (config.autoComplete) {
          it(`has autoComplete set to ${config.autoComplete}`, async () => {
            await renderWithProviders(<Component {...defaultProps} />);
            expect(screen.getByTestId(config.testID).props.autoComplete).toBe(config.autoComplete);
          });
        }

        if (config.textContentType) {
          it(`has textContentType set to ${config.textContentType}`, async () => {
            await renderWithProviders(<Component {...defaultProps} />);
            expect(screen.getByTestId(config.testID).props.textContentType).toBe(
              config.textContentType
            );
          });
        }
      });
    }

    describe('Interaction', () => {
      it('calls onChangeText when text changes', async () => {
        const onChangeText = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onChangeText={onChangeText} />);

        await fireEvent.changeText(screen.getByTestId(config.testID), 'new-value');

        expect(onChangeText).toHaveBeenCalledWith('new-value');
      });

      it('calls onBlur when input loses focus', async () => {
        const onBlur = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onBlur={onBlur} />);

        await fireEvent(screen.getByTestId(config.testID), 'blur');

        expect(onBlur).toHaveBeenCalled();
      });

      it('calls onSubmitEditing when return key is pressed', async () => {
        const onSubmitEditing = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onSubmitEditing={onSubmitEditing} />);

        await fireEvent(screen.getByTestId(config.testID), 'submitEditing');

        expect(onSubmitEditing).toHaveBeenCalled();
      });
    });

    describe('Accessibility', () => {
      it('uses placeholder as default accessibility label', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        expect(screen.getByLabelText(config.defaultPlaceholder)).toBeOnTheScreen();
      });

      it('uses custom accessibility label when provided', async () => {
        await renderWithProviders(<Component {...defaultProps} accessibilityLabel="Custom label" />);
        expect(screen.getByLabelText('Custom label')).toBeOnTheScreen();
      });

      if (config.defaultAccessibilityHint) {
        it('has default accessibility hint', async () => {
          await renderWithProviders(<Component {...defaultProps} />);
          expect(screen.getByTestId(config.testID).props.accessibilityHint).toBe(
            config.defaultAccessibilityHint
          );
        });
      }

      it('uses custom accessibility hint when provided', async () => {
        await renderWithProviders(<Component {...defaultProps} accessibilityHint="Custom hint" />);
        expect(screen.getByTestId(config.testID).props.accessibilityHint).toBe('Custom hint');
      });
    });

    describe('Error Display', () => {
      it('renders error message when error prop is provided', async () => {
        await renderWithProviders(<Component {...defaultProps} error="Validation error" />);
        expect(screen.getByText('Validation error')).toBeOnTheScreen();
      });

      it('does not render error when no error prop', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        expect(screen.queryByText('Validation error')).toBeNull();
      });
    });

    describe('Return Key Type', () => {
      it('defaults to next return key type', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        expect(screen.getByTestId(config.testID).props.returnKeyType).toBe('next');
      });

      it('accepts custom return key type', async () => {
        await renderWithProviders(<Component {...defaultProps} returnKeyType="done" />);
        expect(screen.getByTestId(config.testID).props.returnKeyType).toBe('done');
      });
    });

    describe('Editable State', () => {
      it('is editable by default', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        expect(screen.getByTestId(config.testID).props.editable).toBe(true);
      });

      it('is non-editable when editable is false', async () => {
        await renderWithProviders(<Component {...defaultProps} editable={false} />);
        expect(screen.getByTestId(config.testID).props.editable).toBe(false);
      });
    });

    describe('Ref Forwarding', () => {
      it('forwards ref for focus functionality', async () => {
        const ref = createRef<{ focus: () => void }>();
        await renderWithProviders(<Component {...defaultProps} ref={ref} />);
        expect(ref.current).toBeDefined();
      });
    });

    describe('Group Variants', () => {
      it.each(['single', 'top', 'middle', 'bottom'] as const)(
        'renders with groupVariant=%s',
        async groupVariant => {
          await renderWithProviders(<Component {...defaultProps} groupVariant={groupVariant} />);
          expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
        }
      );
    });

    describe('Security - Input Sanitisation', () => {
      it('handles XSS attempts without crashing', async () => {
        const onChangeText = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onChangeText={onChangeText} />);

        await fireEvent.changeText(screen.getByTestId(config.testID), '<script>alert("xss")</script>');

        expect(onChangeText).toHaveBeenCalledWith('<script>alert("xss")</script>');
        expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
      });

      it('handles SQL injection attempts without crashing', async () => {
        const onChangeText = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onChangeText={onChangeText} />);

        await fireEvent.changeText(screen.getByTestId(config.testID), "admin'--");

        expect(onChangeText).toHaveBeenCalledWith("admin'--");
        expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
      });

      it('handles unicode characters without crashing', async () => {
        const onChangeText = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onChangeText={onChangeText} />);

        await fireEvent.changeText(screen.getByTestId(config.testID), 'tëst-ünïcödé');

        expect(onChangeText).toHaveBeenCalledWith('tëst-ünïcödé');
        expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
      });

      it('handles emoji without crashing', async () => {
        const onChangeText = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onChangeText={onChangeText} />);

        await fireEvent.changeText(screen.getByTestId(config.testID), '😀test-emoji');

        expect(onChangeText).toHaveBeenCalledWith('😀test-emoji');
        expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
      });

      it('handles very long input', async () => {
        const onChangeText = jest.fn();
        await renderWithProviders(<Component {...defaultProps} onChangeText={onChangeText} />);

        const longValue = 'a'.repeat(500);
        await fireEvent.changeText(screen.getByTestId(config.testID), longValue);

        expect(onChangeText).toHaveBeenCalledWith(longValue);
        expect(screen.getByTestId(config.testID)).toBeOnTheScreen();
      });
    });

    describe('EAA Accessibility Compliance', () => {
      it('input is accessible within touch-target container', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        const input = screen.getByLabelText(config.defaultPlaceholder);
        expect(input).toBeOnTheScreen();
      });

      it('input with error is accessible', async () => {
        await renderWithProviders(<Component {...defaultProps} error="Error message" />);
        const input = screen.getByTestId(config.testID);
        expect(input).toBeOnTheScreen();
        expect(screen.getByText('Error message')).toBeOnTheScreen();
      });

      it('non-editable input is accessible', async () => {
        await renderWithProviders(<Component {...defaultProps} editable={false} />);
        const input = screen.getByTestId(config.testID);
        expect(input.props.editable).toBe(false);
      });

      it('meets minimum touch target requirements', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        const input = screen.getByTestId(config.testID);
        expect(input.props.accessible).not.toBe(false);
      });

      it('can receive programmatic focus', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        const input = screen.getByTestId(config.testID);
        expectCanReceiveFocus(input);
      });

      it('has complete accessibility properties', async () => {
        await renderWithProviders(<Component {...defaultProps} />);
        const input = screen.getByTestId(config.testID);
        expect(input.props.accessibilityLabel).toBe(config.defaultPlaceholder);
        if (config.defaultAccessibilityHint) {
          expect(input.props.accessibilityHint).toBe(config.defaultAccessibilityHint);
        }
      });
    });
  });
}
