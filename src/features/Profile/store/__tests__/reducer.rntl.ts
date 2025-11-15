import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';

import { fetchProfile } from '../actions';
import { clearProfile, profileReducer, type ProfileState } from '../reducer';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('profileReducer', () => {
  const initialState: ProfileState = {
    data: null,
    loading: false,
    error: null,
  };

  it('returns the initial state', () => {
    expect(profileReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('clearProfile', () => {
    it('clears profile data and error', () => {
      const stateWithData: ProfileState = {
        data: profileFixture,
        loading: false,
        error: 'Some error',
      };

      const actual = profileReducer(stateWithData, clearProfile());
      expect(actual.data).toBeNull();
      expect(actual.error).toBeNull();
      expect(actual.loading).toBe(false);
    });
  });

  describe('fetchProfile async thunk', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          profile: profileReducer,
          settings: () => ({ theme: 'system', language: 'en' }),
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sets loading to true when fetchProfile is pending', () => {
      const pendingAction = { type: fetchProfile.pending.type };
      const state = profileReducer(initialState, pendingAction);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets profile data when fetchProfile is fulfilled', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ data: profileFixture });

      await store.dispatch(fetchProfile());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(profileFixture);
      expect(state.error).toBeNull();
    });

    it('sets error when fetchProfile is rejected with error message', async () => {
      const errorMessage = 'Network error';
      mockedAxios.get = jest.fn().mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchProfile());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('sets default error message when fetchProfile is rejected without message', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue({});

      await store.dispatch(fetchProfile());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toBeNull();
      expect(state.error).toBe('Failed to fetch profile');
    });

    it('clears error when fetchProfile pending is dispatched', () => {
      const stateWithError: ProfileState = {
        data: null,
        loading: false,
        error: 'Previous error',
      };

      const pendingAction = { type: fetchProfile.pending.type };
      const state = profileReducer(stateWithError, pendingAction);

      expect(state.error).toBeNull();
      expect(state.loading).toBe(true);
    });

    it('preserves error-free state when fetchProfile is fulfilled', () => {
      const pendingState: ProfileState = {
        data: null,
        loading: true,
        error: null,
      };

      const fulfilledAction = {
        type: fetchProfile.fulfilled.type,
        payload: profileFixture,
      };
      const state = profileReducer(pendingState, fulfilledAction);

      expect(state.data).toEqual(profileFixture);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
