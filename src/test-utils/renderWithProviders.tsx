import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { render, type RenderAPI } from '@testing-library/react-native';

import i18n from '@app/i18n';

export const renderWithProviders = (ui: React.ReactElement): RenderAPI =>
  render(
    <I18nextProvider i18n={i18n}>
      <GluestackUIProvider config={config}>{ui}</GluestackUIProvider>
    </I18nextProvider>
  );
