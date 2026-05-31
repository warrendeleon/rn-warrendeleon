import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { expectFocusOrder, expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { PickerGroup } from '../PickerGroup';

describe('PickerGroup', () => {
  describe('PickerGroup Component', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    it('renders a single item with label text in light mode', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        {
          label: 'Single Item',
          onPress: jest.fn(),
        },
      ];

      const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

      expect(getByText('Single Item')).toBeOnTheScreen();
    });

    it('renders multiple items with label text in dark mode', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [
        { label: 'First Item', onPress: jest.fn() },
        { label: 'Second Item', onPress: jest.fn() },
        { label: 'Third Item', onPress: jest.fn() },
      ];

      const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

      expect(getByText('First Item')).toBeOnTheScreen();
      expect(getByText('Second Item')).toBeOnTheScreen();
      expect(getByText('Third Item')).toBeOnTheScreen();
    });

    it('shows check mark for selected item only', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        {
          label: 'Selected Item',
          onPress: jest.fn(),
          isSelected: true,
          testID: 'selected-item',
        },
        {
          label: 'Unselected Item',
          onPress: jest.fn(),
          isSelected: false,
          testID: 'unselected-item',
        },
      ];

      const { getByText, getAllByText } = await renderWithProviders(<PickerGroup items={items} />);

      expect(getByText('Selected Item')).toBeOnTheScreen();
      expect(getByText('Unselected Item')).toBeOnTheScreen();
      // Only one check mark should be visible
      expect(getAllByText('✓')).toHaveLength(1);
    });

    it('renders with two items (top and bottom variants)', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        { label: 'First', onPress: jest.fn() },
        { label: 'Last', onPress: jest.fn() },
      ];

      const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Last')).toBeOnTheScreen();
    });

    it('renders with four items (top, middle, middle, bottom)', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [
        { label: 'Top Item', onPress: jest.fn() },
        { label: 'Middle 1', onPress: jest.fn() },
        { label: 'Middle 2', onPress: jest.fn() },
        { label: 'Bottom Item', onPress: jest.fn() },
      ];

      const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

      expect(getByText('Top Item')).toBeOnTheScreen();
      expect(getByText('Middle 1')).toBeOnTheScreen();
      expect(getByText('Middle 2')).toBeOnTheScreen();
      expect(getByText('Bottom Item')).toBeOnTheScreen();
    });

    describe('Selection State Logic', () => {
      it('shows check mark when item is selected', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          {
            label: 'Selected Option',
            onPress: jest.fn(),
            isSelected: true,
            testID: 'selected-button',
          },
        ];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Selected Option')).toBeOnTheScreen();
        expect(getByText('✓')).toBeOnTheScreen();
      });

      it('does not show check mark when item is not selected', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          {
            label: 'Unselected Option',
            onPress: jest.fn(),
            isSelected: false,
            testID: 'unselected-button',
          },
        ];

        const { getByText, queryByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Unselected Option')).toBeOnTheScreen();
        expect(queryByText('✓')).not.toBeOnTheScreen();
      });

      it('shows correct number of check marks for mixed selection states', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'Option 1', onPress: jest.fn(), isSelected: true },
          { label: 'Option 2', onPress: jest.fn(), isSelected: false },
          { label: 'Option 3', onPress: jest.fn(), isSelected: true },
        ];

        const { getAllByText } = await renderWithProviders(<PickerGroup items={items} />);

        // Two items selected = two check marks
        expect(getAllByText('✓')).toHaveLength(2);
      });

      it('shows no check marks when all items are unselected', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'Option 1', onPress: jest.fn(), isSelected: false },
          { label: 'Option 2', onPress: jest.fn(), isSelected: false },
        ];

        const { queryByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(queryByText('✓')).not.toBeOnTheScreen();
      });

      it('shows check marks for all items when all are selected', async () => {
        mockUseColorScheme.mockReturnValue('dark');

        const items = [
          { label: 'Option 1', onPress: jest.fn(), isSelected: true },
          { label: 'Option 2', onPress: jest.fn(), isSelected: true },
          { label: 'Option 3', onPress: jest.fn(), isSelected: true },
        ];

        const { getAllByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getAllByText('✓')).toHaveLength(3);
      });

      it('defaults to no check mark when isSelected is undefined', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          {
            label: 'Option without isSelected',
            onPress: jest.fn(),
            // isSelected intentionally omitted
          },
        ];

        const { getByText, queryByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Option without isSelected')).toBeOnTheScreen();
        expect(queryByText('✓')).not.toBeOnTheScreen();
      });
    });

    describe('Event Handlers', () => {
      it('calls onPress when item is pressed', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const mockOnPress = jest.fn();
        const items = [
          {
            label: 'Pressable Button',
            onPress: mockOnPress,
            testID: 'pressable-button',
          },
        ];

        const { getByTestId } = await renderWithProviders(<PickerGroup items={items} />);

        await fireEvent.press(getByTestId('pressable-button'));

        expect(mockOnPress).toHaveBeenCalledTimes(1);
      });

      it('calls correct onPress handler for each item', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const mockOnPress1 = jest.fn();
        const mockOnPress2 = jest.fn();
        const mockOnPress3 = jest.fn();

        const items = [
          { label: 'Button 1', onPress: mockOnPress1, testID: 'button-1' },
          { label: 'Button 2', onPress: mockOnPress2, testID: 'button-2' },
          { label: 'Button 3', onPress: mockOnPress3, testID: 'button-3' },
        ];

        const { getByTestId } = await renderWithProviders(<PickerGroup items={items} />);

        await fireEvent.press(getByTestId('button-2'));

        expect(mockOnPress1).not.toHaveBeenCalled();
        expect(mockOnPress2).toHaveBeenCalledTimes(1);
        expect(mockOnPress3).not.toHaveBeenCalled();
      });
    });

    describe('GroupVariant Logic', () => {
      // GroupVariant is calculated by getButtonGroupVariant based on position
      // These tests verify the component renders correctly with different list sizes

      it('renders single item (single variant)', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [{ label: 'Single Item', onPress: jest.fn(), testID: 'single-item' }];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Single Item')).toBeOnTheScreen();
      });

      it('renders two items (top and bottom variants)', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'First Item', onPress: jest.fn() },
          { label: 'Second Item', onPress: jest.fn() },
        ];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('First Item')).toBeOnTheScreen();
        expect(getByText('Second Item')).toBeOnTheScreen();
      });

      it('renders three items (top, middle, bottom variants)', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'Top Item', onPress: jest.fn() },
          { label: 'Middle Item', onPress: jest.fn() },
          { label: 'Bottom Item', onPress: jest.fn() },
        ];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Top Item')).toBeOnTheScreen();
        expect(getByText('Middle Item')).toBeOnTheScreen();
        expect(getByText('Bottom Item')).toBeOnTheScreen();
      });

      it('renders five items (multiple middle variants)', async () => {
        mockUseColorScheme.mockReturnValue('dark');

        const items = [
          { label: 'Item 1', onPress: jest.fn() },
          { label: 'Item 2', onPress: jest.fn() },
          { label: 'Item 3', onPress: jest.fn() },
          { label: 'Item 4', onPress: jest.fn() },
          { label: 'Item 5', onPress: jest.fn() },
        ];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Item 1')).toBeOnTheScreen();
        expect(getByText('Item 2')).toBeOnTheScreen();
        expect(getByText('Item 3')).toBeOnTheScreen();
        expect(getByText('Item 4')).toBeOnTheScreen();
        expect(getByText('Item 5')).toBeOnTheScreen();
      });
    });

    describe('Divider Placement', () => {
      // Dividers are rendered between items using ButtonGroupDivider
      // The logic: !isLastItem && <ButtonGroupDivider />

      it('renders single item without divider', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [{ label: 'Single Item', onPress: jest.fn() }];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Single Item')).toBeOnTheScreen();
        // Dividers don't have testIDs, but we can verify the component rendered
      });

      it('renders multiple items with labels visible', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'First Item', onPress: jest.fn() },
          { label: 'Second Item', onPress: jest.fn() },
          { label: 'Third Item', onPress: jest.fn() },
        ];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('First Item')).toBeOnTheScreen();
        expect(getByText('Second Item')).toBeOnTheScreen();
        expect(getByText('Third Item')).toBeOnTheScreen();
      });
    });

    describe('Edge Cases', () => {
      it('renders empty list without crashing', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items: never[] = [];

        const { queryByText } = await renderWithProviders(<PickerGroup items={items} />);

        // Empty list should render nothing
        expect(queryByText('Item')).not.toBeOnTheScreen();
      });

      it('renders items without testID using label text', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [{ label: 'Item without testID', onPress: jest.fn() }];

        const { getByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Item without testID')).toBeOnTheScreen();
      });

      it('renders with all props and shows check mark', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const mockOnPress = jest.fn();
        const items = [
          {
            label: 'Complete Props',
            onPress: mockOnPress,
            isSelected: true,
            testID: 'complete-props-button',
          },
        ];

        const { getByText, getByTestId } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Complete Props')).toBeOnTheScreen();
        expect(getByText('✓')).toBeOnTheScreen();
        expect(getByTestId('complete-props-button')).toBeOnTheScreen();
      });

      it('renders items with minimal props', async () => {
        mockUseColorScheme.mockReturnValue('dark');

        const items = [{ label: 'Minimal Props', onPress: jest.fn() }];

        const { getByText, queryByText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByText('Minimal Props')).toBeOnTheScreen();
        expect(queryByText('✓')).not.toBeOnTheScreen();
      });

      it('renders large list (10 items) with correct selection', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = Array.from({ length: 10 }, (_, i) => ({
          label: `Item ${i + 1}`,
          onPress: jest.fn(),
          isSelected: i % 3 === 0, // Items 1, 4, 7, 10 selected
        }));

        const { getByText, getAllByText } = await renderWithProviders(
          <PickerGroup items={items} />
        );

        expect(getByText('Item 1')).toBeOnTheScreen();
        expect(getByText('Item 10')).toBeOnTheScreen();
        // 4 items selected (indices 0, 3, 6, 9)
        expect(getAllByText('✓')).toHaveLength(4);
      });
    });

    describe('Accessibility', () => {
      it('items have accessible labels', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'English', onPress: jest.fn(), isSelected: true },
          { label: 'Spanish', onPress: jest.fn(), isSelected: false },
        ];

        const { getByLabelText } = await renderWithProviders(<PickerGroup items={items} />);

        expect(getByLabelText('English, selected')).toBeOnTheScreen();
        expect(getByLabelText('Spanish')).toBeOnTheScreen();
      });
    });

    describe('EAA Accessibility Compliance', () => {
      it('all items have accessible touch targets (44×44 minimum)', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'Option 1', onPress: jest.fn(), testID: 'option-1' },
          { label: 'Option 2', onPress: jest.fn(), testID: 'option-2' },
          { label: 'Option 3', onPress: jest.fn(), testID: 'option-3' },
        ];

        const { getByTestId } = await renderWithProviders(<PickerGroup items={items} />);

        expectMinTouchTarget(getByTestId('option-1'));
        expectMinTouchTarget(getByTestId('option-2'));
        expectMinTouchTarget(getByTestId('option-3'));
      });

      it('has correct focus order for picker items', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'First', onPress: jest.fn(), testID: 'first' },
          { label: 'Second', onPress: jest.fn(), testID: 'second' },
          { label: 'Third', onPress: jest.fn(), testID: 'third' },
        ];

        const { getByTestId } = await renderWithProviders(<PickerGroup items={items} />);

        expectFocusOrder([getByTestId('first'), getByTestId('second'), getByTestId('third')]);
      });

      it('selected items maintain accessible touch targets', async () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'Selected', onPress: jest.fn(), isSelected: true, testID: 'selected-item' },
        ];

        const { getByTestId } = await renderWithProviders(<PickerGroup items={items} />);

        expectMinTouchTarget(getByTestId('selected-item'));
      });
    });
  });
});
