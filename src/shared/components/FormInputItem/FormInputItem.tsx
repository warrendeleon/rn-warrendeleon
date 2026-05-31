import React, { forwardRef } from 'react';
import type {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInput,
  TextInputProps,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Input, InputField } from '@app/components/ui/input';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { type GroupVariant, groupVariantRadius } from '@app/shared/components/shared';
import { useAppColorScheme } from '@app/shared/hooks';

type FormInputItemProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  groupVariant?: GroupVariant;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: string;
  secureTextEntry?: boolean;
  showSecureToggle?: boolean;
  onToggleSecure?: () => void;
  isSecureVisible?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  editable?: boolean;
  /** Optional left content (e.g., country selector) */
  leftContent?: React.ReactNode;
  /** Error message to display */
  error?: string;
  /** iOS text content type for autofill (e.g., 'newPassword', 'password', 'emailAddress') */
  textContentType?: TextInputProps['textContentType'];
  /** Called when the return key is pressed */
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
};

/** Ref type for FormInputItem - the underlying TextInput exposes focus() */
type FormInputItemRef = Pick<TextInput, 'focus'>;

/**
 * The v2 InputField (built via createInput) types its ref as the props type
 * rather than the TextInput instance, so the forwarded ref needs narrowing to
 * match. At runtime React assigns a real TextInput, which provides focus().
 */
type InputFieldRef = React.ComponentRef<typeof InputField>;

/**
 * iOS-style form input item for use within ButtonGroup
 * Renders a clean input with placeholder, matching SwiftUI Form style
 */
export const FormInputItem = forwardRef<FormInputItemRef, FormInputItemProps>(
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
      keyboardType,
      autoCapitalize = 'sentences',
      autoCorrect = true,
      autoComplete,
      secureTextEntry = false,
      showSecureToggle = false,
      onToggleSecure,
      isSecureVisible = false,
      returnKeyType,
      editable = true,
      leftContent,
      error,
      textContentType,
      onSubmitEditing,
    },
    ref
  ) => {
    const scheme = useAppColorScheme();
    const isDark = scheme === 'dark';

    const { top, bottom } = groupVariantRadius[groupVariant];

    const bg = isDark ? '#262626' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const placeholderColor = isDark ? '#6b7280' : '#9ca3af';

    return (
      <Box>
        <Box
          className="px-3 py-2.5"
          style={{
            backgroundColor: bg,
            minHeight: 44,
            borderTopLeftRadius: top,
            borderTopRightRadius: top,
            borderBottomLeftRadius: error ? 0 : bottom,
            borderBottomRightRadius: error ? 0 : bottom,
          }}
        >
          <HStack space="sm" className="items-center">
            {leftContent}
            <Box className="flex-1">
              <Input variant="outline" size="md" className="m-0 border-0 bg-transparent p-0">
                <InputField
                  ref={ref as React.Ref<InputFieldRef>}
                  placeholder={placeholder}
                  placeholderTextColor={placeholderColor}
                  value={value}
                  onChangeText={onChangeText}
                  onBlur={onBlur}
                  onSubmitEditing={onSubmitEditing}
                  testID={testID}
                  accessibilityLabel={accessibilityLabel || placeholder}
                  accessibilityHint={accessibilityHint}
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  autoCorrect={autoCorrect}
                  autoComplete={autoComplete as never}
                  secureTextEntry={secureTextEntry && !isSecureVisible}
                  returnKeyType={returnKeyType}
                  editable={editable}
                  textContentType={textContentType}
                  className="m-0 p-0 text-base"
                  style={{ minHeight: 22, padding: 0, margin: 0, color: textColor }}
                />
              </Input>
            </Box>
            {showSecureToggle && (
              <Pressable
                onPress={onToggleSecure}
                testID="password-visibility-toggle"
                accessibilityRole="button"
                accessibilityLabel={isSecureVisible ? 'Hide password' : 'Show password'}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 8 }}
              >
                {isSecureVisible ? (
                  <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                ) : (
                  <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
              </Pressable>
            )}
          </HStack>
        </Box>
        {error && (
          <Box
            className="px-4 py-2"
            style={{
              backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
              borderBottomLeftRadius: bottom,
              borderBottomRightRadius: bottom,
            }}
          >
            <Text className="text-xs" style={{ color: isDark ? '#fca5a5' : '#dc2626' }}>
              {error}
            </Text>
          </Box>
        )}
      </Box>
    );
  }
);
