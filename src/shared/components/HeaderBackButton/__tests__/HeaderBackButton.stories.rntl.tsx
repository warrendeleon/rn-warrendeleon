import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { HeaderBackButton } from '../HeaderBackButton';

// Wrapper to provide navigation context
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>{children}</NavigationContainer>
);

describe('HeaderBackButton Stories', () => {
  it('renders Default story with back button visible', async () => {
    const { getByTestId } = await renderWithProviders(
      <NavigationWrapper>
        <HeaderBackButton />
      </NavigationWrapper>
    );
    expect(getByTestId('header-back-button')).toBeOnTheScreen();
    expect(getByTestId('header-back-button').props.accessibilityRole).toBe('button');
  });

  it('renders with testID', async () => {
    const { getByTestId } = await renderWithProviders(
      <NavigationWrapper>
        <HeaderBackButton />
      </NavigationWrapper>
    );
    expect(getByTestId('header-back-button')).toBeOnTheScreen();
  });

  it('has correct accessibility role', async () => {
    const { getByTestId } = await renderWithProviders(
      <NavigationWrapper>
        <HeaderBackButton />
      </NavigationWrapper>
    );
    const button = getByTestId('header-back-button');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('has correct accessibility label', async () => {
    const { getByTestId } = await renderWithProviders(
      <NavigationWrapper>
        <HeaderBackButton />
      </NavigationWrapper>
    );
    const button = getByTestId('header-back-button');
    expect(button.props.accessibilityLabel).toBe('Go back');
  });
});
