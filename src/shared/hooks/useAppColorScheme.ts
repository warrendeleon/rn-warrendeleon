import { useColorScheme } from 'react-native';

import { selectTheme } from '@app/features/Settings';
import { useAppSelector } from '@app/store';

/**
 * Returns the effective color scheme based on user's theme preference.
 *
 * - If theme is 'system': returns device's color scheme
 * - If theme is 'light': always returns 'light'
 * - If theme is 'dark': always returns 'dark'
 *
 * Use this instead of React Native's useColorScheme() to respect user preferences.
 */
export const useAppColorScheme = (): 'light' | 'dark' => {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppSelector(selectTheme);

  if (themePreference === 'system') {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }

  return themePreference;
};
