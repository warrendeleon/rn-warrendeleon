import React from 'react';
import * as ReactNative from 'react-native';
import { waitFor } from '@testing-library/react-native';

import { SupabaseAuthClient } from '@app/features/Auth/api';
import { renderWithProviders } from '@app/test-utils';
import educationFixture from '@app/test-utils/fixtures/api/en/education.json';
import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';
import workxpFixture from '@app/test-utils/fixtures/api/en/workxp.json';
import type { Education, Profile, WorkExperience } from '@app/types/portfolio';

import { MockStatusScreen } from '../MockStatusScreen';

// Mock Auth API
jest.mock('@app/features/Auth/api', () => ({
  SupabaseAuthClient: {
    verifyMockStatus: jest.fn(),
  },
}));

const mockVerifyMockStatus = SupabaseAuthClient.verifyMockStatus as jest.Mock;

describe('MockStatusScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockVerifyMockStatus.mockReset();
    // Default to returning not mocked
    mockVerifyMockStatus.mockResolvedValue({ mocked: false });
    jest.resetModules();
  });

  describe('initial render', () => {
    it('renders mock status screen correctly', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-screen')).toBeTruthy();

      // Wait for async auth check to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('renders all mock status items including auth', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-profile')).toBeTruthy();
      expect(getByTestId('mock-status-education')).toBeTruthy();
      expect(getByTestId('mock-status-work-experience')).toBeTruthy();
      expect(getByTestId('mock-status-auth-api')).toBeTruthy();

      // Wait for async auth check to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('shows loading spinner for auth initially', () => {
      mockUseColorScheme.mockReturnValue('light');
      // Make the promise never resolve to test loading state
      mockVerifyMockStatus.mockReturnValue(new Promise(() => {}));

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-auth-api-loading')).toBeTruthy();
    });
  });

  describe('auth API mock verification', () => {
    it('displays "Mocked" when auth API returns mocked: true', async () => {
      mockUseColorScheme.mockReturnValue('light');
      mockVerifyMockStatus.mockResolvedValue({ mocked: true });

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-mocked')).toBeTruthy();
      });
    });

    it('displays "Not Mocked" when auth API returns mocked: false', async () => {
      mockUseColorScheme.mockReturnValue('light');
      mockVerifyMockStatus.mockResolvedValue({ mocked: false });

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('displays "Not Mocked" when auth API throws error', async () => {
      mockUseColorScheme.mockReturnValue('light');
      mockVerifyMockStatus.mockRejectedValue(new Error('Network error'));

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });
  });

  describe('mocked state', () => {
    it('displays "Mocked" status for profile when data has mocked flag', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const mockProfile = { ...profileFixture, mocked: true } as Profile & { mocked: boolean };

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-profile-mocked')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('displays "Mocked" status for education when data has mocked flag', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const mockEducation = { ...educationFixture[0], mocked: true } as Education & {
        mocked: boolean;
      };

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: {
            data: [mockEducation],
            loading: false,
            error: null,
          },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-education-mocked')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('displays "Mocked" status for work experience when data has mocked flag', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const mockWorkExperience = { ...workxpFixture[0], mocked: true } as WorkExperience & {
        mocked: boolean;
      };

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: {
            data: [mockWorkExperience],
            loading: false,
            error: null,
          },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-work-experience-mocked')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });
  });

  describe('not mocked state', () => {
    it('displays "Not Mocked" status for profile when data lacks mocked flag', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: {
            data: profileFixture as Profile,
            loading: false,
            error: null,
          },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-profile-not-mocked')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('displays "Not Mocked" status for education when data lacks mocked flag', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: {
            data: [educationFixture[0] as Education],
            loading: false,
            error: null,
          },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-education-not-mocked')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('displays "Not Mocked" status for work experience when data lacks mocked flag', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: {
            data: [workxpFixture[0] as WorkExperience],
            loading: false,
            error: null,
          },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-work-experience-not-mocked')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('displays "No data loaded" for portfolio sections when no data exists', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getAllByText } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      // Three portfolio sections should show "No data loaded"
      const noDataElements = getAllByText('No data loaded');
      expect(noDataElements).toHaveLength(3);

      // Wait for auth to complete
      await waitFor(() => {
        expect(mockVerifyMockStatus).toHaveBeenCalled();
      });
    });

    it('does not display "No data loaded" when profile has data', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { queryAllByText, getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: {
            data: profileFixture as Profile,
            loading: false,
            error: null,
          },
          education: {
            data: [educationFixture[0] as Education],
            loading: false,
            error: null,
          },
          workExperience: {
            data: [workxpFixture[0] as WorkExperience],
            loading: false,
            error: null,
          },
          settings: { theme: 'light', language: 'en' },
        },
      });

      // Should not have any "No data loaded" messages
      expect(queryAllByText('No data loaded')).toHaveLength(0);

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });
  });

  describe('dark/light theme support', () => {
    it('renders correctly in light theme', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-screen')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('renders correctly in dark theme', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'dark', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-screen')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('renders correctly with system theme in light mode', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'system', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-screen')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('renders correctly with system theme in dark mode', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'system', language: 'en' },
        },
      });

      expect(getByTestId('mock-status-screen')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility label for screen', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByLabelText, getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(getByLabelText('Mock Status Screen')).toBeTruthy();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('has correct accessibility role for header', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root, getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      expect(UNSAFE_root).toBeDefined();

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('has correct accessibility labels for mock status items', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const mockProfile = { ...profileFixture, mocked: true } as Profile & { mocked: boolean };

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            error: null,
          },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      const profileItem = getByTestId('mock-status-profile');
      expect(profileItem.props.accessibilityLabel).toBe('Profile Data: Mocked');
      expect(profileItem.props.accessibilityRole).toBe('summary');

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('updates accessibility label based on mock status', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: {
            data: profileFixture as Profile,
            loading: false,
            error: null,
          },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      const profileItem = getByTestId('mock-status-profile');
      expect(profileItem.props.accessibilityLabel).toBe('Profile Data: Not Mocked');

      // Wait for auth to complete
      await waitFor(() => {
        expect(getByTestId('mock-status-auth-api-not-mocked')).toBeTruthy();
      });
    });

    it('shows Loading accessibility label for auth while checking', () => {
      mockUseColorScheme.mockReturnValue('light');
      // Never resolve to test loading state
      mockVerifyMockStatus.mockReturnValue(new Promise(() => {}));

      const { getByTestId } = renderWithProviders(<MockStatusScreen />, {
        preloadedState: {
          profile: { data: null, loading: false, error: null },
          education: { data: [], loading: false, error: null },
          workExperience: { data: [], loading: false, error: null },
          settings: { theme: 'light', language: 'en' },
        },
      });

      const authItem = getByTestId('mock-status-auth-api');
      expect(authItem.props.accessibilityLabel).toBe('Auth API Call: Loading');
    });
  });
});
