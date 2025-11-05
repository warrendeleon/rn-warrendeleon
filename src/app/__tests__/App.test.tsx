import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders RootNavigator / Home screen', () => {
    const { getByText } = render(<App />);

    // Whatever you show on the HomeScreen title:
    expect(getByText('Home')).toBeTruthy();
  });
});
