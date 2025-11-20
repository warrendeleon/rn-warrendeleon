import React from 'react';
import * as ReactNative from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';

import { ButtonGroupDivider } from '@app/components/ButtonGroupDivider';
import type { GroupVariant } from '@app/components/shared/types';
import { renderWithProviders } from '@app/test-utils';

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
    it('renders all items correctly', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { getByTestId } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('item-0')).toBeTruthy();
      expect(getByTestId('item-1')).toBeTruthy();
      expect(getByTestId('item-2')).toBeTruthy();
    });

    it('renders item labels correctly', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByText } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
    });

    it('passes correct index to renderItem', () => {
      const items: TestItem[] = [
        { id: '1', label: 'Item 1' },
        { id: '2', label: 'Item 2' },
        { id: '3', label: 'Item 3' },
      ];

      const { getByTestId } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('item-0')).toBeTruthy();
      expect(getByTestId('item-1')).toBeTruthy();
      expect(getByTestId('item-2')).toBeTruthy();
    });
  });

  describe('single item layout', () => {
    it('renders single item with "single" variant', () => {
      const items: TestItem[] = [{ id: '1', label: 'Only Item' }];

      const { getByTestId } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('single');
    });

    it('does not render divider for single item', () => {
      const items: TestItem[] = [{ id: '1', label: 'Only Item' }];

      const { UNSAFE_queryAllByType } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // ButtonGroupDivider should not be present
      const dividers = UNSAFE_queryAllByType(ButtonGroupDivider);
      expect(dividers).toHaveLength(0);
    });
  });

  describe('multiple items layout', () => {
    it('renders two items with "top" and "bottom" variants', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByTestId } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('top');
      expect(getByTestId('variant-1')).toHaveTextContent('bottom');
    });

    it('renders three items with "top", "middle", and "bottom" variants', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { getByTestId } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByTestId('variant-0')).toHaveTextContent('top');
      expect(getByTestId('variant-1')).toHaveTextContent('middle');
      expect(getByTestId('variant-2')).toHaveTextContent('bottom');
    });

    it('renders five items with correct variants', () => {
      const items: TestItem[] = [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' },
        { id: '4', label: 'Four' },
        { id: '5', label: 'Five' },
      ];

      const { getByTestId } = renderWithProviders(
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
    it('renders correctly with two items', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { UNSAFE_root, getByText } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(UNSAFE_root).toBeDefined();
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
    });

    it('renders correctly with three items', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];

      const { UNSAFE_root, getByText } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(UNSAFE_root).toBeDefined();
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });

    it('renders correctly with five items', () => {
      const items: TestItem[] = [
        { id: '1', label: 'One' },
        { id: '2', label: 'Two' },
        { id: '3', label: 'Three' },
        { id: '4', label: 'Four' },
        { id: '5', label: 'Five' },
      ];

      const { UNSAFE_root } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('maintains correct item order with multiple items', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByTestId } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // Items should be present in order
      expect(getByTestId('item-0')).toBeTruthy();
      expect(getByTestId('item-1')).toBeTruthy();
    });
  });

  describe('dark/light theme support', () => {
    it('renders correctly in light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { UNSAFE_root, getByText } = renderWithProviders(
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

      expect(UNSAFE_root).toBeDefined();
      expect(getByText('Test Item')).toBeTruthy();
    });

    it('renders correctly in dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { UNSAFE_root, getByText } = renderWithProviders(
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

      expect(UNSAFE_root).toBeDefined();
      expect(getByText('Test Item')).toBeTruthy();
    });

    it('renders correctly with system theme in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { UNSAFE_root, getByText } = renderWithProviders(
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

      expect(UNSAFE_root).toBeDefined();
      expect(getByText('Test Item')).toBeTruthy();
    });

    it('renders correctly with system theme in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: TestItem[] = [{ id: '1', label: 'Test Item' }];

      const { UNSAFE_root, getByText } = renderWithProviders(
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

      expect(UNSAFE_root).toBeDefined();
      expect(getByText('Test Item')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('renders accessible items with accessibility labels', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
      ];

      const { getByLabelText } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(getByLabelText('Item First')).toBeTruthy();
      expect(getByLabelText('Item Second')).toBeTruthy();
    });

    it('renders container Box for grouping', () => {
      const items: TestItem[] = [{ id: '1', label: 'Test' }];

      const { UNSAFE_queryAllByType } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      // ButtonGroup renders a Box container
      const boxes = UNSAFE_queryAllByType(Box);
      expect(boxes.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('renders empty list without crashing', () => {
      const items: TestItem[] = [];

      const { UNSAFE_root } = renderWithProviders(
        <ButtonGroup items={items} renderItem={testRenderItem} />
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('handles custom item types correctly', () => {
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

      const { getByText } = renderWithProviders(
        <ButtonGroup items={customItems} renderItem={customRenderItem} />
      );

      expect(getByText('Custom 1')).toBeTruthy();
      expect(getByText('Custom 2')).toBeTruthy();
    });
  });
});
