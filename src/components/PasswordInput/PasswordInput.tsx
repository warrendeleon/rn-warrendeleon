import React, { forwardRef, useState } from 'react';
import type {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInputSubmitEditingEventData,
} from 'react-native';

import { FormInputItem } from '@app/components/FormInputItem';
import type { GroupVariant } from '@app/components/shared';

export type PasswordInputProps = {
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
  /** Return key type (default: 'done') */
  returnKeyType?: ReturnKeyTypeOptions;
  /** Whether input is editable */
  editable?: boolean;
  /** Error message to display */
  error?: string;
  /** Called when return key is pressed */
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  /** Whether this is a new password (affects iOS autofill) */
  isNewPassword?: boolean;
  /** External control of visibility state (for syncing with confirm password) */
  isSecureVisible?: boolean;
  /** External handler for visibility toggle (for syncing with confirm password) */
  onToggleSecure?: () => void;
};

/** Ref type for PasswordInput */
type PasswordInputRef = { focus: () => void };

/**
 * PasswordInput - Specialised password input component
 *
 * Pre-configured FormInputItem with password-specific settings:
 * - Secure text entry with show/hide toggle
 * - No auto-capitalisation
 * - No auto-correct
 * - Password autoComplete and textContentType for iOS autofill
 *
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const PasswordInput = forwardRef<PasswordInputRef, PasswordInputProps>(
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
      returnKeyType = 'done',
      editable = true,
      error,
      onSubmitEditing,
      isNewPassword = false,
      isSecureVisible: externalIsSecureVisible,
      onToggleSecure: externalOnToggleSecure,
    },
    ref
  ) => {
    // Internal state for show/hide toggle (used when not externally controlled)
    const [internalIsSecureVisible, setInternalIsSecureVisible] = useState(false);

    // Use external control if provided, otherwise use internal state
    const isControlled =
      externalIsSecureVisible !== undefined && externalOnToggleSecure !== undefined;
    const isSecureVisible = isControlled ? externalIsSecureVisible : internalIsSecureVisible;
    const handleToggleSecure = isControlled
      ? externalOnToggleSecure
      : () => setInternalIsSecureVisible(prev => !prev);

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
        accessibilityHint={accessibilityHint || 'Enter your password'}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={isNewPassword ? 'new-password' : 'current-password'}
        textContentType={isNewPassword ? 'newPassword' : 'password'}
        secureTextEntry
        showSecureToggle
        isSecureVisible={isSecureVisible}
        onToggleSecure={handleToggleSecure}
        returnKeyType={returnKeyType}
        editable={editable}
        error={error}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
);
