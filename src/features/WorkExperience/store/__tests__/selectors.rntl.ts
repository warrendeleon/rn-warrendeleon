import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

import {
  selectCompanyInfoByPositionId,
  selectPositionById,
  selectWorkExperience,
  selectWorkExperienceByCompany,
  selectWorkExperienceById,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
  selectWorkExperiencePositionsWithClientsById,
  selectWorkExperienceWithClients,
} from '../selectors';

describe('WorkExperience selectors', () => {
  const mockWorkExperience: WorkExperience[] = [
    {
      id: '1',
      company: 'Company A',
      positions: [
        {
          id: 'pos-1',
          title: 'Developer',
          startDate: '2020-01',
          endDate: '2021-01',
          description: 'Test A',
          responsibilities: null,
          technologies: {
            languages: ['TypeScript'],
            frameworks: ['React Native'],
            testing: {
              unit: ['Jest'],
              e2e: null,
            },
            tools: ['VS Code'],
            ci: null,
            methodology: ['Scrum'],
          },
          client: {
            name: 'Client 1',
            logo: 'https://example.com/client1.svg',
          },
        },
      ],
    },
    {
      id: '2',
      company: 'Company B',
      positions: [
        {
          id: 'pos-2',
          title: 'Senior Developer',
          startDate: '2021-01',
          endDate: '2022-01',
          description: 'Test B',
          responsibilities: null,
          technologies: null,
          client: null,
        },
      ],
    },
    {
      id: '3',
      company: 'Company A',
      positions: [
        {
          id: 'pos-3',
          title: 'Lead Developer',
          startDate: '2022-01',
          endDate: null,
          description: 'Test C',
          responsibilities: ['Team Leadership', 'Technical Direction'],
          technologies: null,
          client: null,
        },
      ],
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
    it('should select only work experience with positions that have clients', () => {
      const result = selectWorkExperienceWithClients(mockState);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('1');
      const positionsWithClients = result[0]!.positions.filter(pos => pos.client !== null);
      expect(positionsWithClients.length).toBeGreaterThan(0);
    });

    it('should return empty array when no positions have clients', () => {
      const noClientsState = {
        ...mockState,
        workExperience: {
          data: mockWorkExperience.filter(item => !item.positions.some(pos => pos.client !== null)),
          loading: false,
          error: null,
        },
      };
      const result = selectWorkExperienceWithClients(noClientsState);
      expect(result).toEqual([]);
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
      expect(result?.positions).toHaveLength(1);
    });

    it('returns null when id does not exist', () => {
      const result = selectWorkExperienceById(mockState, '999');
      expect(result).toBeNull();
    });
  });

  describe('selectWorkExperiencePositionsWithClientsById', () => {
    it('returns positions with clients for the matching work experience entry', () => {
      const result = selectWorkExperiencePositionsWithClientsById(mockState, '1');
      expect(result).toHaveLength(1);
      expect(result[0]!.client?.name).toBe('Client 1');
    });

    it('returns empty array when no positions have clients', () => {
      const result = selectWorkExperiencePositionsWithClientsById(mockState, '2');
      expect(result).toEqual([]);
    });

    it('returns empty array when id is unknown', () => {
      const result = selectWorkExperiencePositionsWithClientsById(mockState, 'unknown');
      expect(result).toEqual([]);
    });
  });

  describe('selectPositionById', () => {
    describe('Position Matching', () => {
      it('returns position when ID matches a position entry', () => {
        const result = selectPositionById(mockState, 'pos-1');
        expect(result).not.toBeNull();
        expect(result?.id).toBe('pos-1');
        expect(result?.title).toBe('Developer');
        expect(result?.startDate).toBe('2020-01');
      });

      it('returns position with all properties intact', () => {
        const result = selectPositionById(mockState, 'pos-2');
        expect(result).not.toBeNull();
        expect(result?.id).toBe('pos-2');
        expect(result?.title).toBe('Senior Developer');
        expect(result?.startDate).toBe('2021-01');
        expect(result?.endDate).toBe('2022-01');
        expect(result?.description).toBe('Test B');
      });

      it('returns position with client reference', () => {
        const result = selectPositionById(mockState, 'pos-1');
        expect(result?.client).not.toBeNull();
        expect(result?.client?.name).toBe('Client 1');
        expect(result?.client?.logo).toBe('https://example.com/client1.svg');
      });

      it('returns position without client', () => {
        const result = selectPositionById(mockState, 'pos-2');
        expect(result?.client).toBeNull();
      });
    });

    describe('Not Found Cases', () => {
      it('returns null when ID does not match any position', () => {
        const result = selectPositionById(mockState, 'nonexistent');
        expect(result).toBeNull();
      });

      it('returns null when searching empty data', () => {
        const emptyState: RootState = {
          ...mockState,
          workExperience: { data: [], loading: false, error: null },
        };
        const result = selectPositionById(emptyState, 'pos-1');
        expect(result).toBeNull();
      });

      it('returns null when work experience entry has undefined positions', () => {
        const stateWithUndefinedPositions: RootState = {
          ...mockState,
          workExperience: {
            data: [
              {
                id: 'work-1',
                company: 'Company Without Positions',
                positions: undefined as unknown as WorkExperience['positions'],
              },
            ],
            loading: false,
            error: null,
          },
        };
        const result = selectPositionById(stateWithUndefinedPositions, 'pos-1');
        expect(result).toBeNull();
      });
    });

    describe('Memoization', () => {
      it('returns same reference when called with same state and ID', () => {
        const result1 = selectPositionById(mockState, 'pos-1');
        const result2 = selectPositionById(mockState, 'pos-1');
        expect(result1).toBe(result2);
      });

      it('returns different reference for different IDs', () => {
        const result1 = selectPositionById(mockState, 'pos-1');
        const result2 = selectPositionById(mockState, 'pos-2');
        expect(result1).not.toBe(result2);
      });
    });
  });

  describe('selectCompanyInfoByPositionId', () => {
    it('returns company info when position has no client', () => {
      const result = selectCompanyInfoByPositionId(mockState, 'pos-2');
      expect(result).not.toBeNull();
      expect(result?.company).toBe('Company B');
    });

    it('returns client info when position has client', () => {
      const result = selectCompanyInfoByPositionId(mockState, 'pos-1');
      expect(result).not.toBeNull();
      expect(result?.company).toBe('Client 1');
      expect(result?.logo).toBe('https://example.com/client1.svg');
    });

    it('returns null when position ID does not exist', () => {
      const result = selectCompanyInfoByPositionId(mockState, 'nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when data is empty', () => {
      const emptyState: RootState = {
        ...mockState,
        workExperience: { data: [], loading: false, error: null },
      };
      const result = selectCompanyInfoByPositionId(emptyState, 'pos-1');
      expect(result).toBeNull();
    });
  });

  describe('selector consistency', () => {
    it('selectWorkExperience returns consistent data', () => {
      expect(selectWorkExperience(mockState)).toEqual(mockWorkExperience);
      expect(selectWorkExperience(mockState)).toEqual(mockWorkExperience);
    });

    it('selectWorkExperience reflects state changes', () => {
      const state2: RootState = {
        ...mockState,
        workExperience: {
          ...mockState.workExperience,
          data: [...mockWorkExperience, { id: '4', company: 'Company D', positions: [] }],
        },
      };

      expect(selectWorkExperience(mockState).length).toBe(3);
      expect(selectWorkExperience(state2).length).toBe(4);
    });

    it('selectWorkExperienceLoading returns consistent value', () => {
      const loadingState: RootState = {
        ...mockState,
        workExperience: { ...mockState.workExperience, loading: true },
      };

      expect(selectWorkExperienceLoading(loadingState)).toBe(true);
      expect(selectWorkExperienceLoading(loadingState)).toBe(true);
    });

    it('selectWorkExperienceError returns consistent value', () => {
      const errorState: RootState = {
        ...mockState,
        workExperience: { ...mockState.workExperience, error: 'Network error' },
      };

      expect(selectWorkExperienceError(errorState)).toBe('Network error');
      expect(selectWorkExperienceError(errorState)).toBe('Network error');
    });

    it('selectWorkExperienceWithClients returns consistent filtered data', () => {
      const result = selectWorkExperienceWithClients(mockState);
      expect(selectWorkExperienceWithClients(mockState)).toEqual(result);
    });

    it('selectWorkExperienceByCompany returns consistent filtered data', () => {
      const companyA = selectWorkExperienceByCompany(mockState, 'Company A');
      expect(selectWorkExperienceByCompany(mockState, 'Company A')).toEqual(companyA);
    });

    it('selectWorkExperienceByCompany returns different data for different companies', () => {
      const companyA = selectWorkExperienceByCompany(mockState, 'Company A');
      const companyB = selectWorkExperienceByCompany(mockState, 'Company B');

      expect(companyA.length).toBe(2);
      expect(companyB.length).toBe(1);
    });

    it('selectWorkExperienceById returns consistent data', () => {
      const result = selectWorkExperienceById(mockState, '1');
      expect(selectWorkExperienceById(mockState, '1')).toEqual(result);
    });

    it('selectPositionById returns consistent data', () => {
      const result = selectPositionById(mockState, 'pos-1');
      expect(selectPositionById(mockState, 'pos-1')).toEqual(result);
    });

    it('selectCompanyInfoByPositionId returns consistent data', () => {
      const result = selectCompanyInfoByPositionId(mockState, 'pos-1');
      expect(selectCompanyInfoByPositionId(mockState, 'pos-1')).toEqual(result);
    });

    it('derived selectors chain correctly', () => {
      const allData = selectWorkExperience(mockState);
      const withClients = selectWorkExperienceWithClients(mockState);

      expect(allData.length).toBeGreaterThanOrEqual(withClients.length);
    });

    it('selector returns same data when unrelated state changes', () => {
      const state2 = {
        ...mockState,
        settings: { theme: 'dark', language: 'es' },
      } as RootState;

      expect(selectWorkExperience(mockState)).toEqual(selectWorkExperience(state2));
    });

    it('selector handles large datasets correctly', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: `work-${i}`,
        company: `Company ${i}`,
        positions: [
          {
            id: `pos-${i}`,
            title: `Position ${i}`,
            startDate: '2020-01',
            endDate: '2021-01',
            description: `Description ${i}`,
            responsibilities: null,
            technologies: null,
            client: null,
          },
        ],
      }));

      const largeState: RootState = {
        workExperience: { data: largeData, loading: false, error: null },
      } as RootState;

      const result1 = selectWorkExperience(largeState);
      const result2 = selectWorkExperience(largeState);

      expect(result1.length).toBe(100);
      expect(result1).toEqual(result2);
    });
  });
});
