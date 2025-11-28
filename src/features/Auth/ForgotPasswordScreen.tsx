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
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

import { EmailInput, FormInputGroup } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';

import { SupabaseAuthClient } from './api/api';
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          flex={1}
          bg={isDark ? '$black' : '$coolGray100'}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          testID="forgot-password-screen"
        >
          {/* Success Message */}
          <Box mx="$4" mt="$6">
            <Box
              bg={isDark ? '$green900' : '$green100'}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={isDark ? '$green700' : '$green300'}
              testID="success-message"
              accessibilityRole="alert"
              accessibilityLabel={t('auth.forgotPassword.successHint')}
            >
              <HStack space="md" alignItems="flex-start">
                <CheckCircle size={24} color={isDark ? '#86EFAC' : '#16A34A'} />
                <VStack flex={1} space="xs">
                  <Text
                    color={isDark ? '$green200' : '$green800'}
                    fontWeight="$semibold"
                    fontSize="$md"
                  >
                    {t('auth.forgotPassword.successTitle')}
                  </Text>
                  <Text color={isDark ? '$green300' : '$green700'} fontSize="$sm">
                    {t('auth.forgotPassword.successMessage', { email: submittedEmail })}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Box>

          {/* Back to Login Button */}
          <Box mx="$4" mt="$8">
            <Button
              onPress={handleBackToLogin}
              size="lg"
              testID="back-to-login-button"
              accessibilityRole="button"
              accessibilityLabel={t('auth.forgotPassword.backToLogin')}
              accessibilityHint={t('auth.forgotPassword.backToLoginHint')}
              borderRadius="$xl"
              style={{ minHeight: 50 }}
            >
              <ButtonText fontWeight="$semibold">{t('auth.forgotPassword.backToLogin')}</ButtonText>
            </Button>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
        testID="forgot-password-screen"
      >
        {/* Subtitle */}
        <Box mx="$4" mt="$4">
          <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$sm">
            {t('auth.forgotPassword.subtitle')}
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
        <Box mx="$4" mt="$6">
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={!isValid || isSubmitting}
            size="lg"
            testID="send-reset-email-button"
            accessibilityRole="button"
            accessibilityLabel={t('auth.forgotPassword.sendButton')}
            accessibilityHint={t('auth.forgotPassword.sendButtonHint')}
            accessibilityState={{ disabled: !isValid || isSubmitting }}
            borderRadius="$xl"
            style={{ minHeight: 50 }}
          >
            {isSubmitting ? (
              <ButtonSpinner color="$white" />
            ) : (
              <ButtonText fontWeight="$semibold">{t('auth.forgotPassword.sendButton')}</ButtonText>
            )}
          </Button>
        </Box>

        {/* Back to Login Link */}
        <HStack justifyContent="center" alignItems="center" mt="$6">
          <Pressable
            onPress={handleBackToLogin}
            testID="back-to-login-link"
            accessibilityRole="link"
            accessibilityLabel={t('auth.forgotPassword.backToLogin')}
            accessibilityHint={t('auth.forgotPassword.backToLoginHint')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
              {t('auth.forgotPassword.backToLogin')}
            </Text>
          </Pressable>
        </HStack>

        {/* Information Box */}
        <Box mx="$4" mt="$8">
          <Box
            bg={isDark ? '$backgroundDark900' : '$white'}
            borderRadius="$xl"
            p="$4"
            testID="info-box"
          >
            <HStack space="md" alignItems="flex-start">
              <Info size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <VStack flex={1} space="sm">
                <Text
                  color={isDark ? '$coolGray300' : '$coolGray700'}
                  fontWeight="$semibold"
                  fontSize="$sm"
                >
                  {t('auth.forgotPassword.infoTitle')}
                </Text>
                <VStack space="xs">
                  <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$xs">
                    • {t('auth.forgotPassword.infoStep1')}
                  </Text>
                  <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$xs">
                    • {t('auth.forgotPassword.infoStep2')}
                  </Text>
                  <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$xs">
                    • {t('auth.forgotPassword.infoStep3')}
                  </Text>
                </VStack>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
