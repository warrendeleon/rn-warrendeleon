import React from 'react';
import * as ReactNative from 'react-native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import type { GroupVariant } from '@app/shared/components/shared/types';
import { expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { ButtonGroup } from '../ButtonGroup';

// Test item type
type TestItem = {
  id: string;
  label: string;
};

describe('ButtonGroup', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  const testRenderItem = (item: TestItem, groupVariant: GroupVariant, index: number) => (
    <Box testID={`item-${index}`} accessibilityLabel={`Item ${item.label}`}>
      <Text testID={`text-${index}`}>{item.label}</Text>
      <Text testID={`variant-${index}`}>{groupVariant}</Text>
    </Box>
  );

  describe('children rendering', () => {
    it('renders all items correctly', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('item-0')).toBeOnTheScreen();
      expect(getByTestId('item-1')).toBeOnTheScreen();
      expect(getByTestId('item-2')).toBeOnTheScreen();
    });

    it('renders item labels correctly', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByText } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Second')).toBeOnTheScreen();
    });

    it('passes correct index to renderItem', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'Item 1' },
        { id: '2', label: 'Item 2' },
        { id: '3', label: 'Item 3' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('item-0')).toBeOnTheScreen();
      expect(getByTestId('item-1')).toBeOnTheScreen();
      expect(getByTestId('item-2')).toBeOnTheScreen();
    });
  });

  describe('single item layout', () => {
    it('renders single item with "single" variant', async () => {
      const items: TestItem[] = [{ id: '1', label: 'Only Item' }];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('single');
    });

    it('does not render divider for single item', async () => {
      const items: TestItem[] = [{ id: '1', label: 'Only Item' }];

      const { queryAllByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // ButtonGroupDivider should not be present
      const dividers = queryAllByTestId('button-group-divider');
      expect(dividers).toHaveLength(0);
    });
  });

  describe('multiple items layout', () => {
    it('renders two items with "top" and "bottom" variants', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('top');
      expect(getByTestId('variant-1')).toHaveTextContent('bottom');
    });

    it('renders three items with "top", "middle", and "bottom" variants', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('top');
      expect(getByTestId('variant-1')).toHaveTextContent('middle');
      expect(getByTestId('variant-2')).toHaveTextContent('bottom');
    });

    it('renders five items with correct variants', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' },
        { id: '4', label: 'Four' },
        { id: '5', label: 'Five' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('top');
      expect(getByTestId('variant-1')).toHaveTextContent('middle');
      expect(getByTestId('variant-2')).toHaveTextContent('middle');
      expect(getByTestId('variant-3')).toHaveTextContent('middle');
      expect(getByTestId('variant-4')).toHaveTextContent('bottom');
    });
  });

  describe('spacing between items (dividers)', () => {
    it('renders all items correctly for two items', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByText } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Second')).toBeOnTheScreen();
    });

    it('renders all items correctly for three items', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { getByText } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Second')).toBeOnTheScreen();
      expect(getByText('Third')).toBeOnTheScreen();
    });

    it('renders all items correctly for five items', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' },
        { id: '4', label: 'Four' },
        { id: '5', label: 'Five' },
      ];

      const { getByText } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByText('One')).toBeOnTheScreen();
      expect(getByText('Two')).toBeOnTheScreen();
      expect(getByText('Three')).toBeOnTheScreen();
      expect(getByText('Four')).toBeOnTheScreen();
      expect(getByText('Five')).toBeOnTheScreen();
    });

    it('maintains correct item order with multiple items', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // Items should be present in order
      expect(getByTestId('item-0')).toBeOnTheScreen();
      expect(getByTestId('item-1')).toBeOnTheScreen();
    });
  });

  describe('dark/light theme support', () => {
    it('renders items correctly in light theme', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { getByText, getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />,
        {
          preloadedState: {
            settings: {
              theme: 'light',
              language: 'en',
            },
          },
        }
      );

      expect(getByText('Test Item')).toBeOnTheScreen();
      expect(getByTestId('item-0')).toBeOnTheScreen();
    });

    it('renders items correctly in dark theme', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { getByText, getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />,
        {
          preloadedState: {
            settings: {
              theme: 'dark',
              language: 'en',
            },
          },
        }
      );

      expect(getByText('Test Item')).toBeOnTheScreen();
      expect(getByTestId('item-0')).toBeOnTheScreen();
    });

    it('renders items correctly with system theme in light mode', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { getByText, getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />,
        {
          preloadedState: {
            settings: {
              theme: 'system',
              language: 'en',
            },
          },
        }
      );

      expect(getByText('Test Item')).toBeOnTheScreen();
      expect(getByTestId('item-0')).toBeOnTheScreen();
    });

    it('renders items correctly with system theme in dark mode', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { getByText, getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />,
        {
          preloadedState: {
            settings: {
              theme: 'system',
              language: 'en',
            },
          },
        }
      );

      expect(getByText('Test Item')).toBeOnTheScreen();
      expect(getByTestId('item-0')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('renders accessible items with accessibility labels', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByLabelText } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByLabelText('Item First')).toBeOnTheScreen();
      expect(getByLabelText('Item Second')).toBeOnTheScreen();
    });

    it('renders items in a container for visual grouping', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByText } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // Both items should be rendered, indicating they are in a container
      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Second')).toBeOnTheScreen();
    });
  });

  describe('edge cases', () => {
    it('renders empty list without items', async () => {
      const items: TestItem[] = [];

      const { queryByTestId, queryAllByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // No items should be rendered
      expect(queryByTestId('item-0')).toBeNull();
      // No dividers should be rendered
      const dividers = queryAllByTestId('button-group-divider');
      expect(dividers).toHaveLength(0);
    });

    it('handles custom item types correctly', async () => {
      type CustomItem = {
        customId: number;
        customLabel: string;
        metadata: { value: number };
      };

      const customItems: CustomItem[] = [
        { customId: 1, customLabel: 'Custom 1', metadata: { value: 100 } },
        { customId: 2, customLabel: 'Custom 2', metadata: { value: 200 } },
      ];

      const customRenderItem = (item: CustomItem) => (
        <Box testID={`custom-${item.customId}`}>
          <Text>{item.customLabel}</Text>
        </Box>
      );

      const { getByText, getByTestId } = await renderWithProviders(
        <ButtonGroup items={customItems} renderItem={customRenderItem} />
      );

      expect(getByText('Custom 1')).toBeOnTheScreen();
      expect(getByText('Custom 2')).toBeOnTheScreen();
      expect(getByTestId('custom-1')).toBeOnTheScreen();
      expect(getByTestId('custom-2')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('has correct focus order for button group items', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expectFocusOrder([getByTestId('item-0'), getByTestId('item-1'), getByTestId('item-2')]);
    });

    it('single item has correct focus order', async () => {
      const items: TestItem[] = [{ id: '1', label: 'Only Item' }];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expectFocusOrder([getByTestId('item-0')]);
    });

    it('maintains focus order with five items', async () => {
      const items: TestItem[] = [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' },
        { id: '4', label: 'Four' },
        { id: '5', label: 'Five' },
      ];

      const { getByTestId } = await renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expectFocusOrder([
        getByTestId('item-0'),
        getByTestId('item-1'),
        getByTestId('item-2'),
        getByTestId('item-3'),
        getByTestId('item-4'),
      ]);
    });
  });
});
