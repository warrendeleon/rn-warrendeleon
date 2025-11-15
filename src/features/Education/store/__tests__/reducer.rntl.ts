import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

import educationFixture from '@app/test-utils/fixtures/api/en/education.json';

import { fetchEducation } from '../actions';
import { clearEducation, educationReducer, type EducationState } from '../reducer';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('educationReducer', () => {
  const initialState: EducationState = {
    data: [],
    loading: false,
    error: null,
  };

  it('returns the initial state', () => {
    expect(educationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('clearEducation', () => {
    it('clears education data and error', () => {
      const stateWithData: EducationState = {
        data: educationFixture,
        loading: false,
        error: 'Some error',
      };

      const actual = educationReducer(stateWithData, clearEducation());
      expect(actual.data).toEqual([]);
      expect(actual.error).toBeNull();
      expect(actual.loading).toBe(false);
    });
  });

  describe('fetchEducation async thunk', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          education: educationReducer,
          settings: () => ({ theme: 'system', language: 'en' }),
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sets loading to true when fetchEducation is pending', () => {
      const pendingAction = { type: fetchEducation.pending.type };
      const state = educationReducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets education data when fetchEducation is fulfilled', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ data: educationFixture });

      await store.dispatch(fetchEducation());

      const state = store.getState().education;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(educationFixture);
      expect(state.error).toBeNull();
    });

    it('sets error when fetchEducation is rejected with error message', async () => {
      const errorMessage = 'Network error';
      mockedAxios.get = jest.fn().mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchEducation());

      const state = store.getState().education;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });

    it('sets default error message when fetchEducation is rejected without message', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue({});

      await store.dispatch(fetchEducation());

      const state = store.getState().education;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual([]);
      expect(state.error).toBe('Failed to fetch education');
    });

    it('clears error when fetchEducation pending is dispatched', () => {
      const stateWithError: EducationState = {
        data: [],
        loading: false,
        error: 'Previous error',
      };

      const pendingAction = { type: fetchEducation.pending.type };
      const state = educationReducer(stateWithError, pendingAction);

      expect(state.error).toBeNull();
      expect(state.loading).toBe(true);
    });

    it('preserves error-free state when fetchEducation is fulfilled', () => {
      const pendingState: EducationState = {
        data: [],
        loading: true,
        error: null,
      };

      const fulfilledAction = {
        type: fetchEducation.fulfilled.type,
        payload: educationFixture,
      };
      const state = educationReducer(pendingState, fulfilledAction);

      expect(state.data).toEqual(educationFixture);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
