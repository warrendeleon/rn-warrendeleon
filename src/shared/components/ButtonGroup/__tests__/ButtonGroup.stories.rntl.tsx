import React from 'react';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { ButtonGroup } from '../ButtonGroup';
import * as stories from '../ButtonGroup.stories';

// Simple render function for testing
const simpleRenderItem = (item: { label: string }) => (
  <Box className="p-4">
    <Text>{item.label as string}</Text>
  </Box>
);

describe('ButtonGroup Stories', () => {
  describe('story rendering', () => {
    it.each([
      ['SingleItem', stories.SingleItem],
      ['TwoItems', stories.TwoItems],
      ['ThreeItems', stories.ThreeItems],
      ['FiveItems', stories.FiveItems],
    ] as const)('renders %s story with all items visible', async (_storyName, story) => {
      const { args } = story;
      const { getByText } = await renderWithProviders(
        <ButtonGroup
          items={args!.items!}
          renderItem={item => simpleRenderItem(item as { label: string })}
        />
      );

      // Verify each item label renders correctly
      args!.items!.forEach(item => {
        expect(getByText((item as { label: string }).label)).toBeOnTheScreen();
      });
    });
  });

  describe('story item counts', () => {
    it.each([
      ['SingleItem', stories.SingleItem, 1],
      ['TwoItems', stories.TwoItems, 2],
      ['ThreeItems', stories.ThreeItems, 3],
      ['FiveItems', stories.FiveItems, 5],
    ] as const)('%s story has %d items', (_storyName, story, expectedCount) => {
      expect(story.args?.items).toHaveLength(expectedCount);
    });
  });
});
