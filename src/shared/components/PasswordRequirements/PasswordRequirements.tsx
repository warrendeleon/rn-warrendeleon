import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { useAppColorScheme } from '@app/shared/hooks';

/**
 * Password strength requirements checker
 * Returns an object with boolean flags for each requirement
 */
export const checkPasswordRequirements = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[!-/:-@[-`{-~]/.test(password),
});

export type PasswordRequirementsResult = ReturnType<typeof checkPasswordRequirements>;

/**
 * Additional custom requirement that can be passed to PasswordRequirements
 */
export interface CustomRequirement {
  /** Unique key for React list rendering */
  key: string;
  /** Whether the requirement is met */
  met: boolean;
  /** Display text for the requirement */
  text: string;
}

export interface PasswordRequirementsProps {
  /** The password to validate against requirements */
  password: string;
  /** Optional testID for E2E testing */
  testID?: string;
  /** Additional custom requirements to display (e.g., "Different from current password") */
  additionalRequirements?: CustomRequirement[];
}

/**
 * Individual requirement item with check/x icon
 */
interface RequirementItemProps {
  met: boolean;
  text: string;
  isDark: boolean;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text, isDark }) => (
  <HStack space="sm" className="items-center">
    {met ? (
      <Check size={16} color={isDark ? '#86EFAC' : '#16A34A'} />
    ) : (
      <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
    )}
    <Text
      className="text-xs"
      style={{
        color: met ? (isDark ? '#4ade80' : '#16a34a') : isDark ? '#9ca3af' : '#6b7280',
      }}
    >
      {text}
    </Text>
  </HStack>
);

/**
 * PasswordRequirements - Displays password strength requirements with visual indicators
 *
 * A reusable component that shows password requirements in an iOS SwiftUI-style card.
 * Automatically validates the password against standard requirements and displays
 * check/x icons for each requirement.
 *
 * Features:
 * - Standard password requirements (length, uppercase, lowercase, number, special)
 * - Support for additional custom requirements
 * - Dark/light mode support
 * - EAA compliant with proper accessibility
 *
 * @example
 * // Basic usage
 * <PasswordRequirements password={password} testID="password-requirements" />
 *
 * @example
 * // With additional requirements (e.g., for Change Password screen)
 * <PasswordRequirements
 *   password={newPassword}
 *   testID="password-requirements"
 *   additionalRequirements={[
 *     { key: 'different', met: newPassword !== currentPassword, text: 'Different from current' }
 *   ]}
 * />
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  testID = 'password-requirements',
  additionalRequirements = [],
}) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? '#262626' : '#FFFFFF';
  const textColor = isDark ? '#d1d5db' : '#374151';

  const requirements = useMemo(() => checkPasswordRequirements(password || ''), [password]);

  return (
    <Box className="rounded-xl p-4" style={{ backgroundColor: cardBg }} testID={testID}>
      <Text className="mb-3 text-sm font-semibold" style={{ color: textColor }}>
        {t('auth.resetPassword.requirements.title')}
      </Text>
      <VStack space="sm">
        <RequirementItem
          met={requirements.length}
          text={t('auth.resetPassword.requirements.length')}
          isDark={isDark}
        />
        <RequirementItem
          met={requirements.uppercase}
          text={t('auth.resetPassword.requirements.uppercase')}
          isDark={isDark}
        />
        <RequirementItem
          met={requirements.lowercase}
          text={t('auth.resetPassword.requirements.lowercase')}
          isDark={isDark}
        />
        <RequirementItem
          met={requirements.number}
          text={t('auth.resetPassword.requirements.number')}
          isDark={isDark}
        />
        <RequirementItem
          met={requirements.special}
          text={t('auth.resetPassword.requirements.special')}
          isDark={isDark}
        />
        {additionalRequirements.map(req => (
          <RequirementItem key={req.key} met={req.met} text={req.text} isDark={isDark} />
        ))}
      </VStack>
    </Box>
  );
};
