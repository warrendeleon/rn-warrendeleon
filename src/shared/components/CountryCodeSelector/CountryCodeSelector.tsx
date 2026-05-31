import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';

import type { CountryData } from './countryData';

interface CountryCodeSelectorProps {
  selectedCountry: CountryData;
  onCountrySelect: (country: CountryData) => void;
  testID?: string;
  isDisabled?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Country code selector component - iOS style with right chevron and separator
 * EAA compliant with proper accessibility labels
 */
export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onCountrySelect,
  testID = 'country-code-selector',
  isDisabled = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    if (!isDisabled) {
      navigation.navigate('CountryCodeSelector', {
        selectedCountryCode: selectedCountry.code,
        onSelect: onCountrySelect,
      });
    }
  };

  return (
    <HStack className="items-center">
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Country code selector. Currently selected: ${selectedCountry.name}, ${selectedCountry.callingCode}`}
        accessibilityHint="Double tap to open country selector"
        accessibilityState={{ disabled: isDisabled }}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
        className="py-1"
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
      >
        <HStack space="xs" className="items-center">
          <Text className="text-base">{selectedCountry.flag}</Text>
          <Text className="text-sm" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
            {selectedCountry.callingCode}
          </Text>
          <ChevronRight size={14} color={isDark ? '#9CA3AF' : '#C7C7CC'} />
        </HStack>
      </Pressable>
      {/* Vertical separator */}
      <Box
        className="mx-2 h-[20px] w-[1px]"
        style={{ backgroundColor: isDark ? '#374151' : '#d1d5db' }}
      />
    </HStack>
  );
};
