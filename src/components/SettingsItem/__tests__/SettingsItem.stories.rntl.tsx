import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import type { SettingsItemProps } from '../SettingsItem';
import { SettingsItem } from '../SettingsItem';
import * as stories from '../SettingsItem.stories';

describe('SettingsItem Stories', () => {
  it('renders Default story', () => {
    const { args } = stories.Default;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders WithIcon story', () => {
    const { args } = stories.WithIcon;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders WithEndLabel story', () => {
    const { args } = stories.WithEndLabel;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders WithoutChevron story', () => {
    const { args } = stories.WithoutChevron;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders TopInGroup story', () => {
    const { args } = stories.TopInGroup;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders MiddleInGroup story', () => {
    const { args } = stories.MiddleInGroup;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders BottomInGroup story', () => {
    const { args } = stories.BottomInGroup;
    const { toJSON } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(toJSON()).toBeTruthy();
  });

  it('WithEndLabel story displays end label', () => {
    const { args } = stories.WithEndLabel;
    const { getByText } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(getByText('System')).toBeTruthy();
  });

  it('Default story displays label', () => {
    const { args } = stories.Default;
    const { getByText } = renderWithProviders(<SettingsItem {...(args as SettingsItemProps)} />);
    expect(getByText('Settings')).toBeTruthy();
  });
});
