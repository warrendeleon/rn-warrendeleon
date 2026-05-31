import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box } from '@app/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@app/components/ui/button';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import type { RootStackParamList } from '@app/navigation';
import {
  AlertBox,
  AuthScreenWrapper,
  ButtonGroupDivider,
  EmailInput,
  FormInputGroup,
  PasswordInput,
  useToast,
} from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import type { AuthErrorPayload } from '@app/store';
import { login, selectAuthError, useAppDispatch, useAppSelector } from '@app/store';

import type { LoginFormData } from './validation/loginSchema';
import { loginSchema } from './validation/loginSchema';
import { useAuth } from './hooks';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

/**
 * Login Screen - iOS SwiftUI style
 *
 * Provides email/password login with validation.
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const { intendedRoute, clearIntendedRoute } = useAuth();
  const { showToast } = useToast();

  const authError = useAppSelector(selectAuthError);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<{ focus: () => void }>(null);

  // Show toast when navigated here after successful password reset
  useEffect(() => {
    if (route?.params?.passwordUpdated) {
      showToast({
        message: t('auth.resetPassword.successTitle'),
        type: 'success',
        testID: 'password-updated-toast',
      });
      // Clear the param to prevent showing toast again on re-render
      navigation.setParams({ passwordUpdated: undefined });
    }
  }, [route?.params?.passwordUpdated, navigation, showToast, t]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setIsSubmitting(true);
      try {
        await dispatch(
          login({
            email: data.email,
            password: data.password,
          })
        ).unwrap();

        // Navigate to intended route or Home after successful login
        if (intendedRoute) {
          clearIntendedRoute();
          // Reset stack with Home + intended route so back button works
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: intendedRoute as keyof RootStackParamList }],
          });
        } else {
          // Reset to Home as the only screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      } catch (error) {
        // Check for email_not_confirmed error - redirect to EmailVerification
        const authError = error as AuthErrorPayload | undefined;
        if (authError?.code === 'email_not_confirmed') {
          navigation.replace('EmailVerification', { email: data.email, source: 'login' });
          return;
        }
        // Other errors handled by Redux state
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, navigation, intendedRoute, clearIntendedRoute]
  );

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Registration');
  }, [navigation]);

  const focusPassword = useCallback(() => {
    passwordRef.current?.focus();
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <AuthScreenWrapper testID="login-screen">
      {/* Error Message */}
      {authError && (
        <Box className="mx-4 mt-4">
          <AlertBox variant="error" message={authError} testID="auth-error-message" />
        </Box>
      )}

      {/* Login Form */}
      <FormInputGroup title={t('auth.login.loginButton')}>
        {/* Email Field */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <EmailInput
              placeholder={t('auth.login.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              groupVariant="top"
              testID="email-input"
              returnKeyType="next"
              onSubmitEditing={focusPassword}
              error={errors.email?.message}
            />
          )}
        />
        <ButtonGroupDivider />
        {/* Password Field */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              ref={passwordRef}
              placeholder={t('auth.login.password')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              groupVariant="bottom"
              testID="password-input"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              isSecureVisible={showPassword}
              onToggleSecure={togglePasswordVisibility}
              error={errors.password?.message}
            />
          )}
        />
      </FormInputGroup>

      {/* Forgot Password Link */}
      <Pressable
        onPress={handleForgotPassword}
        testID="forgot-password-link"
        accessibilityRole="link"
        accessibilityLabel={t('auth.login.forgotPassword')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="mx-4 mt-3 self-end"
      >
        <Text className="text-sm text-primary-500">{t('auth.login.forgotPassword')}</Text>
      </Pressable>

      {/* Login Button */}
      <Box className="mx-4 mt-6">
        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={!isValid || isSubmitting}
          size="lg"
          testID="login-button"
          accessibilityRole="button"
          accessibilityLabel={t('auth.login.loginButton')}
          accessibilityHint={t('auth.login.loginButtonHint')}
          accessibilityState={{ disabled: !isValid || isSubmitting }}
          className="rounded-xl"
          style={{ minHeight: 50 }}
        >
          {isSubmitting ? (
            <ButtonSpinner color="#FFFFFF" />
          ) : (
            <ButtonText className="font-semibold">{t('auth.login.loginButton')}</ButtonText>
          )}
        </Button>
      </Box>

      {/* Register Link */}
      <HStack className="mt-6 items-center justify-center">
        <Text className="text-sm" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
          {t('auth.login.noAccount')}{' '}
        </Text>
        <Pressable
          onPress={handleRegister}
          testID="register-link"
          accessibilityRole="link"
          accessibilityLabel={t('auth.login.registerLink')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm font-semibold text-primary-500">
            {t('auth.login.registerLink')}
          </Text>
        </Pressable>
      </HStack>
    </AuthScreenWrapper>
  );
};
