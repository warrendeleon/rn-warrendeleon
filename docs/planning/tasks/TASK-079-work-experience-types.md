# TASK-079: Define Work Experience TypeScript Types

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-017: Work Experience Screen with Company Logos](../stories/US-017-work-experience-screen-display.md), [US-018: Work Experience Redux State Management](../stories/US-018-work-experience-redux-state.md)
**Status**: ✅ Done
**Priority**: High
**Estimated Effort**: 0.5 hours
**Created**: 2025-11-16
**Completed**: 2025-11-16

---

## Context

Define comprehensive TypeScript interfaces and types for work experience data to ensure type safety across the application. These types will be used by the Redux slice, API client, and React components to prevent runtime errors and provide excellent developer experience.

## Technical Details

### Types to Define

**Location**: `src/types/portfolio.ts`

```typescript
/**
 * Represents a client within a work experience entry
 */
export interface Client {
  id: string;
  name: string;
  logo?: string; // Optional SVG filename or URI
  project?: string;
  duration?: string; // e.g., "6 months", "1 year"
  description?: string;
}

/**
 * Represents a work experience entry
 */
export interface WorkExperience {
  id: string;
  company: string; // Company name
  position: string; // Job title
  logo: string; // SVG filename or URI for company logo
  start: string; // ISO date string (YYYY-MM-DD)
  end: string | null; // ISO date string or null for current positions
  description?: string; // Job description
  technologies?: string[]; // Technologies used
  clients?: Client[]; // List of clients (for consulting positions)
  location?: string; // e.g., "London, UK"
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
}

/**
 * Redux state shape for work experience feature
 */
export interface WorkExperienceState {
  data: WorkExperience[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * API response type for work experience endpoint
 */
export interface WorkExperienceApiResponse {
  workExperience: WorkExperience[];
}
```

### Navigation Types

**Location**: `src/types/navigation.ts`

Update the `RootStackParamList` to include work experience routes:

```typescript
export type RootStackParamList = {
  // ... existing routes
  WorkExperience: undefined;
  WorkExperienceDetails: {
    workExperienceId: string;
    companyName: string;
  };
  WorkExperienceClients: {
    workExperienceId: string;
    companyName: string;
  };
};
```

### Files Affected

- `src/types/portfolio.ts` - Add WorkExperience, Client, WorkExperienceState, WorkExperienceApiResponse interfaces
- `src/types/navigation.ts` - Add WorkExperience, WorkExperienceDetails, WorkExperienceClients routes to RootStackParamList

## Acceptance Criteria

- ✅ `WorkExperience` interface defined with all required properties
- ✅ `Client` interface defined for multi-client positions
- ✅ `WorkExperienceState` interface defined for Redux state
- ✅ `WorkExperienceApiResponse` interface defined for API integration
- ✅ Navigation routes added to `RootStackParamList`
- ✅ All types exported from appropriate modules
- ✅ TypeScript strict mode compliance (no `any` types)
- ✅ JSDoc comments added for clarity

## Test Scenarios

### Scenario 1: Type safety in Redux slice

**GIVEN** WorkExperience types are defined
**WHEN** implementing Redux slice with `createSlice`
**THEN** TypeScript should enforce correct state shape
**AND** no type errors should occur

### Scenario 2: Type safety in API client

**GIVEN** WorkExperienceApiResponse is defined
**WHEN** implementing API client with axios
**THEN** response typing should be automatic
**AND** IDE autocomplete should work correctly

### Scenario 3: Type safety in navigation

**GIVEN** navigation routes are typed in RootStackParamList
**WHEN** navigating with `navigation.navigate('WorkExperienceDetails', params)`
**THEN** TypeScript should enforce correct params shape
**AND** autocomplete should suggest valid route names

## Dependencies

**Prerequisites**:

- ✅ TypeScript configured in project
- ✅ `src/types/` directory exists

**Enables**:

- TASK-080: Create WorkExperienceScreen Component
- TASK-081: Set up Work Experience Navigation Routes
- TASK-084: Create Work Experience API Client
- TASK-085: Implement Work Experience Redux Slice

## Success Criteria

- Types provide excellent developer experience (autocomplete, type checking)
- No runtime type errors when used correctly
- Types are reusable across features
- Consistent with existing type patterns (Education, Profile)
- Properly exported and importable

## Notes

- Follow same pattern as Education types for consistency
- Consider optional fields carefully (logo, clients, description)
- Employment dates use ISO format for i18n compatibility
- Client logo field optional since not all clients have logos
- `end` field nullable to support current positions ("Present")
- Employment type enum ensures valid values only
