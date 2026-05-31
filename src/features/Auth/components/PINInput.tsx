/**
 * PINInput Component
 *
 * Complete PIN input with iOS 26 style dots and keypad.
 * Combines PINDot display with PINKeypad for full PIN entry experience.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { VStack } from '@app/components/ui/vstack';

import { PINDot } from './PINDot';
import { PINKeypad } from './PINKeypad';

interface PINInputProps {
  /** Number of PIN digits (default: 6) */
  length?: number;
  /** Called when all digits are entered */
  onComplete: (pin: string) => void;
  /** Current PIN value (controlled) */
  value: string;
  /** Called when PIN value changes */
  onChange: (pin: string) => void;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether to show error state on dots */
  hasError?: boolean;
  /** Test ID prefix */
  testID?: string;
}

/**
 * PINInput - Complete iOS 26 style PIN entry
 *
 * Features:
 * - 6 PIN dots showing entry progress
 * - Circular numeric keypad with haptic feedback
 * - Auto-complete when all digits entered
 * - Error state visual feedback
 * - Full accessibility support
 */
export const PINInput: React.FC<PINInputProps> = ({
  length = 6,
  onComplete,
  value,
  onChange,
  disabled = false,
  hasError = false,
  testID = 'pin-input',
}) => {
  const [internalPin, setInternalPin] = useState(value);

  // Sync with external value
  useEffect(() => {
    setInternalPin(value);
  }, [value]);

  /**
   * Handle digit press from keypad
   */
  const handleDigitPress = useCallback(
    (digit: string) => {
      if (disabled || internalPin.length >= length) {
        return;
      }

      const newPin = internalPin + digit;
      setInternalPin(newPin);
      onChange(newPin);

      // Auto-complete when all digits entered
      if (newPin.length === length) {
        // Small delay to allow visual feedback
        setTimeout(() => {
          onComplete(newPin);
        }, 100);
      }
    },
    [disabled, internalPin, length, onChange, onComplete]
  );

  /**
   * Handle delete press from keypad
   */
  const handleDeletePress = useCallback(() => {
    if (disabled || internalPin.length === 0) {
      return;
    }

    const newPin = internalPin.slice(0, -1);
    setInternalPin(newPin);
    onChange(newPin);
  }, [disabled, internalPin, onChange]);

  return (
    <VStack space="2xl" className="items-center" testID={testID}>
      {/* PIN Dots Display */}
      <HStack space="lg" testID={`${testID}-dots`}>
        {Array.from({ length }).map((_, index) => (
          <PINDot
            key={index}
            index={index}
            total={length}
            isFilled={index < internalPin.length}
            hasError={hasError}
            testID={`${testID}-dot`}
          />
        ))}
      </HStack>

      {/* Spacer */}
      <Box className="h-4" />

      {/* Keypad */}
      <PINKeypad
        onDigitPress={handleDigitPress}
        onDeletePress={handleDeletePress}
        disabled={disabled}
        testID={`${testID}-keypad`}
      />
    </VStack>
  );
};

export { PINDot } from './PINDot';
export { PINKeypad } from './PINKeypad';
