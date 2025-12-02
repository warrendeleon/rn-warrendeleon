import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  HStack,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail } from 'lucide-react-native';

import { AlertBox, AuthScreenWrapper, useToast } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import { SupabaseAuthClient } from '@app/httpClients';
import type { RootStackParamList } from '@app/navigation';

import {
  checkEmailResendRateLimit,
  recordEmailResendRequest,
} from './utils/emailResendRateLimiter';

type EmailVerificationScreenProps = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

/**
 * Email Verification Screen - iOS SwiftUI style
 *
 * Shown after registration, prompts user to check their email for verification link.
 * Includes rate-limited resend functionality (1 request per minute).
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const { email, source } = route.params;
  const { showToast } = useToast();

  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const hasShownToast = useRef(false);

  // Show Toast message based on navigation source (once on mount)
  useEffect(() => {
    if (hasShownToast.current) {
      return;
    }
    hasShownToast.current = true;

    if (source === 'registration') {
      showToast({
        message: t('auth.emailVerification.toastRegistrationSuccess'),
        type: 'success',
        testID: 'registration-success-toast',
      });
    } else if (source === 'login') {
      showToast({
        message: t('auth.emailVerification.toastEmailNotConfirmed'),
        type: 'info',
        testID: 'email-not-confirmed-toast',
      });
    } else if (source === 'registration_exists') {
      showToast({
        message: t('auth.emailVerification.toastAccountExists'),
        type: 'info',
        testID: 'account-exists-toast',
      });
    }
  }, [source, showToast, t]);

  // Check rate limit on mount and setup countdown
  useEffect(() => {
    const checkRateLimit = async () => {
      const result = await checkEmailResendRateLimit(email);
      if (!result.allowed) {
        setCooldownSeconds(result.secondsRemaining);
      }
    };
    checkRateLimit();
  }, [email]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldownSeconds]);

  const handleResendEmail = useCallback(async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      // Check rate limit
      const rateLimitResult = await checkEmailResendRateLimit(email);

      if (!rateLimitResult.allowed) {
        setError(rateLimitResult.error ?? t('auth.emailVerification.errors.rateLimitExceeded'));
        setCooldownSeconds(rateLimitResult.secondsRemaining);
        setIsResending(false);
        return;
      }

      // Resend confirmation email
      await SupabaseAuthClient.resendConfirmationEmail(email);

      // Record the request for rate limiting
      await recordEmailResendRequest(email);

      // Start cooldown
      setCooldownSeconds(60);

      // Show success state
      setResendSuccess(true);
    } catch {
      setError(t('auth.emailVerification.errors.resendFailed'));
    } finally {
      setIsResending(false);
    }
  }, [email, t]);

  const handleBackToLogin = useCallback(() => {
    navigation.replace('Login');
  }, [navigation]);

  const isResendDisabled = isResending || cooldownSeconds > 0;

  return (
    <AuthScreenWrapper testID="email-verification-screen">
      {/* Email Icon */}
      <Box alignItems="center" mt="$8">
        <Box
          bg={isDark ? '$primary900' : '$primary100'}
          borderRadius="$full"
          p="$6"
          testID="email-icon-container"
        >
          <Mail size={48} color={isDark ? '#93C5FD' : '#2563EB'} />
        </Box>
      </Box>

      {/* Title and Message */}
      <VStack mx="$4" mt="$6" space="sm" alignItems="center">
        <Text
          fontSize="$2xl"
          fontWeight="$bold"
          color={isDark ? '$white' : '$coolGray900'}
          textAlign="center"
          testID="verification-title"
        >
          {t('auth.emailVerification.title')}
        </Text>
        <Text
          fontSize="$md"
          color={isDark ? '$coolGray400' : '$coolGray600'}
          textAlign="center"
          testID="verification-message"
        >
          {t('auth.emailVerification.message')}
        </Text>
      </VStack>

      {/* Email Display */}
      <Box mx="$4" mt="$6">
        <Box
          bg={isDark ? '$backgroundDark900' : '$white'}
          borderRadius="$xl"
          p="$4"
          testID="email-display"
          accessibilityLabel={t('auth.emailVerification.emailSentTo', { email })}
        >
          <HStack space="md" alignItems="center" justifyContent="center">
            <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={isDark ? '$white' : '$coolGray900'}
              testID="email-address"
            >
              {email}
            </Text>
          </HStack>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Box mx="$4" mt="$4">
          <AlertBox variant="error" message={error} testID="error-message" />
        </Box>
      )}

      {/* Resend Success Message */}
      {resendSuccess && (
        <Box mx="$4" mt="$4">
          <AlertBox
            variant="success"
            message={t('auth.emailVerification.resendSuccess')}
            testID="resend-success-message"
          />
        </Box>
      )}

      {/* Resend Button */}
      <Box mx="$4" mt="$6">
        <Button
          onPress={handleResendEmail}
          isDisabled={isResendDisabled}
          size="lg"
          variant="outline"
          testID="resend-email-button"
          accessibilityRole="button"
          accessibilityLabel={
            cooldownSeconds > 0
              ? t('auth.emailVerification.resendButtonCooldown', { seconds: cooldownSeconds })
              : t('auth.emailVerification.resendButton')
          }
          accessibilityHint={t('auth.emailVerification.resendButtonHint')}
          accessibilityState={{ disabled: isResendDisabled }}
          borderRadius="$xl"
          style={{ minHeight: 50 }}
        >
          {isResending ? (
            <ButtonSpinner color="$primary500" />
          ) : (
            <ButtonText fontWeight="$semibold">
              {cooldownSeconds > 0
                ? t('auth.emailVerification.resendButtonCooldown', { seconds: cooldownSeconds })
                : t('auth.emailVerification.resendButton')}
            </ButtonText>
          )}
        </Button>
      </Box>

      {/* Back to Login Button */}
      <Box mx="$4" mt="$4">
        <Button
          onPress={handleBackToLogin}
          size="lg"
          testID="back-to-login-button"
          accessibilityRole="button"
          accessibilityLabel={t('auth.emailVerification.backToLogin')}
          accessibilityHint={t('auth.emailVerification.backToLoginHint')}
          borderRadius="$xl"
          style={{ minHeight: 50 }}
        >
          <ButtonText fontWeight="$semibold">{t('auth.emailVerification.backToLogin')}</ButtonText>
        </Button>
      </Box>

      {/* Back to Login Link (secondary) */}
      <HStack justifyContent="center" alignItems="center" mt="$6">
        <Pressable
          onPress={handleBackToLogin}
          testID="back-to-login-link"
          accessibilityRole="link"
          accessibilityLabel={t('auth.emailVerification.backToLogin')}
          accessibilityHint={t('auth.emailVerification.backToLoginHint')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text color="$primary500" fontWeight="$semibold" fontSize="$sm">
            {t('auth.emailVerification.loginInstead')}
          </Text>
        </Pressable>
      </HStack>

      {/* Information Box */}
      <Box mx="$4" mt="$8">
        <Box
          bg={isDark ? '$backgroundDark900' : '$white'}
          borderRadius="$xl"
          p="$4"
          testID="info-box"
        >
          <VStack space="sm">
            <Text
              color={isDark ? '$coolGray300' : '$coolGray700'}
              fontWeight="$semibold"
              fontSize="$sm"
            >
              {t('auth.emailVerification.infoTitle')}
            </Text>
            <VStack space="xs">
              <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$xs">
                {t('auth.emailVerification.infoStep1')}
              </Text>
              <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$xs">
                {t('auth.emailVerification.infoStep2')}
              </Text>
              <Text color={isDark ? '$coolGray400' : '$coolGray600'} fontSize="$xs">
                {t('auth.emailVerification.infoStep3')}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </AuthScreenWrapper>
  );
};
