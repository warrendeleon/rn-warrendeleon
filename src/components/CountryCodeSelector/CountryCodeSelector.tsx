import React from 'react';
import { Box, HStack, Pressable, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';

import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';

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
    <HStack alignItems="center">
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Country code selector. Currently selected: ${selectedCountry.name}, ${selectedCountry.callingCode}`}
        accessibilityHint="Double tap to open country selector"
        accessibilityState={{ disabled: isDisabled }}
        opacity={isDisabled ? 0.5 : 1}
        py="$1"
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
      >
        <HStack space="xs" alignItems="center">
          <Text fontSize="$md">{selectedCountry.flag}</Text>
          <Text fontSize="$sm" color={isDark ? '$coolGray300' : '$coolGray600'}>
            {selectedCountry.callingCode}
          </Text>
          <ChevronRight size={14} color={isDark ? '#9CA3AF' : '#C7C7CC'} />
        </HStack>
      </Pressable>
      {/* Vertical separator */}
      <Box h={20} w={1} bg={isDark ? '$coolGray700' : '$coolGray300'} ml="$2" mr="$2" />
    </HStack>
  );
};
