# TASK-084: Create Work Experience API Client

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-018: Work Experience Redux State Management](../stories/US-018-work-experience-redux-state.md)
**Status**: ✅ Done
**Priority**: High
**Estimated Effort**: 1.5 hours
**Created**: 2025-11-16
**Completed**: 2025-11-16

---

## Context

Create an API client for fetching work experience data from the backend GitHub API. This client will validate responses using Zod schemas, handle errors gracefully, and support multi-language data fetching.

## Technical Details

### API Client Implementation

**Location**: `src/features/WorkExperience/api/api.ts`

```typescript
import { z } from 'zod';
import axiosInstance from '@app/api/axiosInstance';
import type { WorkExperience } from '@app/types/portfolio';

// Zod schema for Client validation
const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().optional(),
  project: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
});

// Zod schema for WorkExperience validation
const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  logo: z.string(),
  start: z.string(), // ISO date string
  end: z.string().nullable(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  clients: z.array(ClientSchema).optional(),
  location: z.string().optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'freelance']).optional(),
});

// Zod schema for API response
const WorkExperienceApiResponseSchema = z.object({
  workExperience: z.array(WorkExperienceSchema),
});

/**
 * Fetches work experience data from the GitHub API
 * @param locale - Language code (en, es, ca, pl, tl)
 * @returns Promise resolving to array of WorkExperience objects
 * @throws Error if API request fails or response is invalid
 */
export const getWorkExperience = async (locale: string): Promise<WorkExperience[]> => {
  try {
    // Construct GitHub raw content URL
    const url = `/portfolio-data/${locale}/workExperience.json`;

    // Make API request
    const response = await axiosInstance.get(url);

    // Validate response with Zod
    const validatedData = WorkExperienceApiResponseSchema.parse(response.data);

    // Sort by start date (newest first)
    const sortedData = validatedData.workExperience.sort((a, b) => {
      return new Date(b.start).getTime() - new Date(a.start).getTime();
    });

    return sortedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Schema validation error
      console.error('Work experience data validation failed:', error.errors);
      throw new Error('Invalid work experience data format');
    }

    // Network or other errors
    console.error('Failed to fetch work experience:', error);
    throw new Error('Failed to load work experience');
  }
};

/**
 * Fetches work experience data for a specific company
 * @param locale - Language code
 * @param workExperienceId - Work experience ID
 * @returns Promise resolving to single WorkExperience object
 * @throws Error if not found or request fails
 */
export const getWorkExperienceById = async (
  locale: string,
  workExperienceId: string
): Promise<WorkExperience> => {
  const allWorkExperience = await getWorkExperience(locale);
  const workExperience = allWorkExperience.find(item => item.id === workExperienceId);

  if (!workExperience) {
    throw new Error(`Work experience not found: ${workExperienceId}`);
  }

  return workExperience;
};
```

### API Tests

**Location**: `src/features/WorkExperience/api/__tests__/api.test.ts`

```typescript
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getWorkExperience, getWorkExperienceById } from '../api';
import type { WorkExperience } from '@app/types/portfolio';

const mockAxios = new MockAdapter(axios);

describe('Work Experience API', () => {
  const mockWorkExperienceData: WorkExperience[] = [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      logo: 'techcorp.svg',
      start: '2020-01-01',
      end: '2023-06-30',
      clients: [
        { id: 'c1', name: 'Client A' },
        { id: 'c2', name: 'Client B' },
      ],
      employmentType: 'full-time',
    },
    {
      id: '2',
      company: 'Startup Inc',
      position: 'Lead Engineer',
      logo: 'startup.svg',
      start: '2018-03-15',
      end: '2019-12-31',
      employmentType: 'contract',
    },
  ];

  afterEach(() => {
    mockAxios.reset();
  });

  describe('getWorkExperience', () => {
    it('fetches and returns work experience data successfully', async () => {
      mockAxios
        .onGet('/portfolio-data/en/workExperience.json')
        .reply(200, { workExperience: mockWorkExperienceData });

      const result = await getWorkExperience('en');

      expect(result).toEqual(mockWorkExperienceData);
    });

    it('sorts work experience by start date (newest first)', async () => {
      mockAxios
        .onGet('/portfolio-data/en/workExperience.json')
        .reply(200, { workExperience: mockWorkExperienceData });

      const result = await getWorkExperience('en');

      expect(result[0].company).toBe('Tech Corp'); // 2020 start
      expect(result[1].company).toBe('Startup Inc'); // 2018 start
    });

    it('handles network errors', async () => {
      mockAxios.onGet('/portfolio-data/en/workExperience.json').networkError();

      await expect(getWorkExperience('en')).rejects.toThrow('Failed to load work experience');
    });

    it('handles invalid response schema', async () => {
      const invalidData = { workExperience: [{ company: 'Test' }] }; // Missing required fields

      mockAxios.onGet('/portfolio-data/en/workExperience.json').reply(200, invalidData);

      await expect(getWorkExperience('en')).rejects.toThrow('Invalid work experience data format');
    });

    it('fetches data for different locales', async () => {
      mockAxios
        .onGet('/portfolio-data/es/workExperience.json')
        .reply(200, { workExperience: mockWorkExperienceData });

      await getWorkExperience('es');

      expect(mockAxios.history.get[0].url).toBe('/portfolio-data/es/workExperience.json');
    });
  });

  describe('getWorkExperienceById', () => {
    beforeEach(() => {
      mockAxios
        .onGet('/portfolio-data/en/workExperience.json')
        .reply(200, { workExperience: mockWorkExperienceData });
    });

    it('fetches work experience by ID successfully', async () => {
      const result = await getWorkExperienceById('en', '1');

      expect(result.company).toBe('Tech Corp');
      expect(result.id).toBe('1');
    });

    it('throws error when ID not found', async () => {
      await expect(getWorkExperienceById('en', 'non-existent')).rejects.toThrow(
        'Work experience not found: non-existent'
      );
    });
  });
});
```

### Files Affected

- `src/features/WorkExperience/api/api.ts` - New API client
- `src/features/WorkExperience/api/__tests__/api.test.ts` - New API tests
- `src/api/axiosInstance.ts` - Existing axios instance (reused)

## Acceptance Criteria

- ✅ API client function `getWorkExperience()` implemented
- ✅ Supports multi-language data fetching (locale parameter)
- ✅ Validates response with Zod schema
- ✅ Sorts work experience by start date (newest first)
- ✅ Handles network errors gracefully
- ✅ Handles schema validation errors
- ✅ Returns user-friendly error messages
- ✅ `getWorkExperienceById()` helper function implemented
- ✅ API tests achieve 100% coverage
- ✅ All tests pass with `yarn test`
- ✅ TypeScript strict mode compliance
- ✅ No lint errors or warnings

## Test Scenarios

### Scenario 1: Successful data fetch

**GIVEN** the API returns valid work experience data
**WHEN** `getWorkExperience('en')` is called
**THEN** data should be returned as WorkExperience array
**AND** data should be sorted by start date (newest first)

### Scenario 2: Network error handling

**GIVEN** the API request fails with network error
**WHEN** `getWorkExperience('en')` is called
**THEN** function should throw error with message "Failed to load work experience"

### Scenario 3: Schema validation error

**GIVEN** the API returns invalid data format
**WHEN** `getWorkExperience('en')` is called
**THEN** function should throw error with message "Invalid work experience data format"

### Scenario 4: Multi-language support

**GIVEN** different locale parameter passed
**WHEN** `getWorkExperience('es')` is called
**THEN** API should fetch from `/portfolio-data/es/workExperience.json`

### Scenario 5: Fetch by ID

**GIVEN** work experience ID exists
**WHEN** `getWorkExperienceById('en', '1')` is called
**THEN** function should return single WorkExperience object

### Scenario 6: ID not found

**GIVEN** work experience ID does not exist
**WHEN** `getWorkExperienceById('en', 'invalid')` is called
**THEN** function should throw error "Work experience not found"

## Dependencies

**Prerequisites**:

- ✅ TASK-079: Work Experience TypeScript types defined
- ✅ Axios instance configured (`src/api/axiosInstance.ts`)
- ✅ Zod installed for schema validation

**Enables**:

- TASK-085: Implement Work Experience Redux Slice
- TASK-086: Unit Tests for Work Experience Redux

## Success Criteria

- API client fetches data reliably
- Schema validation prevents invalid data
- Error messages are user-friendly
- Multi-language support works correctly
- Sorting logic correct (newest first)
- 100% test coverage achieved
- Code quality: zero TypeScript errors, zero lint warnings

## Notes

- Reuse existing axios instance for consistency
- Follow same pattern as Education and Profile API clients
- Zod schema ensures runtime type safety
- Sorting by start date critical for UI display order
- Error messages should not expose technical details to users
- Consider adding caching layer in future iteration
- GitHub API URL structure should match existing portfolio data endpoints
