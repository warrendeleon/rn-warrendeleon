import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import type { ProfileCardProps } from '../ProfileCard';
import { ProfileCard } from '../ProfileCard';
import * as stories from '../ProfileCard.stories';

describe('ProfileCard Stories', () => {
  it('renders Default story', () => {
    const { args } = stories.Default;
    const { toJSON } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders LongName story', () => {
    const { args } = stories.LongName;
    const { toJSON } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders NoAvatar story', () => {
    const { args } = stories.NoAvatar;
    const { toJSON } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('Default story displays full name', () => {
    const { args } = stories.Default;
    const { getByText } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
    const fullName = `${args!.name} ${args!.lastName}`;
    expect(getByText(fullName)).toBeTruthy();
  });

  it('LongName story handles long names gracefully', () => {
    const { args } = stories.LongName;
    const { getByText } = renderWithProviders(<ProfileCard {...(args as ProfileCardProps)} />);
    expect(getByText(/Alexander/)).toBeTruthy();
  });
});
