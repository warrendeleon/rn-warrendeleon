import React from 'react';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import { useAppColorScheme } from '@app/shared/hooks';

/** Spacing token (e.g. '$4') used for margin overrides. */
type SpacingToken = `$${number}`;

export type FormInputGroupProps = {
  /** Group title displayed above the inputs */
  title?: string;
  /** Form inputs to display in the group */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
  /** Horizontal margin (default: '$4') */
  mx?: SpacingToken;
  /** Top margin (default: '$6') */
  mt?: SpacingToken;
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
    <Box
      style={{
        marginHorizontal: Number(mx.slice(1)) * 4,
        marginTop: Number(mt.slice(1)) * 4,
      }}
      testID={testID}
    >
      {title && (
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: isDark ? '#A3A3A3' : '#8C8C8C' }}
          accessibilityRole="header"
        >
          {title}
        </Text>
      )}
      {children}
    </Box>
  );
};
