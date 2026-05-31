import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import * as yup from 'yup';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Spinner } from '@app/components/ui/spinner';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { refreshUser, selectUser, updateUserProfileAsync } from '@app/features/Auth';
import type { RootStackParamList } from '@app/navigation';
import { AlertBox, AuthScreenWrapper, ConfirmDialog, useToast } from '@app/shared/components';
import {
  CountryCodeSelector,
  type CountryData,
  DEFAULT_COUNTRY,
} from '@app/shared/components/CountryCodeSelector';
import { useAppColorScheme } from '@app/shared/hooks';
import { logout, useAppDispatch, useAppSelector } from '@app/store';

import { ProfilePictureSection } from './components';

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
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(
    user?.profilePicture || null
  );

  // iOS 26 style colours
  const cardBg = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const pillBg = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(120, 120, 128, 0.16)';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const labelColor = isDark ? '#8E8E93' : '#6C6C70';
  const inputColor = isDark ? '#FFFFFF' : '#000000';
  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';
  const separatorColor = isDark ? 'rgba(60, 60, 67, 0.36)' : 'rgba(60, 60, 67, 0.12)';
  const primaryButtonBg = '#0066FF';

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

  // Handle profile picture selection from ProfilePicturePreviewScreen
  useEffect(() => {
    if (route.params?.selectedImageUri) {
      setProfilePictureUri(route.params.selectedImageUri);
      // Clear the param to prevent re-applying on re-render
      navigation.setParams({ selectedImageUri: undefined });
    }
  }, [route.params?.selectedImageUri, navigation]);

  // Handle remove photo action from ProfilePictureActionSheetScreen
  useEffect(() => {
    if (route.params?.profilePictureAction === 'remove') {
      setProfilePictureUri(null);
      navigation.setParams({ profilePictureAction: undefined });
    }
  }, [route.params?.profilePictureAction, navigation]);

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
        <Box className="mx-4 mt-4">
          <AlertBox variant="error" message={saveError} testID="save-error-message" />
        </Box>
      )}

      {/* Profile Picture Section */}
      <ProfilePictureSection
        displayName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
        profilePictureUrl={profilePictureUri}
      />

      {/* Name Section */}
      <VStack className="mt-6 px-4">
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: labelColor }}
          accessibilityRole="header"
        >
          {t('account.personalInfo')}
        </Text>

        {/* iOS 26 style grouped input card */}
        <Box className="overflow-hidden rounded-[20px]" style={{ backgroundColor: cardBg }}>
          {/* First Name Row */}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <HStack
                className="items-center justify-between border-b px-4 py-3"
                style={{ borderBottomColor: separatorColor }}
              >
                <Text className="min-w-24 text-base" style={{ color: textColor }}>
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
              <HStack className="items-center justify-between px-4 py-3">
                <Text className="min-w-24 text-base" style={{ color: textColor }}>
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
          <Text className="ml-4 mt-2 text-xs text-red-500">
            {errors.firstName?.message || errors.lastName?.message || errors.phoneNumber?.message}
          </Text>
        )}
      </VStack>

      {/* Contact Information Section */}
      <VStack className="mt-6 px-4">
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: labelColor }}
          accessibilityRole="header"
        >
          {t('account.contactInfo')}
        </Text>

        {/* iOS 26 style grouped card for contact info */}
        <Box className="overflow-hidden rounded-[20px]" style={{ backgroundColor: cardBg }}>
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
                  className="items-center justify-end border-b px-4 py-3"
                  style={{ borderBottomColor: separatorColor }}
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
          <HStack className="items-center justify-between px-4 py-3">
            <Text className="min-w-24 text-base" style={{ color: textColor }}>
              {t('account.email')}
            </Text>
            <Text
              className="flex-1 text-right text-base"
              style={{ color: labelColor }}
              accessibilityLabel={t('account.email')}
              accessibilityHint={t('account.emailHint')}
              testID="email-display"
            >
              {user?.email || '-'}
            </Text>
          </HStack>
        </Box>
      </VStack>

      {/* Save Button - iOS 26 pill style */}
      <VStack className="mt-6 px-4">
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || isSaving}
          className="items-center rounded-[25px] py-3.5"
          style={{
            backgroundColor: isDirty ? primaryButtonBg : pillBg,
            opacity: isDirty ? 1 : 0.6,
            minHeight: 50,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('account.save')}
          accessibilityHint={t('account.saveHint')}
          accessibilityState={{ disabled: !isDirty || isSaving }}
          testID="save-button"
        >
          {isSaving ? (
            <Spinner size="small" color="#FFFFFF" />
          ) : (
            <Text
              className="text-base font-semibold"
              style={{ color: isDirty ? '#FFFFFF' : labelColor }}
            >
              {t('account.save')}
            </Text>
          )}
        </Pressable>
      </VStack>

      {/* Change Password - iOS 26 pill style */}
      <VStack className="mt-6 px-4">
        <Pressable
          onPress={handleChangePassword}
          className="items-center rounded-[25px] py-3.5"
          style={{ backgroundColor: pillBg, minHeight: 50 }}
          accessibilityRole="button"
          accessibilityLabel={t('account.changePassword')}
          accessibilityHint={t('account.changePasswordHint')}
          testID="change-password-button"
        >
          <Text className="text-base font-medium" style={{ color: textColor }}>
            {t('account.changePassword')}
          </Text>
        </Pressable>
      </VStack>

      {/* Logout - iOS 26 pill style */}
      <VStack className="mt-4 px-4 pb-8">
        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          className="items-center rounded-[25px] py-3.5"
          style={{ backgroundColor: pillBg, opacity: isLoggingOut ? 0.6 : 1, minHeight: 50 }}
          accessibilityRole="button"
          accessibilityLabel={t('settings.logout')}
          accessibilityHint={t('account.logoutHint')}
          testID="logout-button"
        >
          {isLoggingOut ? (
            <Spinner size="small" color="#FF453A" />
          ) : (
            <Text className="text-base font-medium text-[#FF453A]">{t('settings.logout')}</Text>
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
