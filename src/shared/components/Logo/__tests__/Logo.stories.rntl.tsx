import React from 'react';
import LottieView from 'lottie-react-native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { Logo } from '../Logo';
import * as stories from '../Logo.stories';

describe('Logo Stories', () => {
  describe('story rendering', () => {
    it.each([
      ['Default', stories.Default],
      ['DarkMode', stories.DarkMode],
      ['CustomSize', stories.CustomSize],
    ] as const)('renders %s story with Lottie animation', (_storyName, story) => {
      const { args } = story;
      const { UNSAFE_getByType } = renderWithProviders(<Logo {...args} />);
      // Logo renders a Lottie animation component - UNSAFE_getByType returns a component instance
      expect(UNSAFE_getByType(LottieView)).toBeTruthy();
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
