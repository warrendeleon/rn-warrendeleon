import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle, XCircle } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Button, ButtonText } from '@app/components/ui/button';
import { Heading } from '@app/components/ui/heading';
import { Spinner } from '@app/components/ui/spinner';
import { Text } from '@app/components/ui/text';
import {
  getE2EMockOverride,
  getEnvE2EMockValue,
  isE2EMockEnabled,
  setE2EMockOverride,
} from '@app/config/e2e';
import { SupabaseAuthClient } from '@app/features/Auth/api';
import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';
import type { RootState } from '@app/store';
import {
  clearEducation,
  clearProfile,
  clearWorkExperience,
  fetchEducation,
  fetchProfile,
  fetchWorkExperience,
  logout,
  useAppDispatch,
  useAppSelector,
} from '@app/store';

/**
 * Extended types for mocked data
 * Metro runtime mocking adds a `mocked: true` flag to responses during E2E tests
 */
type MockedData<T> = T & { mocked?: boolean };

/**
 * MockStatus Screen - Development/Testing Tool
 *
 * Displays whether API responses are being mocked by Metro runtime mocking during E2E tests.
 * Only accessible when ENABLE_TEST_UI=true.
 *
 * Shows mock status for:
 * - Profile data (checks Redux store for mocked flag)
 * - Education data (checks Redux store for mocked flag)
 * - Work Experience data (checks Redux store for mocked flag)
 * - Auth API (makes actual API call to verify mocking)
 */
type MockStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MockStatus'>;

export const MockStatusScreen: React.FC = () => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const dispatch = useAppDispatch();
  const navigation = useNavigation<MockStatusScreenNavigationProp>();

  // Mock override state for developer toggle
  const [mockEnabled, setMockEnabled] = useState(isE2EMockEnabled());
  const [isToggling, setIsToggling] = useState(false);
  const envValue = getEnvE2EMockValue();
  const overrideValue = getE2EMockOverride();

  // Auth mock verification state - actually calls the API
  const [authMockStatus, setAuthMockStatus] = useState<{
    loading: boolean;
    mocked: boolean | null;
  }>({ loading: true, mocked: null });

  // Toggle mock override with full logout and data refresh
  const handleToggleMock = useCallback(() => {
    const newValue = !mockEnabled;
    const action = newValue ? 'ENABLE' : 'DISABLE';

    Alert.alert(`${action} Mock Mode`, `This will log you out and refresh all data. Continue?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action,
        style: newValue ? 'default' : 'destructive',
        onPress: async () => {
          setIsToggling(true);
          try {
            // 1. Log out the user
            await dispatch(logout()).unwrap();

            // 2. Clear all portfolio data
            dispatch(clearProfile());
            dispatch(clearEducation());
            dispatch(clearWorkExperience());

            // 3. Set the new mock override value (persisted to AsyncStorage)
            await setE2EMockOverride(newValue);
            setMockEnabled(newValue);

            // 4. Fetch fresh data with new mock setting
            dispatch(fetchProfile());
            dispatch(fetchEducation());
            dispatch(fetchWorkExperience());

            // 5. Navigate to Home
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch {
            // Silent fail - still update mock state
            await setE2EMockOverride(newValue);
            setMockEnabled(newValue);
          } finally {
            setIsToggling(false);
          }
        },
      },
    ]);
  }, [mockEnabled, dispatch, navigation]);

  // Get data from Redux store with mocked flag support
  // Metro runtime mocking adds 'mocked: true' to responses during E2E tests
  const profileData = useAppSelector((state: RootState) => state.profile.data) as MockedData<
    NonNullable<RootState['profile']['data']>
  > | null;
  const educationData = useAppSelector((state: RootState) => state.education.data) as MockedData<
    RootState['education']['data'][number]
  >[];
  const workExperienceData = useAppSelector(
    (state: RootState) => state.workExperience.data
  ) as MockedData<RootState['workExperience']['data'][number]>[];

  // Verify Auth API mocking by making an actual API call
  useEffect(() => {
    const verifyAuthMocking = async (): Promise<void> => {
      try {
        const result = await SupabaseAuthClient.verifyMockStatus();
        setAuthMockStatus({ loading: false, mocked: result.mocked });
      } catch {
        // On error, assume not mocked (real API would error)
        setAuthMockStatus({ loading: false, mocked: false });
      }
    };

    verifyAuthMocking();
  }, []);

  // Check if data is mocked
  const isProfileMocked = profileData?.mocked === true;
  const isEducationMocked = Array.isArray(educationData) && educationData[0]?.mocked === true;
  const isWorkExperienceMocked =
    Array.isArray(workExperienceData) && workExperienceData[0]?.mocked === true;

  const cardBg = isDark ? '#262626' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const labelColor = isDark ? '#A3A3A3' : '#6B6B6B';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#f3f4f6' }}
      testID="mock-status-screen"
      accessibilityLabel="Mock Status Screen"
    >
      {/* Developer Mock Toggle */}
      <Box className="mb-6 mt-2">
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: labelColor }}
          accessibilityRole="header"
        >
          Developer Mock Control
        </Text>
        <Box
          className="flex-row items-center justify-between rounded-lg p-4"
          style={{ backgroundColor: cardBg }}
        >
          <Box className="flex-1">
            <Text className="text-base font-semibold" style={{ color: textColor }}>
              E2E Mock Status
            </Text>
            <Text className="mt-1 text-xs" style={{ color: labelColor }}>
              .env: {envValue ? 'true' : 'false'}
              {overrideValue !== null && ` → Override: ${overrideValue}`}
            </Text>
          </Box>
          <Button
            size="sm"
            action={mockEnabled ? 'negative' : 'positive'}
            onPress={handleToggleMock}
            isDisabled={isToggling}
            testID="mock-toggle-button"
          >
            {isToggling ? (
              <Spinner size="small" color="#FFFFFF" />
            ) : (
              <ButtonText>{mockEnabled ? 'DISABLE' : 'ENABLE'}</ButtonText>
            )}
          </Button>
        </Box>
      </Box>

      <Box>
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: labelColor }}
          accessibilityRole="header"
        >
          API Mock Status Verification
        </Text>
        <Text className="mb-6 text-sm" style={{ color: labelColor }}>
          Verifies that API responses contain mocked data with the mocked=true flag during E2E
          tests.
        </Text>

        {/* Portfolio API Section */}
        <Heading size="sm" className="mb-3" style={{ color: textColor }}>
          Portfolio API (GitHub)
        </Heading>

        {/* Profile Status */}
        <MockStatusItem
          label="Profile Data"
          isMocked={isProfileMocked}
          hasData={profileData !== null}
          bgColor={cardBg}
          textColor={textColor}
          testID="mock-status-profile"
        />

        {/* Education Status */}
        <MockStatusItem
          label="Education Data"
          isMocked={isEducationMocked}
          hasData={Array.isArray(educationData) && educationData.length > 0}
          bgColor={cardBg}
          textColor={textColor}
          testID="mock-status-education"
        />

        {/* Work Experience Status */}
        <MockStatusItem
          label="Work Experience Data"
          isMocked={isWorkExperienceMocked}
          hasData={Array.isArray(workExperienceData) && workExperienceData.length > 0}
          bgColor={cardBg}
          textColor={textColor}
          testID="mock-status-work-experience"
        />

        {/* Auth API Section */}
        <Heading size="sm" className="mb-3 mt-4" style={{ color: textColor }}>
          Supabase Auth API
        </Heading>
        <Text className="mb-3 text-xs" style={{ color: labelColor }}>
          Makes actual API call to verify mocking returns response with mocked=true.
        </Text>

        {/* Auth API - makes actual API call to verify mocking */}
        <MockStatusItem
          label="Auth API Call"
          isMocked={authMockStatus.mocked === true}
          hasData={!authMockStatus.loading}
          isLoading={authMockStatus.loading}
          bgColor={cardBg}
          textColor={textColor}
          testID="mock-status-auth-api"
        />
      </Box>
    </ScrollView>
  );
};

/**
 * Individual mock status item component
 */
interface MockStatusItemProps {
  label: string;
  isMocked: boolean;
  hasData: boolean;
  isLoading?: boolean;
  bgColor: string;
  textColor: string;
  testID: string;
}

const MockStatusItem: React.FC<MockStatusItemProps> = ({
  label,
  isMocked,
  hasData,
  isLoading = false,
  bgColor,
  textColor,
  testID,
}) => {
  const status = isMocked ? 'Mocked' : 'Not Mocked';
  const statusColor = isMocked ? '#16a34a' : '#dc2626'; // green-600, red-600
  const iconColor = isMocked ? '#16a34a' : '#dc2626'; // green-600, red-600
  const Icon = isMocked ? CheckCircle : XCircle;

  return (
    <Box
      className="mb-4 flex-row items-center justify-between rounded-lg p-4"
      style={{ backgroundColor: bgColor }}
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${isLoading ? 'Loading' : status}`}
    >
      <Box className="flex-1">
        <Text className="mb-1 text-base font-semibold" style={{ color: textColor }}>
          {label}
        </Text>
        {!hasData && !isLoading && <Text className="text-xs text-amber-600">No data loaded</Text>}
      </Box>

      <Box className="flex-row items-center gap-2">
        {isLoading ? (
          <Spinner size="small" testID={`${testID}-loading`} />
        ) : (
          <>
            <Text
              className="text-sm font-medium"
              style={{ color: statusColor }}
              testID={`${testID}-${isMocked ? 'mocked' : 'not-mocked'}`}
            >
              {status}
            </Text>
            <Icon size={20} color={iconColor} testID={`${testID}-icon`} />
          </>
        )}
      </Box>
    </Box>
  );
};
