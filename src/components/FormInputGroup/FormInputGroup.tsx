import type { ComponentProps } from 'react';
import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/hooks';

type BoxProps = ComponentProps<typeof Box>;

export type FormInputGroupProps = {
  /** Group title displayed above the inputs */
  title?: string;
  /** Form inputs to display in the group */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
  /** Horizontal margin (default: '$4') */
  mx?: BoxProps['mx'];
  /** Top margin (default: '$6') */
  mt?: BoxProps['mt'];
};

/**
 * FormInputGroup - Container for grouping form inputs
 *
 * Provides consistent styling for form sections with:
 * - Optional uppercase title/header
 * - Proper spacing and margins
 * - Dark mode support
 *
 * Use with FormInputItem, EmailInput, PasswordInput, PhoneInput, and
 * ButtonGroupDivider to create iOS-style grouped forms.
 *
 * EAA compliant with proper accessibility labels.
 *
 * @example
 * ```tsx
 * <FormInputGroup title="Account Details">
 *   <EmailInput
 *     placeholder="Email"
 *     value={email}
 *     onChangeText={setEmail}
 *     groupVariant="top"
 *   />
 *   <ButtonGroupDivider />
 *   <PasswordInput
 *     placeholder="Password"
 *     value={password}
 *     onChangeText={setPassword}
 *     groupVariant="bottom"
 *   />
 * </FormInputGroup>
 * ```
 */
export const FormInputGroup: React.FC<FormInputGroupProps> = ({
  title,
  children,
  testID,
  mx = '$4',
  mt = '$6',
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box mx={mx} mt={mt} testID={testID}>
      {title && (
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={isDark ? '$textDark400' : '$textLight500'}
          accessibilityRole="header"
        >
          {title}
        </Text>
      )}
      {children}
    </Box>
  );
};
