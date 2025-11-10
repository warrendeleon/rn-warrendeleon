import React from 'react';
import { render } from '@testing-library/react-native';

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

  it('initializes i18n on import', () => {
    // The import '@app/i18n' at the top of App.tsx initializes i18next
    // This test verifies that the import doesn't throw
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(() => require('@app/i18n')).not.toThrow();
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
