import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PickerGroup } from '../PickerGroup';
import * as stories from '../PickerGroup.stories';

describe('PickerGroup Stories', () => {
  it('renders SingleOption story', () => {
    const { args } = stories.SingleOption;
    const { toJSON } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders TwoOptions story', () => {
    const { args } = stories.TwoOptions;
    const { toJSON } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders ThreeOptions story', () => {
    const { args } = stories.ThreeOptions;
    const { toJSON } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders LanguageSelection story', () => {
    const { args } = stories.LanguageSelection;
    const { toJSON } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders NoneSelected story', () => {
    const { args } = stories.NoneSelected;
    const { toJSON } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(toJSON()).toBeTruthy();
  });

  it('ThreeOptions story shows all labels', () => {
    const { args } = stories.ThreeOptions;
    const { getByText } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('System')).toBeTruthy();
    expect(getByText('Light')).toBeTruthy();
    expect(getByText('Dark')).toBeTruthy();
  });

  it('LanguageSelection story shows selected item', () => {
    const { args } = stories.LanguageSelection;
    const { getByText } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('✓')).toBeTruthy();
  });
});
