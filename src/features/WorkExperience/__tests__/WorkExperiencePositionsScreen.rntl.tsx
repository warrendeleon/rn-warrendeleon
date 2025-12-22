import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { WorkExperience } from '@app/types/portfolio';

import { WorkExperiencePositionsScreen } from '../WorkExperiencePositionsScreen';

// Use requireActual to avoid type compatibility issues with redux-mock-store
const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

// Mock navigation
const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  }),
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
jest.mock('@app/shared/components', () => {
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
          mockReact.createElement(mockRN.Text, { key: 'label' }, String(item.label))
        )
      )
    );
  };

  return {
    DetailListGroup: MockDetailListGroup,
  };
});

describe('WorkExperiencePositionsScreen', () => {
  const mockWorkExperienceData: WorkExperience[] = [
    {
      id: 'work-1',
      company: 'xDesign',
      logo: 'https://example.com/xdesign.svg',
      positions: [
        {
          id: 'pos-1',
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
          id: 'pos-2',
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render and Navigation Title', () => {
    it('renders position list when data is loaded', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      expect(screen.getByText('Lead React Native Developer')).toBeOnTheScreen();
      expect(screen.getByText('Senior Developer')).toBeOnTheScreen();
    });

    it('sets navigation title to company name', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      expect(mockSetOptions).toHaveBeenCalledWith({
        title: 'xDesign',
      });
    });

    it('does not set title when work experience not found', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'invalid-id' },
            }}
          />
        </Provider>
      );

      expect(mockSetOptions).not.toHaveBeenCalled();
    });
  });

  describe('Position List Display', () => {
    it('displays all positions for the work experience', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-item-pos-1')).toBeOnTheScreen();
      expect(screen.getByTestId('work-experience-positions-item-pos-2')).toBeOnTheScreen();
    });

    it('displays position with logo from parent company', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      // Verify items are rendered (logo is passed to DetailListGroup)
      expect(screen.getByTestId('work-experience-positions-item-pos-1')).toBeOnTheScreen();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no positions exist', () => {
      const emptyWorkExperience: WorkExperience = {
        id: 'work-empty',
        company: 'Empty Company',
        logo: 'https://example.com/empty.svg',
        positions: [],
      };

      const store = mockStore({
        workExperience: {
          data: [emptyWorkExperience],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-empty' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-empty-state')).toBeOnTheScreen();
      expect(screen.getByText('No positions available')).toBeOnTheScreen();
    });

    it('displays empty state when work experience not found', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'invalid-id' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-empty-state')).toBeOnTheScreen();
      expect(screen.getByText('No positions available')).toBeOnTheScreen();
    });

    it('does not display empty state when positions exist', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      expect(screen.queryByTestId('work-experience-positions-empty-state')).not.toBeOnTheScreen();
    });
  });

  describe('Date Range Formatting', () => {
    it('formats date range with "Present" correctly', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-positions-item-pos-1');
      expect(item.props.accessibilityLabel).toBe('Lead React Native Developer, Jan 2022 - Present');
    });

    it('formats date range with end date correctly', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-positions-item-pos-2');
      expect(item.props.accessibilityLabel).toBe('Senior Developer, Sep 2021 - Dec 2021');
    });
  });

  describe('Navigation', () => {
    it('navigates to WorkExperienceDetails when position is tapped', async () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const firstPosition = screen.getByTestId('work-experience-positions-item-pos-1');
      fireEvent.press(firstPosition);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
            workExperienceId: 'pos-1',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('navigates with correct position ID for each item', async () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const secondPosition = screen.getByTestId('work-experience-positions-item-pos-2');
      fireEvent.press(secondPosition);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
            workExperienceId: 'pos-2',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Accessibility - EAA Compliance', () => {
    it('has correct accessibility labels for position items', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const item = screen.getByTestId('work-experience-positions-item-pos-1');
      expect(item.props.accessibilityLabel).toBe('Lead React Native Developer, Jan 2022 - Present');
      expect(item.props.accessibilityHint).toBe('View position details');
      expect(item.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility hint for all items', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const item1 = screen.getByTestId('work-experience-positions-item-pos-1');
      const item2 = screen.getByTestId('work-experience-positions-item-pos-2');

      expect(item1.props.accessibilityHint).toBe('View position details');
      expect(item2.props.accessibilityHint).toBe('View position details');
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const scrollView = screen.getByTestId('work-experience-positions-screen');
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      const scrollView = screen.getByTestId('work-experience-positions-screen');
      expect(scrollView.props.bg).toBe('$coolGray100');
    });

    it('applies dark mode to empty state text', () => {
      const emptyWorkExperience: WorkExperience = {
        id: 'work-empty',
        company: 'Empty Company',
        logo: 'https://example.com/empty.svg',
        positions: [],
      };

      const store = mockStore({
        workExperience: {
          data: [emptyWorkExperience],
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-empty' },
            }}
          />
        </Provider>
      );

      const emptyText = screen.getByText('No positions available');
      expect(emptyText.props.color).toBe('$white');
    });

    it('applies light mode to empty state text', () => {
      const emptyWorkExperience: WorkExperience = {
        id: 'work-empty',
        company: 'Empty Company',
        logo: 'https://example.com/empty.svg',
        positions: [],
      };

      const store = mockStore({
        workExperience: {
          data: [emptyWorkExperience],
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-empty' },
            }}
          />
        </Provider>
      );

      const emptyText = screen.getByText('No positions available');
      expect(emptyText.props.color).toBe('$black');
    });
  });

  describe('TestID Verification', () => {
    it('has testID on main ScrollView', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-screen')).toBeOnTheScreen();
    });

    it('has testID on each position item', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-1' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-item-pos-1')).toBeOnTheScreen();
      expect(screen.getByTestId('work-experience-positions-item-pos-2')).toBeOnTheScreen();
    });

    it('has testID on empty state', () => {
      const emptyWorkExperience: WorkExperience = {
        id: 'work-empty',
        company: 'Empty Company',
        logo: 'https://example.com/empty.svg',
        positions: [],
      };

      const store = mockStore({
        workExperience: {
          data: [emptyWorkExperience],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-empty' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-empty-state')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles null workExperience gracefully', () => {
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
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'non-existent' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-empty-state')).toBeOnTheScreen();
      expect(screen.getByText('No positions available')).toBeOnTheScreen();
    });

    it('handles undefined positions gracefully', () => {
      const workExperienceWithoutPositions: WorkExperience = {
        id: 'work-no-pos',
        company: 'Test Company',
        positions: [],
      };

      const store = mockStore({
        workExperience: {
          data: [workExperienceWithoutPositions],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-no-pos' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-empty-state')).toBeOnTheScreen();
    });

    it('handles work experience with no logo', () => {
      const workExperienceNoLogo: WorkExperience = {
        id: 'work-no-logo',
        company: 'No Logo Company',
        positions: [
          {
            id: 'pos-no-logo',
            title: 'Developer',
            startDate: 'Jan 2023',
            endDate: null,
            description: 'Working',
            responsibilities: null,
            technologies: null,
            client: null,
          },
        ],
      };

      const store = mockStore({
        workExperience: {
          data: [workExperienceNoLogo],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      render(
        <Provider store={store}>
          <WorkExperiencePositionsScreen
            route={{
              key: 'test',
              name: 'WorkExperiencePositions',
              params: { workExperienceId: 'work-no-logo' },
            }}
          />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-positions-item-pos-no-logo')).toBeOnTheScreen();
    });
  });
});
