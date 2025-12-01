import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform } from 'react-native';
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  HStack,
  ScrollView,
  Text,
} from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle } from 'lucide-react-native';

import {
  ButtonGroupDivider,
  FormInputGroup,
  PasswordInput,
  PasswordRequirements,
} from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';

import type { ChangePasswordFormData } from './validation/passwordRecoverySchema';
import { changePasswordSchema } from './validation/passwordRecoverySchema';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        flex={1}
        bg={isDark ? '$black' : '$coolGray100'}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        testID="change-password-screen"
      >
        {/* Subtitle */}
        <Box mx="$4" mt="$4">
          <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$sm">
            {t('auth.changePassword.subtitle')}
          </Text>
        </Box>

        {/* Error Message */}
        {error && (
          <Box mx="$4" mt="$4">
            <Box
              bg="$red100"
              borderRadius="$xl"
              p="$3"
              borderWidth={1}
              borderColor="$red300"
              testID="error-message"
              accessibilityRole="alert"
            >
              <HStack space="sm" alignItems="center">
                <AlertCircle size={20} color="#DC2626" />
                <Text color="$red700" flex={1} fontSize="$sm">
                  {error}
                </Text>
              </HStack>
            </Box>
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
        <Box mx="$4" mt="$4">
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
        <Box mx="$4" mt="$6">
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={!isValid || isSubmitting}
            size="lg"
            testID="change-password-button"
            accessibilityRole="button"
            accessibilityLabel={t('auth.changePassword.changeButton')}
            accessibilityHint={t('auth.changePassword.changeButtonHint')}
            accessibilityState={{ disabled: !isValid || isSubmitting }}
            borderRadius="$xl"
            style={{ minHeight: 50 }}
          >
            {isSubmitting ? (
              <ButtonSpinner color="$white" />
            ) : (
              <ButtonText fontWeight="$semibold">
                {t('auth.changePassword.changeButton')}
              </ButtonText>
            )}
          </Button>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
