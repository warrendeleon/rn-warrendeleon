import React from 'react';
import type { KeyboardTypeOptions, ReturnKeyTypeOptions, TextInputProps } from 'react-native';
import { Box, HStack, Input, InputField, Pressable, Text } from '@gluestack-ui/themed';
import { Eye, EyeOff } from 'lucide-react-native';

import { type GroupVariant, groupVariantRadius } from '@app/components/shared';
import { useAppColorScheme } from '@app/hooks';

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
};

/**
 * iOS-style form input item for use within ButtonGroup
 * Renders a clean input with placeholder, matching SwiftUI Form style
 */
export const FormInputItem: React.FC<FormInputItemProps> = ({
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
}) => {
  const scheme = useAppColorScheme();
  const isDark = scheme === 'dark';

  const { top, bottom } = groupVariantRadius[groupVariant];

  const bg = isDark ? '$backgroundDark900' : '$white';
  const textColor = isDark ? '$white' : '$black';
  const placeholderColor = isDark ? '$coolGray500' : '$coolGray400';

  return (
    <Box>
      <Box
        bg={bg}
        px="$3"
        py="$2.5"
        minHeight={44}
        borderTopLeftRadius={top}
        borderTopRightRadius={top}
        borderBottomLeftRadius={error ? '$none' : bottom}
        borderBottomRightRadius={error ? '$none' : bottom}
      >
        <HStack alignItems="center" space="sm">
          {leftContent}
          <Box flex={1}>
            <Input variant="outline" size="md" borderWidth={0} bg="transparent" p="$0" m="$0">
              <InputField
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
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
                color={textColor}
                fontSize="$md"
                p="$0"
                m="$0"
                style={{ minHeight: 22, padding: 0, margin: 0 }}
              />
            </Input>
          </Box>
          {showSecureToggle && (
            <Pressable
              onPress={onToggleSecure}
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
          bg={isDark ? '$red900' : '$red50'}
          px="$4"
          py="$2"
          borderBottomLeftRadius={bottom}
          borderBottomRightRadius={bottom}
        >
          <Text fontSize="$xs" color={isDark ? '$red300' : '$red600'}>
            {error}
          </Text>
        </Box>
      )}
    </Box>
  );
};
