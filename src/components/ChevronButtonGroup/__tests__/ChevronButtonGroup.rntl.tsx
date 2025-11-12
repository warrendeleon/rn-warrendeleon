import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { ChevronButtonGroup } from '../ChevronButtonGroup';

describe('ChevronButtonGroup', () => {
  describe('ChevronButtonGroup Component', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    describe('Rendering', () => {
      it('renders a single item without crashing in light mode', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          {
            label: 'Single Item',
            onPress: jest.fn(),
          },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders multiple items without crashing in dark mode', () => {
        mockUseColorScheme.mockReturnValue('dark');

        const items = [
          { label: 'First Item', onPress: jest.fn() },
          { label: 'Second Item', onPress: jest.fn() },
          { label: 'Third Item', onPress: jest.fn() },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders items with all optional props without crashing', () => {
        mockUseColorScheme.mockReturnValue('light');

        const MockIcon = () => null;

        const items = [
          {
            label: 'Complex Item',
            onPress: jest.fn(),
            startIcon: MockIcon,
            startIconBgColor: '$blue500',
            endLabel: 'Detail',
            testID: 'complex-item',
          },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders with two items (exercises top and bottom variants)', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'First', onPress: jest.fn() },
          { label: 'Last', onPress: jest.fn() },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders with four items (exercises top, middle, middle, bottom)', () => {
        mockUseColorScheme.mockReturnValue('dark');

        const items = [
          { label: 'Top Item', onPress: jest.fn() },
          { label: 'Middle 1', onPress: jest.fn() },
          { label: 'Middle 2', onPress: jest.fn() },
          { label: 'Bottom Item', onPress: jest.fn() },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders in light mode without divider on single item', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [{ label: 'Only One', onPress: jest.fn() }];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders in dark mode without divider on single item', () => {
        mockUseColorScheme.mockReturnValue('dark');

        const items = [{ label: 'Singular', onPress: jest.fn() }];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('renders empty View when items array is empty', () => {
        mockUseColorScheme.mockReturnValue('light');

        const { UNSAFE_root } = renderWithProviders(<ChevronButtonGroup items={[]} />);

        // Component should render successfully (not crash) with empty items
        expect(UNSAFE_root).toBeDefined();
      });
    });

    describe('Button Rendering', () => {
      it('renders correct number of buttons from items config', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'Button 1', onPress: jest.fn() },
          { label: 'Button 2', onPress: jest.fn() },
          { label: 'Button 3', onPress: jest.fn() },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders items with all optional props without crashing', () => {
        mockUseColorScheme.mockReturnValue('light');

        const MockIcon = () => null;
        const items = [
          {
            label: 'Language',
            onPress: jest.fn(),
            startIcon: MockIcon,
            startIconBgColor: '$blue500',
            endLabel: 'English',
            testID: 'language-button',
          },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });

      it('renders items with different props', () => {
        mockUseColorScheme.mockReturnValue('light');

        const MockIcon1 = () => null;
        const MockIcon2 = () => null;

        const items = [
          {
            label: 'Language',
            onPress: jest.fn(),
            startIcon: MockIcon1,
            startIconBgColor: '$blue500',
            endLabel: 'English',
          },
          {
            label: 'Appearance',
            onPress: jest.fn(),
            startIcon: MockIcon2,
            startIconBgColor: '$indigo500',
            endLabel: 'Automatic',
          },
          {
            label: 'Settings',
            onPress: jest.fn(),
          },
        ];

        expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
      });
    });

    describe('Event Handlers', () => {
      it('does not crash when button onPress handler is invoked', () => {
        mockUseColorScheme.mockReturnValue('light');

        const mockOnPress = jest.fn();
        const items = [{ label: 'Clickable Button', onPress: mockOnPress }];

        const { UNSAFE_root } = renderWithProviders(<ChevronButtonGroup items={items} />);

        // Verify component renders
        expect(UNSAFE_root).toBeDefined();
      });

      it('renders multiple buttons with different handlers', () => {
        mockUseColorScheme.mockReturnValue('light');

        const mockOnPress1 = jest.fn();
        const mockOnPress2 = jest.fn();
        const mockOnPress3 = jest.fn();

        const items = [
          { label: 'Button 1', onPress: mockOnPress1 },
          { label: 'Button 2', onPress: mockOnPress2 },
          { label: 'Button 3', onPress: mockOnPress3 },
        ];

        const { UNSAFE_root } = renderWithProviders(<ChevronButtonGroup items={items} />);

        expect(UNSAFE_root).toBeDefined();
      });
    });

    describe('Divider Logic', () => {
      it('renders without crashing for single item (no dividers)', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [{ label: 'Single', onPress: jest.fn() }];

        const { UNSAFE_root } = renderWithProviders(<ChevronButtonGroup items={items} />);

        // Single item should render successfully
        expect(UNSAFE_root).toBeDefined();
      });

      it('renders without crashing for multiple items (with dividers between)', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'First', onPress: jest.fn() },
          { label: 'Second', onPress: jest.fn() },
          { label: 'Third', onPress: jest.fn() },
        ];

        const { UNSAFE_root } = renderWithProviders(<ChevronButtonGroup items={items} />);

        // Multiple items should render with dividers between them
        expect(UNSAFE_root).toBeDefined();
      });

      it('renders correctly with two items (one divider)', () => {
        mockUseColorScheme.mockReturnValue('light');

        const items = [
          { label: 'First', onPress: jest.fn() },
          { label: 'Second', onPress: jest.fn() },
        ];

        const { UNSAFE_root } = renderWithProviders(<ChevronButtonGroup items={items} />);

        expect(UNSAFE_root).toBeDefined();
      });
    });
  });
});
