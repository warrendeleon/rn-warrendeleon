import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PickerItem } from '../PickerItem';
import * as stories from '../PickerItem.stories';

describe('PickerItem Stories', () => {
  it('renders Default story with label visible', () => {
    const { args } = stories.Default;
    const { getByText } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('renders Selected story with check mark', () => {
    const { args } = stories.Selected;
    const { getByText } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
    expect(getByText('✓')).toBeOnTheScreen();
  });

  it('renders TopInGroup story with top variant', () => {
    const { args } = stories.TopInGroup;
    const { getByText } = renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('renders MiddleInGroup story with middle variant', () => {
    const { args } = stories.MiddleInGroup;
    const { getByText } = renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('renders BottomInGroup story with bottom variant', () => {
    const { args } = stories.BottomInGroup;
    const { getByText } = renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(getByText(args!.label!)).toBeOnTheScreen();
  });

  it('Selected story shows check mark', () => {
    const { args } = stories.Selected;
    const { getByText } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText('✓')).toBeOnTheScreen();
  });

  it('Default story does not show check mark', () => {
    const { args } = stories.Default;
    const { queryByText } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(queryByText('✓')).toBeNull();
  });
});
