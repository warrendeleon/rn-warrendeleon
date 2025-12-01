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
  Switch,
  Text,
} from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle } from 'lucide-react-native';

import {
  ButtonGroupDivider,
  EmailInput,
  FormInputGroup,
  FormInputItem,
  PasswordInput,
  PasswordRequirements,
  PhoneInput,
} from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import type { AuthErrorPayload } from '@app/store';
import { register, selectAuthError, useAppDispatch, useAppSelector } from '@app/store';

import type { RegistrationFormData } from './validation/registrationSchema';
import { registrationSchema } from './validation/registrationSchema';

type RegistrationScreenProps = NativeStackScreenProps<RootStackParamList, 'Registration'>;

/**
 * Registration Screen - iOS SwiftUI style
 *
 * Uses grouped form sections matching native iOS design patterns.
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const authError = useAppSelector(selectAuthError);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Field refs for keyboard navigation
  const lastNameRef = useRef<{ focus: () => void }>(null);
  const phoneRef = useRef<{ focus: () => void }>(null);
  const emailRef = useRef<{ focus: () => void }>(null);
  const passwordRef = useRef<{ focus: () => void }>(null);
  const confirmPasswordRef = useRef<{ focus: () => void }>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegistrationFormData>({
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = useCallback(
    async (data: RegistrationFormData) => {
      setIsSubmitting(true);
      try {
        await dispatch(
          register({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
          })
        ).unwrap();
        // Navigate directly to EmailVerification screen
        navigation.replace('EmailVerification', { email: data.email, source: 'registration' });
      } catch (error) {
        // Check for user_already_exists error - redirect to EmailVerification
        const authError = error as AuthErrorPayload | undefined;
        if (authError?.code === 'user_already_exists') {
          navigation.replace('EmailVerification', {
            email: data.email,
            source: 'registration_exists',
          });
          return;
        }
        // Other errors handled by Redux state
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, navigation]
  );

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
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        testID="registration-screen"
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

        {/* Name Section */}
        <FormInputGroup>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInputItem
                placeholder={t('auth.registration.firstName')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="top"
                testID="firstName-input"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="given-name"
                textContentType="givenName"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                error={errors.firstName?.message}
              />
            )}
          />
          <ButtonGroupDivider />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInputItem
                ref={lastNameRef}
                placeholder={t('auth.registration.lastName')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="bottom"
                testID="lastName-input"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="family-name"
                textContentType="familyName"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                error={errors.lastName?.message}
              />
            )}
          />
        </FormInputGroup>

        {/* Contact Section - Phone */}
        <FormInputGroup>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <PhoneInput
                ref={phoneRef}
                placeholder={t('auth.registration.phoneNumber')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="single"
                testID="phone-number-input"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.phoneNumber?.message}
                isCountrySelectorDisabled={isSubmitting}
                countrySelectorTestID="country-code-selector"
              />
            )}
          />
        </FormInputGroup>

        {/* Contact Section - Email */}
        <FormInputGroup>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <EmailInput
                ref={emailRef}
                placeholder={t('auth.registration.email')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="single"
                testID="email-input"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.email?.message}
              />
            )}
          />
        </FormInputGroup>

        {/* Password Section */}
        <FormInputGroup>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                ref={passwordRef}
                placeholder={t('auth.registration.password')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="top"
                testID="password-input"
                isNewPassword
                isSecureVisible={showPassword}
                onToggleSecure={togglePasswordVisibility}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                error={errors.password?.message}
              />
            )}
          />
          <ButtonGroupDivider />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                ref={confirmPasswordRef}
                placeholder={t('auth.registration.confirmPassword')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="bottom"
                testID="confirmPassword-input"
                isNewPassword
                isSecureVisible={showPassword}
                onToggleSecure={togglePasswordVisibility}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </FormInputGroup>

        {/* Password Requirements */}
        <Box mx="$4" mt="$4">
          <PasswordRequirements password={password} testID="password-requirements" />
        </Box>

        {/* Terms Toggle */}
        <Box mx="$4" mt="$6">
          <Controller
            control={control}
            name="acceptTerms"
            render={({ field: { onChange, value } }) => (
              <Box bg={isDark ? '$backgroundDark900' : '$white'} borderRadius="$xl" p="$4">
                <Box flexDirection="row" alignItems="stretch" justifyContent="space-between">
                  <Box flex={1} pr="$3" justifyContent="center">
                    <Text fontSize="$sm" color={isDark ? '$coolGray300' : '$coolGray700'}>
                      {t('auth.registration.acceptTermsText')}{' '}
                    </Text>
                    <HStack flexWrap="wrap" alignItems="center">
                      <Pressable
                        onPress={() => navigation.navigate('TermsAndConditions')}
                        testID="terms-link"
                        accessibilityRole="link"
                        accessibilityLabel={t('auth.registration.termsLink')}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      >
                        <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
                          {t('auth.registration.termsLink')}
                        </Text>
                      </Pressable>
                      <Text fontSize="$sm" color={isDark ? '$coolGray300' : '$coolGray700'}>
                        {' '}
                        {t('auth.registration.andThe')}{' '}
                      </Text>
                      <Pressable
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                        testID="privacy-link"
                        accessibilityRole="link"
                        accessibilityLabel={t('auth.registration.privacyLink')}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      >
                        <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
                          {t('auth.registration.privacyLink')}
                        </Text>
                      </Pressable>
                    </HStack>
                  </Box>
                  <Box justifyContent="center">
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      testID="accept-terms-switch"
                      accessibilityLabel={t('auth.registration.acceptTerms')}
                      accessibilityHint={t('auth.registration.acceptTermsHint')}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: value }}
                    />
                  </Box>
                </Box>
                {errors.acceptTerms && (
                  <Text fontSize="$xs" color="$red600" mt="$2">
                    {errors.acceptTerms.message}
                  </Text>
                )}
              </Box>
            )}
          />
        </Box>

        {/* Submit Button */}
        <Box mx="$4" mt="$8">
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={!isValid || isSubmitting}
            size="lg"
            testID="register-button"
            accessibilityRole="button"
            accessibilityLabel={t('auth.registration.registerButton')}
            accessibilityHint={t('auth.registration.registerButtonHint')}
            accessibilityState={{ disabled: !isValid || isSubmitting }}
            borderRadius="$xl"
            style={{ minHeight: 50 }}
          >
            {isSubmitting ? (
              <ButtonSpinner color="$white" />
            ) : (
              <ButtonText fontWeight="$semibold">
                {t('auth.registration.registerButton')}
              </ButtonText>
            )}
          </Button>
        </Box>

        {/* Login Link */}
        <HStack justifyContent="center" alignItems="center" mt="$6">
          <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$sm">
            {t('auth.registration.haveAccount')}{' '}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            testID="login-link"
            accessibilityRole="link"
            accessibilityLabel={t('auth.registration.loginLink')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
              {t('auth.registration.loginLink')}
            </Text>
          </Pressable>
        </HStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
