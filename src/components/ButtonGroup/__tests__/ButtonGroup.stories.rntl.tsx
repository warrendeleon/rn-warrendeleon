import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { ButtonGroup } from '../ButtonGroup';
import * as stories from '../ButtonGroup.stories';

// Simple render function for testing
const simpleRenderItem = (item: { label: string }) => (
  <Box p="$4">
    <Text>{item.label as string}</Text>
  </Box>
);

describe('ButtonGroup Stories', () => {
  it('renders SingleItem story', () => {
    const { args } = stories.SingleItem;
    const { toJSON } = renderWithProviders(
      <ButtonGroup
        items={args!.items!}
        renderItem={item => simpleRenderItem(item as { label: string })}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders TwoItems story', () => {
    const { args } = stories.TwoItems;
    const { toJSON } = renderWithProviders(
      <ButtonGroup
        items={args!.items!}
        renderItem={item => simpleRenderItem(item as { label: string })}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders ThreeItems story', () => {
    const { args } = stories.ThreeItems;
    const { toJSON } = renderWithProviders(
      <ButtonGroup
        items={args!.items!}
        renderItem={item => simpleRenderItem(item as { label: string })}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders FiveItems story', () => {
    const { args } = stories.FiveItems;
    const { toJSON } = renderWithProviders(
      <ButtonGroup
        items={args!.items!}
        renderItem={item => simpleRenderItem(item as { label: string })}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('SingleItem story has correct item count', () => {
    expect(stories.SingleItem.args?.items).toHaveLength(1);
  });

  it('TwoItems story has correct item count', () => {
    expect(stories.TwoItems.args?.items).toHaveLength(2);
  });

  it('ThreeItems story has correct item count', () => {
    expect(stories.ThreeItems.args?.items).toHaveLength(3);
  });

  it('FiveItems story has correct item count', () => {
    expect(stories.FiveItems.args?.items).toHaveLength(5);
  });
});
