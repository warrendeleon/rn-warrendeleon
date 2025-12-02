import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { FallbackUI } from '../FallbackUI';
import * as stories from '../FallbackUI.stories';

// Mock useNavigation hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    reset: jest.fn(),
  }),
}));

describe('FallbackUI Stories', () => {
  it('renders Default story', () => {
    const { args } = stories.Default;
    const { toJSON } = renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders NetworkError story', () => {
    const { args } = stories.NetworkError;
    const { toJSON } = renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders NullError story', () => {
    const { args } = stories.NullError;
    const { toJSON } = renderWithProviders(
      <FallbackUI error={args!.error ?? null} onReset={args!.onReset!} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders LongErrorMessage story', () => {
    const { args } = stories.LongErrorMessage;
    const { toJSON } = renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('Default story has Try Again button', () => {
    const { args } = stories.Default;
    const { getByTestId } = renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-try-again-button')).toBeTruthy();
  });

  it('Default story has Go Home button', () => {
    const { args } = stories.Default;
    const { getByTestId } = renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-go-home-button')).toBeTruthy();
  });
});
