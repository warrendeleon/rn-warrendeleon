import React from 'react';
import { render } from '@testing-library/react-native';
import RootNavigator from '../RootNavigator';

describe('RootNavigator', () => {
  it('renders the Home screen as the initial route', () => {
    const { getByText, getByTestId } = render(<RootNavigator />);

    // Title inside the Home screen
    expect(getByText('Home')).toBeTruthy();

    // ENV text block from HomeScreen (testID defined in HomeScreen.tsx)
    expect(getByTestId('env-text')).toBeTruthy();
  });
});
