import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { SettingsGroup } from '../SettingsGroup';
import * as stories from '../SettingsGroup.stories';

describe('SettingsGroup Stories', () => {
  it('renders SingleItem story', () => {
    const { args } = stories.SingleItem;
    const { toJSON } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders TwoItems story', () => {
    const { args } = stories.TwoItems;
    const { toJSON } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders ThreeItems story', () => {
    const { args } = stories.ThreeItems;
    const { toJSON } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders WithoutIcons story', () => {
    const { args } = stories.WithoutIcons;
    const { toJSON } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders Mixed story', () => {
    const { args } = stories.Mixed;
    const { toJSON } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('ThreeItems story displays all labels', () => {
    const { args } = stories.ThreeItems;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
  });

  it('WithoutIcons story displays labels without icons', () => {
    const { args } = stories.WithoutIcons;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Terms of Service')).toBeTruthy();
  });
});
