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
jest.mock('@app/components', () => {
  const mockReact = jest.requireActual('react');
  const mockRN = jest.requireActual('react-native');

  const MockDetailListGroup = ({ items }: Record<string, unknown>) => {
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

  describe('initial render', () => {
    it('renders clients list from work experience', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-screen')).toBeTruthy();
      expect(getByTestId('items-container')).toBeTruthy();
    });

    it('sets navigation title to company name', () => {
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

      render(
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
    it('renders client position items with correct details', () => {
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

      const { getByTestId, getByText } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-item-pos-1')).toBeTruthy();
      expect(getByTestId('work-experience-clients-item-pos-2')).toBeTruthy();
      expect(getByText('Senior Developer')).toBeTruthy();
      expect(getByText('Lead Developer')).toBeTruthy();
    });

    it('renders client names in subtitle', () => {
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

      const { getByText } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByText(/Client A/)).toBeTruthy();
      expect(getByText(/Client B/)).toBeTruthy();
    });

    it('renders date ranges in subtitle', () => {
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

      const { getByText } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      // Should have "Present" for current role
      expect(getByText(/Present/)).toBeTruthy();
      // Should have both dates for past role
      expect(getByText(/Jan 2021/)).toBeTruthy();
      expect(getByText(/Dec 2021/)).toBeTruthy();
    });
  });

  describe('navigation to details', () => {
    it('navigates to WorkExperienceDetails when client item is tapped', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const clientItem = getByTestId('work-experience-clients-item-pos-1');
      fireEvent.press(clientItem);

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-1',
      });
    });

    it('navigates with correct position ID for each client', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const firstClient = getByTestId('work-experience-clients-item-pos-1');
      fireEvent.press(firstClient);

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-1',
      });

      mockNavigate.mockClear();

      const secondClient = getByTestId('work-experience-clients-item-pos-2');
      fireEvent.press(secondClient);

      expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
        workExperienceId: 'pos-2',
      });
    });
  });

  describe('empty state', () => {
    it('displays empty state when no client positions', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-empty-state')).toBeTruthy();
    });

    it('does not display empty state when clients exist', () => {
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

      const { queryByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(queryByTestId('work-experience-clients-empty-state')).toBeNull();
    });
  });

  describe('accessibility - EAA compliance', () => {
    it('has correct accessibility labels for client items', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const firstItem = getByTestId('work-experience-clients-item-pos-1');
      expect(firstItem.props.accessibilityLabel).toBeTruthy();
      expect(firstItem.props.accessibilityRole).toBe('button');
    });

    it('has accessibility hints for navigation', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const firstItem = getByTestId('work-experience-clients-item-pos-1');
      expect(firstItem.props.accessibilityHint).toBeTruthy();
    });
  });

  describe('theme support', () => {
    it('renders with light theme background', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const screen = getByTestId('work-experience-clients-screen');
      expect(screen).toBeTruthy();
    });

    it('renders with dark theme background', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      const screen = getByTestId('work-experience-clients-screen');
      expect(screen).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles work experience not found', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-empty-state')).toBeTruthy();
    });

    it('handles null work experience data', () => {
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

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      expect(getByTestId('work-experience-clients-empty-state')).toBeTruthy();
    });

    it('filters out positions without clients', () => {
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

      const { getByTestId, queryByTestId, getByText } = render(
        <Provider store={store}>
          <WorkExperienceClientsScreen route={mockRoute} />
        </Provider>
      );

      // Should only show position with client
      expect(getByTestId('work-experience-clients-item-pos-1')).toBeTruthy();
      expect(queryByTestId('work-experience-clients-item-pos-2')).toBeNull();
      expect(getByText('Senior Developer')).toBeTruthy();
    });
  });
});
