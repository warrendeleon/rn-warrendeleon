import React, { forwardRef, useCallback, useState } from 'react';
import type {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInputSubmitEditingEventData,
} from 'react-native';

import {
  CountryCodeSelector,
  type CountryData,
  DEFAULT_COUNTRY,
} from '@app/shared/components/CountryCodeSelector';
import { FormInputItem } from '@app/shared/components/FormInputItem';
import type { GroupVariant } from '@app/shared/components/shared';

export type PhoneInputProps = {
  /** Placeholder text */
  placeholder: string;
  /** Current value (full phone number with country code, e.g., '+447510084239') */
  value: string;
  /** Change handler - receives full phone number with country code */
  onChangeText: (text: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Position in group for border radius styling */
  groupVariant?: GroupVariant;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Return key type (default: 'next') */
  returnKeyType?: ReturnKeyTypeOptions;
  /** Whether input is editable */
  editable?: boolean;
  /** Error message to display */
  error?: string;
  /** Called when return key is pressed */
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  /** Initial country (defaults to UK) */
  initialCountry?: CountryData;
  /** Whether country selector is disabled */
  isCountrySelectorDisabled?: boolean;
  /** Test ID for country selector */
  countrySelectorTestID?: string;
};

/** Ref type for PhoneInput */
type PhoneInputRef = { focus: () => void };

/**
 * PhoneInput - Specialised phone number input with country code selector
 *
 * Features:
 * - Integrated country code selector with flag and dial code
 * - Automatic country code prepending
 * - Phone keyboard type
 * - iOS autofill support (telephoneNumber textContentType)
 *
 * The value prop and onChangeText callback use the full international format
 * (e.g., '+447510084239'), while the input displays just the national number.
 *
 * EAA compliant with proper accessibility labels and touch targets.
 */
export const PhoneInput = forwardRef<PhoneInputRef, PhoneInputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      onBlur,
      groupVariant = 'single',
      testID,
      accessibilityLabel,
      accessibilityHint,
      returnKeyType = 'next',
      editable = true,
      error,
      onSubmitEditing,
      initialCountry = DEFAULT_COUNTRY,
      isCountrySelectorDisabled = false,
      countrySelectorTestID = 'country-code-selector',
    },
    ref
  ) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryData>(initialCountry);

    /**
     * Handle country selection - update country and adjust phone number
     */
    const handleCountrySelect = useCallback(
      (country: CountryData) => {
        setSelectedCountry(country);
        if (value) {
          // Replace old country code with new one
          const nationalNumber = value.replace(/^\+\d+/, '');
          onChangeText(`${country.callingCode}${nationalNumber}`);
        }
      },
      [value, onChangeText]
    );

    /**
     * Handle phone number input - prepend country code if not present
     */
    const handlePhoneNumberChange = useCallback(
      (text: string) => {
        let formattedNumber = text;
        if (text && !text.startsWith('+')) {
          formattedNumber = `${selectedCountry.callingCode}${text}`;
        }
        onChangeText(formattedNumber);
      },
      [selectedCountry.callingCode, onChangeText]
    );

    /**
     * Get display value - show only national number (without country code)
     */
    const getDisplayPhoneNumber = useCallback(
      (fullNumber: string): string => {
        if (fullNumber.startsWith(selectedCountry.callingCode)) {
          return fullNumber.slice(selectedCountry.callingCode.length);
        }
        return fullNumber.replace(/^\+\d+/, '');
      },
      [selectedCountry.callingCode]
    );

    return (
      <FormInputItem
        ref={ref}
        placeholder={placeholder}
        value={getDisplayPhoneNumber(value)}
        onChangeText={handlePhoneNumberChange}
        onBlur={onBlur}
        groupVariant={groupVariant}
        testID={testID}
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint={accessibilityHint || 'Enter your phone number'}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType={returnKeyType}
        editable={editable}
        error={error}
        onSubmitEditing={onSubmitEditing}
        leftContent={
          <CountryCodeSelector
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
            testID={countrySelectorTestID}
            isDisabled={isCountrySelectorDisabled || !editable}
          />
        }
      />
    );
  }
);
