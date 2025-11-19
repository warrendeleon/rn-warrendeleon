import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { Logo } from '../Logo';
import * as stories from '../Logo.stories';

describe('Logo Stories', () => {
  it('renders Default story', () => {
    const { args } = stories.Default;
    const { toJSON } = renderWithProviders(<Logo {...args} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders DarkMode story', () => {
    const { args } = stories.DarkMode;
    const { toJSON } = renderWithProviders(<Logo {...args} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders CustomSize story', () => {
    const { args } = stories.CustomSize;
    const { toJSON } = renderWithProviders(<Logo {...args} />);
    expect(toJSON()).toBeTruthy();
  });

  it('Default story has correct darkMode prop', () => {
    expect(stories.Default.args?.darkMode).toBe(false);
  });

  it('DarkMode story has correct darkMode prop', () => {
    expect(stories.DarkMode.args?.darkMode).toBe(true);
  });
});
