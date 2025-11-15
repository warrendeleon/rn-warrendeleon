import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

import workXPFixture from '@app/test-utils/fixtures/api/en/workxp.json';

import { fetchWorkXP } from '../actions';
import { clearWorkXP, workXPReducer, type WorkXPState } from '../reducer';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('workXPReducer', () => {
  const initialState: WorkXPState = {
    data: [],
    loading: false,
    error: null,
  };

  it('returns the initial state', () => {
    expect(workXPReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('clearWorkXP', () => {
    it('clears work experience data and error', () => {
      const stateWithData: WorkXPState = {
        data: workXPFixture,
        loading: false,
        error: 'Some error',
      };

      const actual = workXPReducer(stateWithData, clearWorkXP());
      expect(actual.data).toEqual([]);
      expect(actual.error).toBeNull();
      expect(actual.loading).toBe(false);
    });
  });

  describe('fetchWorkXP async thunk', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          workXP: workXPReducer,
          settings: () => ({ theme: 'system', language: 'en' }),
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sets loading to true when fetchWorkXP is pending', () => {
      const pendingAction = { type: fetchWorkXP.pending.type };
      const state = workXPReducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets work experience data when fetchWorkXP is fulfilled', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ data: workXPFixture });

      await store.dispatch(fetchWorkXP());

      const state = store.getState().workXP;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(workXPFixture);
      expect(state.error).toBeNull();
    });

    it('sets error when fetchWorkXP is rejected with error message', async () => {
      const errorMessage = 'Network error';
      mockedAxios.get = jest.fn().mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchWorkXP());

      const state = store.getState().workXP;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });

    it('sets default error message when fetchWorkXP is rejected without message', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue({});

      await store.dispatch(fetchWorkXP());

      const state = store.getState().workXP;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual([]);
      expect(state.error).toBe('Failed to fetch work experience');
    });

    it('clears error when fetchWorkXP pending is dispatched', () => {
      const stateWithError: WorkXPState = {
        data: [],
        loading: false,
        error: 'Previous error',
      };

      const pendingAction = { type: fetchWorkXP.pending.type };
      const state = workXPReducer(stateWithError, pendingAction);

      expect(state.error).toBeNull();
      expect(state.loading).toBe(true);
    });

    it('preserves error-free state when fetchWorkXP is fulfilled', () => {
      const pendingState: WorkXPState = {
        data: [],
        loading: true,
        error: null,
      };

      const fulfilledAction = {
        type: fetchWorkXP.fulfilled.type,
        payload: workXPFixture,
      };
      const state = workXPReducer(pendingState, fulfilledAction);

      expect(state.data).toEqual(workXPFixture);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
