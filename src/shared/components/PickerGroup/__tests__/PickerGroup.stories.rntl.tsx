import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PickerGroup } from '../PickerGroup';
import * as stories from '../PickerGroup.stories';

describe('PickerGroup Stories', () => {
  it('renders SingleOption story with option label', () => {
    const { args } = stories.SingleOption;
    const items = args?.items ?? [];
    const { getByText } = renderWithProviders(<PickerGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders TwoOptions story with both labels', () => {
    const { args } = stories.TwoOptions;
    const items = args?.items ?? [];
    const { getByText } = renderWithProviders(<PickerGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
    expect(getByText(items[1]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders ThreeOptions story with all labels', () => {
    const { args } = stories.ThreeOptions;
    const { getByText } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('System')).toBeOnTheScreen();
    expect(getByText('Light')).toBeOnTheScreen();
    expect(getByText('Dark')).toBeOnTheScreen();
  });

  it('renders LanguageSelection story with all languages', () => {
    const { args } = stories.LanguageSelection;
    const { getByText } = renderWithProviders(<PickerGroup items={args!.items!} />);
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('renders NoneSelected story without check mark', () => {
    const { args } = stories.NoneSelected;
    const items = args?.items ?? [];
    const { queryByText, getByText } = renderWithProviders(<PickerGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
    expect(queryByText('✓')).toBeNull();
  });

  it('ThreeOptions story shows all labels', () => {
    const { args } = stories.ThreeOptions;
    const { getByText } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('System')).toBeOnTheScreen();
    expect(getByText('Light')).toBeOnTheScreen();
    expect(getByText('Dark')).toBeOnTheScreen();
  });

  it('LanguageSelection story shows selected item', () => {
    const { args } = stories.LanguageSelection;
    const { getByText } = renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('✓')).toBeOnTheScreen();
  });
});
