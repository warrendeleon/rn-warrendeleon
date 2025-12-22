/**
 * ButtonGroup Snapshot Tests
 *
 * Verifies visual consistency of the ButtonGroup component across all variants.
 * Uses @testing-library/react-native for compatibility with GlueStack UI components.
 */

import React from 'react';
import { Text } from '@gluestack-ui/themed';

import { type GroupVariant } from '@app/shared/components';
import { renderWithProviders } from '@app/test-utils';

import { ButtonGroup, ButtonGroupItem } from '../ButtonGroup';

// Simple test item type
interface TestItem extends ButtonGroupItem {
  id: string;
  label: string;
}

// Simple render function for testing - groupVariant and index are required by ButtonGroup API
const renderTestItem = (item: TestItem, groupVariant: GroupVariant, index: number) => (
  <Text testID={`item-${item.id}-${groupVariant}-${index}`}>{item.label}</Text>
);

describe('ButtonGroup Snapshots', () => {
  describe('Item Count Variants', () => {
    it('renders single item correctly', () => {
      const items: TestItem[] = [{ id: '1', label: 'Single Item' }];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Single Item');
    });

    it('renders two items correctly', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First Item' },
        { id: '2', label: 'Second Item' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Two Items');
    });

    it('renders three items correctly', () => {
      const items: TestItem[] = [
        { id: '1', label: 'First Item' },
        { id: '2', label: 'Middle Item' },
        { id: '3', label: 'Last Item' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Three Items');
    });

    it('renders many items correctly', () => {
      const items: TestItem[] = [
        { id: '1', label: 'Item 1' },
        { id: '2', label: 'Item 2' },
        { id: '3', label: 'Item 3' },
        { id: '4', label: 'Item 4' },
        { id: '5', label: 'Item 5' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Five Items');
    });

    it('renders empty list correctly', () => {
      const items: TestItem[] = [];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Empty');
    });
  });

  describe('Content Variants', () => {
    it('renders with long labels', () => {
      const items: TestItem[] = [
        { id: '1', label: 'This is a very long label that might wrap to multiple lines' },
        { id: '2', label: 'Another extraordinarily long label for testing purposes' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Long Labels');
    });

    it('renders with special characters', () => {
      const items: TestItem[] = [
        { id: '1', label: 'Configuración 🔧' },
        { id: '2', label: 'Información & Ayuda' },
        { id: '3', label: 'Términos <Legal>' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Special Characters');
    });

    it('renders with Unicode characters', () => {
      const items: TestItem[] = [
        { id: '1', label: '設定' },
        { id: '2', label: 'Настройки' },
        { id: '3', label: 'הגדרות' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Unicode Labels');
    });

    it('renders with empty labels', () => {
      const items: TestItem[] = [
        { id: '1', label: '' },
        { id: '2', label: '' },
      ];

      const { toJSON } = renderWithProviders(
        <ButtonGroup items={items} renderItem={renderTestItem} />
      );
      expect(toJSON()).toMatchSnapshot('ButtonGroup - Empty Labels');
    });
  });
});

describe('ButtonGroup Snapshot Consistency', () => {
  const testItems: TestItem[] = [
    { id: '1', label: 'First' },
    { id: '2', label: 'Second' },
    { id: '3', label: 'Third' },
  ];

  it('produces consistent output between renders', () => {
    const { toJSON: toJSON1 } = renderWithProviders(
      <ButtonGroup items={testItems} renderItem={renderTestItem} />
    );
    const { toJSON: toJSON2 } = renderWithProviders(
      <ButtonGroup items={testItems} renderItem={renderTestItem} />
    );

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(toJSON1())).toBe(JSON.stringify(toJSON2()));
  });

  it('item order affects output', () => {
    const forwardItems: TestItem[] = [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
    ];
    const reverseItems: TestItem[] = [
      { id: '2', label: 'B' },
      { id: '1', label: 'A' },
    ];

    const { toJSON: forwardJSON } = renderWithProviders(
      <ButtonGroup items={forwardItems} renderItem={renderTestItem} />
    );
    const { toJSON: reverseJSON } = renderWithProviders(
      <ButtonGroup items={reverseItems} renderItem={renderTestItem} />
    );

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(forwardJSON())).not.toBe(JSON.stringify(reverseJSON()));
  });
});
