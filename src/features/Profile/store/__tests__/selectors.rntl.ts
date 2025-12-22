import type { RootState } from '@app/store';
import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';

import {
  selectProfile,
  selectProfileError,
  selectProfileLoading,
  selectProfileLocation,
  selectProfileName,
  selectProfileSocials,
} from '../selectors';

describe('Profile selectors', () => {
  describe('selectProfile', () => {
    it('returns profile data from state', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfile(state)).toEqual(profileFixture);
    });

    it('returns null when profile data is null', () => {
      const state = {
        profile: { data: null, loading: false, error: null },
      } as RootState;

      expect(selectProfile(state)).toBeNull();
    });
  });

  describe('selectProfileLoading', () => {
    it('returns loading state when true', () => {
      const state = {
        profile: { data: null, loading: true, error: null },
      } as RootState;

      expect(selectProfileLoading(state)).toBe(true);
    });

    it('returns loading state when false', () => {
      const state = {
        profile: { data: null, loading: false, error: null },
      } as RootState;

      expect(selectProfileLoading(state)).toBe(false);
    });
  });

  describe('selectProfileError', () => {
    it('returns error message when present', () => {
      const errorMessage = 'Failed to fetch profile';
      const state = {
        profile: { data: null, loading: false, error: errorMessage },
      } as RootState;

      expect(selectProfileError(state)).toBe(errorMessage);
    });

    it('returns null when no error', () => {
      const state = {
        profile: { data: null, loading: false, error: null },
      } as RootState;

      expect(selectProfileError(state)).toBeNull();
    });
  });

  describe('selectProfileName', () => {
    it('returns full name when profile exists', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfileName(state)).toBe('Warren de Leon');
    });

    it('returns null when profile is null', () => {
      const state = {
        profile: { data: null, loading: false, error: null },
      } as RootState;

      expect(selectProfileName(state)).toBeNull();
    });
  });

  describe('selectProfileLocation', () => {
    it('returns location when profile exists', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfileLocation(state)).toEqual(profileFixture.location);
    });

    it('returns null when profile is null', () => {
      const state = {
        profile: { data: null, loading: false, error: null },
      } as RootState;

      expect(selectProfileLocation(state)).toBeNull();
    });
  });

  describe('selectProfileSocials', () => {
    it('returns socials when profile exists', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfileSocials(state)).toEqual(profileFixture.socials);
    });

    it('returns null when profile is null', () => {
      const state = {
        profile: { data: null, loading: false, error: null },
      } as RootState;

      expect(selectProfileSocials(state)).toBeNull();
    });
  });

  describe('selector consistency', () => {
    it('selectProfile returns consistent data when state unchanged', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      const result1 = selectProfile(state);
      const result2 = selectProfile(state);

      expect(result1).toEqual(result2);
      expect(result1).toEqual(profileFixture);
    });

    it('selectProfile reflects state changes', () => {
      const state1 = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      const modifiedProfile = { ...profileFixture, name: 'John' };
      const state2 = {
        profile: { data: modifiedProfile, loading: false, error: null },
      } as RootState;

      expect(selectProfile(state1)?.name).toBe('Warren');
      expect(selectProfile(state2)?.name).toBe('John');
    });

    it('selectProfileLoading returns consistent value', () => {
      const state = {
        profile: { data: null, loading: true, error: null },
      } as RootState;

      expect(selectProfileLoading(state)).toBe(true);
      expect(selectProfileLoading(state)).toBe(true);
    });

    it('selectProfileError returns consistent value', () => {
      const state = {
        profile: { data: null, loading: false, error: 'Network error' },
      } as RootState;

      expect(selectProfileError(state)).toBe('Network error');
      expect(selectProfileError(state)).toBe('Network error');
    });

    it('selectProfileName returns consistent full name', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfileName(state)).toBe('Warren de Leon');
      expect(selectProfileName(state)).toBe('Warren de Leon');
    });

    it('selectProfileLocation returns profile location data', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfileLocation(state)).toEqual(profileFixture.location);
    });

    it('selectProfileSocials returns profile socials data', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      expect(selectProfileSocials(state)).toEqual(profileFixture.socials);
    });

    it('derived selectors chain correctly', () => {
      const state = {
        profile: { data: profileFixture, loading: false, error: null },
      } as RootState;

      const profile = selectProfile(state);
      const name = selectProfileName(state);

      expect(profile?.name).toBe('Warren');
      expect(profile?.lastName).toBe('de Leon');
      expect(name).toBe('Warren de Leon');
    });

    it('selector returns same data when unrelated state changes', () => {
      const state1 = {
        profile: { data: profileFixture, loading: false, error: null },
        settings: { theme: 'light', language: 'en' },
      } as unknown as RootState;

      const state2 = {
        ...state1,
        settings: { theme: 'dark', language: 'es' },
      } as unknown as RootState;

      expect(selectProfile(state1)).toEqual(selectProfile(state2));
    });
  });
});
