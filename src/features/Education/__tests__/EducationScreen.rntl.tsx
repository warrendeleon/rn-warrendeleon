import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { Education } from '@app/types/portfolio';

import { EducationScreen } from '../EducationScreen';

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
          },
          mockReact.createElement(mockRN.Text, {}, String(item.label))
        )
      )
    );
  };

  return {
    DetailListGroup: MockDetailListGroup,
  };
});

describe('EducationScreen', () => {
  const mockEducationData: Education[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      institution: 'University A',
      title: 'Computer Science Degree',
      logo: 'university-a.svg',
      startDate: '2010-09',
      endDate: '2014-06',
      certificateUrl: 'https://example.com/cert1.pdf',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      institution: 'Online Course B',
      title: 'React Native Course',
      logo: 'udemy.svg',
      startDate: '2020-01',
      endDate: '2020-03',
      certificateUrl: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders education items when data is loaded', () => {
    const store = mockStore({
      education: {
        data: mockEducationData,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationScreen />
      </Provider>
    );

    expect(screen.getByText('Computer Science Degree')).toBeOnTheScreen();
    expect(screen.getByText('React Native Course')).toBeOnTheScreen();
  });

  it('navigates to WebView when education with certificate is tapped', async () => {
    const store = mockStore({
      education: {
        data: mockEducationData,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationScreen />
      </Provider>
    );

    const certItem = screen.getByTestId('education-item-university-a');
    fireEvent.press(certItem);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WebView', {
        uri: 'https://example.com/cert1.pdf',
      });
    });
  });

  it('does not navigate when education without certificate is tapped', () => {
    const store = mockStore({
      education: {
        data: mockEducationData,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationScreen />
      </Provider>
    );

    const noCertItem = screen.getByTestId('education-item-online-course-b');
    fireEvent.press(noCertItem);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays loading state', () => {
    const store = mockStore({
      education: {
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
        <EducationScreen />
      </Provider>
    );

    expect(screen.getByTestId('loading-state')).toBeOnTheScreen();
  });

  it('displays error state', () => {
    const errorMessage = 'Network error';
    const store = mockStore({
      education: {
        data: null,
        loading: false,
        error: errorMessage,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationScreen />
      </Provider>
    );

    expect(screen.getByTestId('error-state')).toBeOnTheScreen();
    expect(screen.getByText(errorMessage)).toBeOnTheScreen();
  });

  it('displays empty state when no data', () => {
    const store = mockStore({
      education: {
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
        <EducationScreen />
      </Provider>
    );

    expect(screen.getByText('No education data available')).toBeOnTheScreen();
  });

  it('fetches education data on mount', () => {
    const store = mockStore({
      education: {
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
        <EducationScreen />
      </Provider>
    );

    // dispatch is called with the thunk function, not the action object
    expect(dispatchSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });
});
