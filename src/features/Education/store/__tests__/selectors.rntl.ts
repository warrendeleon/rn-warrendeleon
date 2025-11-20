import type { RootState } from '@app/store';
import educationFixture from '@app/test-utils/fixtures/api/en/education.json';

import {
  selectEducation,
  selectEducationByInstitution,
  selectEducationError,
  selectEducationLoading,
  selectEducationWithCertificates,
} from '../selectors';

describe('Education selectors', () => {
  describe('selectEducation', () => {
    it('returns education data from state', () => {
      const state = {
        education: { data: educationFixture, loading: false, error: null },
      } as unknown as RootState;

      expect(selectEducation(state)).toEqual(educationFixture);
    });

    it('returns empty array when no data', () => {
      const state = {
        education: { data: [], loading: false, error: null },
      } as unknown as RootState;

      expect(selectEducation(state)).toEqual([]);
    });
  });

  describe('selectEducationLoading', () => {
    it('returns loading state when true', () => {
      const state = {
        education: { data: [], loading: true, error: null },
      } as unknown as RootState;

      expect(selectEducationLoading(state)).toBe(true);
    });

    it('returns loading state when false', () => {
      const state = {
        education: { data: [], loading: false, error: null },
      } as unknown as RootState;

      expect(selectEducationLoading(state)).toBe(false);
    });
  });

  describe('selectEducationError', () => {
    it('returns error message when present', () => {
      const errorMessage = 'Failed to fetch education';
      const state = {
        education: { data: [], loading: false, error: errorMessage },
      } as unknown as RootState;

      expect(selectEducationError(state)).toBe(errorMessage);
    });

    it('returns null when no error', () => {
      const state = {
        education: { data: [], loading: false, error: null },
      } as unknown as RootState;

      expect(selectEducationError(state)).toBeNull();
    });
  });

  describe('selectEducationWithCertificates', () => {
    it('returns only education items with certificates', () => {
      const state = {
        education: { data: educationFixture, loading: false, error: null },
      } as unknown as RootState;

      const withCertificates = selectEducationWithCertificates(state);
      expect(withCertificates.length).toBeGreaterThan(0);
      withCertificates.forEach(item => {
        expect(item.certificateUrl).toBeDefined();
      });
    });

    it('returns empty array when no education has certificates', () => {
      const dataWithoutCertificates = educationFixture.map(item => ({
        ...item,
        certificateUrl: null,
      }));

      const state = {
        education: { data: dataWithoutCertificates, loading: false, error: null },
      } as unknown as RootState;

      expect(selectEducationWithCertificates(state)).toEqual([]);
    });

    it('returns empty array when education data is empty', () => {
      const state = {
        education: { data: [], loading: false, error: null },
      } as unknown as RootState;

      expect(selectEducationWithCertificates(state)).toEqual([]);
    });
  });

  describe('selectEducationByInstitution', () => {
    it('returns education filtered by institution', () => {
      const state = {
        education: { data: educationFixture, loading: false, error: null },
      } as unknown as RootState;

      const stucomEducation = selectEducationByInstitution(state, "Stucom Centre d'Estudis");
      expect(stucomEducation.length).toBeGreaterThan(0);
      stucomEducation.forEach(item => {
        expect(item.institution).toBe("Stucom Centre d'Estudis");
      });
    });

    it('returns empty array when institution not found', () => {
      const state = {
        education: { data: educationFixture, loading: false, error: null },
      } as unknown as RootState;

      const education = selectEducationByInstitution(state, 'NonExistentInstitution');
      expect(education).toEqual([]);
    });

    it('returns empty array when education data is empty', () => {
      const state = {
        education: { data: [], loading: false, error: null },
      } as unknown as RootState;

      const education = selectEducationByInstitution(state, 'Udemy');
      expect(education).toEqual([]);
    });
  });
});
