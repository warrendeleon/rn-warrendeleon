import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box } from '@app/components/ui/box';
import { Heading } from '@app/components/ui/heading';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';

type TermsAndConditionsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TermsAndConditions'
>;

/**
 * Terms and Conditions Screen - iOS SwiftUI style
 *
 * Displays worldwide-compatible terms of service with GDPR compliance.
 * EAA compliant with proper accessibility labels.
 */
export const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = () => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#000000' : '#f3f4f6';
  const cardBg = isDark ? '#262626' : '#FFFFFF';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const headingColor = isDark ? '#FFFFFF' : '#000000';

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box className="mb-4 rounded-xl p-4" style={{ backgroundColor: cardBg }}>
      <Heading size="sm" className="mb-2" style={{ color: headingColor }}>
        {title}
      </Heading>
      {children}
    </Box>
  );

  const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text className="mb-2 text-sm leading-[24px]" style={{ color: textColor }}>
      {children}
    </Text>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 40 }}
      testID="terms-and-conditions-screen"
      accessibilityRole="scrollbar"
      accessibilityLabel={t('legal.terms.title')}
    >
      <VStack className="px-4 pt-4">
        {/* Last Updated */}
        <Text className="mb-4 text-center text-xs" style={{ color: '#6b7280' }}>
          {t('legal.lastUpdated', { date: '25 November 2025' })}
        </Text>

        {/* Introduction */}
        <Section title={t('legal.terms.sections.introduction.title')}>
          <Paragraph>{t('legal.terms.sections.introduction.content')}</Paragraph>
        </Section>

        {/* Acceptance of Terms */}
        <Section title={t('legal.terms.sections.acceptance.title')}>
          <Paragraph>{t('legal.terms.sections.acceptance.content')}</Paragraph>
        </Section>

        {/* User Accounts */}
        <Section title={t('legal.terms.sections.accounts.title')}>
          <Paragraph>{t('legal.terms.sections.accounts.content')}</Paragraph>
        </Section>

        {/* Acceptable Use */}
        <Section title={t('legal.terms.sections.acceptableUse.title')}>
          <Paragraph>{t('legal.terms.sections.acceptableUse.content')}</Paragraph>
        </Section>

        {/* Intellectual Property */}
        <Section title={t('legal.terms.sections.intellectualProperty.title')}>
          <Paragraph>{t('legal.terms.sections.intellectualProperty.content')}</Paragraph>
        </Section>

        {/* Limitation of Liability */}
        <Section title={t('legal.terms.sections.liability.title')}>
          <Paragraph>{t('legal.terms.sections.liability.content')}</Paragraph>
        </Section>

        {/* Termination */}
        <Section title={t('legal.terms.sections.termination.title')}>
          <Paragraph>{t('legal.terms.sections.termination.content')}</Paragraph>
        </Section>

        {/* Governing Law */}
        <Section title={t('legal.terms.sections.governingLaw.title')}>
          <Paragraph>{t('legal.terms.sections.governingLaw.content')}</Paragraph>
        </Section>

        {/* Changes to Terms */}
        <Section title={t('legal.terms.sections.changes.title')}>
          <Paragraph>{t('legal.terms.sections.changes.content')}</Paragraph>
        </Section>

        {/* Contact */}
        <Section title={t('legal.terms.sections.contact.title')}>
          <Paragraph>{t('legal.terms.sections.contact.content')}</Paragraph>
        </Section>
      </VStack>
    </ScrollView>
  );
};
