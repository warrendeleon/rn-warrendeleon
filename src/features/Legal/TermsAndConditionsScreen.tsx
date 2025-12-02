import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Heading, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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

  const bg = isDark ? '$black' : '$coolGray100';
  const cardBg = isDark ? '$backgroundDark900' : '$white';
  const textColor = isDark ? '$coolGray300' : '$coolGray700';
  const headingColor = isDark ? '$white' : '$black';

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box bg={cardBg} borderRadius="$xl" p="$4" mb="$4">
      <Heading size="sm" color={headingColor} mb="$2">
        {title}
      </Heading>
      {children}
    </Box>
  );

  const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text fontSize="$sm" color={textColor} lineHeight="$lg" mb="$2">
      {children}
    </Text>
  );

  return (
    <ScrollView
      flex={1}
      bg={bg}
      contentContainerStyle={{ paddingBottom: 40 }}
      testID="terms-and-conditions-screen"
      accessibilityRole="scrollbar"
      accessibilityLabel={t('legal.terms.title')}
    >
      <VStack px="$4" pt="$4">
        {/* Last Updated */}
        <Text fontSize="$xs" color="$coolGray500" mb="$4" textAlign="center">
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
