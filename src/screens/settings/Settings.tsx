import React, {useState} from 'react';
import {Heading, useColorMode, VStack} from 'native-base';
import {Select} from '@app/atoms/select';
import {useSelector} from 'react-redux';
import {setDarkMode, setLocale} from '@app/modules/settings/actions';
import {
  darkModeSelector,
  localeSelector,
} from '@app/modules/settings/selectors';
import {useAppDispatch} from '@app/redux/configureStore';
import {useTranslation} from 'react-i18next';
import {Switch} from '@app/atoms/switch';

export const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const locale = useSelector(localeSelector);
  const darkMode = useSelector(darkModeSelector);
  const {toggleColorMode} = useColorMode();
  const [switchValue, setSwitchValue] = useState<boolean>(darkMode);
  const toggleSwitch = (value: boolean) => {
    setSwitchValue(value);
    dispatch(setDarkMode(value));
    toggleColorMode();
  };
  const {t} = useTranslation();
  const languages = [
    {
      label: t('settings.languages.spanish'),
      value: 'es',
    },
    {
      label: t('settings.languages.english'),
      value: 'en',
    },
  ];
  return (
    <VStack p={4}>
      <Heading
        color="muted.500"
        fontSize="xs"
        mb={2}
        ml={4}
        textTransform="uppercase">
        {t('settings.language')}
      </Heading>
      <Select
        items={languages}
        selectedValue={locale}
        onValueChange={(itemValue: string) => dispatch(setLocale(itemValue))}
      />
      <Heading
        color="muted.500"
        fontSize="xs"
        mt={8}
        mb={2}
        ml={4}
        textTransform="uppercase">
        {t('settings.appearance')}
      </Heading>

      <Switch
        value={switchValue}
        onValueChange={toggleSwitch}
        label={t('settings.darkMode')}
      />
    </VStack>
  );
};
