import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { HomeScreen } from '@app/features';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('displays environment variables', () => {
    render(<HomeScreen />);
    const envText = screen.getByTestId('env-text');
    expect(envText).toBeTruthy();
  });
});
