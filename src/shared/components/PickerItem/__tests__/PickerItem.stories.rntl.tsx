import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PickerItem } from '../PickerItem';
import * as stories from '../PickerItem.stories';

describe('PickerItem Stories', () => {
  it('renders Default story with label visible', async () => {
    const { args } = stories.Default;
    const { getByText } = await renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('renders Selected story with check mark', async () => {
    const { args } = stories.Selected;
    const { getByText } = await renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
    expect(getByText('✓')).toBeOnTheScreen();
  });

  it('renders TopInGroup story with top variant', async () => {
    const { args } = stories.TopInGroup;
    const { getByText } = await renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('renders MiddleInGroup story with middle variant', async () => {
    const { args } = stories.MiddleInGroup;
    const { getByText } = await renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('renders BottomInGroup story with bottom variant', async () => {
    const { args } = stories.BottomInGroup;
    const { getByText } = await renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('Selected story shows check mark', async () => {
    const { args } = stories.Selected;
    const { getByText } = await renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText('✓')).toBeOnTheScreen();
  });

  it('Default story does not show check mark', async () => {
    const { args } = stories.Default;
    const { queryByText } = await renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(queryByText('✓')).toBeNull();
  });
});
