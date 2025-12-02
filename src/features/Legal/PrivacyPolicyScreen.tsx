import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Heading, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';

type PrivacyPolicyScreenProps = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

/**
 * Privacy Policy Screen - iOS SwiftUI style
 *
 * Displays GDPR-compliant privacy policy for UK/EU and worldwide use.
 * EAA compliant with proper accessibility labels.
 */
export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = () => {
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

  const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text fontSize="$sm" color={textColor} lineHeight="$lg" mb="$1" pl="$2">
      • {children}
    </Text>
  );

  return (
    <ScrollView
      flex={1}
      bg={bg}
      contentContainerStyle={{ paddingBottom: 40 }}
      testID="privacy-policy-screen"
      accessibilityRole="scrollbar"
      accessibilityLabel={t('legal.privacy.title')}
    >
      <VStack px="$4" pt="$4">
        {/* Last Updated */}
        <Text fontSize="$xs" color="$coolGray500" mb="$4" textAlign="center">
          {t('legal.lastUpdated', { date: '25 November 2025' })}
        </Text>

        {/* Introduction */}
        <Section title={t('legal.privacy.sections.introduction.title')}>
          <Paragraph>{t('legal.privacy.sections.introduction.content')}</Paragraph>
        </Section>

        {/* Data We Collect */}
        <Section title={t('legal.privacy.sections.dataCollection.title')}>
          <Paragraph>{t('legal.privacy.sections.dataCollection.intro')}</Paragraph>
          <BulletPoint>{t('legal.privacy.sections.dataCollection.items.identity')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.dataCollection.items.contact')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.dataCollection.items.technical')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.dataCollection.items.usage')}</BulletPoint>
        </Section>

        {/* How We Use Your Data */}
        <Section title={t('legal.privacy.sections.dataUse.title')}>
          <Paragraph>{t('legal.privacy.sections.dataUse.intro')}</Paragraph>
          <BulletPoint>{t('legal.privacy.sections.dataUse.items.service')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.dataUse.items.communication')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.dataUse.items.improvement')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.dataUse.items.legal')}</BulletPoint>
        </Section>

        {/* Legal Basis (GDPR) */}
        <Section title={t('legal.privacy.sections.legalBasis.title')}>
          <Paragraph>{t('legal.privacy.sections.legalBasis.content')}</Paragraph>
        </Section>

        {/* Data Sharing */}
        <Section title={t('legal.privacy.sections.dataSharing.title')}>
          <Paragraph>{t('legal.privacy.sections.dataSharing.content')}</Paragraph>
        </Section>

        {/* Data Retention */}
        <Section title={t('legal.privacy.sections.dataRetention.title')}>
          <Paragraph>{t('legal.privacy.sections.dataRetention.content')}</Paragraph>
        </Section>

        {/* Your Rights (GDPR) */}
        <Section title={t('legal.privacy.sections.yourRights.title')}>
          <Paragraph>{t('legal.privacy.sections.yourRights.intro')}</Paragraph>
          <BulletPoint>{t('legal.privacy.sections.yourRights.items.access')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.yourRights.items.rectification')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.yourRights.items.erasure')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.yourRights.items.restriction')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.yourRights.items.portability')}</BulletPoint>
          <BulletPoint>{t('legal.privacy.sections.yourRights.items.objection')}</BulletPoint>
        </Section>

        {/* International Transfers */}
        <Section title={t('legal.privacy.sections.internationalTransfers.title')}>
          <Paragraph>{t('legal.privacy.sections.internationalTransfers.content')}</Paragraph>
        </Section>

        {/* Security */}
        <Section title={t('legal.privacy.sections.security.title')}>
          <Paragraph>{t('legal.privacy.sections.security.content')}</Paragraph>
        </Section>

        {/* Children's Privacy */}
        <Section title={t('legal.privacy.sections.children.title')}>
          <Paragraph>{t('legal.privacy.sections.children.content')}</Paragraph>
        </Section>

        {/* Changes to Policy */}
        <Section title={t('legal.privacy.sections.changes.title')}>
          <Paragraph>{t('legal.privacy.sections.changes.content')}</Paragraph>
        </Section>

        {/* Contact */}
        <Section title={t('legal.privacy.sections.contact.title')}>
          <Paragraph>{t('legal.privacy.sections.contact.content')}</Paragraph>
        </Section>
      </VStack>
    </ScrollView>
  );
};
