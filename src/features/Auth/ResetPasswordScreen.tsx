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
import { AlertCircle, CheckCircle } from 'lucide-react-native';

import { FormInputGroup, PasswordInput, PasswordRequirements } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';

import type { PasswordResetFormData } from './validation/passwordRecoverySchema';
import { passwordResetSchema } from './validation/passwordRecoverySchema';

type ResetPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

/**
 * Reset Password Screen - iOS SwiftUI style
 *
 * Allows users to set a new password after clicking the reset link.
 * Includes password strength indicators and proper accessibility support.
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const { accessToken, fromEditAccount } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PasswordResetFormData>({
    resolver: yupResolver(passwordResetSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = useCallback(
    async (data: PasswordResetFormData) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await SupabaseAuthClient.resetPasswordWithToken(accessToken, data.password);

        // Show success state
        setIsSuccess(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t('auth.resetPassword.errors.genericError');

        // Check for specific error types
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          setError(t('auth.resetPassword.errors.invalidToken'));
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [accessToken, t]
  );

  const handleNavigateAway = useCallback(() => {
    if (fromEditAccount) {
      // Coming from Edit Account - go back to account settings
      navigation.navigate('EditAccount', { passwordUpdated: true });
    } else {
      // Deep link flow - go to Login screen
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'Login', params: { passwordUpdated: true } }],
      });
    }
  }, [fromEditAccount, navigation]);

  const handleBackToLogin = useCallback(() => {
    if (fromEditAccount) {
      // Go back to the previous screen (EditAccountScreen)
      navigation.goBack();
    } else {
      // Reset to login screen for deep link flow
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }, { name: 'Login' }],
      });
    }
  }, [navigation, fromEditAccount]);

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
          testID="reset-password-screen"
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
              accessibilityLabel={t('auth.resetPassword.successHint')}
            >
              <HStack space="md" alignItems="flex-start">
                <CheckCircle size={24} color={isDark ? '#86EFAC' : '#16A34A'} />
                <VStack flex={1} space="xs">
                  <Text
                    color={isDark ? '$green200' : '$green800'}
                    fontWeight="$semibold"
                    fontSize="$md"
                  >
                    {t('auth.resetPassword.successTitle')}
                  </Text>
                  <Text color={isDark ? '$green300' : '$green700'} fontSize="$sm">
                    {fromEditAccount
                      ? t('auth.resetPassword.successMessageFromAccount')
                      : t('auth.resetPassword.successMessage')}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Box>

          {/* Navigate Away Button */}
          <Box mx="$4" mt="$8">
            <Button
              onPress={handleNavigateAway}
              size="lg"
              testID="back-to-login-button"
              accessibilityRole="button"
              accessibilityLabel={
                fromEditAccount
                  ? t('auth.resetPassword.backToAccount')
                  : t('auth.resetPassword.backToLogin')
              }
              accessibilityHint={
                fromEditAccount
                  ? t('auth.resetPassword.backToAccountHint')
                  : t('auth.resetPassword.backToLoginHint')
              }
              borderRadius="$xl"
              style={{ minHeight: 50 }}
            >
              <ButtonText fontWeight="$semibold">
                {fromEditAccount
                  ? t('auth.resetPassword.backToAccount')
                  : t('auth.resetPassword.backToLogin')}
              </ButtonText>
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
        testID="reset-password-screen"
      >
        {/* Subtitle */}
        <Box mx="$4" mt="$4">
          <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$sm">
            {t('auth.resetPassword.subtitle')}
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

        {/* Password Form */}
        <FormInputGroup>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                placeholder={t('auth.resetPassword.newPassword')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="top"
                testID="new-password-input"
                returnKeyType="next"
                error={errors.password?.message}
                editable={!isSubmitting}
                isNewPassword
                accessibilityLabel={t('auth.resetPassword.newPassword')}
                accessibilityHint={t('auth.resetPassword.newPasswordHint')}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                placeholder={t('auth.resetPassword.confirmPassword')}
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
                accessibilityLabel={t('auth.resetPassword.confirmPassword')}
                accessibilityHint={t('auth.resetPassword.confirmPasswordHint')}
              />
            )}
          />
        </FormInputGroup>

        {/* Password Requirements */}
        <Box mx="$4" mt="$4">
          <PasswordRequirements password={password} testID="password-requirements" />
        </Box>

        {/* Reset Button */}
        <Box mx="$4" mt="$6">
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={!isValid || isSubmitting}
            size="lg"
            testID="reset-password-button"
            accessibilityRole="button"
            accessibilityLabel={t('auth.resetPassword.resetButton')}
            accessibilityHint={t('auth.resetPassword.resetButtonHint')}
            accessibilityState={{ disabled: !isValid || isSubmitting }}
            borderRadius="$xl"
            style={{ minHeight: 50 }}
          >
            {isSubmitting ? (
              <ButtonSpinner color="$white" />
            ) : (
              <ButtonText fontWeight="$semibold">{t('auth.resetPassword.resetButton')}</ButtonText>
            )}
          </Button>
        </Box>

        {/* Back to Login Link - only show for deep link flow, not when coming from Edit Account */}
        {!fromEditAccount && (
          <HStack justifyContent="center" alignItems="center" mt="$6">
            <Pressable
              onPress={handleBackToLogin}
              testID="back-to-login-link"
              accessibilityRole="link"
              accessibilityLabel={t('auth.resetPassword.backToLogin')}
              accessibilityHint={t('auth.resetPassword.backToLoginHint')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
                {t('auth.resetPassword.backToLogin')}
              </Text>
            </Pressable>
          </HStack>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
