import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

import {
  selectWorkExperience,
  selectWorkExperienceByCompany,
  selectWorkExperienceById,
  selectWorkExperienceClientsById,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
  selectWorkExperienceWithClients,
} from '../selectors';

describe('WorkExperience selectors', () => {
  const mockWorkExperience: WorkExperience[] = [
    {
      id: '1',
      company: 'Company A',
      position: 'Developer',
      start: '2020-01-01',
      end: '2021-01-01',
      description: 'Test A',
      clients: [
        {
          id: 'c1',
          company: 'Client 1',
          logo: 'https://example.com/client1.svg',
          position: 'Developer',
          start: '2020-01-01',
          end: '2021-01-01',
          type: 'contract',
          programmingLanguages: ['TypeScript'],
          techStack: ['React Native'],
          devTools: ['VS Code'],
          agileMethodology: ['Scrum'],
          description: 'Client work',
        },
      ],
    },
    {
      id: '2',
      company: 'Company B',
      position: 'Senior Developer',
      start: '2021-01-01',
      end: '2022-01-01',
      description: 'Test B',
    },
    {
      id: '3',
      company: 'Company A',
      position: 'Lead Developer',
      start: '2022-01-01',
      end: 'Present',
      description: 'Test C',
    },
  ];

  const mockState: RootState = {
    workExperience: {
      data: mockWorkExperience,
      loading: false,
      error: null,
    },
  } as RootState;

  describe('selectWorkExperience', () => {
    it('should select all work experience data', () => {
      const result = selectWorkExperience(mockState);
      expect(result).toEqual(mockWorkExperience);
    });

    it('should return empty array when no data', () => {
      const emptyState = {
        ...mockState,
        workExperience: { data: [], loading: false, error: null },
      };
      const result = selectWorkExperience(emptyState);
      expect(result).toEqual([]);
    });
  });

  describe('selectWorkExperienceLoading', () => {
    it('should select loading state', () => {
      const result = selectWorkExperienceLoading(mockState);
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const loadingState = {
        ...mockState,
        workExperience: { ...mockState.workExperience, loading: true },
      };
      const result = selectWorkExperienceLoading(loadingState);
      expect(result).toBe(true);
    });
  });

  describe('selectWorkExperienceError', () => {
    it('should select error state', () => {
      const result = selectWorkExperienceError(mockState);
      expect(result).toBeNull();
    });

    it('should return error message when present', () => {
      const errorState = {
        ...mockState,
        workExperience: { ...mockState.workExperience, error: 'Failed to fetch' },
      };
      const result = selectWorkExperienceError(errorState);
      expect(result).toBe('Failed to fetch');
    });
  });

  describe('selectWorkExperienceWithClients', () => {
    it('should select only work experience with clients', () => {
      const result = selectWorkExperienceWithClients(mockState);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('1');
      expect(result[0]!.clients).toBeDefined();
      expect(result[0]!.clients?.length).toBeGreaterThan(0);
    });

    it('should return empty array when no work experience has clients', () => {
      const noClientsState = {
        ...mockState,
        workExperience: {
          data: mockWorkExperience.filter(item => !item.clients),
          loading: false,
          error: null,
        },
      };
      const result = selectWorkExperienceWithClients(noClientsState);
      expect(result).toEqual(mockWorkExperience.filter(item => !item.clients));
    });
  });

  describe('selectWorkExperienceByCompany', () => {
    it('should select work experience by company name', () => {
      const result = selectWorkExperienceByCompany(mockState, 'Company A');
      expect(result).toHaveLength(2);
      expect(result[0]!.company).toBe('Company A');
      expect(result[1]!.company).toBe('Company A');
    });

    it('should return empty array when no matching company', () => {
      const result = selectWorkExperienceByCompany(mockState, 'Nonexistent Company');
      expect(result).toEqual([]);
    });

    it('should return empty array when data is empty', () => {
      const emptyState = {
        ...mockState,
        workExperience: { data: [], loading: false, error: null },
      };
      const result = selectWorkExperienceByCompany(emptyState, 'Company A');
      expect(result).toEqual([]);
    });
  });

  describe('selectWorkExperienceById', () => {
    it('returns the matching work experience entry', () => {
      const result = selectWorkExperienceById(mockState, '1');
      expect(result?.company).toBe('Company A');
      expect(result?.clients).toHaveLength(1);
    });

    it('returns null when id does not exist', () => {
      const result = selectWorkExperienceById(mockState, '999');
      expect(result).toBeNull();
    });
  });

  describe('selectWorkExperienceClientsById', () => {
    it('returns clients for the matching work experience entry', () => {
      const result = selectWorkExperienceClientsById(mockState, '1');
      expect(result).toHaveLength(1);
      expect(result[0]!.company).toBe('Client 1');
    });

    it('returns empty array when no clients exist', () => {
      const result = selectWorkExperienceClientsById(mockState, '2');
      expect(result).toEqual([]);
    });

    it('returns empty array when id is unknown', () => {
      const result = selectWorkExperienceClientsById(mockState, 'unknown');
      expect(result).toEqual([]);
    });
  });
});
