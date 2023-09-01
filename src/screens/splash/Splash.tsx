import React, {JSX, useCallback, useEffect, useState} from 'react';
import DevMenu from 'react-native-dev-menu';
import {useSelector} from 'react-redux';
import {extendTheme, NativeBaseProvider, Spinner, VStack} from 'native-base';

import {Logo} from '@app/atoms';
import {changeLanguage} from '@app/i18n';
import {
  darkModeSelector,
  getEducation,
  getProfile,
  getVideos,
  getWorkXP,
  localeSelector,
} from '@app/modules';
import {RootNavigator} from '@app/navigators';
import {useAppDispatch} from '@app/redux';
import {theme as tempTheme} from '@app/theme';
import {Storybook} from '@rn-storybook';

const ContentOrSplash = (): JSX.Element => {
  const [storybookActive, setStorybookActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const toggleStorybook = useCallback(
    () => setStorybookActive(active => !active),
    [],
  );
  const locale = useSelector(localeSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setLoading(true);
    dispatch(getVideos());
    dispatch(getProfile());
    dispatch(getWorkXP());
    dispatch(getEducation());
    setTimeout(() => {
      changeLanguage(locale).then(() => setLoading(false));
    }, 4500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (__DEV__) {
      DevMenu.addItem('Toggle Storybook', toggleStorybook);
    }
  }, [toggleStorybook]);

  if (loading) {
    return (
      <VStack flex={1} space={32} alignItems={'center'} justifyContent="center">
        <Logo />
      </VStack>
    );
  }
  return storybookActive ? <Storybook /> : <RootNavigator />;
};

export const Splash = (): JSX.Element => {
  const darkMode = useSelector(darkModeSelector);

  let theme = extendTheme({
    ...tempTheme,
    config: {
      ...tempTheme.config,
      initialColorMode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <NativeBaseProvider theme={theme}>
      <ContentOrSplash />
    </NativeBaseProvider>
  );
};
