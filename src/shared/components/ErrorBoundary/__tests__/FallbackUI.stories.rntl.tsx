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
  it('renders Default story with error message and action buttons', async () => {
    const { args } = stories.Default;
    const { getByTestId, getAllByText } = await renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
    // In DEV mode, error.message is shown; text may appear in both title and message
    expect(getAllByText(/something went wrong/i).length).toBeGreaterThan(0);
  });

  it('renders NetworkError story with network error message', async () => {
    const { args } = stories.NetworkError;
    const { getByTestId, getByText } = await renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    // In DEV mode, error.message is shown
    expect(getByText(/Network request failed/i)).toBeOnTheScreen();
  });

  it('renders NullError story with fallback content', async () => {
    const { args } = stories.NullError;
    const { getByTestId } = await renderWithProviders(
      <FallbackUI error={args!.error ?? null} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
  });

  it('renders LongErrorMessage story with truncated or full message', async () => {
    const { args } = stories.LongErrorMessage;
    const { getByTestId } = await renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
  });

  it('Default story has Try Again button', async () => {
    const { args } = stories.Default;
    const { getByTestId } = await renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
  });

  it('Default story has Go Home button', async () => {
    const { args } = stories.Default;
    const { getByTestId } = await renderWithProviders(
      <FallbackUI error={args!.error!} onReset={args!.onReset!} />
    );
    expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
  });
});
