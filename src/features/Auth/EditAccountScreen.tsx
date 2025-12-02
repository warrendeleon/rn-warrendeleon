import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import { Box, HStack, Pressable, Spinner, Text, VStack } from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import * as yup from 'yup';

import {
  AlertBox,
  AuthScreenWrapper,
  ConfirmDialog,
  SettingsItem,
  UserCard,
  useToast,
} from '@app/components';
import {
  CountryCodeSelector,
  type CountryData,
  DEFAULT_COUNTRY,
} from '@app/components/CountryCodeSelector';
import { refreshUser, selectUser, updateUserProfileAsync } from '@app/features/Auth';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { logout, useAppDispatch, useAppSelector } from '@app/store';

type EditAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditAccount'>;
type EditAccountScreenRouteProp = NativeStackScreenProps<
  RootStackParamList,
  'EditAccount'
>['route'];

const editAccountSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  phoneNumber: yup.string().default('').max(20, 'Phone number must not exceed 20 characters'),
});

type EditAccountFormData = yup.InferType<typeof editAccountSchema>;

// Note: TextInput from react-native is used here for iOS Settings-style inline inputs.
// GlueStack Input doesn't support right-aligned text within HStack rows.
// This is an acceptable use case per react-patterns.md guidelines.

export const EditAccountScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<EditAccountScreenNavigationProp>();
  const route = useRoute<EditAccountScreenRouteProp>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(DEFAULT_COUNTRY);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const cardBg = isDark ? '$backgroundDark900' : '$white';
  const textColor = isDark ? '$white' : '$black';
  const labelColor = isDark ? '$textDark400' : '$textLight500';
  const inputColor = isDark ? '#FFFFFF' : '#000000';
  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';
  const separatorColor = isDark ? '$borderDark800' : '$borderLight200';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditAccountFormData>({
    resolver: yupResolver(editAccountSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  // Fetch fresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(refreshUser());
    }, [dispatch])
  );

  // Update form values when user data changes
  useEffect(() => {
    if (user && !isDirty) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, reset, isDirty]);

  // Show toast when navigated here after successful password reset
  useEffect(() => {
    if (route.params?.passwordUpdated) {
      showToast({
        message: t('auth.resetPassword.successTitle'),
        type: 'success',
        testID: 'password-updated-toast',
      });
      // Clear the param to prevent showing toast again on re-render
      navigation.setParams({ passwordUpdated: undefined });
    }
  }, [route.params?.passwordUpdated, navigation, showToast, t]);

  const onSubmit = useCallback(
    async (data: EditAccountFormData) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await dispatch(
          updateUserProfileAsync({
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber || undefined,
          })
        ).unwrap();
        navigation.goBack();
      } catch {
        setSaveError(
          t('account.updateError', { defaultValue: 'Failed to update profile. Please try again.' })
        );
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch, navigation, t]
  );

  const handleLogout = useCallback(() => {
    setShowLogoutDialog(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setShowLogoutDialog(false);
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, navigation]);

  const cancelLogout = useCallback(() => {
    setShowLogoutDialog(false);
  }, []);

  const handleChangePassword = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);

  // Handle save when form changes
  const handleSave = useCallback(() => {
    if (isDirty) {
      handleSubmit(onSubmit)();
    }
  }, [isDirty, handleSubmit, onSubmit]);

  return (
    <AuthScreenWrapper testID="edit-account-screen">
      {/* Error Message */}
      {saveError && (
        <Box mx="$4" mt="$4">
          <AlertBox variant="error" message={saveError} testID="save-error-message" />
        </Box>
      )}

      {/* User Card Header */}
      <Box px="$4" pt="$2">
        <UserCard
          firstName={user?.firstName || null}
          lastName={user?.lastName || null}
          email={user?.email || null}
          groupVariant="single"
          testID="edit-account-user-card"
        />
      </Box>

      {/* Name Section */}
      <VStack mt="$6" px="$4">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={labelColor}
          accessibilityRole="header"
        >
          {t('account.personalInfo')}
        </Text>

        {/* iOS-style grouped input card */}
        <Box bg={cardBg} borderRadius="$xl" overflow="hidden">
          {/* First Name Row */}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <HStack
                px="$4"
                py="$3"
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={1}
                borderBottomColor={separatorColor}
              >
                <Text fontSize="$md" color={textColor} minWidth="$24">
                  {t('account.firstName')}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('account.firstNamePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  style={{
                    flex: 1,
                    fontSize: 17,
                    color: inputColor,
                    textAlign: 'right',
                    paddingVertical: 0,
                  }}
                  accessibilityLabel={t('account.firstName')}
                  accessibilityHint={t('account.firstNameHint')}
                  testID="first-name-input"
                />
              </HStack>
            )}
          />

          {/* Last Name Row */}
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <HStack px="$4" py="$3" alignItems="center" justifyContent="space-between">
                <Text fontSize="$md" color={textColor} minWidth="$24">
                  {t('account.lastName')}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('account.lastNamePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  style={{
                    flex: 1,
                    fontSize: 17,
                    color: inputColor,
                    textAlign: 'right',
                    paddingVertical: 0,
                  }}
                  accessibilityLabel={t('account.lastName')}
                  accessibilityHint={t('account.lastNameHint')}
                  testID="last-name-input"
                />
              </HStack>
            )}
          />
        </Box>

        {/* Validation errors */}
        {(errors.firstName || errors.lastName || errors.phoneNumber) && (
          <Text fontSize="$xs" color="$red500" mt="$2" ml="$4">
            {errors.firstName?.message || errors.lastName?.message || errors.phoneNumber?.message}
          </Text>
        )}
      </VStack>

      {/* Contact Information Section */}
      <VStack mt="$6" px="$4">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={labelColor}
          accessibilityRole="header"
        >
          {t('account.contactInfo')}
        </Text>

        {/* iOS-style grouped card for contact info */}
        <Box bg={cardBg} borderRadius="$xl" overflow="hidden">
          {/* Phone Number Row */}
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => {
              // Get display value - show only national number (without country code)
              const getDisplayPhoneNumber = (fullNumber: string): string => {
                if (fullNumber.startsWith(selectedCountry.callingCode)) {
                  return fullNumber.slice(selectedCountry.callingCode.length);
                }
                return fullNumber.replace(/^\+\d+/, '');
              };

              // Handle phone number input - prepend country code
              const handlePhoneChange = (text: string) => {
                let formattedNumber = text;
                if (text && !text.startsWith('+')) {
                  formattedNumber = `${selectedCountry.callingCode}${text}`;
                }
                onChange(formattedNumber);
              };

              // Handle country selection
              const handleCountrySelect = (country: CountryData) => {
                setSelectedCountry(country);
                if (value) {
                  const nationalNumber = value.replace(/^\+\d+/, '');
                  onChange(`${country.callingCode}${nationalNumber}`);
                }
              };

              return (
                <HStack
                  px="$4"
                  py="$3"
                  alignItems="center"
                  justifyContent="flex-end"
                  borderBottomWidth={1}
                  borderBottomColor={separatorColor}
                >
                  <CountryCodeSelector
                    selectedCountry={selectedCountry}
                    onCountrySelect={handleCountrySelect}
                    testID="country-code-selector"
                    isDisabled={isSaving}
                  />
                  <TextInput
                    value={getDisplayPhoneNumber(value)}
                    onChangeText={handlePhoneChange}
                    onBlur={onBlur}
                    placeholder={t('account.phoneNumberPlaceholder')}
                    placeholderTextColor={placeholderColor}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                    style={{
                      flex: 1,
                      fontSize: 17,
                      color: inputColor,
                      textAlign: 'right',
                      paddingVertical: 0,
                    }}
                    accessibilityLabel={t('account.phoneNumber')}
                    accessibilityHint={t('account.phoneNumberHint')}
                    testID="phone-number-input"
                  />
                </HStack>
              );
            }}
          />

          {/* Email Row (Read-only) */}
          <HStack px="$4" py="$3" alignItems="center" justifyContent="space-between">
            <Text fontSize="$md" color={textColor} minWidth="$24">
              {t('account.email')}
            </Text>
            <Text
              fontSize="$md"
              color={labelColor}
              flex={1}
              textAlign="right"
              accessibilityLabel={t('account.email')}
              accessibilityHint={t('account.emailHint')}
              testID="email-display"
            >
              {user?.email || '-'}
            </Text>
          </HStack>
        </Box>
      </VStack>

      {/* Save Button - iOS style (always visible, disabled when no changes) */}
      <VStack mt="$6" px="$4">
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || isSaving}
          bg={cardBg}
          borderRadius="$xl"
          py="$3"
          alignItems="center"
          opacity={isDirty ? 1 : 0.5}
          accessibilityRole="button"
          accessibilityLabel={t('account.save')}
          accessibilityHint={t('account.saveHint')}
          accessibilityState={{ disabled: !isDirty || isSaving }}
          testID="save-button"
        >
          {isSaving ? (
            <Spinner size="small" color="$primary500" />
          ) : (
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={isDirty ? '$primary500' : '$textLight400'}
            >
              {t('account.save')}
            </Text>
          )}
        </Pressable>
      </VStack>

      {/* Change Password Section */}
      <VStack mt="$6" px="$4">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={labelColor}
          accessibilityRole="header"
        >
          {t('account.security')}
        </Text>

        <SettingsItem
          label={t('account.changePassword')}
          onPress={handleChangePassword}
          accessibilityHint={t('account.changePasswordHint')}
          labelFontWeight="$normal"
          testID="change-password-button"
        />
      </VStack>

      {/* Logout Section */}
      <VStack mt="$8" px="$4" pb="$8">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={labelColor}
          accessibilityRole="header"
        >
          {t('account.session')}
        </Text>

        {/* iOS-style logout button */}
        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          bg={cardBg}
          borderRadius="$xl"
          py="$3"
          alignItems="center"
          accessibilityRole="button"
          accessibilityLabel={t('settings.logout')}
          accessibilityHint={t('account.logoutHint')}
          testID="logout-button"
        >
          {isLoggingOut ? (
            <Spinner size="small" color="$red500" />
          ) : (
            <Text fontSize="$md" color="$red500">
              {t('settings.logout')}
            </Text>
          )}
        </Pressable>
      </VStack>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title={t('settings.logoutTitle')}
        message={t('settings.logoutMessage')}
        testID="logout-dialog"
        onClose={cancelLogout}
        buttons={[
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: cancelLogout,
            testID: 'logout-cancel-button',
          },
          {
            text: t('settings.logout'),
            style: 'destructive',
            onPress: confirmLogout,
            testID: 'logout-confirm-button',
          },
        ]}
      />
    </AuthScreenWrapper>
  );
};
