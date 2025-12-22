import React from 'react';

import { expectStoryRenders, renderWithProviders } from '@app/test-utils';

import type { SettingsItemProps } from '../SettingsItem';
import { SettingsItem } from '../SettingsItem';
import * as stories from '../SettingsItem.stories';

describe('SettingsItem Stories', () => {
  it('renders Default story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.Default.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'Default');
  });

  it('renders WithIcon story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.WithIcon.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'WithIcon');
  });

  it('renders WithEndLabel story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.WithEndLabel.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'WithEndLabel');
  });

  it('renders WithoutChevron story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.WithoutChevron.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'WithoutChevron');
  });

  it('renders TopInGroup story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.TopInGroup.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'TopInGroup');
  });

  it('renders MiddleInGroup story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.MiddleInGroup.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'MiddleInGroup');
  });

  it('renders BottomInGroup story without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SettingsItem {...(stories.BottomInGroup.args as SettingsItemProps)} />
    );
    expectStoryRenders(toJSON, 'BottomInGroup');
  });

  it('displays end label text in WithEndLabel story', () => {
    const { getByText } = renderWithProviders(
      <SettingsItem {...(stories.WithEndLabel.args as SettingsItemProps)} />
    );
    expect(getByText('System')).toBeOnTheScreen();
  });

  it('displays label text in Default story', () => {
    const { getByText } = renderWithProviders(
      <SettingsItem {...(stories.Default.args as SettingsItemProps)} />
    );
    expect(getByText('Settings')).toBeOnTheScreen();
  });
});
