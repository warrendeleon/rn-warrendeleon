import { fetchWorkExperience } from '../actions';
import { clearWorkExperience, workExperienceReducer, type WorkExperienceState } from '../reducer';

describe('workExperienceReducer', () => {
  const initialState: WorkExperienceState = {
    data: [],
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(workExperienceReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearWorkExperience', () => {
    const previousState: WorkExperienceState = {
      data: [
        {
          id: '1',
          company: 'Test Company',
          positions: [
            {
              id: 'pos-1',
              title: 'Developer',
              startDate: '2020-01',
              endDate: '2021-01',
              description: 'Test',
              responsibilities: null,
              technologies: null,
              client: null,
            },
          ],
        },
      ],
      loading: false,
      error: 'Some error',
    };

    expect(workExperienceReducer(previousState, clearWorkExperience())).toEqual({
      data: [],
      loading: false,
      error: null,
    });
  });

  describe('fetchWorkExperience', () => {
    it('should set loading to true on pending', () => {
      const action = { type: fetchWorkExperience.pending.type };
      const state = workExperienceReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set data and loading to false on fulfilled', () => {
      const mockData = [
        {
          id: '1',
          company: 'Test Company',
          positions: [
            {
              id: 'pos-1',
              title: 'Developer',
              startDate: '2020-01',
              endDate: '2021-01',
              description: 'Test',
              responsibilities: null,
              technologies: null,
              client: null,
            },
          ],
        },
      ];

      const action = {
        type: fetchWorkExperience.fulfilled.type,
        payload: mockData,
      };

      const state = workExperienceReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockData);
      expect(state.error).toBeNull();
    });

    it('should set error and loading to false on rejected', () => {
      const action = {
        type: fetchWorkExperience.rejected.type,
        error: { message: 'Failed to fetch' },
      };

      const state = workExperienceReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });

    it('should use default error message when error message is undefined', () => {
      const action = {
        type: fetchWorkExperience.rejected.type,
        error: {},
      };

      const state = workExperienceReducer(initialState, action);

      expect(state.error).toBe('Failed to fetch work experience');
    });
  });
});
