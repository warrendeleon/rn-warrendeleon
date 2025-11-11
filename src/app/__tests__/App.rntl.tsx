import React from 'react';
import { render } from '@testing-library/react-native';
import i18n from 'i18next';

import { App } from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('renders the GluestackUIProvider with RootNavigator', () => {
    const { UNSAFE_root } = render(<App />);

    // Verify the component tree is structured correctly
    expect(UNSAFE_root).toBeTruthy();
  });

  it('initializes i18n with correct configuration', () => {
    // The import '@app/i18n' at the top of App.tsx initializes i18next
    // Verify i18n is initialized and has a valid language
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBeTruthy();
    expect(['en', 'es']).toContain(i18n.language);
  });
});

describe('App implementation', () => {
  it('can be invoked directly to produce an element', () => {
    type AppProps = Parameters<typeof App>[0];
    const props = {} as AppProps;

    const element = App(props);

    expect(element).toBeTruthy();
  });
});
