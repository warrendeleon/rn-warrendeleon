import React from 'react';
import * as ReactNative from 'react-native';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';

import type { Position, WorkExperience } from '@app/types/portfolio';

import {
  getWorkExperienceDetailsStyles,
  WorkExperienceDetailsScreen,
} from '../WorkExperienceDetailsScreen';

const middlewares = [jest.requireActual('redux-thunk').thunk];
const mockStore = configureStore(middlewares);

// Mock SvgUri from react-native-svg
jest.mock('react-native-svg', () => ({
  SvgUri: 'SvgUri',
}));

// Mock react-native-localize for date formatting
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en', countryCode: 'US' }],
  getTimeZone: () => 'America/New_York',
  getCalendar: () => 'gregorian',
  uses24HourClock: () => false,
}));

// Mock navigation
const mockUseRoute = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockUseRoute(),
}));

describe('WorkExperienceDetailsScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseRoute.mockReset();
    mockUseRoute.mockReturnValue(mockRoute);
  });

  const mockWorkExperienceWithTech: WorkExperience = {
    id: 'work-exp-1',
    company: 'Tech Company',
    positions: [
      {
        id: 'pos-1',
        title: 'Senior Developer',
        startDate: '2022-01',
        endDate: null,
        description: 'Leading development of mobile applications',
        responsibilities: null,
        technologies: {
          languages: ['TypeScript', 'JavaScript'],
          frameworks: ['React Native', 'React'],
          testing: {
            unit: ['Jest', 'React Testing Library'],
            e2e: ['Detox'],
          },
          tools: ['Git', 'VS Code'],
          ci: ['GitHub Actions'],
          methodology: ['Scrum', 'Agile'],
        },
      },
    ],
  };

  const mockWorkExperienceWithResponsibilities: WorkExperience = {
    id: 'work-exp-2',
    company: 'Manager Company',
    positions: [
      {
        id: 'pos-2',
        title: 'Engineering Manager',
        startDate: '2020-01',
        endDate: '2021-12',
        description: 'Managing a team of engineers',
        responsibilities: [
          'Lead team of 5 engineers',
          'Conduct performance reviews',
          'Define technical strategy',
        ],
        technologies: null,
      },
    ],
  };

  const mockRoute = {
    key: 'test-key',
    name: 'WorkExperienceDetails' as const,
    params: {
      workExperienceId: 'pos-1',
    },
  };

  describe('getWorkExperienceDetailsStyles helper', () => {
    it('returns light theme styles', () => {
      const styles = getWorkExperienceDetailsStyles('light');

      expect(styles.container.backgroundColor).toBe('#F2F2F7');
      expect(styles.cardBackground.backgroundColor).toBe('#FFFFFF');
      expect(styles.textPrimary.color).toBe('#000000');
      expect(styles.textSecondary.color).toBe('#666666');
    });

    it('returns dark theme styles', () => {
      const styles = getWorkExperienceDetailsStyles('dark');

      expect(styles.container.backgroundColor).toBe('#000000');
      expect(styles.cardBackground.backgroundColor).toBe('#1C1C1E');
      expect(styles.textPrimary.color).toBe('#FFFFFF');
      expect(styles.textSecondary.color).toBe('#A1A1A6');
    });

    it('returns correct border colors for light theme', () => {
      const styles = getWorkExperienceDetailsStyles('light');
      expect(styles.borderColor.borderColor).toBe('#E5E5EA');
    });

    it('returns correct border colors for dark theme', () => {
      const styles = getWorkExperienceDetailsStyles('dark');
      expect(styles.borderColor.borderColor).toBe('#3A3A3C');
    });

    it('returns correct tag styles for light theme', () => {
      const styles = getWorkExperienceDetailsStyles('light');
      expect(styles.tagBackground.backgroundColor).toBe('#E8E8ED');
      expect(styles.tagText.color).toBe('#000000');
    });

    it('returns correct tag styles for dark theme', () => {
      const styles = getWorkExperienceDetailsStyles('dark');
      expect(styles.tagBackground.backgroundColor).toBe('#2C2C2E');
      expect(styles.tagText.color).toBe('#FFFFFF');
    });
  });

  describe('initial render', () => {
    it('renders work experience details screen', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-screen')).toBeOnTheScreen();
    });

    it('displays company name', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-company-name')).toHaveTextContent('Tech Company');
    });

    it('displays position title', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-position')).toHaveTextContent('Senior Developer');
    });

    it('displays date range', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-date-range')).toBeOnTheScreen();
    });
  });

  describe('not found state', () => {
    it('displays not found message when position does not exist', () => {
      mockUseColorScheme.mockReturnValue('light');

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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-not-found')).toBeOnTheScreen();
    });
  });

  describe('description card', () => {
    it('displays description when present', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-description-card')).toBeOnTheScreen();
      expect(getByTestId('work-experience-details-description-text')).toHaveTextContent(
        'Leading development of mobile applications'
      );
    });

    it('does not display description card when not present', () => {
      mockUseColorScheme.mockReturnValue('light');

      const basePosition = mockWorkExperienceWithTech.positions[0]!;
      const position: Position = {
        id: basePosition.id,
        title: basePosition.title,
        startDate: basePosition.startDate,
        endDate: basePosition.endDate,
        description: '',
        responsibilities: basePosition.responsibilities,
        technologies: basePosition.technologies,
      };
      const workExpWithoutDescription: WorkExperience = {
        ...mockWorkExperienceWithTech,
        positions: [position],
      };

      const store = mockStore({
        workExperience: {
          data: [workExpWithoutDescription],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(queryByTestId('work-experience-details-description-card')).toBeNull();
    });
  });

  describe('technology sections', () => {
    it('displays tech card when technologies exist', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-tech-card')).toBeOnTheScreen();
    });

    it('renders programming languages tags', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByText('TypeScript')).toBeOnTheScreen();
      expect(getByText('JavaScript')).toBeOnTheScreen();
    });

    it('renders framework tags', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByText('React Native')).toBeOnTheScreen();
      expect(getByText('React')).toBeOnTheScreen();
    });

    it('does not display tech card when no technologies', () => {
      mockUseColorScheme.mockReturnValue('light');

      const basePosition = mockWorkExperienceWithTech.positions[0]!;
      const position: Position = {
        id: basePosition.id,
        title: basePosition.title,
        startDate: basePosition.startDate,
        endDate: basePosition.endDate,
        description: basePosition.description,
        responsibilities: basePosition.responsibilities,
        technologies: null,
      };
      const workExpWithoutTech: WorkExperience = {
        ...mockWorkExperienceWithTech,
        positions: [position],
      };

      const store = mockStore({
        workExperience: {
          data: [workExpWithoutTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(queryByTestId('work-experience-details-tech-card')).toBeNull();
    });
  });

  describe('responsibilities section', () => {
    it('displays responsibilities card when present', () => {
      mockUseColorScheme.mockReturnValue('light');

      const routeWithManager = {
        ...mockRoute,
        params: { workExperienceId: 'pos-2' },
      };

      mockUseRoute.mockReturnValue(routeWithManager);

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithResponsibilities],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-responsibilities-card')).toBeOnTheScreen();
      expect(getByTestId('work-experience-details-responsibilities-section')).toBeOnTheScreen();
    });

    it('renders all responsibility items', () => {
      mockUseColorScheme.mockReturnValue('light');

      const routeWithManager = {
        ...mockRoute,
        params: { workExperienceId: 'pos-2' },
      };

      mockUseRoute.mockReturnValue(routeWithManager);

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithResponsibilities],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByText('Lead team of 5 engineers')).toBeOnTheScreen();
      expect(getByText('Conduct performance reviews')).toBeOnTheScreen();
      expect(getByText('Define technical strategy')).toBeOnTheScreen();
    });

    it('does not display responsibilities card when not present', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(queryByTestId('work-experience-details-responsibilities-card')).toBeNull();
    });
  });

  describe('logo rendering', () => {
    it('does not display logo card when logo not present', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(queryByTestId('work-experience-details-logo-card')).toBeNull();
    });
  });

  describe('dark/light theme support', () => {
    it('renders correctly in light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-screen')).toBeOnTheScreen();
    });

    it('renders correctly in dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-screen')).toBeOnTheScreen();
    });

    it('renders correctly with system theme in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'system',
          language: 'en',
        },
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-screen')).toBeOnTheScreen();
    });

    it('renders correctly with system theme in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
          loading: false,
          error: null,
        },
        settings: {
          theme: 'system',
          language: 'en',
        },
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      expect(getByTestId('work-experience-details-screen')).toBeOnTheScreen();
    });
  });

  describe('accessibility - EAA compliance', () => {
    it('has correct accessibility role for header card', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      const headerCard = getByTestId('work-experience-details-header-card');
      expect(headerCard.props.accessibilityRole).toBe('header');
    });

    it('has correct accessibility label for company name', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      const companyName = getByTestId('work-experience-details-company-name');
      expect(companyName.props.accessibilityRole).toBe('header');
      expect(companyName.props.accessibilityLabel).toBe('Tech Company');
    });

    it('has correct accessibility label for position', () => {
      mockUseColorScheme.mockReturnValue('light');

      const store = mockStore({
        workExperience: {
          data: [mockWorkExperienceWithTech],
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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      const position = getByTestId('work-experience-details-position');
      expect(position.props.accessibilityRole).toBe('text');
      expect(position.props.accessibilityLabel).toBe('Position: Senior Developer');
    });

    it('has correct accessibility role for not found state', () => {
      mockUseColorScheme.mockReturnValue('light');

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
          <WorkExperienceDetailsScreen />
        </Provider>
      );

      const notFound = getByTestId('work-experience-details-not-found');
      expect(notFound.props.accessibilityRole).toBe('alert');
      expect(notFound.props.accessibilityLabel).toBe('Work experience not found');
    });
  });
});
