import {extendTheme, NativeBaseProvider} from 'native-base';
import {theme as tempTheme} from '@app/theme/Theme';
import {RootNavigator} from '@app/navigators';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  darkModeSelector,
  localeSelector,
} from '@app/modules/settings/selectors';
import {changeLanguage} from '@app/i18n/i18n.config';

export const Splash = (): JSX.Element => {
  const locale = useSelector(localeSelector);
  const darkMode = useSelector(darkModeSelector);
  let theme = extendTheme({
    ...tempTheme,
    config: {
      ...tempTheme.config,
      initialColorMode: darkMode ? 'dark' : 'light',
    },
  });

  useEffect(() => {
    setTimeout(() => {
      changeLanguage(locale);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <RootNavigator />
    </NativeBaseProvider>
  );
};
