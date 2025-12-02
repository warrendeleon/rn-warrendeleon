import type { InternalAxiosRequestConfig } from 'axios';

import * as api from '@app/features/Profile/api/api';
import type { RootState } from '@app/store';
import mockProfileData from '@app/test-utils/fixtures/api/en/profile.json';

import { fetchProfile } from '../actions';

// Mock the API
jest.mock('@app/features/Profile/api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Profile actions', () => {
  const mockDispatch = jest.fn();
  const mockGetState = jest.fn<RootState, []>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({
      settings: {
        language: 'en',
        theme: 'light',
      },
    } as RootState);
  });

  describe('fetchProfile', () => {
    it('dispatches pending and fulfilled on success', async () => {
      mockedApi.fetchProfileData.mockResolvedValue({
        data: mockProfileData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      const result = await fetchProfile()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('profile/fetchProfile/fulfilled');
      expect(result.payload).toEqual(mockProfileData);
    });

    it('dispatches pending and rejected on error', async () => {
      const errorMessage = 'Network error';
      mockedApi.fetchProfileData.mockRejectedValue(new Error(errorMessage));

      const result = await fetchProfile()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('profile/fetchProfile/rejected');
      if ('error' in result) {
        expect(result.error.message).toBe(errorMessage);
      }
    });

    it('passes language parameter to API', async () => {
      mockedApi.fetchProfileData.mockResolvedValue({
        data: mockProfileData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      await fetchProfile()(mockDispatch, mockGetState, undefined);

      expect(mockedApi.fetchProfileData).toHaveBeenCalledWith('en');
    });

    it('uses correct language from Redux state', async () => {
      mockedApi.fetchProfileData.mockResolvedValue({
        data: mockProfileData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      await fetchProfile()(mockDispatch, mockGetState, undefined);

      expect(mockedApi.fetchProfileData).toHaveBeenCalledWith('en');
    });
  });
});
