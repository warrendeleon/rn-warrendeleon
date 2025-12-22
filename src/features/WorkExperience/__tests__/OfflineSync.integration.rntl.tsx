/**
 * Offline Sync Integration Tests - WorkExperience
 *
 * Tests for offline-first behaviour in work experience scenarios:
 * - Network unavailable during data fetch
 * - Network recovery and data sync
 * - Cached data display during offline
 * - Network state transitions
 *
 * These tests verify the application handles network
 * connectivity changes gracefully for work experience data.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import { offlineHandlers, server } from '@app/test-utils';
import type { WorkExperience } from '@app/types/portfolio';

import { WorkExperienceScreen } from '../WorkExperienceScreen';

const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
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
            testID: String(item.testID),
          },
          [mockReact.createElement(mockRN.Text, { key: 'label' }, String(item.label))]
        )
      )
    );
  };

  return {
    DetailListGroup: MockDetailListGroup,
  };
});

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
          tools: [],
          ci: null,
          methodology: [],
        },
      },
    ],
  },
  {
    id: 'work-2',
    company: 'BBC',
    logo: 'https://example.com/bbc.svg',
    positions: [
      {
        id: 'pos-2',
        title: 'React Native Developer',
        startDate: 'Jan 2022',
        endDate: 'Dec 2022',
        description: 'BBC Sounds app development',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript'],
          frameworks: ['React Native'],
          testing: {
            unit: ['Jest'],
            e2e: [],
          },
          tools: [],
          ci: null,
          methodology: [],
        },
      },
    ],
  },
];

const renderWorkExperienceScreen = (state: {
  data: WorkExperience[] | null;
  loading: boolean;
  error: string | null;
}) => {
  const store = mockStore({
    workExperience: state,
    settings: { theme: 'light', language: 'en' },
  });

  return render(
    <Provider store={store}>
      <WorkExperienceScreen />
    </Provider>
  );
};

describe('Offline Sync Integration - WorkExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('offline state handling', () => {
    it('should display cached work experience data when offline', () => {
      const { getByTestId, getByText } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
      // The label is the position title, not company name
      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
      expect(getByText('React Native Developer')).toBeOnTheScreen();
    });

    it('should show loading state when no cached data and offline', () => {
      const { getByTestId } = renderWorkExperienceScreen({
        data: null,
        loading: true,
        error: null,
      });

      expect(getByTestId('loading-state')).toBeOnTheScreen();
    });

    it('should display error when offline with no cached data', () => {
      const { getByTestId } = renderWorkExperienceScreen({
        data: null,
        loading: false,
        error: 'Network error',
      });

      // Error displays via the mock's error-state testID
      expect(getByTestId('error-state')).toBeOnTheScreen();
    });

    it('should show cached data when offline', () => {
      const { getByTestId, getByText } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
    });
  });

  describe('network recovery transitions', () => {
    it('should handle transition from loading to data', async () => {
      const { rerender, getByText } = renderWorkExperienceScreen({
        data: null,
        loading: true,
        error: null,
      });

      // Network recovers
      const updatedStore = mockStore({
        workExperience: { data: mockWorkExperienceData, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle transition from error to data', async () => {
      const { rerender, getByTestId, getByText } = renderWorkExperienceScreen({
        data: null,
        loading: false,
        error: 'Network error',
      });

      expect(getByTestId('error-state')).toBeOnTheScreen();

      // Network recovers
      const updatedStore = mockStore({
        workExperience: { data: mockWorkExperienceData, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should handle transition from data to error gracefully', () => {
      const { rerender, getByTestId, getByText } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();

      // Network fails - but we keep showing cached data with error
      const updatedStore = mockStore({
        workExperience: { data: mockWorkExperienceData, loading: false, error: 'Network error' },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={updatedStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Should still show cached data
      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
    });
  });

  describe('offline data persistence', () => {
    it('should handle component remount with cached data', () => {
      // First mount
      const { unmount, getByText } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
      unmount();

      // Remount with same cached data
      const { getByText: getByTextNew } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      expect(getByTextNew('Senior React Native Developer')).toBeOnTheScreen();
    });

    it('should preserve work experience state across rerenders', () => {
      const { rerender, getByText } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();

      // Multiple rerenders
      for (let i = 0; i < 3; i++) {
        const store = mockStore({
          workExperience: { data: mockWorkExperienceData, loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={store}>
            <WorkExperienceScreen />
          </Provider>
        );
      }

      // Data should still be visible
      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
      expect(getByText('React Native Developer')).toBeOnTheScreen();
    });
  });

  describe('MSW offline handler simulation', () => {
    it('should handle offline response from MSW', () => {
      server.use(...offlineHandlers);

      const { getByTestId } = renderWorkExperienceScreen({
        data: null,
        loading: false,
        error: 'Network error',
      });

      expect(getByTestId('error-state')).toBeOnTheScreen();
    });
  });

  describe('rapid network state changes', () => {
    it('should handle rapid online/offline transitions', () => {
      const { rerender, getByTestId } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      });

      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        // Offline
        const offlineStore = mockStore({
          workExperience: { data: mockWorkExperienceData, loading: false, error: 'Network error' },
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={offlineStore}>
            <WorkExperienceScreen />
          </Provider>
        );

        // Online
        const onlineStore = mockStore({
          workExperience: { data: mockWorkExperienceData, loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        });

        rerender(
          <Provider store={onlineStore}>
            <WorkExperienceScreen />
          </Provider>
        );
      }

      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
    });

    it('should handle loading interrupted by offline', () => {
      const { rerender, getByTestId } = renderWorkExperienceScreen({
        data: null,
        loading: true,
        error: null,
      });

      // Network fails during load
      const errorStore = mockStore({
        workExperience: { data: null, loading: false, error: 'Network error' },
        settings: { theme: 'light', language: 'en' },
      });

      rerender(
        <Provider store={errorStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(getByTestId('error-state')).toBeOnTheScreen();
    });
  });

  describe('partial data scenarios', () => {
    it('should handle work experience with empty positions', () => {
      const emptyPositionsData: WorkExperience[] = [
        {
          id: 'work-1',
          company: 'Sky',
          logo: 'https://example.com/sky.svg',
          positions: [],
        },
      ];

      const { getByTestId } = renderWorkExperienceScreen({
        data: emptyPositionsData,
        loading: false,
        error: null,
      });

      // Even with empty positions, an item is still created for the work experience
      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
      expect(getByTestId('items-container')).toBeOnTheScreen();
    });

    it('should handle single work experience entry', () => {
      const firstEntry = mockWorkExperienceData[0];
      if (!firstEntry) {
        throw new Error('Mock data not available');
      }
      const singleEntry: WorkExperience[] = [firstEntry];

      const { getByTestId, getByText, queryByText } = renderWorkExperienceScreen({
        data: singleEntry,
        loading: false,
        error: null,
      });

      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
      expect(getByText('Senior React Native Developer')).toBeOnTheScreen();
      expect(queryByText('React Native Developer')).toBeNull();
    });

    it('should handle empty work experience array', () => {
      const { getByTestId } = renderWorkExperienceScreen({
        data: [],
        loading: false,
        error: null,
      });

      expect(getByTestId('items-container-empty')).toBeOnTheScreen();
    });
  });

  describe('concurrent state updates', () => {
    it('should handle settings change while offline', () => {
      const { rerender, getByTestId } = renderWorkExperienceScreen({
        data: mockWorkExperienceData,
        loading: false,
        error: 'Network error',
      });

      // Settings change while offline
      const updatedStore = mockStore({
        workExperience: { data: mockWorkExperienceData, loading: false, error: 'Network error' },
        settings: { theme: 'dark', language: 'es' },
      });

      rerender(
        <Provider store={updatedStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-screen')).toBeOnTheScreen();
    });
  });
});
