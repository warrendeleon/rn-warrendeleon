import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PickerItem } from '../PickerItem';
import * as stories from '../PickerItem.stories';

describe('PickerItem Stories', () => {
  it('renders Default story', () => {
    const { args } = stories.Default;
    const { toJSON } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders Selected story', () => {
    const { args } = stories.Selected;
    const { toJSON } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders TopInGroup story', () => {
    const { args } = stories.TopInGroup;
    const { toJSON } = renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders MiddleInGroup story', () => {
    const { args } = stories.MiddleInGroup;
    const { toJSON } = renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders BottomInGroup story', () => {
    const { args } = stories.BottomInGroup;
    const { toJSON } = renderWithProviders(
      <PickerItem
        label={args!.label!}
        isSelected={args?.isSelected}
        onPress={args?.onPress}
        groupVariant={args?.groupVariant}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('Selected story shows check mark', () => {
    const { args } = stories.Selected;
    const { getByText } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('Default story does not show check mark', () => {
    const { args } = stories.Default;
    const { queryByText } = renderWithProviders(
      <PickerItem label={args!.label!} isSelected={args?.isSelected} onPress={args?.onPress} />
    );
    expect(queryByText('✓')).toBeNull();
  });
});
