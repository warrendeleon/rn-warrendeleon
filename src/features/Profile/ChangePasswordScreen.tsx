import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box } from '@app/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@app/components/ui/button';
import { Text } from '@app/components/ui/text';
import type { ChangePasswordFormData } from '@app/features/Auth/validation/passwordRecoverySchema';
import { changePasswordSchema } from '@app/features/Auth/validation/passwordRecoverySchema';
import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import {
  AlertBox,
  AuthScreenWrapper,
  ButtonGroupDivider,
  FormInputGroup,
  PasswordInput,
  PasswordRequirements,
} from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';

type ChangePasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

/**
 * Change Password Screen - iOS SwiftUI style
 *
 * Allows logged-in users to change their password.
 * Requires current password verification for security.
 * Includes password strength indicators and proper accessibility support.
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const currentPassword = watch('currentPassword');
  const passwordsDifferent = currentPassword !== newPassword && newPassword.length > 0;

  const onSubmit = useCallback(
    async (data: ChangePasswordFormData) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await SupabaseAuthClient.changePassword(data.currentPassword, data.newPassword);

        // Navigate back to EditAccount with success toast
        navigation.navigate('EditAccount', { passwordUpdated: true });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t('auth.changePassword.errors.genericError');

        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [t, navigation]
  );

  return (
    <AuthScreenWrapper testID="change-password-screen">
      {/* Subtitle */}
      <Box className="mx-4 mt-4">
        <Text className="text-sm" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
          {t('auth.changePassword.subtitle')}
        </Text>
      </Box>

      {/* Error Message */}
      {error && (
        <Box className="mx-4 mt-4">
          <AlertBox variant="error" message={error} testID="error-message" />
        </Box>
      )}

      {/* Current Password Section */}
      <FormInputGroup title={t('auth.changePassword.currentSection')}>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              placeholder={t('auth.changePassword.currentPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              groupVariant="single"
              testID="current-password-input"
              returnKeyType="next"
              error={errors.currentPassword?.message}
              editable={!isSubmitting}
              accessibilityLabel={t('auth.changePassword.currentPassword')}
              accessibilityHint={t('auth.changePassword.currentPasswordHint')}
            />
          )}
        />
      </FormInputGroup>

      {/* New Password Section */}
      <FormInputGroup title={t('auth.changePassword.newSection')}>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              placeholder={t('auth.changePassword.newPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              groupVariant="top"
              testID="new-password-input"
              returnKeyType="next"
              error={errors.newPassword?.message}
              editable={!isSubmitting}
              isNewPassword
              accessibilityLabel={t('auth.changePassword.newPassword')}
              accessibilityHint={t('auth.changePassword.newPasswordHint')}
            />
          )}
        />
        <ButtonGroupDivider />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              placeholder={t('auth.changePassword.confirmPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              groupVariant="bottom"
              testID="confirm-password-input"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              error={errors.confirmPassword?.message}
              editable={!isSubmitting}
              isNewPassword
              accessibilityLabel={t('auth.changePassword.confirmPassword')}
              accessibilityHint={t('auth.changePassword.confirmPasswordHint')}
            />
          )}
        />
      </FormInputGroup>

      {/* Password Requirements */}
      <Box className="mx-4 mt-4">
        <PasswordRequirements
          password={newPassword}
          testID="password-requirements"
          additionalRequirements={[
            {
              key: 'different',
              met: passwordsDifferent,
              text: t('auth.changePassword.requirements.different'),
            },
          ]}
        />
      </Box>

      {/* Change Password Button */}
      <Box className="mx-4 mt-6">
        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={!isValid || isSubmitting}
          size="lg"
          testID="change-password-button"
          accessibilityRole="button"
          accessibilityLabel={t('auth.changePassword.changeButton')}
          accessibilityHint={t('auth.changePassword.changeButtonHint')}
          accessibilityState={{ disabled: !isValid || isSubmitting }}
          className="rounded-xl"
          style={{ minHeight: 50 }}
        >
          {isSubmitting ? (
            <ButtonSpinner color="#FFFFFF" />
          ) : (
            <ButtonText className="font-semibold">
              {t('auth.changePassword.changeButton')}
            </ButtonText>
          )}
        </Button>
      </Box>
    </AuthScreenWrapper>
  );
};
