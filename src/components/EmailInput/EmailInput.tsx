import React, { forwardRef } from 'react';
import type {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInputSubmitEditingEventData,
} from 'react-native';

import { FormInputItem } from '@app/components/FormInputItem';
import type { GroupVariant } from '@app/components/shared';

export type EmailInputProps = {
  /** Placeholder text */
  placeholder: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Position in group for border radius styling */
  groupVariant?: GroupVariant;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Return key type (default: 'next') */
  returnKeyType?: ReturnKeyTypeOptions;
  /** Whether input is editable */
  editable?: boolean;
  /** Error message to display */
  error?: string;
  /** Called when return key is pressed */
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
};

/** Ref type for EmailInput */
type EmailInputRef = { focus: () => void };

/**
 * EmailInput - Specialised email input component
 *
 * Pre-configured FormInputItem with email-specific settings:
 * - email-address keyboard
 * - No auto-capitalisation
 * - No auto-correct
 * - Email autoComplete and textContentType for iOS autofill
 *
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const EmailInput = forwardRef<EmailInputRef, EmailInputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      onBlur,
      groupVariant = 'single',
      testID,
      accessibilityLabel,
      accessibilityHint,
      returnKeyType = 'next',
      editable = true,
      error,
      onSubmitEditing,
    },
    ref
  ) => {
    return (
      <FormInputItem
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        groupVariant={groupVariant}
        testID={testID}
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint={accessibilityHint || 'Enter your email address'}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType={returnKeyType}
        editable={editable}
        error={error}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
);
