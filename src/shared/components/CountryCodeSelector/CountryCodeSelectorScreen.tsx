import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Input, InputField } from '@app/components/ui/input';
import { Text } from '@app/components/ui/text';
import type { RootStackParamList } from '@app/navigation';
import { ButtonGroup, PickerItem } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';

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
      className="flex-1"
      style={{ backgroundColor: isDark ? '#000000' : '#f3f4f6' }}
      testID="country-code-selector-screen"
      accessibilityLabel={t('auth.registration.selectCountry')}
    >
      <Box className="p-4">
        {/* Search Input */}
        <Input variant="outline" size="md" className="mb-4">
          <Box className="justify-center pl-3">
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
          <Box className="items-center p-4">
            <Text className="text-gray-500">{t('auth.registration.noCountriesFound')}</Text>
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
