import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppSelector } from '@app/store';

import { selectCompanyInfoByPositionId, selectWorkExperienceOrClientById } from './store/selectors';

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
    <Box
      testID={`work-experience-details-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={`${title} section`}
    >
      <Text
        style={[{ fontSize: 14, fontWeight: '600', marginBottom: 12 }, styles.textPrimary]}
        testID={`work-experience-details-section-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {title}
      </Text>

      <Box
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}
        testID={`work-experience-details-tags-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {items.map((item, index) => (
          <Box
            key={`${title}-${index}-${item}`}
            style={[
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: styles.tagBackground.backgroundColor,
              },
            ]}
            testID={`work-experience-details-tag-${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={item}
          >
            <Text style={[{ fontSize: 12, fontWeight: '500', color: styles.tagText.color }]}>
              {item}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ResponsibilitiesSectionComponent: React.FC<{
  items: string[];
  isDark: boolean;
}> = ({ items, isDark }) => {
  const { t } = useTranslation();
  const styles = getWorkExperienceDetailsStyles(isDark ? 'dark' : 'light');

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box
      testID="work-experience-details-responsibilities-section"
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={t('workExperience.keyResponsibilities')}
    >
      <Text
        style={[{ fontSize: 14, fontWeight: '600', marginBottom: 12 }, styles.textPrimary]}
        testID="work-experience-details-responsibilities-title"
      >
        {t('workExperience.keyResponsibilities')}
      </Text>

      {items.map((item, index) => (
        <Box
          key={`responsibility-${index}`}
          style={{ flexDirection: 'row', marginBottom: 12, paddingRight: 8 }}
          testID={`work-experience-details-responsibility-${index}`}
          accessible={true}
          accessibilityRole="text"
        >
          <Text style={[{ fontSize: 14, marginRight: 8 }, styles.textPrimary]}>•</Text>
          <Text
            style={[{ fontSize: 14, lineHeight: 20, flex: 1 }, styles.textSecondary]}
            accessibilityLabel={item}
          >
            {item}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export const WorkExperienceDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<WorkExperienceDetailsScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const { workExperienceId } = route.params;

  // Get position data
  const position = useAppSelector(
    state => selectWorkExperienceOrClientById(state, workExperienceId),
    (a, b) => a?.id === b?.id
  );

  // Get company info (name and logo)
  const companyInfo = useAppSelector(state =>
    selectCompanyInfoByPositionId(state, workExperienceId)
  );

  const styles = getWorkExperienceDetailsStyles(isDark ? 'dark' : 'light');

  const dateRange = useMemo(() => {
    if (!position) return '';
    return formatDateRange(position.start, position.end, t('workExperience.present'));
  }, [position, t]);

  // Check if this is a technical role (has tech stack) or manager role (has responsibilities)
  const hasTechContent = useMemo(() => {
    return (
      position?.programmingLanguages?.length ||
      position?.techStack?.length ||
      position?.unitTest?.length ||
      position?.e2e?.length ||
      position?.devTools?.length ||
      position?.agileMethodology?.length
    );
  }, [position]);

  const hasResponsibilities = useMemo(() => {
    return position?.responsibilities && position.responsibilities.length > 0;
  }, [position]);

  // Show not found state
  if (!position) {
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
      {companyInfo?.logo && (
        <Box
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
          {companyInfo.logo.endsWith('.svg') ? (
            <SvgUri
              uri={companyInfo.logo}
              width={100}
              height={100}
              testID="work-experience-details-logo-svg"
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`${companyInfo.company} logo`}
            />
          ) : (
            <Image
              source={{ uri: companyInfo.logo }}
              style={{ width: 100, height: 100, resizeMode: 'contain' }}
              testID="work-experience-details-logo-image"
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`${companyInfo.company} logo`}
            />
          )}
        </Box>
      )}

      {/* Company and Position Card */}
      <Box
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
        {companyInfo?.company && (
          <Text
            style={[{ fontSize: 24, fontWeight: '700', marginBottom: 8 }, styles.textPrimary]}
            testID="work-experience-details-company-name"
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel={companyInfo.company}
          >
            {companyInfo.company}
          </Text>
        )}

        <Text
          style={[{ fontSize: 16, fontWeight: '600', marginBottom: 8 }, styles.textPrimary]}
          testID="work-experience-details-position"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Position: ${position.title}`}
        >
          {position.title}
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
      </Box>

      {/* Description Card */}
      {position.description && (
        <Box
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
            accessibilityLabel={position.description}
          >
            {position.description}
          </Text>
        </Box>
      )}

      {/* Responsibilities Card (for manager roles) */}
      {hasResponsibilities && (
        <Box
          style={[
            {
              marginBottom: 20,
              borderRadius: 12,
              padding: 16,
            },
            styles.cardBackground,
          ]}
          testID="work-experience-details-responsibilities-card"
        >
          <ResponsibilitiesSectionComponent
            items={position.responsibilities ?? []}
            isDark={isDark}
          />
        </Box>
      )}

      {/* Tech Stack Card (for developer roles) */}
      {hasTechContent && (
        <Box
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
            items={position.programmingLanguages}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.techStack')}
            items={position.techStack}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.unitTest')}
            items={position.unitTest}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.e2e')}
            items={position.e2e}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.devTools')}
            items={position.devTools}
            isDark={isDark}
          />

          <TechSectionComponent
            title={t('workExperience.agileMethodology')}
            items={position.agileMethodology}
            isDark={isDark}
          />
        </Box>
      )}
    </ScrollView>
  );
};
