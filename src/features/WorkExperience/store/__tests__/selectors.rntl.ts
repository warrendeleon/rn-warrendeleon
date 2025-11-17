import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

import {
  selectWorkExperience,
  selectWorkExperienceByCompany,
  selectWorkExperienceById,
  selectWorkExperienceClientsById,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
  selectWorkExperienceOrClientById,
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
      expect(result).toEqual([]); // Should return empty array since none have clients
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

  describe('selectWorkExperienceOrClientById', () => {
    describe('Work Experience Matching', () => {
      it('returns work experience when ID matches top-level entry', () => {
        const result = selectWorkExperienceOrClientById(mockState, '1');
        expect(result).not.toBeNull();
        expect(result?.id).toBe('1');
        expect(result?.company).toBe('Company A');
        expect(result?.position).toBe('Developer');
        expect(result?.clients).toBeDefined();
      });

      it('returns work experience with all properties intact', () => {
        const result = selectWorkExperienceOrClientById(mockState, '2');
        expect(result).not.toBeNull();
        expect(result?.id).toBe('2');
        expect(result?.company).toBe('Company B');
        expect(result?.position).toBe('Senior Developer');
        expect(result?.start).toBe('2021-01-01');
        expect(result?.end).toBe('2022-01-01');
        expect(result?.description).toBe('Test B');
      });

      it('prioritizes work experience over client when IDs could overlap', () => {
        // First checks work experience, then clients
        const result = selectWorkExperienceOrClientById(mockState, '1');
        expect(result?.company).toBe('Company A'); // Work experience, not client
        expect(result?.clients).toBeDefined(); // Work experience have clients property
      });
    });

    describe('Client Matching and Conversion', () => {
      it('returns client converted to work experience format when client ID matches', () => {
        const result = selectWorkExperienceOrClientById(mockState, 'c1');
        expect(result).not.toBeNull();
        expect(result?.id).toBe('c1');
        expect(result?.company).toBe('Client 1');
        expect(result?.position).toBe('Developer');
      });

      it('converts client with all required properties', () => {
        const result = selectWorkExperienceOrClientById(mockState, 'c1');
        expect(result).not.toBeNull();
        expect(result?.logo).toBe('https://example.com/client1.svg');
        expect(result?.start).toBe('2020-01-01');
        expect(result?.end).toBe('2021-01-01');
        expect(result?.programmingLanguages).toEqual(['TypeScript']);
        expect(result?.techStack).toEqual(['React Native']);
        expect(result?.devTools).toEqual(['VS Code']);
        expect(result?.agileMethodology).toEqual(['Scrum']);
        expect(result?.description).toBe('Client work');
      });

      it('sets clients property to undefined for converted client entries', () => {
        const result = selectWorkExperienceOrClientById(mockState, 'c1');
        expect(result).not.toBeNull();
        expect(result?.clients).toBeUndefined(); // Clients don't have sub-clients
      });

      it('searches through all work experience entries for client match', () => {
        // Create state with client in second work experience entry
        const stateWithMultipleClients: RootState = {
          ...mockState,
          workExperience: {
            ...mockState.workExperience,
            data: [
              ...mockWorkExperience,
              {
                id: '4',
                company: 'Company C',
                position: 'Manager',
                start: '2023-01-01',
                end: 'Present',
                description: 'Test D',
                clients: [
                  {
                    id: 'c2',
                    company: 'Client 2',
                    logo: 'https://example.com/client2.svg',
                    position: 'Tech Lead',
                    start: '2023-01-01',
                    end: 'Present',
                    type: 'contract',
                    programmingLanguages: ['JavaScript'],
                    techStack: ['React'],
                    devTools: ['VSCode'],
                    agileMethodology: ['Kanban'],
                    description: 'Client 2 work',
                  },
                ],
              },
            ],
          },
        };

        const result = selectWorkExperienceOrClientById(stateWithMultipleClients, 'c2');
        expect(result).not.toBeNull();
        expect(result?.id).toBe('c2');
        expect(result?.company).toBe('Client 2');
      });
    });

    describe('Not Found Cases', () => {
      it('returns null when ID does not match any work experience or client', () => {
        const result = selectWorkExperienceOrClientById(mockState, 'nonexistent');
        expect(result).toBeNull();
      });

      it('returns null when searching empty data', () => {
        const emptyState: RootState = {
          ...mockState,
          workExperience: { data: [], loading: false, error: null },
        };
        const result = selectWorkExperienceOrClientById(emptyState, '1');
        expect(result).toBeNull();
      });

      it('returns null when work experience has no clients and ID does not match', () => {
        const noClientsState: RootState = {
          ...mockState,
          workExperience: {
            data: [
              {
                id: '100',
                company: 'Company No Clients',
                position: 'Developer',
                start: '2020-01-01',
                end: '2021-01-01',
                description: 'No clients here',
              },
            ],
            loading: false,
            error: null,
          },
        };
        const result = selectWorkExperienceOrClientById(noClientsState, 'c1');
        expect(result).toBeNull();
      });
    });

    describe('Edge Cases', () => {
      it('handles undefined clients array gracefully', () => {
        const stateWithUndefinedClients: RootState = {
          ...mockState,
          workExperience: {
            data: [
              {
                id: '5',
                company: 'Company D',
                position: 'Developer',
                start: '2020-01-01',
                end: '2021-01-01',
                description: 'Test',
                clients: undefined,
              },
            ],
            loading: false,
            error: null,
          },
        };
        const result = selectWorkExperienceOrClientById(stateWithUndefinedClients, 'c1');
        expect(result).toBeNull();
      });

      it('handles empty clients array', () => {
        const stateWithEmptyClients: RootState = {
          ...mockState,
          workExperience: {
            data: [
              {
                id: '6',
                company: 'Company E',
                position: 'Developer',
                start: '2020-01-01',
                end: '2021-01-01',
                description: 'Test',
                clients: [],
              },
            ],
            loading: false,
            error: null,
          },
        };
        const result = selectWorkExperienceOrClientById(stateWithEmptyClients, 'c1');
        expect(result).toBeNull();
      });

      it('handles empty string ID', () => {
        const result = selectWorkExperienceOrClientById(mockState, '');
        expect(result).toBeNull();
      });
    });

    describe('Memoization', () => {
      it('returns same reference when called with same state and ID', () => {
        const result1 = selectWorkExperienceOrClientById(mockState, '1');
        const result2 = selectWorkExperienceOrClientById(mockState, '1');
        // Memoization ensures same reference for same inputs
        expect(result1).toBe(result2);
      });

      it('returns different reference for different IDs', () => {
        const result1 = selectWorkExperienceOrClientById(mockState, '1');
        const result2 = selectWorkExperienceOrClientById(mockState, '2');
        expect(result1).not.toBe(result2);
      });
    });
  });
});
