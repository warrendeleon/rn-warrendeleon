import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PickerGroup } from '../PickerGroup';
import * as stories from '../PickerGroup.stories';

describe('PickerGroup Stories', () => {
  it('renders SingleOption story with option label', async () => {
    const { args } = stories.SingleOption;
    const items = args?.items ?? [];
    const { getByText } = await renderWithProviders(<PickerGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders TwoOptions story with both labels', async () => {
    const { args } = stories.TwoOptions;
    const items = args?.items ?? [];
    const { getByText } = await renderWithProviders(<PickerGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
    expect(getByText(items[1]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders ThreeOptions story with all labels', async () => {
    const { args } = stories.ThreeOptions;
    const { getByText } = await renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('System')).toBeOnTheScreen();
    expect(getByText('Light')).toBeOnTheScreen();
    expect(getByText('Dark')).toBeOnTheScreen();
  });

  it('renders LanguageSelection story with all languages', async () => {
    const { args } = stories.LanguageSelection;
    const { getByText } = await renderWithProviders(<PickerGroup items={args!.items!} />);
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('renders NoneSelected story without check mark', async () => {
    const { args } = stories.NoneSelected;
    const items = args?.items ?? [];
    const { queryByText, getByText } = await renderWithProviders(<PickerGroup items={items} />);
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
    expect(queryByText('✓')).toBeNull();
  });

  it('ThreeOptions story shows all labels', async () => {
    const { args } = stories.ThreeOptions;
    const { getByText } = await renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('System')).toBeOnTheScreen();
    expect(getByText('Light')).toBeOnTheScreen();
    expect(getByText('Dark')).toBeOnTheScreen();
  });

  it('LanguageSelection story shows selected item', async () => {
    const { args } = stories.LanguageSelection;
    const { getByText } = await renderWithProviders(<PickerGroup items={args!.items!} />);
    expect(getByText('✓')).toBeOnTheScreen();
  });
});
