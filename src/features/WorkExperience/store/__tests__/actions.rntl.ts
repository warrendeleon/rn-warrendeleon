import type { InternalAxiosRequestConfig } from 'axios';

import type { RootState } from '@app/store';
import mockWorkExperienceData from '@app/test-utils/fixtures/api/en/workxp.json';

import * as api from '../../api/api';
import { fetchWorkExperience } from '../actions';

// Mock the API
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('WorkExperience actions', () => {
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

  describe('fetchWorkExperience', () => {
    it('dispatches pending and fulfilled on success', async () => {
      mockedApi.fetchWorkExperienceData.mockResolvedValue({
        data: mockWorkExperienceData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      const result = await fetchWorkExperience()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('workExperience/fetchWorkExperience/fulfilled');
      expect(result.payload).toEqual(mockWorkExperienceData);
    });

    it('dispatches pending and rejected on error', async () => {
      const errorMessage = 'Network error';
      mockedApi.fetchWorkExperienceData.mockRejectedValue(new Error(errorMessage));

      const result = await fetchWorkExperience()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('workExperience/fetchWorkExperience/rejected');
      if ('error' in result) {
        expect(result.error.message).toBe(errorMessage);
      }
    });

    it('passes language parameter to API', async () => {
      mockedApi.fetchWorkExperienceData.mockResolvedValue({
        data: mockWorkExperienceData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      await fetchWorkExperience()(mockDispatch, mockGetState, undefined);

      expect(mockedApi.fetchWorkExperienceData).toHaveBeenCalledWith('en');
    });

    it('uses correct language from Redux state', async () => {
      mockedApi.fetchWorkExperienceData.mockResolvedValue({
        data: mockWorkExperienceData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      await fetchWorkExperience()(mockDispatch, mockGetState, undefined);

      expect(mockedApi.fetchWorkExperienceData).toHaveBeenCalledWith('en');
    });
  });
});
