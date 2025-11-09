import React from 'react';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { render, type RenderAPI } from '@testing-library/react-native';

export const renderWithProviders = (ui: React.ReactElement): RenderAPI =>
  render(<GluestackUIProvider config={config}>{ui}</GluestackUIProvider>);
