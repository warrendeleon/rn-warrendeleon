/**
 * PINSetupScreen
 *
 * iOS 26 style 6-digit PIN setup screen for onboarding.
 * Two-step flow: Enter PIN → Confirm PIN.
 *
 * Features:
 * - iOS 26 unlock screen style UI
 * - Weak PIN validation (rejects sequential, repeated, common patterns)
 * - bcrypt hashing before storage
 * - Keychain storage (WHEN_UNLOCKED_THIS_DEVICE_ONLY)
 * - Full EAA accessibility compliance
 * - Dark/light mode support
 * - i18n translations
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box } from '@app/components/ui/box';
import { Heading } from '@app/components/ui/heading';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import type { RootStackParamList } from '@app/navigation';
import { AlertBox } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';

import { PINInput } from './components/PINInput';
import { hashPIN, storePINHash } from './utils/pinHashing';
import { comparePINs, validatePIN } from './utils/pinValidation';

type PINSetupScreenProps = NativeStackScreenProps<RootStackParamList, 'PINSetup'>;

type PINSetupStep = 'enter' | 'confirm';

/**
 * PINSetupScreen - iOS 26 style PIN creation
 *
 * Flow:
 * 1. User enters 6-digit PIN via keypad
 * 2. System validates PIN strength
 * 3. User confirms PIN
 * 4. System verifies match
 * 5. PIN hashed and stored
 * 6. Navigate to Home
 */
export const PINSetupScreen: React.FC<PINSetupScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<PINSetupStep>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle PIN entry completion (first step)
   */
  const handlePINEnter = useCallback(
    (enteredPin: string) => {
      setError(null);

      const validation = validatePIN(enteredPin);

      if (!validation.isValid) {
        // Use error key for translation if available, otherwise use error message
        const errorMessage = validation.errorKey
          ? t(validation.errorKey)
          : (validation.error ?? null);
        setError(errorMessage);
        setPin('');
        return;
      }

      // PIN is strong, proceed to confirmation
      setPin(enteredPin);
      setStep('confirm');
    },
    [t]
  );

  /**
   * Handle PIN confirmation (second step)
   */
  const handlePINConfirm = useCallback(
    async (enteredPin: string) => {
      setError(null);

      const comparison = comparePINs(pin, enteredPin);

      if (!comparison.isValid) {
        // Use error key for translation if available, otherwise use error message
        const errorMessage = comparison.errorKey
          ? t(comparison.errorKey)
          : (comparison.error ?? null);
        setError(errorMessage);
        setConfirmPin('');
        return;
      }

      // PINs match, hash and store
      setIsSubmitting(true);

      try {
        const hashedPin = await hashPIN(pin);
        await storePINHash(hashedPin);

        // Navigate to Home on success
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch {
        setError(t('auth.pin.errors.storeFailed'));
        setIsSubmitting(false);
      }
    },
    [pin, navigation, t]
  );

  /**
   * Handle back button (return to first step)
   */
  const handleBack = useCallback(() => {
    setStep('enter');
    setPin('');
    setConfirmPin('');
    setError(null);
  }, []);

  /**
   * Get current PIN value based on step
   */
  const currentPin = step === 'enter' ? pin : confirmPin;

  /**
   * Get PIN change handler based on step
   */
  const handlePINChange = step === 'enter' ? setPin : setConfirmPin;

  /**
   * Get completion handler based on step
   */
  const handleComplete = step === 'enter' ? handlePINEnter : handlePINConfirm;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
      }}
      testID="pin-setup-screen"
    >
      <VStack className="flex-1 items-center justify-center px-6">
        {/* Header */}
        <VStack space="sm" className="mb-8 items-center">
          <Heading
            size="2xl"
            className="text-center"
            style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            accessibilityRole="header"
            accessibilityLabel={
              step === 'enter' ? t('auth.pin.createTitle') : t('auth.pin.confirmTitle')
            }
          >
            {step === 'enter' ? t('auth.pin.createTitle') : t('auth.pin.confirmTitle')}
          </Heading>

          <Text
            className="px-4 text-center text-base"
            style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
          >
            {step === 'enter' ? t('auth.pin.createSubtitle') : t('auth.pin.confirmSubtitle')}
          </Text>
        </VStack>

        {/* Error Message */}
        {error && (
          <Box className="mb-4 w-full">
            <AlertBox
              variant="error"
              message={error}
              testID="pin-error-message"
              accessibilityLiveRegion="assertive"
            />
          </Box>
        )}

        {/* Success Message (confirmation step only, before error) */}
        {step === 'confirm' && !error && !isSubmitting && (
          <Box className="mb-4 w-full">
            <AlertBox
              variant="success"
              message={t('auth.pin.pinStrong')}
              testID="pin-strong-message"
            />
          </Box>
        )}

        {/* PIN Input */}
        <PINInput
          value={currentPin}
          onChange={handlePINChange}
          onComplete={handleComplete}
          disabled={isSubmitting}
          hasError={!!error}
          testID={step === 'enter' ? 'pin-input-enter' : 'pin-input-confirm'}
        />

        {/* Change PIN Link (confirmation step only) */}
        {step === 'confirm' && (
          <Pressable
            onPress={handleBack}
            disabled={isSubmitting}
            className="mt-6 p-2"
            testID="change-pin-link"
            accessibilityRole="button"
            accessibilityLabel={t('auth.pin.changePin')}
            accessibilityHint={t('auth.pin.changePinHint')}
          >
            <Text className="font-medium text-primary-500">{t('auth.pin.changePin')}</Text>
          </Pressable>
        )}

        {/* Info Box */}
        <Box className="mt-8 px-4">
          <Text className="text-center text-sm" style={{ color: isDark ? '#6b7280' : '#4b5563' }}>
            {t('auth.pin.infoText')}
          </Text>
        </Box>

        {/* Submitting State */}
        {isSubmitting && (
          <Text
            className="mt-4 text-center text-sm"
            style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
          >
            {t('auth.pin.settingUp')}
          </Text>
        )}
      </VStack>
    </SafeAreaView>
  );
};
