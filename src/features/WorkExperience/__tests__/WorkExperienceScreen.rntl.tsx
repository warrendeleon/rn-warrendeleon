import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { WorkExperience } from '@app/types/portfolio';

import { WorkExperienceScreen } from '../WorkExperienceScreen';

// Use requireActual to avoid type compatibility issues with redux-mock-store
const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({}),
}));

// Mock Image.resolveAssetSource
jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  return jest.fn((source: number) => ({
    uri: `mocked://asset/${source}`,
    width: 100,
    height: 100,
  }));
});

// Mock DetailListGroup
jest.mock('@app/components', () => {
  const mockReact = jest.requireActual('react');
  const mockRN = jest.requireActual('react-native');

  const MockDetailListGroup = ({ items, loading, error }: Record<string, unknown>) => {
    if (loading) return mockReact.createElement(mockRN.View, { testID: 'loading-state' });
    if (error)
      return mockReact.createElement(
        mockRN.View,
        { testID: 'error-state' },
        mockReact.createElement(mockRN.Text, {}, error)
      );
    if (!Array.isArray(items) || items.length === 0) {
      return mockReact.createElement(mockRN.View, { testID: 'items-container-empty' });
    }
    return mockReact.createElement(
      mockRN.View,
      { testID: 'items-container' },
      items.map((item: Record<string, unknown>) =>
        mockReact.createElement(
          mockRN.TouchableOpacity,
          {
            key: String(item.id),
            onPress: typeof item.onPress === 'function' ? item.onPress : undefined,
            testID: String(item.testID),
            accessibilityLabel: String(item.accessibilityLabel),
            accessibilityHint: item.accessibilityHint ? String(item.accessibilityHint) : undefined,
            accessibilityRole: 'button',
          },
          [
            mockReact.createElement(mockRN.Text, { key: 'label' }, String(item.label)),
            item.badge
              ? mockReact.createElement(
                  mockRN.View,
                  { key: 'badge', testID: `${String(item.testID)}-badge` },
                  mockReact.createElement(mockRN.Text, {}, String(item.badge))
                )
              : null,
          ]
        )
      )
    );
  };

  return {
    DetailListGroup: MockDetailListGroup,
  };
});

describe('WorkExperienceScreen', () => {
  const mockWorkExperienceData: WorkExperience[] = [
    {
      id: 'work-1',
      company: 'Sky',
      logo: 'https://example.com/sky.svg',
      positions: [
        {
          id: 'pos-1',
          title: 'Senior React Native Developer',
          startDate: 'Jan 2023',
          endDate: null,
          description: 'Working on eSIM features',
          responsibilities: null,
          technologies: {
            languages: ['TypeScript'],
            frameworks: ['React Native', 'Redux'],
            testing: {
              unit: ['RNTL'],
              e2e: ['Detox'],
            },
            tools: ['Xcode'],
            ci: null,
            methodology: ['Scrum'],
          },
          client: null,
        },
      ],
    },
    {
      id: 'work-2',
      company: 'xDesign',
      logo: 'https://example.com/xdesign.svg',
      positions: [
        {
          id: 'pos-2',
          title: 'Lead React Native Developer',
          startDate: 'Jan 2022',
          endDate: null,
          description: 'Leading FanDuel team',
          responsibilities: null,
          technologies: {
            languages: ['TypeScript'],
            frameworks: ['React Native'],
            testing: {
              unit: ['RNTL'],
              e2e: ['Detox'],
            },
            tools: ['Xcode'],
            ci: null,
            methodology: ['Scrum'],
          },
          client: {
            name: 'FanDuel',
            logo: 'https://example.com/fanduel.svg',
          },
        },
        {
          id: 'pos-3',
          title: 'Senior Developer',
          startDate: 'Sep 2021',
          endDate: 'Dec 2021',
          description: 'POS development',
          responsibilities: null,
          technologies: {
            languages: ['TypeScript'],
            frameworks: ['React Native'],
            testing: null,
            tools: ['Xcode'],
            ci: null,
            methodology: ['Scrum'],
          },
          client: {
            name: 'Zonal',
            logo: 'https://example.com/zonal.svg',
          },
        },
      ],
    },
    {
      id: 'work-3',
      company: 'Candide',
      logo: 'https://example.com/candide.svg',
      positions: [
        {
          id: 'pos-4',
          title: 'Senior Software Engineer',
          startDate: 'Apr 2022',
          endDate: 'Jul 2022',
          description: 'Developing new apps',
          responsibilities: null,
          technologies: {
            languages: ['TypeScript'],
            frameworks: ['React Native'],
            testing: {
              unit: ['RNTL'],
              e2e: ['Detox'],
            },
            tools: ['Xcode'],
            ci: null,
            methodology: ['Kanban'],
          },
          client: null,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render and Data Fetching', () => {
    it('renders work experience items when data is loaded', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByText('Senior React Native Developer')).toBeOnTheScreen();
      expect(screen.getByText('Lead React Native Developer')).toBeOnTheScreen();
      expect(screen.getByText('Senior Software Engineer')).toBeOnTheScreen();
    });

    it('fetches work experience data on mount', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(dispatchSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    it('refetches data when language changes', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const { rerender } = render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Initial mount triggers fetch
      expect(dispatchSpy).toHaveBeenCalledTimes(1);

      // Change language
      const newStore = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'es',
        },
      });

      const newDispatchSpy = jest.spyOn(newStore, 'dispatch');

      rerender(
        <Provider store={newStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Language change triggers refetch
      expect(newDispatchSpy).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('displays loading state', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: true,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('loading-state')).toBeOnTheScreen();
    });

    it('displays loading state with empty data array', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: true,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('loading-state')).toBeOnTheScreen();
    });
  });

  describe('Error State', () => {
    it('displays error state with translated message', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: false,
          error: 'Network error',
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('error-state')).toBeOnTheScreen();
      expect(
        screen.getByText('Failed to load work experience. Please try again.')
      ).toBeOnTheScreen();
    });

    it('does not display empty state when error is present', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: 'Network error',
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('error-state')).toBeOnTheScreen();
      expect(screen.queryByTestId('work-experience-empty-state')).not.toBeOnTheScreen();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no data', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-empty-state')).toBeOnTheScreen();
      expect(screen.getByText('No work experience available')).toBeOnTheScreen();
    });

    it('does not display empty state when loading', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: true,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.queryByTestId('work-experience-empty-state')).not.toBeOnTheScreen();
    });

    it('does not display empty state when error is present', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: 'Error',
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.queryByTestId('work-experience-empty-state')).not.toBeOnTheScreen();
    });
  });

  describe('Date Range Formatting', () => {
    it('formats date range with "Present" correctly', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-item-work-1');
      expect(item.props.accessibilityLabel).toBe(
        'Senior React Native Developer at Sky, Jan 2023 - Present'
      );
    });

    it('formats date range with end date correctly', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[2]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-item-work-3');
      expect(item.props.accessibilityLabel).toBe(
        'Senior Software Engineer at Candide, Apr 2022 - Jul 2022'
      );
    });
  });

  describe('Navigation - Client List', () => {
    it('navigates to WorkExperienceClients when item with clients is tapped', async () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const itemWithClients = screen.getByTestId('work-experience-item-work-2');
      fireEvent.press(itemWithClients);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceClients', {
          workExperienceId: 'work-2',
        });
      });
    });

    it('displays badge with client count for items with clients', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Item with 2 clients should show badge
      const badge = screen.getByTestId('work-experience-item-work-2-badge');
      expect(badge).toBeOnTheScreen();
      expect(screen.getByText('2')).toBeOnTheScreen();
    });

    it('does not display badge for items without clients', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.queryByTestId('work-experience-item-work-1-badge')).not.toBeOnTheScreen();
    });
  });

  describe('Navigation - Direct Details', () => {
    it('navigates to WorkExperienceDetails when item without clients is tapped', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const itemWithoutClients = screen.getByTestId('work-experience-item-work-1');
      fireEvent.press(itemWithoutClients);

      await waitFor(() => {
        // Navigation uses position ID for single-position work experience
        expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
          workExperienceId: 'pos-1',
        });
      });
    });

    it('navigates to WorkExperienceDetails when item has positions without clients', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const itemWithoutClients = screen.getByTestId('work-experience-item-work-1');
      fireEvent.press(itemWithoutClients);

      await waitFor(() => {
        // Navigation uses position ID for single-position work experience
        expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
          workExperienceId: 'pos-1',
        });
      });
    });
  });

  describe('Accessibility - EAA Compliance', () => {
    it('has correct accessibility labels for items without clients', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-item-work-1');
      expect(item.props.accessibilityLabel).toBe(
        'Senior React Native Developer at Sky, Jan 2023 - Present'
      );
      expect(item.props.accessibilityHint).toBe('Tap to view job details');
      expect(item.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility labels for items with clients', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[1]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-item-work-2');
      expect(item.props.accessibilityLabel).toBe(
        'Lead React Native Developer at xDesign, Jan 2022 - Present'
      );
      expect(item.props.accessibilityHint).toBe('Tap to view 2 clients');
      expect(item.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility hint for single client', () => {
      const workExpWithSingleClient: WorkExperience = {
        ...mockWorkExperienceData[1]!,
        positions: [mockWorkExperienceData[1]!.positions[0]!],
      };

      const store = mockStore({
        workExperience: {
          data: [workExpWithSingleClient],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-item-work-2');
      // Single client goes directly to details screen (not clients screen)
      expect(item.props.accessibilityHint).toBe('Tap to view job details');
    });
  });

  describe('Theme Support', () => {
    it('renders with dark theme background', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
          theme: 'dark',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const scrollView = screen.getByTestId('work-experience-screen');
      expect(scrollView.props.bg).toBe('$black');
    });

    it('renders with light theme background', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
          theme: 'light',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const scrollView = screen.getByTestId('work-experience-screen');
      expect(scrollView.props.bg).toBe('$coolGray100');
    });

    it('applies dark mode to empty state text', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
          theme: 'dark',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const emptyText = screen.getByText('No work experience available');
      expect(emptyText.props.color).toBe('$white');
    });

    it('applies light mode to empty state text', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
          theme: 'light',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const emptyText = screen.getByText('No work experience available');
      expect(emptyText.props.color).toBe('$black');
    });
  });

  describe('TestID Verification', () => {
    it('has testID on main ScrollView', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-screen')).toBeOnTheScreen();
    });

    it('has testID on each work experience item', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-item-work-1')).toBeOnTheScreen();
      expect(screen.getByTestId('work-experience-item-work-2')).toBeOnTheScreen();
      expect(screen.getByTestId('work-experience-item-work-3')).toBeOnTheScreen();
    });

    it('has testID on empty state', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-empty-state')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles null data gracefully', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Should show empty items container (no items to render)
      expect(screen.getByTestId('items-container-empty')).toBeOnTheScreen();
    });

    it('handles positions without clients correctly', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-item-work-1');
      fireEvent.press(item);

      // Navigation uses position ID for single-position work experience
      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-1',
      });
    });

    it('handles item with positions without clients correctly', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceData[0]],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.queryByTestId('work-experience-item-work-1-badge')).not.toBeOnTheScreen();

      const item = screen.getByTestId('work-experience-item-work-1');
      expect(item.props.accessibilityHint).toBe('Tap to view job details');
    });
  });
});
