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
});
