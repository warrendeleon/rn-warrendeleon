import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { WorkExperience } from '@app/types/portfolio';

import { WorkExperienceClientsScreen } from '../WorkExperienceClientsScreen';

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

// Mock DetailListGroup
jest.mock('@app/shared/components', () => {
  const mockReact = jest.requireActual('react');
  const mockRN = jest.requireActual('react-native');

  const MockDetailListGroup = ({
    items,
    loading,
    error,
  }: {
    items: Record<string, unknown>[];
    loading?: boolean;
    error?: string;
  }) => {
    if (loading) {
      return mockReact.createElement(mockRN.View, { testID: 'detail-list-loading' }, [
        mockReact.createElement(mockRN.ActivityIndicator, {
          key: 'spinner',
          testID: 'loading-spinner',
        }),
      ]);
    }

    if (error) {
      return mockReact.createElement(mockRN.View, { testID: 'detail-list-error' }, [
        mockReact.createElement(mockRN.Text, { key: 'error', testID: 'error-message' }, error),
      ]);
    }

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
            item.subtitle
              ? mockReact.createElement(mockRN.Text, { key: 'subtitle' }, String(item.subtitle))
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

describe('WorkExperienceClientsScreen', () => {
  const mockWorkExperienceId = 'work-exp-1';

  const mockWorkExperienceWithClients: WorkExperience = {
    id: mockWorkExperienceId,
    company: 'Tech Company',
    positions: [
      {
        id: 'pos-1',
        title: 'Senior Developer',
        startDate: '2022-01',
        endDate: null,
        description: 'Developing client solutions',
        responsibilities: null,
        technologies: null,
        client: {
          name: 'Client A',
          logo: 'https://example.com/logo-a.svg',
        },
      },
      {
        id: 'pos-2',
        title: 'Lead Developer',
        startDate: '2021-01',
        endDate: '2021-12',
        description: 'Leading client projects',
        responsibilities: null,
        technologies: null,
        client: {
          name: 'Client B',
          logo: 'https://example.com/logo-b.svg',
        },
      },
    ],
  };

  const mockRoute = {
    key: 'test-key',
    name: 'WorkExperienceClients' as const,
    params: {
      workExperienceId: mockWorkExperienceId,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('displays loading spinner when loading is true', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: true,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('detail-list-loading')).toBeOnTheScreen();
      expect(getByTestId('loading-spinner')).toBeOnTheScreen();
    });

    it('does not display empty state when loading', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: true,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { queryByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(queryByTestId('work-experience-clients-empty-state')).toBeNull();
    });
  });

  describe('error state', () => {
    it('displays error message when error exists', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: 'Failed to load work experience data',
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId, getByText } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('detail-list-error')).toBeOnTheScreen();
      expect(getByText('Failed to load work experience data')).toBeOnTheScreen();
    });

    it('does not display empty state when error exists', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: 'Some error occurred',
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { queryByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(queryByTestId('work-experience-clients-empty-state')).toBeNull();
    });

    it('does not display loading spinner when error exists', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: 'Network error',
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { queryByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(queryByTestId('detail-list-loading')).toBeNull();
    });
  });

  describe('initial render', () => {
    it('renders clients list from work experience', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-screen')).toBeOnTheScreen();
      expect(getByTestId('items-container')).toBeOnTheScreen();
    });

    it('sets navigation title to company name', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(mockSetOptions).toHaveBeenCalledWith({
        title: 'Tech Company',
      });
    });
  });

  describe('client items rendering', () => {
    it('renders client position items with correct details', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId, getByText } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-item-pos-1')).toBeOnTheScreen();
      expect(getByTestId('work-experience-clients-item-pos-2')).toBeOnTheScreen();
      expect(getByText('Senior Developer')).toBeOnTheScreen();
      expect(getByText('Lead Developer')).toBeOnTheScreen();
    });

    it('renders client names in subtitle', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByText } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByText(/Client A/)).toBeOnTheScreen();
      expect(getByText(/Client B/)).toBeOnTheScreen();
    });

    it('renders date ranges in subtitle', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByText } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      // Should have "Present" for current role
      expect(getByText(/Present/)).toBeOnTheScreen();
      // Should have both dates for past role
      expect(getByText(/Jan 2021/)).toBeOnTheScreen();
      expect(getByText(/Dec 2021/)).toBeOnTheScreen();
    });
  });

  describe('navigation to details', () => {
    it('navigates to WorkExperienceDetails when client item is tapped', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const clientItem = getByTestId('work-experience-clients-item-pos-1');
      await fireEvent.press(clientItem);

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-1',
      });
    });

    it('navigates with correct position ID for each client', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const firstClient = getByTestId('work-experience-clients-item-pos-1');
      await fireEvent.press(firstClient);

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-1',
      });

      mockNavigate.mockClear();

      const secondClient = getByTestId('work-experience-clients-item-pos-2');
      await fireEvent.press(secondClient);

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-2',
      });
    });
  });

  describe('empty state', () => {
    it('displays empty state when no client positions', async () => {
      const emptyWorkExperience: WorkExperience = {
        id: mockWorkExperienceId,
        company: 'Tech Company',
        positions: [],
      };

      const store = mockStore({
        workExperience: {
          data: [emptyWorkExperience],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-empty-state')).toBeOnTheScreen();
    });

    it('does not display empty state when clients exist', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { queryByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(queryByTestId('work-experience-clients-empty-state')).toBeNull();
    });
  });

  describe('accessibility - EAA compliance', () => {
    it('has correct accessibility labels for client items', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const firstItem = getByTestId('work-experience-clients-item-pos-1');
      expect(firstItem.props.accessibilityLabel).toBeDefined();
      expect(firstItem.props.accessibilityRole).toBe('button');
    });

    it('has accessibility hints for navigation', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const firstItem = getByTestId('work-experience-clients-item-pos-1');
      expect(firstItem.props.accessibilityHint).toBeDefined();
    });
  });

  describe('theme support', () => {
    it('renders with light theme background', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const screen = getByTestId('work-experience-clients-screen');
      expect(screen).toBeOnTheScreen();
    });

    it('renders with dark theme background', async () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithClients],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'dark',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const screen = getByTestId('work-experience-clients-screen');
      expect(screen).toBeOnTheScreen();
    });
  });

  describe('edge cases', () => {
    it('handles work experience not found', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-empty-state')).toBeOnTheScreen();
    });

    it('handles null work experience data', async () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-empty-state')).toBeOnTheScreen();
    });

    it('filters out positions without clients', async () => {
      const mixedWorkExperience: WorkExperience = {
        id: mockWorkExperienceId,
        company: 'Tech Company',
        positions: [
          {
            id: 'pos-1',
            title: 'Senior Developer',
            startDate: '2022-01',
            endDate: null,
            description: 'Internal development work',
            responsibilities: null,
            technologies: null,
            client: {
              name: 'Client A',
              logo: 'https://example.com/logo-a.svg',
            },
          },
          {
            id: 'pos-2',
            title: 'Staff Developer',
            startDate: '2020-01',
            endDate: '2021-12',
            description: 'Internal development work',
            responsibilities: null,
            technologies: null,
            // No client - should be filtered out
          },
        ],
      };

      const store = mockStore({
        workExperience: {
          data: [mixedWorkExperience],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'light',
          language: 'en',
        },
      });

      const { getByTestId, queryByTestId, getByText } = await render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      // Should only show position with client
      expect(getByTestId('work-experience-clients-item-pos-1')).toBeOnTheScreen();
      expect(queryByTestId('work-experience-clients-item-pos-2')).toBeNull();
      expect(getByText('Senior Developer')).toBeOnTheScreen();
    });
  });
});
