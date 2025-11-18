import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppSelector } from '@app/store';

import { selectWorkExperienceOrClientById } from './store/selectors';

type WorkExperienceDetailsScreenRouteProp = RouteProp<RootStackParamList, 'WorkExperienceDetails'>;

const formatDateRange = (start: string, end: string, presentText: string): string => {
  const endDate = end === 'Present' ? presentText : end;
  return `${start} - ${endDate}`;
};

/**
 * Pure helper that computes themed styles for work experience details
 */
export const getWorkExperienceDetailsStyles = (scheme: 'light' | 'dark') => {
  const isDark = scheme === 'dark';
  return {
    container: {
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    cardBackground: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    },
    textPrimary: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    textSecondary: {
      color: isDark ? '#A1A1A6' : '#666666',
    },
    borderColor: {
      borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
    },
    tagBackground: {
      backgroundColor: isDark ? '#2C2C2E' : '#E8E8ED',
    },
    tagText: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
  };
};

const TechSectionComponent: React.FC<{
  title: string;
  items?: string[];
  isDark: boolean;
}> = ({ title, items, isDark }) => {
  const styles = getWorkExperienceDetailsStyles(isDark ? 'dark' : 'light');

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View
      testID={`work-experience-details-section-${title.toLowerCase()}`}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={`${title} section`}
    >
      <Text
        style={[{ fontSize: 14, fontWeight: '600', marginBottom: 12 }, styles.textPrimary]}
        testID={`work-experience-details-section-title-${title.toLowerCase()}`}
      >
        {title}
      </Text>

      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}
        testID={`work-experience-details-tags-${title.toLowerCase()}`}
      >
        {items.map((item, index) => (
          <View
            key={`${title}-${index}-${item}`}
            style={[
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: styles.tagBackground.backgroundColor,
              },
            ]}
            testID={`work-experience-details-tag-${title.toLowerCase()}-${index}`}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={item}
          >
            <Text style={[{ fontSize: 12, fontWeight: '500', color: styles.tagText.color }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const WorkExperienceDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<WorkExperienceDetailsScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const { workExperienceId } = route.params;
  const workExperience = useAppSelector(
    state => selectWorkExperienceOrClientById(state, workExperienceId),
    (a, b) => a?.id === b?.id
  );

  const styles = getWorkExperienceDetailsStyles(isDark ? 'dark' : 'light');
  const dateRange = useMemo(() => {
    if (!workExperience) return '';
    return formatDateRange(workExperience.start, workExperience.end, t('workExperience.present'));
  }, [workExperience, t]);

  // Show not found state
  if (!workExperience) {
    return (
      <ScrollView
        testID="work-experience-details-screen"
        bg={isDark ? '$black' : '$coolGray100'}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Box
          flex={1}
          p="$5"
          alignItems="center"
          justifyContent="center"
          minHeight={300}
          testID="work-experience-details-not-found"
          accessible={true}
          accessibilityRole="alert"
          accessibilityLabel="Work experience not found"
        >
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={isDark ? '$white' : '$black'}>
            {t('workExperience.notFound')}
          </Text>
          <Text fontSize="$sm" textAlign="center" color={isDark ? '$coolGray400' : '$coolGray600'}>
            {t('workExperience.notFoundMessage')}
          </Text>
        </Box>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      testID="work-experience-details-screen"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Company Logo Card */}
      {workExperience.logo && (
        <View
          style={[
            {
              marginBottom: 20,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120,
            },
            styles.cardBackground,
          ]}
          testID="work-experience-details-logo-card"
        >
          {workExperience.logo.endsWith('.svg') ? (
            <SvgUri
              uri={workExperience.logo}
              width={100}
              height={100}
              testID="work-experience-details-logo-svg"
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`${workExperience.company} logo`}
            />
          ) : (
            <Image
              source={{ uri: workExperience.logo }}
              style={{ width: 100, height: 100, resizeMode: 'contain' }}
              testID="work-experience-details-logo-image"
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`${workExperience.company} logo`}
            />
          )}
        </View>
      )}

      {/* Company and Position Card */}
      <View
        style={[
          {
            marginBottom: 20,
            borderRadius: 12,
            padding: 16,
          },
          styles.cardBackground,
        ]}
        testID="work-experience-details-header-card"
        accessible={true}
        accessibilityRole="header"
      >
        <Text
          style={[{ fontSize: 24, fontWeight: '700', marginBottom: 8 }, styles.textPrimary]}
          testID="work-experience-details-company-name"
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel={workExperience.company}
        >
          {workExperience.company}
        </Text>

        <Text
          style={[{ fontSize: 16, fontWeight: '600', marginBottom: 8 }, styles.textPrimary]}
          testID="work-experience-details-position"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Position: ${workExperience.position}`}
        >
          {workExperience.position}
        </Text>

        <Text
          style={[{ fontSize: 14 }, styles.textSecondary]}
          testID="work-experience-details-date-range"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Duration: ${dateRange}`}
        >
          {dateRange}
        </Text>
      </View>

      {/* Description Card */}
      {workExperience.description && (
        <View
          style={[
            {
              marginBottom: 20,
              borderRadius: 12,
              padding: 16,
            },
            styles.cardBackground,
          ]}
          testID="work-experience-details-description-card"
          accessible={true}
          accessibilityRole="text"
        >
          <Text
            style={[{ fontSize: 14, fontWeight: '600', marginBottom: 8 }, styles.textPrimary]}
            testID="work-experience-details-description-title"
          >
            {t('workExperience.description')}
          </Text>
          <Text
            style={[{ fontSize: 14, lineHeight: 20 }, styles.textSecondary]}
            testID="work-experience-details-description-text"
            accessible={true}
            accessibilityLabel={workExperience.description}
          >
            {workExperience.description}
          </Text>
        </View>
      )}

      {/* Tech Stack Card */}
      {(workExperience.programmingLanguages ||
        workExperience.techStack ||
        workExperience.unitTest ||
        workExperience.e2e ||
        workExperience.devTools ||
        workExperience.agileMethodology) && (
        <View
          style={[
            {
              marginBottom: 20,
              borderRadius: 12,
              padding: 16,
            },
            styles.cardBackground,
          ]}
          testID="work-experience-details-tech-card"
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel="Technology and tools section"
        >
          <TechSectionComponent
            title={t('workExperience.programmingLanguages')}
            items={workExperience.programmingLanguages}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.techStack')}
            items={workExperience.techStack}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.unitTest')}
            items={workExperience.unitTest}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.e2e')}
            items={workExperience.e2e}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.devTools')}
            items={workExperience.devTools}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.agileMethodology')}
            items={workExperience.agileMethodology}
            isDark={isDark}
          />
        </View>
      )}
    </ScrollView>
  );
};
