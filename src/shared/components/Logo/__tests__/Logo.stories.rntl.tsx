import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { Logo } from '../Logo';
import * as stories from '../Logo.stories';

describe('Logo Stories', () => {
  describe('story rendering', () => {
    it.each([
      ['Default', stories.Default],
      ['DarkMode', stories.DarkMode],
      ['CustomSize', stories.CustomSize],
    ] as const)('renders %s story with Lottie animation', async (_storyName, story) => {
      const { args } = story;
      const { getByTestId } = await renderWithProviders(<Logo {...args} />);
      // Logo renders a Lottie animation component, queried by its testID
      expect(getByTestId('logo-lottie')).toBeTruthy();
    });
  });

  describe('story props validation', () => {
    it.each([
      ['Default', stories.Default, false],
      ['DarkMode', stories.DarkMode, true],
    ] as const)('%s story has darkMode=%s', (_storyName, story, expectedDarkMode) => {
      expect(story.args?.darkMode).toBe(expectedDarkMode);
    });
  });
});
