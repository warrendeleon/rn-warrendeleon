import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render, type RenderAPI } from '@testing-library/react-native';

import { educationReducer } from '@app/features/Education';
import { profileReducer } from '@app/features/Profile';
import { settingsReducer } from '@app/features/Settings';
import { workXPReducer } from '@app/features/WorkXP';
import i18n from '@app/i18n';
import type { RootState } from '@app/store';

type RenderWithProvidersOptions = {
  preloadedState?: Partial<RootState>;
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderWithProvidersOptions
): RenderAPI => {
  const rootReducer = combineReducers({
    settings: settingsReducer,
    profile: profileReducer,
    workXP: workXPReducer,
    education: educationReducer,
  });

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: options?.preloadedState,
  });

  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <GluestackUIProvider config={config}>{ui}</GluestackUIProvider>
      </I18nextProvider>
    </Provider>
  );
};
