import React from 'react';
import {Heading, VStack} from 'native-base';
import {Select} from '@app/atoms/select';
import {useSelector} from 'react-redux';
import {setLocale} from '@app/modules/settings/actions';
import {localeSelector} from '@app/modules/settings/selectors';
import {useAppDispatch} from '@app/redux/configureStore';
import {useTranslation} from 'react-i18next';

export const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const locale = useSelector(localeSelector);
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
    </VStack>
  );
};
