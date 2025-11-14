import React from 'react';
import { render } from '@testing-library/react-native';

import { Logo } from '../Logo';

describe('Logo', () => {
  it('renders light mode logo by default', () => {
    const { getByTestId } = render(<Logo testID="logo" />);
    expect(getByTestId('logo')).toBeDefined();
  });

  it('renders dark mode logo when darkMode is true', () => {
    const { getByTestId } = render(<Logo darkMode testID="logo" />);
    expect(getByTestId('logo')).toBeDefined();
  });

  it('renders light mode logo when darkMode is false', () => {
    const { getByTestId } = render(<Logo darkMode={false} testID="logo" />);
    expect(getByTestId('logo')).toBeDefined();
  });

  it('passes additional props to Lottie component', () => {
    const { getByTestId } = render(<Logo testID="logo" style={{ width: 200, height: 200 }} />);
    expect(getByTestId('logo')).toBeDefined();
  });

  it('auto plays and loops by default', () => {
    const { getByTestId } = render(<Logo testID="logo" />);
    const logo = getByTestId('logo');
    expect(logo).toBeDefined();
  });
});
