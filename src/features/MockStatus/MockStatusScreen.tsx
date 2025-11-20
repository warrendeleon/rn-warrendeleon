import React from 'react';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import { CheckCircle, XCircle } from 'lucide-react-native';

import { isE2EMockEnabled } from '@app/config/e2e';
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
 * - Profile data
 * - Education data
 * - Work Experience data
 */
export const MockStatusScreen: React.FC = () => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

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
          API Mock Status {isE2EMockEnabled ? 'Enabled' : 'Disabled'}
        </Text>
        <Text mb="$6" fontSize="$sm" color={labelColor}>
          Verifies whether API responses are being intercepted and mocked by Metro runtime mocking
          during E2E tests.
        </Text>

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
  bgColor: string;
  textColor: string;
  testID: string;
}

const MockStatusItem: React.FC<MockStatusItemProps> = ({
  label,
  isMocked,
  hasData,
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
      accessibilityLabel={`${label}: ${status}`}
    >
      <Box flex={1}>
        <Text mb="$1" fontSize="$md" fontWeight="$semibold" color={textColor}>
          {label}
        </Text>
        {!hasData && (
          <Text fontSize="$xs" color="$amber600">
            No data loaded
          </Text>
        )}
      </Box>

      <Box flexDirection="row" alignItems="center" gap="$2">
        <Text
          fontSize="$sm"
          fontWeight="$medium"
          color={statusColorToken}
          testID={`${testID}-status`}
        >
          {status}
        </Text>
        <Icon size={20} color={iconColor} testID={`${testID}-icon`} />
      </Box>
    </Box>
  );
};
