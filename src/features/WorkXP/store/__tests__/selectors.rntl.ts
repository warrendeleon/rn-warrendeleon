import type { RootState } from '@app/store';
import workXPFixture from '@app/test-utils/fixtures/api/en/workxp.json';

import {
  selectCurrentPosition,
  selectWorkXP,
  selectWorkXPByCompany,
  selectWorkXPError,
  selectWorkXPLoading,
} from '../selectors';

describe('WorkXP selectors', () => {
  describe('selectWorkXP', () => {
    it('returns work experience data from state', () => {
      const state = {
        workXP: { data: workXPFixture, loading: false, error: null },
      } as RootState;

      expect(selectWorkXP(state)).toEqual(workXPFixture);
    });

    it('returns empty array when no data', () => {
      const state = {
        workXP: { data: [], loading: false, error: null },
      } as RootState;

      expect(selectWorkXP(state)).toEqual([]);
    });
  });

  describe('selectWorkXPLoading', () => {
    it('returns loading state when true', () => {
      const state = {
        workXP: { data: [], loading: true, error: null },
      } as RootState;

      expect(selectWorkXPLoading(state)).toBe(true);
    });

    it('returns loading state when false', () => {
      const state = {
        workXP: { data: [], loading: false, error: null },
      } as RootState;

      expect(selectWorkXPLoading(state)).toBe(false);
    });
  });

  describe('selectWorkXPError', () => {
    it('returns error message when present', () => {
      const errorMessage = 'Failed to fetch work experience';
      const state = {
        workXP: { data: [], loading: false, error: errorMessage },
      } as RootState;

      expect(selectWorkXPError(state)).toBe(errorMessage);
    });

    it('returns null when no error', () => {
      const state = {
        workXP: { data: [], loading: false, error: null },
      } as RootState;

      expect(selectWorkXPError(state)).toBeNull();
    });
  });

  describe('selectCurrentPosition', () => {
    it('returns current position when end is "Present"', () => {
      const state = {
        workXP: { data: workXPFixture, loading: false, error: null },
      } as RootState;

      const current = selectCurrentPosition(state);
      expect(current).toBeTruthy();
      expect(current?.end).toBe('Present');
      expect(current?.company).toBe('Sky');
    });

    it('returns null when no current position exists', () => {
      const pastJobs = workXPFixture.filter(job => job.end !== 'Present');
      const state = {
        workXP: { data: pastJobs, loading: false, error: null },
      } as RootState;

      expect(selectCurrentPosition(state)).toBeNull();
    });

    it('returns null when work experience is empty', () => {
      const state = {
        workXP: { data: [], loading: false, error: null },
      } as RootState;

      expect(selectCurrentPosition(state)).toBeNull();
    });
  });

  describe('selectWorkXPByCompany', () => {
    it('returns jobs filtered by company name', () => {
      const state = {
        workXP: { data: workXPFixture, loading: false, error: null },
      } as RootState;

      const skyJobs = selectWorkXPByCompany(state, 'Sky');
      expect(skyJobs).toHaveLength(1);
      expect(skyJobs[0].company).toBe('Sky');
    });

    it('returns empty array when company not found', () => {
      const state = {
        workXP: { data: workXPFixture, loading: false, error: null },
      } as RootState;

      const jobs = selectWorkXPByCompany(state, 'NonExistentCompany');
      expect(jobs).toEqual([]);
    });

    it('returns empty array when work experience is empty', () => {
      const state = {
        workXP: { data: [], loading: false, error: null },
      } as RootState;

      const jobs = selectWorkXPByCompany(state, 'Sky');
      expect(jobs).toEqual([]);
    });
  });
});
