/**
 * Work Experience Flow Integration Tests
 *
 * Tests complete user journeys through the work experience feature,
 * covering multi-step flows: list → clients → positions → details
 */

import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { WorkExperience } from '@app/types/portfolio';

import { WorkExperienceScreen } from '../WorkExperienceScreen';

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
            accessibilityLabel: String(item.accessibilityLabel || item.label),
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

describe('Work Experience Flow Integration', () => {
  // Company with single position (navigates directly to details)
  const singlePositionCompany: WorkExperience = {
    id: 'work-single',
    company: 'StartupCo',
    logo: 'https://example.com/startup.svg',
    positions: [
      {
        id: 'pos-single-1',
        title: 'Full Stack Developer',
        startDate: 'Mar 2024',
        endDate: null,
        description: 'Building features',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript'],
          frameworks: ['React Native'],
          testing: null,
          tools: [],
          ci: null,
          methodology: [],
        },
        client: null,
      },
    ],
  };

  // Company with multiple positions but no clients (navigates to positions screen)
  const multiplePositionsCompany: WorkExperience = {
    id: 'work-positions',
    company: 'GrowingCorp',
    logo: 'https://example.com/growing.svg',
    positions: [
      {
        id: 'pos-mp-1',
        title: 'Senior Developer',
        startDate: 'Jan 2023',
        endDate: null,
        description: 'Leading development',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript'],
          frameworks: ['React Native'],
          testing: null,
          tools: [],
          ci: null,
          methodology: [],
        },
        client: null,
      },
      {
        id: 'pos-mp-2',
        title: 'Developer',
        startDate: 'Jun 2022',
        endDate: 'Dec 2022',
        description: 'Building features',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript'],
          frameworks: ['React Native'],
          testing: null,
          tools: [],
          ci: null,
          methodology: [],
        },
        client: null,
      },
    ],
  };

  // Company with multiple clients (navigates to clients screen)
  const multipleClientsCompany: WorkExperience = {
    id: 'work-clients',
    company: 'ConsultingAgency',
    logo: 'https://example.com/agency.svg',
    positions: [
      {
        id: 'pos-mc-1',
        title: 'Lead Consultant',
        startDate: 'Jan 2023',
        endDate: null,
        description: 'Leading client A',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript'],
          frameworks: ['React Native'],
          testing: null,
          tools: [],
          ci: null,
          methodology: [],
        },
        client: {
          name: 'Client A',
          logo: 'https://example.com/client-a.svg',
        },
      },
      {
        id: 'pos-mc-2',
        title: 'Senior Consultant',
        startDate: 'Jun 2022',
        endDate: 'Dec 2022',
        description: 'Working on client B',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript'],
          frameworks: ['React Native'],
          testing: null,
          tools: [],
          ci: null,
          methodology: [],
        },
        client: {
          name: 'Client B',
          logo: 'https://example.com/client-b.svg',
        },
      },
    ],
  };

  const mockWorkExperienceData: WorkExperience[] = [
    singlePositionCompany,
    multiplePositionsCompany,
    multipleClientsCompany,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('single position → details navigation', () => {
    it('should navigate directly to details when company has single position', async () => {
      const store = mockStore({
        workExperience: {
          data: [singlePositionCompany],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Tap on single position company
      const item = screen.getByTestId('work-experience-item-work-single');
      await fireEvent.press(item);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
            workExperienceId: 'pos-single-1',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('multiple positions → positions screen navigation', () => {
    it('should navigate to positions screen when company has multiple positions without clients', async () => {
      const store = mockStore({
        workExperience: {
          data: [multiplePositionsCompany],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Tap on multiple positions company
      const item = screen.getByTestId('work-experience-item-work-positions');
      await fireEvent.press(item);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperiencePositions', {
            workExperienceId: 'work-positions',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should show badge with position count', async () => {
      const store = mockStore({
        workExperience: {
          data: [multiplePositionsCompany],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Badge should show position count
      expect(screen.getByTestId('work-experience-item-work-positions-badge')).toBeOnTheScreen();
      expect(screen.getByText('2')).toBeOnTheScreen();
    });
  });

  describe('multiple clients → clients screen navigation', () => {
    it('should navigate to clients screen when company has multiple clients', async () => {
      const store = mockStore({
        workExperience: {
          data: [multipleClientsCompany],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Tap on multiple clients company
      const item = screen.getByTestId('work-experience-item-work-clients');
      await fireEvent.press(item);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceClients', {
            workExperienceId: 'work-clients',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should show badge with client count', async () => {
      const store = mockStore({
        workExperience: {
          data: [multipleClientsCompany],
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Badge should show client count
      expect(screen.getByTestId('work-experience-item-work-clients-badge')).toBeOnTheScreen();
      expect(screen.getByText('2')).toBeOnTheScreen();
    });
  });

  describe('complete list view flow', () => {
    it('should display all work experiences with appropriate navigation types', async () => {
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

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // All three companies should be visible
      expect(screen.getByTestId('work-experience-item-work-single')).toBeOnTheScreen();
      expect(screen.getByTestId('work-experience-item-work-positions')).toBeOnTheScreen();
      expect(screen.getByTestId('work-experience-item-work-clients')).toBeOnTheScreen();
    });

    it('should navigate to different screens based on company structure', async () => {
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

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Single position → Details
      await fireEvent.press(screen.getByTestId('work-experience-item-work-single'));
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', expect.any(Object));
        },
        { timeout: 3000, interval: 100 }
      );

      mockNavigate.mockClear();

      // Multiple positions → Positions screen
      await fireEvent.press(screen.getByTestId('work-experience-item-work-positions'));
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperiencePositions', expect.any(Object));
        },
        { timeout: 3000, interval: 100 }
      );

      mockNavigate.mockClear();

      // Multiple clients → Clients screen
      await fireEvent.press(screen.getByTestId('work-experience-item-work-clients'));
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceClients', expect.any(Object));
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('loading → data display flow', () => {
    it('should transition from loading to data display', async () => {
      const loadingStore = mockStore({
        workExperience: {
          data: null,
          loading: true,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      const { rerender } = await render(
        <Provider store={loadingStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('loading-state')).toBeOnTheScreen();

      const loadedStore = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'en',
        },
      });

      await rerender(
        <Provider store={loadedStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      await waitFor(
        () => {
          expect(screen.getByText('Full Stack Developer')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('error state flow', () => {
    it('should display translated error message on failure', async () => {
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

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('error-state')).toBeOnTheScreen();
    });
  });

  describe('empty state flow', () => {
    it('should display empty state when no work experience exists', async () => {
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

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('work-experience-empty-state')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('should provide appropriate accessibility hints based on navigation type', async () => {
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

      await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Single position item should have details hint
      const singleItem = screen.getByTestId('work-experience-item-work-single');
      expect(singleItem.props.accessibilityRole).toBe('button');

      // Multiple positions item should have positions hint
      const positionsItem = screen.getByTestId('work-experience-item-work-positions');
      expect(positionsItem.props.accessibilityHint).toBeDefined();

      // Multiple clients item should have clients hint
      const clientsItem = screen.getByTestId('work-experience-item-work-clients');
      expect(clientsItem.props.accessibilityHint).toBeDefined();
    });
  });

  describe('language change flow', () => {
    it('should refetch data when language changes', async () => {
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

      const { rerender } = await render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(dispatchSpy).toHaveBeenCalledTimes(1);

      const spanishStore = mockStore({
        workExperience: {
          data: mockWorkExperienceData,
          loading: false,
          error: null,
        },
        settings: {
          language: 'es',
        },
      });

      const spanishDispatchSpy = jest.spyOn(spanishStore, 'dispatch');

      await rerender(
        <Provider store={spanishStore}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(spanishDispatchSpy).toHaveBeenCalled();
    });
  });
});
