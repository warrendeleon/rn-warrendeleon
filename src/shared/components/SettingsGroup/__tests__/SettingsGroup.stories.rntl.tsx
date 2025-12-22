import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { SettingsGroup } from '../SettingsGroup';
import * as stories from '../SettingsGroup.stories';

describe('SettingsGroup Stories', () => {
  it('renders SingleItem story with item label', () => {
    const { args } = stories.SingleItem;
    const items = args?.items ?? [];
    const { getByText } = renderWithProviders(<SettingsGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders TwoItems story with both labels', () => {
    const { args } = stories.TwoItems;
    const items = args?.items ?? [];
    const { getByText } = renderWithProviders(<SettingsGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
    expect(getByText(items[1]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders ThreeItems story with all three labels', () => {
    const { args } = stories.ThreeItems;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('renders WithoutIcons story with labels visible', () => {
    const { args } = stories.WithoutIcons;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(getByText('Privacy Policy')).toBeOnTheScreen();
    expect(getByText('Terms of Service')).toBeOnTheScreen();
  });

  it('renders Mixed story with all item labels', () => {
    const { args } = stories.Mixed;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('ThreeItems story displays all labels', () => {
    const { args } = stories.ThreeItems;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(getByText('Appearance')).toBeOnTheScreen();
    expect(getByText('Language')).toBeOnTheScreen();
    expect(getByText('Dark Mode')).toBeOnTheScreen();
  });

  it('WithoutIcons story displays labels without icons', () => {
    const { args } = stories.WithoutIcons;
    const { getByText } = renderWithProviders(<SettingsGroup items={args!.items!} />);
    expect(getByText('Privacy Policy')).toBeOnTheScreen();
    expect(getByText('Terms of Service')).toBeOnTheScreen();
  });
});
