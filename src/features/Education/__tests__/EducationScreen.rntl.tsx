import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import type { Education } from '@app/types/portfolio';

import { EducationScreen } from '../EducationScreen';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockStore = configureStore([thunk as any]);

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

// Mock education logos
jest.mock('@app/assets/svg/logos/education', () => ({
  educationLogos: {
    'university-a': 123,
    udemy: 456,
  },
}));

// Mock MenuButtonGroupSvg
jest.mock('@app/components', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');

  return {
    MenuButtonGroupSvg: jest.fn(({ items, loading, error }) => {
      if (loading) return React.createElement(RN.View, { testID: 'loading-state' });
      if (error)
        return React.createElement(
          RN.View,
          { testID: 'error-state' },
          React.createElement(RN.Text, {}, error)
        );
      return React.createElement(
        RN.View,
        { testID: 'items-container' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.map((item: any) =>
          React.createElement(
            RN.TouchableOpacity,
            { key: item.id, onPress: item.onPress, testID: item.testID },
            React.createElement(RN.Text, {}, item.label)
          )
        )
      );
    }),
  };
});

describe('EducationScreen', () => {
  const mockEducationData: Education[] = [
    {
      location: 'University A',
      title: 'Computer Science Degree',
      logo: 'university-a.svg',
      start: '2010-09-01',
      end: '2014-06-30',
      certificate: 'https://example.com/cert1.pdf',
    },
    {
      location: 'Online Course B',
      title: 'React Native Course',
      logo: 'udemy.svg',
      start: '2020-01-01',
      end: '2020-03-31',
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
        title: 'Certificate',
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

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: expect.stringContaining('fetchEducation') })
    );
  });
});
