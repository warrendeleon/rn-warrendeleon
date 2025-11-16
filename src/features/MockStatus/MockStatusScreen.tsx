import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { CheckCircle, XCircle } from 'lucide-react-native';

import { useAppColorScheme } from '@app/hooks';
import type { RootState } from '@app/store';
import { useAppSelector } from '@app/store';

/**
 * Extended types for mocked data
 * MSW adds a `mocked: true` flag to responses during E2E tests
 */
type MockedData<T> = T & { mocked?: boolean };

/**
 * MockStatus Screen - Development/Testing Tool
 *
 * Displays whether API responses are being mocked by MSW during E2E tests.
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
  // MSW adds 'mocked: true' to responses during E2E tests
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

  const bgColor = isDark ? '#000000' : '#F2F2F7';
  const cardBg = isDark ? '$backgroundDark900' : '$white';
  const textColor = isDark ? '$white' : '$black';
  const labelColor = isDark ? '$textDark400' : '$textLight500';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: bgColor }}
      testID="mock-status-screen"
      accessibilityLabel="Mock Status Screen"
    >
      <View className="mt-2">
        <Text
          className="mb-3 text-xs font-semibold uppercase leading-normal"
          color={labelColor}
          accessibilityRole="header"
        >
          API Mock Status
        </Text>
        <Text className="mb-6 text-sm" color={labelColor}>
          Verifies whether API responses are being intercepted and mocked by MSW during E2E tests.
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
      </View>
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
  const statusColor = isMocked ? '$green600' : '$red600';
  const Icon = isMocked ? CheckCircle : XCircle;

  return (
    <View
      className="mb-4 flex-row items-center justify-between rounded-lg p-4"
      style={{ backgroundColor: bgColor }}
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${status}`}
    >
      <View className="flex-1">
        <Text className="mb-1 text-base font-semibold" color={textColor}>
          {label}
        </Text>
        {!hasData && (
          <Text className="text-xs" color="$amber600">
            No data loaded
          </Text>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-medium" color={statusColor} testID={`${testID}-status`}>
          {status}
        </Text>
        <Icon size={20} color={statusColor} testID={`${testID}-icon`} />
      </View>
    </View>
  );
};
