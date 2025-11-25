import React, { Fragment, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
  CountryCodeSelector,
  type CountryData,
  DEFAULT_COUNTRY,
  FormInputItem,
  getButtonGroupVariant,
} from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(DEFAULT_COUNTRY);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<RegistrationFormData>({
    resolver: yupResolver(registrationSchema),
    mode: 'onBlur',
    defaultValues: {
      // TODO: Remove test data before production
      firstName: 'Warren',
      lastName: 'De Leon',
      email: 'hi@warrendeleon.com',
      phoneNumber: '+447510084239',
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
      acceptTerms: true,
    },
  });

  const phoneNumberValue = watch('phoneNumber');

  const handleCountrySelect = useCallback(
    (country: CountryData) => {
      setSelectedCountry(country);
      if (phoneNumberValue) {
        const nationalNumber = phoneNumberValue.replace(/^\+\d+/, '');
        setValue('phoneNumber', `${country.callingCode}${nationalNumber}`, {
          shouldValidate: true,
        });
      }
    },
    [phoneNumberValue, setValue]
  );

  const handlePhoneNumberChange = useCallback(
    (text: string, onChange: (value: string) => void) => {
      let formattedNumber = text;
      if (text && !text.startsWith('+')) {
        formattedNumber = `${selectedCountry.callingCode}${text}`;
      }
      onChange(formattedNumber);
    },
    [selectedCountry.callingCode]
  );

  const getDisplayPhoneNumber = useCallback(
    (fullNumber: string): string => {
      if (fullNumber.startsWith(selectedCountry.callingCode)) {
        return fullNumber.slice(selectedCountry.callingCode.length);
      }
      return fullNumber.replace(/^\+\d+/, '');
    },
    [selectedCountry.callingCode]
  );

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
        // Show verification message and navigate back
        Alert.alert(
          t('auth.registration.verifyEmailTitle'),
          t('auth.registration.verifyEmailMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } catch {
        // Error handled by Redux state
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, navigation, t]
  );

  // Form section configurations
  const nameFields = [
    {
      name: 'firstName' as const,
      placeholder: t('auth.registration.firstName'),
      textContentType: 'givenName' as const,
      autoComplete: 'given-name',
    },
    {
      name: 'lastName' as const,
      placeholder: t('auth.registration.lastName'),
      textContentType: 'familyName' as const,
      autoComplete: 'family-name',
    },
  ];

  const passwordFields = [
    {
      name: 'password' as const,
      placeholder: t('auth.registration.password'),
      secure: true,
      showToggle: true,
      isVisible: showPassword,
      onToggle: () => setShowPassword(prev => !prev),
      textContentType: 'newPassword' as const,
    },
    {
      name: 'confirmPassword' as const,
      placeholder: t('auth.registration.confirmPassword'),
      secure: true,
      showToggle: true,
      isVisible: showConfirmPassword,
      onToggle: () => setShowConfirmPassword(prev => !prev),
      textContentType: 'newPassword' as const,
    },
  ];

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
        <Box mx="$4" mt="$6">
          {nameFields.map((field, index) => (
            <Fragment key={field.name}>
              <Controller
                control={control}
                name={field.name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInputItem
                    placeholder={field.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    groupVariant={getButtonGroupVariant(index, nameFields.length)}
                    testID={`${field.name}-input`}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete={field.autoComplete}
                    textContentType={field.textContentType}
                    error={errors[field.name]?.message}
                  />
                )}
              />
              {index < nameFields.length - 1 && <ButtonGroupDivider />}
            </Fragment>
          ))}
        </Box>

        {/* Contact Section - Phone */}
        <Box mx="$4" mt="$6">
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInputItem
                placeholder={t('auth.registration.phoneNumber')}
                value={getDisplayPhoneNumber(value)}
                onChangeText={text => handlePhoneNumberChange(text, onChange)}
                onBlur={onBlur}
                groupVariant="single"
                testID="phone-number-input"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                error={errors.phoneNumber?.message}
                leftContent={
                  <CountryCodeSelector
                    selectedCountry={selectedCountry}
                    onCountrySelect={handleCountrySelect}
                    testID="country-code-selector"
                    isDisabled={isSubmitting}
                  />
                }
              />
            )}
          />
        </Box>

        {/* Contact Section - Email */}
        <Box mx="$4" mt="$6">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInputItem
                placeholder={t('auth.registration.email')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                groupVariant="single"
                testID="email-input"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.email?.message}
              />
            )}
          />
        </Box>

        {/* Password Section */}
        <Box mx="$4" mt="$6">
          {passwordFields.map((field, index) => (
            <Fragment key={field.name}>
              <Controller
                control={control}
                name={field.name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInputItem
                    placeholder={field.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    groupVariant={getButtonGroupVariant(index, passwordFields.length)}
                    testID={`${field.name}-input`}
                    secureTextEntry={field.secure}
                    showSecureToggle={field.showToggle}
                    isSecureVisible={field.isVisible}
                    onToggleSecure={field.onToggle}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType={field.textContentType}
                    error={errors[field.name]?.message}
                  />
                )}
              />
              {index < passwordFields.length - 1 && <ButtonGroupDivider />}
            </Fragment>
          ))}
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
                      <Text
                        color="$primary500"
                        fontWeight="$semibold"
                        onPress={() => navigation.navigate('TermsAndConditions')}
                        testID="terms-link"
                        accessibilityRole="link"
                        accessibilityLabel={t('auth.registration.termsLink')}
                        suppressHighlighting
                      >
                        {t('auth.registration.termsLink')}
                      </Text>{' '}
                      {t('auth.registration.andThe')}{' '}
                      <Text
                        color="$primary500"
                        fontWeight="$semibold"
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                        testID="privacy-link"
                        accessibilityRole="link"
                        accessibilityLabel={t('auth.registration.privacyLink')}
                        suppressHighlighting
                      >
                        {t('auth.registration.privacyLink')}
                      </Text>
                    </Text>
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
