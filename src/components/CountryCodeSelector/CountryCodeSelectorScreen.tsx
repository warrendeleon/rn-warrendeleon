import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Input, InputField, ScrollView, Text } from '@gluestack-ui/themed';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';

import { ButtonGroup, PickerItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';

import type { CountryData } from './countryData';
import { getAllCountries, searchCountries } from './countryData';

type CountryCodeSelectorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CountryCodeSelector'
>;

/**
 * Full screen country code selector
 * EAA compliant with proper accessibility labels and search functionality
 */
export const CountryCodeSelectorScreen: React.FC<CountryCodeSelectorScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const { selectedCountryCode, onSelect } = route.params;

  const allCountries = useMemo(() => getAllCountries(), []);

  const filteredCountries = useMemo(
    () => searchCountries(searchQuery, allCountries),
    [searchQuery, allCountries]
  );

  const handleSelectCountry = useCallback(
    (country: CountryData) => {
      onSelect(country);
      navigation.goBack();
    },
    [onSelect, navigation]
  );

  const countryItems = useMemo(
    () =>
      filteredCountries.map(country => ({
        label: `${country.flag}  ${country.name} (${country.callingCode})`,
        onPress: () => handleSelectCountry(country),
        isSelected: selectedCountryCode === country.code,
        testID: `country-option-${country.code}`,
      })),
    [filteredCountries, selectedCountryCode, handleSelectCountry]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      flex={1}
      bg={isDark ? '$black' : '$coolGray100'}
      testID="country-code-selector-screen"
      accessibilityLabel={t('auth.registration.selectCountry')}
    >
      <Box p="$4">
        {/* Search Input */}
        <Input variant="outline" size="md" mb="$4">
          <Box pl="$3" justifyContent="center">
            <Search size={18} color="#9CA3AF" />
          </Box>
          <InputField
            placeholder={t('auth.registration.searchCountries')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="country-search-input"
            accessibilityLabel={t('auth.registration.searchCountries')}
            accessibilityHint="Type to filter the list of countries"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Input>

        {/* Country List */}
        {filteredCountries.length === 0 ? (
          <Box p="$4" alignItems="center">
            <Text color="$coolGray500">{t('auth.registration.noCountriesFound')}</Text>
          </Box>
        ) : (
          <ButtonGroup
            items={countryItems}
            renderItem={(item, groupVariant) => (
              <PickerItem
                label={item.label}
                onPress={item.onPress}
                groupVariant={groupVariant}
                isSelected={item.isSelected}
                testID={item.testID}
              />
            )}
          />
        )}
      </Box>
    </ScrollView>
  );
};
