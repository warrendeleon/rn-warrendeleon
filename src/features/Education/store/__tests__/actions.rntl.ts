import type { InternalAxiosRequestConfig } from 'axios';

import * as api from '@app/features/Education/api/api';
import type { RootState } from '@app/store';
import mockEducationData from '@app/test-utils/fixtures/api/en/education.json';

import { fetchEducation } from '../actions';

// Mock the API
jest.mock('@app/features/Education/api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Education actions', () => {
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

  describe('fetchEducation', () => {
    it('dispatches pending and fulfilled on success', async () => {
      mockedApi.fetchEducationData.mockResolvedValue({
        data: mockEducationData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      const result = await fetchEducation()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('education/fetchEducation/fulfilled');
      expect(result.payload).toEqual(mockEducationData);
    });

    it('dispatches pending and rejected on error', async () => {
      const errorMessage = 'Network error';
      mockedApi.fetchEducationData.mockRejectedValue(new Error(errorMessage));

      const result = await fetchEducation()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('education/fetchEducation/rejected');
      if ('error' in result) {
        expect(result.error.message).toBe(errorMessage);
      }
    });

    it('passes language parameter to API', async () => {
      mockedApi.fetchEducationData.mockResolvedValue({
        data: mockEducationData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      await fetchEducation()(mockDispatch, mockGetState, undefined);

      expect(mockedApi.fetchEducationData).toHaveBeenCalledWith('en');
    });

    it('uses correct language from Redux state', async () => {
      mockedApi.fetchEducationData.mockResolvedValue({
        data: mockEducationData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      await fetchEducation()(mockDispatch, mockGetState, undefined);

      expect(mockedApi.fetchEducationData).toHaveBeenCalledWith('en');
    });
  });
});
