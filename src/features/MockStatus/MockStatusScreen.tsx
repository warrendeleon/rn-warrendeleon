import React, { useEffect, useState } from 'react';
import { Box, Heading, ScrollView, Spinner, Text } from '@gluestack-ui/themed';
import { CheckCircle, XCircle } from 'lucide-react-native';

import { SupabaseAuthClient } from '@app/features/Auth/api';
import { useAppColorScheme } from '@app/hooks';
import type { RootState } from '@app/store';
import { useAppSelector } from '@app/store';

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
export const MockStatusScreen: React.FC = () => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Auth mock verification state - actually calls the API
  const [authMockStatus, setAuthMockStatus] = useState<{
    loading: boolean;
    mocked: boolean | null;
  }>({ loading: true, mocked: null });

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

  const cardBg = isDark ? '$backgroundDark900' : '$white';
  const textColor = isDark ? '$white' : '$black';
  const labelColor = isDark ? '$textDark400' : '$textLight500';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      testID="mock-status-screen"
      accessibilityLabel="Mock Status Screen"
    >
      <Box mt="$2">
        <Text
          mb="$3"
          fontSize="$xs"
          fontWeight="$semibold"
          textTransform="uppercase"
          lineHeight="$sm"
          color={labelColor}
          accessibilityRole="header"
        >
          API Mock Status Verification
        </Text>
        <Text mb="$6" fontSize="$sm" color={labelColor}>
          Verifies that API responses contain mocked data with the mocked=true flag during E2E
          tests.
        </Text>

        {/* Portfolio API Section */}
        <Heading size="sm" mb="$3" color={textColor}>
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
        <Heading size="sm" mt="$4" mb="$3" color={textColor}>
          Supabase Auth API
        </Heading>
        <Text mb="$3" fontSize="$xs" color={labelColor}>
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
  const statusColorToken = isMocked ? '$green600' : '$red600';
  const iconColor = isMocked ? '#16a34a' : '#dc2626'; // green-600, red-600
  const Icon = isMocked ? CheckCircle : XCircle;

  return (
    <Box
      mb="$4"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="$lg"
      p="$4"
      bg={bgColor}
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${isLoading ? 'Loading' : status}`}
    >
      <Box flex={1}>
        <Text mb="$1" fontSize="$md" fontWeight="$semibold" color={textColor}>
          {label}
        </Text>
        {!hasData && !isLoading && (
          <Text fontSize="$xs" color="$amber600">
            No data loaded
          </Text>
        )}
      </Box>

      <Box flexDirection="row" alignItems="center" gap="$2">
        {isLoading ? (
          <Spinner size="small" testID={`${testID}-loading`} />
        ) : (
          <>
            <Text
              fontSize="$sm"
              fontWeight="$medium"
              color={statusColorToken}
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
