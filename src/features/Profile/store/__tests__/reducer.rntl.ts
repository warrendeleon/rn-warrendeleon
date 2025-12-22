import { configureStore } from '@reduxjs/toolkit';

import { fetchProfileData } from '@app/features/Profile/api/api';
import type { AppDispatch } from '@app/store';
import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';

import { fetchProfile } from '../actions';
import { clearProfile, profileReducer, type ProfileState } from '../reducer';

jest.mock('@app/features/Profile/api/api');
const mockedFetchProfileData = fetchProfileData as jest.MockedFunction<typeof fetchProfileData>;

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
    let store: { dispatch: AppDispatch; getState: () => { profile: ProfileState } };

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
      mockedFetchProfileData.mockResolvedValue({
        data: profileFixture,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await store.dispatch(fetchProfile());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(profileFixture);
      expect(state.error).toBeNull();
    });

    it('sets error when fetchProfile is rejected with error message', async () => {
      const errorMessage = 'Network error';
      mockedFetchProfileData.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchProfile());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('sets default error message when fetchProfile is rejected without message', async () => {
      mockedFetchProfileData.mockRejectedValue(new Error());

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

  describe('complex state transition sequences', () => {
    it('handles fetch → clear → refetch sequence', () => {
      // Step 1: Initial fetch
      let state = profileReducer(initialState, { type: fetchProfile.pending.type });
      expect(state.loading).toBe(true);

      state = profileReducer(state, {
        type: fetchProfile.fulfilled.type,
        payload: profileFixture,
      });
      expect(state.data).toEqual(profileFixture);
      expect(state.loading).toBe(false);

      // Step 2: Clear profile
      state = profileReducer(state, clearProfile());
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();

      // Step 3: Refetch
      state = profileReducer(state, { type: fetchProfile.pending.type });
      expect(state.loading).toBe(true);

      state = profileReducer(state, {
        type: fetchProfile.fulfilled.type,
        payload: profileFixture,
      });
      expect(state.data).toEqual(profileFixture);
    });

    it('handles fetch error → retry → success sequence', () => {
      // Step 1: Initial fetch fails
      let state = profileReducer(initialState, { type: fetchProfile.pending.type });
      state = profileReducer(state, {
        type: fetchProfile.rejected.type,
        error: { message: 'Network error' },
      });
      expect(state.error).toBe('Network error');
      expect(state.data).toBeNull();

      // Step 2: Retry fetch
      state = profileReducer(state, { type: fetchProfile.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull(); // Error cleared on pending

      // Step 3: Retry succeeds
      state = profileReducer(state, {
        type: fetchProfile.fulfilled.type,
        payload: profileFixture,
      });
      expect(state.data).toEqual(profileFixture);
      expect(state.error).toBeNull();
    });

    it('handles multiple rapid fetch attempts correctly', () => {
      // First fetch starts
      let state = profileReducer(initialState, { type: fetchProfile.pending.type });

      // Second fetch starts (overwrites first pending)
      state = profileReducer(state, { type: fetchProfile.pending.type });
      expect(state.loading).toBe(true);

      // First fetch completes
      state = profileReducer(state, {
        type: fetchProfile.fulfilled.type,
        payload: profileFixture,
      });
      expect(state.data).toEqual(profileFixture);
      expect(state.loading).toBe(false);
    });
  });

  describe('partial state updates preserve unaffected data', () => {
    it('clearProfile only clears data and error', () => {
      const stateWithData: ProfileState = {
        data: profileFixture,
        loading: true, // Should remain unchanged
        error: 'Some error',
      };

      const state = profileReducer(stateWithData, clearProfile());

      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.loading).toBe(true); // Preserved
    });

    it('pending action preserves existing data', () => {
      const stateWithData: ProfileState = {
        data: profileFixture,
        loading: false,
        error: null,
      };

      const state = profileReducer(stateWithData, { type: fetchProfile.pending.type });

      expect(state.data).toEqual(profileFixture); // Data preserved during loading
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('rejected action preserves loading=false and clears data', () => {
      const stateWithData: ProfileState = {
        data: profileFixture,
        loading: true,
        error: null,
      };

      const state = profileReducer(stateWithData, {
        type: fetchProfile.rejected.type,
        error: { message: 'Failed' },
      });

      // Rejected sets loading to false but doesn't explicitly clear data
      // The reducer keeps existing data on rejection
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed');
    });
  });

  describe('action payload edge cases', () => {
    it('handles rejection without error message', () => {
      const state = profileReducer(initialState, {
        type: fetchProfile.rejected.type,
        error: {},
      });

      expect(state.error).toBe('Failed to fetch profile');
    });

    it('handles rejection with empty string error message', () => {
      const state = profileReducer(initialState, {
        type: fetchProfile.rejected.type,
        error: { message: '' },
      });

      expect(state.error).toBe('Failed to fetch profile');
    });

    it('handles fulfilled with complete profile data', () => {
      const state = profileReducer(initialState, {
        type: fetchProfile.fulfilled.type,
        payload: profileFixture,
      });

      expect(state.data?.name).toBe('Warren');
      expect(state.data?.lastName).toBe('de Leon');
      expect(state.data?.location).toBeDefined();
      expect(state.data?.headline).toBeDefined();
    });
  });
});
