import '@testing-library/jest-native/extend-expect';
import '@app/i18n';

import type React from 'react';

// Mock react-native-localize to avoid native dependency issues in Jest
jest.mock('react-native-localize', () => ({
  getLocales: () => [
    {
      languageTag: 'en',
      isRTL: false,
    },
  ],
  findBestAvailableLanguage: (tags: string[]) => {
    const languageTag = tags[0] ?? 'en';
    return { languageTag, isRTL: false };
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock react-navigation/native-stack so Navigator/Screen behave minimally in tests
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const MockNavigator = ({ children }: { children?: React.ReactNode }) => children ?? null;

    const MockScreen = ({
      component: Component,
      children,
      ...rest
    }: {
      component?: (props: Record<string, unknown>) => unknown;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      if (Component) {
        // Call the component as a function to avoid JSX in this .ts file
        return Component(rest);
      }
      return children ?? null;
    };

    return {
      Navigator: MockNavigator,
      Screen: MockScreen,
    };
  },
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  return {
    enableScreens: jest.fn(),
  };
});
