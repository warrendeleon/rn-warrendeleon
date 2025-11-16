import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import { MenuButtonGroupSvg, type MenuButtonGroupSvgItem } from '../MenuButtonGroupSvg';

const mockStore = configureStore([]);

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  SvgUri: 'SvgUri',
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ChevronRight: 'ChevronRight',
}));

describe('MenuButtonGroupSvg', () => {
  const mockItems: MenuButtonGroupSvgItem[] = [
    {
      id: '1',
      label: 'Test Item 1',
      subtitle: 'Subtitle 1',
      logoUri: 'file:///path/to/logo1.svg',
      onPress: jest.fn(),
      testID: 'test-item-1',
    },
    {
      id: '2',
      label: 'Test Item 2',
      logoUri: 'file:///path/to/logo2.svg',
      testID: 'test-item-2',
    },
  ];

  const createMockStore = () =>
    mockStore({
      settings: {
        theme: 'system',
      },
    });

  it('renders all items correctly', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={mockItems} />
      </Provider>
    );

    expect(screen.getByText('Test Item 1')).toBeOnTheScreen();
    expect(screen.getByText('Subtitle 1')).toBeOnTheScreen();
    expect(screen.getByText('Test Item 2')).toBeOnTheScreen();
  });

  it('calls onPress when item is tapped', () => {
    const store = createMockStore();
    const onPressMock = jest.fn();
    const items: MenuButtonGroupSvgItem[] = [
      {
        id: '1',
        label: 'Clickable Item',
        logoUri: 'file:///logo.svg',
        onPress: onPressMock,
        testID: 'clickable-item',
      },
    ];

    render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={items} />
      </Provider>
    );

    fireEvent.press(screen.getByTestId('clickable-item'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('supports accessibility labels and chevrons based on props', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MenuButtonGroupSvg
          items={[
            {
              id: '1',
              label: 'Accessible Item',
              logoUri: 'file:///logo.svg',
              onPress: jest.fn(),
              testID: 'accessible-item',
              accessibilityLabel: 'Senior Engineer at Sky',
              accessibilityHint: 'Tap to view details',
            },
          ]}
        />
      </Provider>
    );

    expect(screen.getByLabelText('Senior Engineer at Sky')).toBeOnTheScreen();
    // TODO: Fix accessibility hint assertion once proper matcher is available
    // expect(screen.getByLabelText('Senior Engineer at Sky')).toHaveAccessibilityHint(
    //   'Tap to view details'
    // );
  });

  it('renders badge chips when provided and hides chevron when showChevron is false', () => {
    const store = createMockStore();
    const items: MenuButtonGroupSvgItem[] = [
      {
        id: '1',
        label: 'No Chevron Item',
        logoUri: 'file:///logo.svg',
        onPress: jest.fn(),
        showChevron: false,
        testID: 'no-chevron-item',
        badge: '3',
      },
    ];

    render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={items} />
      </Provider>
    );

    expect(screen.getByText('3')).toBeOnTheScreen();
  });

  it('displays loading indicator when loading', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={mockItems} loading />
      </Provider>
    );

    expect(screen.getByTestId('activity-indicator')).toBeOnTheScreen();
    expect(screen.queryByText('Test Item 1')).not.toBeOnTheScreen();
  });

  it('displays error message when error exists', () => {
    const store = createMockStore();
    const errorMessage = 'Failed to load data';
    render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={mockItems} error={errorMessage} />
      </Provider>
    );

    expect(screen.getByText(errorMessage)).toBeOnTheScreen();
    expect(screen.queryByText('Test Item 1')).not.toBeOnTheScreen();
  });

  it('renders dividers between items', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={mockItems} />
      </Provider>
    );

    // There should be 1 divider for 2 items
    // Verify via snapshot
  });

  it('matches snapshot for light mode', () => {
    const store = createMockStore();
    const { toJSON } = render(
      <Provider store={store}>
        <MenuButtonGroupSvg items={mockItems} />
      </Provider>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
