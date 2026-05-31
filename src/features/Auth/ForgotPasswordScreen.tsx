import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Info } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@app/components/ui/button';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';
import { AlertBox, AuthScreenWrapper, EmailInput, FormInputGroup } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';

import { checkPasswordResetRateLimit, recordPasswordResetRequest } from './utils/rateLimiter';
import type { PasswordRecoveryFormData } from './validation/passwordRecoverySchema';
import { passwordRecoverySchema } from './validation/passwordRecoverySchema';

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

/**
 * Forgot Password Screen - iOS SwiftUI style
 *
 * Allows users to request a password reset email.
 * Includes rate limiting and proper accessibility support.
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordRecoveryFormData>({
    resolver: yupResolver(passwordRecoverySchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(
    async (data: PasswordRecoveryFormData) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Check rate limit first
        const rateLimitResult = await checkPasswordResetRateLimit(data.email);

        if (!rateLimitResult.allowed) {
          setError(rateLimitResult.error ?? t('auth.forgotPassword.errors.rateLimitExceeded'));
          setIsSubmitting(false);
          return;
        }

        // Request password recovery
        await SupabaseAuthClient.requestPasswordRecovery(data.email);

        // Record the request for rate limiting
        await recordPasswordResetRequest(data.email);

        // Show success state
        setSubmittedEmail(data.email);
        setIsSuccess(true);
      } catch {
        // Even on error, we show success to prevent email enumeration
        // The backend should also return success regardless of whether the email exists
        setSubmittedEmail(data.email);
        setIsSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [t]
  );

  const handleBackToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Success state
  if (isSuccess) {
    return (
      <AuthScreenWrapper testID="forgot-password-screen">
        {/* Success Message */}
        <Box className="mx-4 mt-6">
          <AlertBox
            variant="success"
            title={t('auth.forgotPassword.successTitle')}
            message={t('auth.forgotPassword.successMessage', { email: submittedEmail })}
            testID="success-message"
          />
        </Box>

        {/* Back to Login Button */}
        <Box className="mx-4 mt-8">
          <Button
            onPress={handleBackToLogin}
            size="lg"
            testID="back-to-login-button"
            accessibilityRole="button"
            accessibilityLabel={t('auth.forgotPassword.backToLogin')}
            accessibilityHint={t('auth.forgotPassword.backToLoginHint')}
            className="rounded-xl"
            style={{ minHeight: 50 }}
          >
            <ButtonText className="font-semibold">
              {t('auth.forgotPassword.backToLogin')}
            </ButtonText>
          </Button>
        </Box>
      </AuthScreenWrapper>
    );
  }

  return (
    <AuthScreenWrapper testID="forgot-password-screen">
      {/* Subtitle */}
      <Box className="mx-4 mt-4">
        <Text className="text-sm" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
          {t('auth.forgotPassword.subtitle')}
        </Text>
      </Box>

      {/* Error Message */}
      {error && (
        <Box className="mx-4 mt-4">
          <AlertBox variant="error" message={error} testID="error-message" />
        </Box>
      )}

      {/* Email Form */}
      <FormInputGroup>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <EmailInput
              placeholder={t('auth.forgotPassword.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              groupVariant="single"
              testID="email-input"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              error={errors.email?.message}
              editable={!isSubmitting}
            />
          )}
        />
      </FormInputGroup>

      {/* Send Button */}
      <Box className="mx-4 mt-6">
        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={!isValid || isSubmitting}
          size="lg"
          testID="send-reset-email-button"
          accessibilityRole="button"
          accessibilityLabel={t('auth.forgotPassword.sendButton')}
          accessibilityHint={t('auth.forgotPassword.sendButtonHint')}
          accessibilityState={{ disabled: !isValid || isSubmitting }}
          className="rounded-xl"
          style={{ minHeight: 50 }}
        >
          {isSubmitting ? (
            <ButtonSpinner color="#FFFFFF" />
          ) : (
            <ButtonText className="font-semibold">{t('auth.forgotPassword.sendButton')}</ButtonText>
          )}
        </Button>
      </Box>

      {/* Back to Login Link */}
      <HStack className="mt-6 items-center justify-center">
        <Pressable
          onPress={handleBackToLogin}
          testID="back-to-login-link"
          accessibilityRole="link"
          accessibilityLabel={t('auth.forgotPassword.backToLogin')}
          accessibilityHint={t('auth.forgotPassword.backToLoginHint')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm font-semibold text-primary-500">
            {t('auth.forgotPassword.backToLogin')}
          </Text>
        </Pressable>
      </HStack>

      {/* Information Box */}
      <Box className="mx-4 mt-8">
        <Box
          className="rounded-xl p-4"
          style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF' }}
          testID="info-box"
        >
          <HStack space="md" className="items-start">
            <Info size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <VStack space="sm" className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: isDark ? '#d1d5db' : '#374151' }}
              >
                {t('auth.forgotPassword.infoTitle')}
              </Text>
              <VStack space="xs">
                <Text className="text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
                  • {t('auth.forgotPassword.infoStep1')}
                </Text>
                <Text className="text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
                  • {t('auth.forgotPassword.infoStep2')}
                </Text>
                <Text className="text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
                  • {t('auth.forgotPassword.infoStep3')}
                </Text>
              </VStack>
            </VStack>
          </HStack>
        </Box>
      </Box>
    </AuthScreenWrapper>
  );
};
