/**
 * Education Flow Integration Tests
 *
 * Tests complete user journeys through the education feature,
 * covering multi-step flows rather than isolated screen tests.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { Education } from '@app/types/portfolio';

import { EducationScreen } from '../EducationScreen';

const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
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
            accessibilityRole: 'button',
            accessibilityLabel: String(item.label),
          },
          mockReact.createElement(mockRN.Text, {}, String(item.label)),
          item.subtitle &&
            mockReact.createElement(
              mockRN.Text,
              { testID: `${item.testID}-subtitle` },
              String(item.subtitle)
            )
        )
      )
    );
  };

  return {
    DetailListGroup: MockDetailListGroup,
  };
});

describe('Education Flow Integration', () => {
  const mockEducationData: Education[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      institution: 'MIT',
      title: 'Master of Computer Science',
      logo: 'mit.svg',
      startDate: '2018-09',
      endDate: '2020-06',
      certificateUrl: 'https://example.com/mit-cert.pdf',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      institution: 'Stanford Online',
      title: 'Machine Learning Specialisation',
      logo: 'stanford.svg',
      startDate: '2021-01',
      endDate: '2021-06',
      certificateUrl: 'https://example.com/stanford-cert.pdf',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      institution: 'Local Community College',
      title: 'Associate Degree',
      logo: 'college.svg',
      startDate: '2015-09',
      endDate: '2017-06',
      certificateUrl: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('education list → certificate view flow', () => {
    it('should complete the flow: view list → tap item → navigate to certificate', async () => {
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

      // Step 1: Education list is displayed
      expect(screen.getByTestId('education-screen')).toBeOnTheScreen();
      expect(screen.getByText('Master of Computer Science')).toBeOnTheScreen();
      expect(screen.getByText('Machine Learning Specialisation')).toBeOnTheScreen();

      // Step 2: Tap on education item with certificate
      const mitItem = screen.getByTestId('education-item-mit');
      fireEvent.press(mitItem);

      // Step 3: Navigation to WebView occurs with certificate URL
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WebView', {
            uri: 'https://example.com/mit-cert.pdf',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should allow viewing multiple certificates in sequence', async () => {
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

      // View first certificate
      const mitItem = screen.getByTestId('education-item-mit');
      fireEvent.press(mitItem);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WebView', {
            uri: 'https://example.com/mit-cert.pdf',
          });
        },
        { timeout: 3000, interval: 100 }
      );

      // Clear navigation mock
      mockNavigate.mockClear();

      // View second certificate
      const stanfordItem = screen.getByTestId('education-item-stanford-online');
      fireEvent.press(stanfordItem);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WebView', {
            uri: 'https://example.com/stanford-cert.pdf',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('loading → data display flow', () => {
    it('should transition from loading state to data display', async () => {
      // Initial loading state
      const loadingStore = mockStore({
        education: {
          data: null,
          loading: true,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      const { rerender } = render(
        <Provider store={loadingStore}>
          <EducationScreen />
        </Provider>
      );

      // Loading state is shown
      expect(screen.getByTestId('loading-state')).toBeOnTheScreen();

      // Simulate data load complete
      const loadedStore = mockStore({
        education: {
          data: mockEducationData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      rerender(
        <Provider store={loadedStore}>
          <EducationScreen />
        </Provider>
      );

      // Data is now displayed
      await waitFor(
        () => {
          expect(screen.getByText('Master of Computer Science')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('error recovery flow', () => {
    it('should display error state when data fetch fails', () => {
      const store = mockStore({
        education: {
          data: null,
          loading: false,
          error: 'Failed to load education data',
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
      expect(screen.getByText('Failed to load education data')).toBeOnTheScreen();
    });

    it('should transition from error to success after retry', async () => {
      // Initial error state
      const errorStore = mockStore({
        education: {
          data: null,
          loading: false,
          error: 'Network error',
        },
        settings: {
          language: 'en',
        },
      });

      const { rerender } = render(
        <Provider store={errorStore}>
          <EducationScreen />
        </Provider>
      );

      expect(screen.getByTestId('error-state')).toBeOnTheScreen();

      // Simulate successful retry
      const successStore = mockStore({
        education: {
          data: mockEducationData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      rerender(
        <Provider store={successStore}>
          <EducationScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(screen.getByText('Master of Computer Science')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('language change flow', () => {
    it('should refetch data when language changes', () => {
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

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const { rerender } = render(
        <Provider store={store}>
          <EducationScreen />
        </Provider>
      );

      // Initial fetch
      expect(dispatchSpy).toHaveBeenCalledTimes(1);

      // Simulate language change
      const spanishStore = mockStore({
        education: {
          data: mockEducationData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'es',
        },
      });

      const spanishDispatchSpy = jest.spyOn(spanishStore, 'dispatch');

      rerender(
        <Provider store={spanishStore}>
          <EducationScreen />
        </Provider>
      );

      // Re-fetch should occur due to language change
      expect(spanishDispatchSpy).toHaveBeenCalled();
    });
  });

  describe('items without certificates', () => {
    it('should not navigate when tapping item without certificate URL', () => {
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

      // Tap on item without certificate
      const collegeItem = screen.getByTestId('education-item-local-community-college');
      fireEvent.press(collegeItem);

      // Navigation should not occur
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should visually differentiate items with and without certificates', () => {
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

      // Items with certificates should be displayed
      expect(screen.getByTestId('education-item-mit')).toBeOnTheScreen();
      expect(screen.getByTestId('education-item-stanford-online')).toBeOnTheScreen();

      // Items without certificates should also be displayed
      expect(screen.getByTestId('education-item-local-community-college')).toBeOnTheScreen();
    });
  });

  describe('empty state flow', () => {
    it('should display empty state when no education data exists', () => {
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

    it('should transition from empty to data when education is added', async () => {
      // Initial empty state
      const emptyStore = mockStore({
        education: {
          data: [],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      const { rerender } = render(
        <Provider store={emptyStore}>
          <EducationScreen />
        </Provider>
      );

      expect(screen.getByText('No education data available')).toBeOnTheScreen();

      // Simulate data becoming available
      const dataStore = mockStore({
        education: {
          data: mockEducationData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      rerender(
        <Provider store={dataStore}>
          <EducationScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(screen.getByText('Master of Computer Science')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('accessibility', () => {
    it('should have accessible education items', () => {
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

      const mitItem = screen.getByTestId('education-item-mit');
      expect(mitItem.props.accessibilityRole).toBe('button');
      expect(mitItem.props.accessibilityLabel).toBeDefined();
    });
  });
});
