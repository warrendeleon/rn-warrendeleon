import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import type { ProfileCardProps } from '../ProfileCard';
import { ProfileCard } from '../ProfileCard';
import * as stories from '../ProfileCard.stories';

describe('ProfileCard Stories', () => {
  describe('story rendering', () => {
    it.each([
      ['Default', stories.Default],
      ['LongName', stories.LongName],
      ['NoAvatar', stories.NoAvatar],
    ] as const)('renders %s story with name visible', (_storyName, story) => {
      const { args } = story;
      const { getByText } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
      expect(getByText(new RegExp(args!.name!))).toBeOnTheScreen();
    });
  });

  describe('story content validation', () => {
    it('Default story displays full name', () => {
      const { args } = stories.Default;
      const { getByText } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
      const fullName = `${args!.name} ${args!.lastName}`;
      expect(getByText(fullName)).toBeOnTheScreen();
    });

    it('LongName story handles long names gracefully', () => {
      const { args } = stories.LongName;
      const { getByText } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
      expect(getByText(/Alexander/)).toBeOnTheScreen();
    });
  });
});
