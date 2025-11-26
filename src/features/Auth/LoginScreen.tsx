import React, { useCallback, useRef, useState } from 'react';
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
} from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle } from 'lucide-react-native';

import { ButtonGroupDivider, EmailInput, FormInputGroup, PasswordInput } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
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
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const { intendedRoute, clearIntendedRoute } = useAuth();

  const authError = useAppSelector(selectAuthError);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<{ focus: () => void }>(null);

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
      } catch {
        // Error handled by Redux state
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, navigation, intendedRoute, clearIntendedRoute]
  );

  const handleForgotPassword = useCallback(() => {
    // TODO: Navigate to ForgotPassword screen when implemented
    // navigation.navigate('ForgotPassword');
  }, []);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        flex={1}
        bg={isDark ? '$black' : '$coolGray100'}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        testID="login-screen"
      >
        {/* Error Message */}
        {authError && (
          <Box mx="$4" mt="$4">
            <Box
              bg="$red100"
              borderRadius="$xl"
              p="$3"
              borderWidth={1}
              borderColor="$red300"
              testID="auth-error-message"
            >
              <HStack space="sm" alignItems="center">
                <AlertCircle size={20} color="#DC2626" />
                <Text color="$red700" flex={1} fontSize="$sm">
                  {authError}
                </Text>
              </HStack>
            </Box>
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
          mx="$4"
          mt="$3"
          alignSelf="flex-end"
        >
          <Text color="$primary500" fontSize="$sm">
            {t('auth.login.forgotPassword')}
          </Text>
        </Pressable>

        {/* Login Button */}
        <Box mx="$4" mt="$6">
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={!isValid || isSubmitting}
            size="lg"
            testID="login-button"
            accessibilityRole="button"
            accessibilityLabel={t('auth.login.loginButton')}
            accessibilityHint={t('auth.login.loginButtonHint')}
            accessibilityState={{ disabled: !isValid || isSubmitting }}
            borderRadius="$xl"
            style={{ minHeight: 50 }}
          >
            {isSubmitting ? (
              <ButtonSpinner color="$white" />
            ) : (
              <ButtonText fontWeight="$semibold">{t('auth.login.loginButton')}</ButtonText>
            )}
          </Button>
        </Box>

        {/* Register Link */}
        <HStack justifyContent="center" alignItems="center" mt="$6">
          <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$sm">
            {t('auth.login.noAccount')}{' '}
          </Text>
          <Pressable
            onPress={handleRegister}
            testID="register-link"
            accessibilityRole="link"
            accessibilityLabel={t('auth.login.registerLink')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
              {t('auth.login.registerLink')}
            </Text>
          </Pressable>
        </HStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
