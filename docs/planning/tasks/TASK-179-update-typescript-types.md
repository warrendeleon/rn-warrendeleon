# TASK-179: Update TypeScript Types for New Structure

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update the TypeScript interfaces in `src/types/portfolio.ts` to match the new fixture data structure. This includes renaming fields, updating nested types, and adding new interfaces for the `technologies` object and `client` object.

---

## Current State

The current types in `src/types/portfolio.ts`:

```typescript
export interface Education {
  location: string;
  title: string;
  logo: string;
  start: string;
  end?: string;
  certificate?: string;
}

export interface Profile {
  profilePicture: string;
  name: string;
  lastName: string;
  headline: string;
  // ...
  carousel: string[];
  socials: Socials;
}

export interface Position {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  programmingLanguages?: string[];
  techStack?: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools?: string[];
  agileMethodology?: string[];
  responsibilities?: string[];
}

export interface Client {
  id: string;
  company: string;
  logo: string;
  start: string;
  end: string;
  type: string;
  position: string;
  // ... tech fields
}

export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[];
  clients?: Client[];
}
```

---

## Target State

Updated types matching the new structure:

```typescript
// New: Testing configuration
export interface TestingConfig {
  unit: string[] | null;
  e2e: string[] | null;
}

// New: Technologies object
export interface Technologies {
  languages: string[];
  frameworks: string[];
  testing: TestingConfig;
  tools: string[];
  ci: string[] | null;
  methodology: string[];
}

// New: Client reference (simplified)
export interface ClientReference {
  name: string;
  logo: string;
}

// Updated: Education with new field names
export interface Education {
  id: string;
  institution: string;
  title: string;
  logo: string;
  startDate: string;
  endDate: string | null;
  certificateUrl: string | null;
}

// Updated: Profile with galleryImages
export interface Profile {
  profilePicture: string;
  name: string;
  lastName: string;
  headline: string;
  namePronunciation: string;
  namePronunciationAudioTrack: string;
  email: string;
  phone: string;
  birthday: string;
  location: Location;
  galleryImages: string[]; // Renamed from carousel
  socials: Socials;
}

// Updated: Position with technologies object
export interface Position {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  responsibilities: string[] | null;
  technologies: Technologies | null;
  client: ClientReference | null;
}

// Updated: WorkExperience without clients array
export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[];
  // clients array removed
}
```

---

## Step-by-Step Instructions

### Step 1: Add New Interfaces

Add these new interfaces at the top of the file (after existing imports):

```typescript
/**
 * Testing framework configuration
 */
export interface TestingConfig {
  unit: string[] | null;
  e2e: string[] | null;
}

/**
 * Technology stack for a position
 */
export interface Technologies {
  languages: string[];
  frameworks: string[];
  testing: TestingConfig;
  tools: string[];
  ci: string[] | null;
  methodology: string[];
}

/**
 * Client reference for contract positions
 */
export interface ClientReference {
  name: string;
  logo: string;
}
```

### Step 2: Update Education Interface

```typescript
export interface Education {
  id: string; // NEW
  institution: string; // Renamed from location
  title: string;
  logo: string;
  startDate: string; // Renamed from start
  endDate: string | null; // Renamed from end, now nullable
  certificateUrl: string | null; // Renamed from certificate, now nullable
}
```

### Step 3: Update Profile Interface

Change `carousel` to `galleryImages`:

```typescript
export interface Profile {
  // ... existing fields ...
  galleryImages: string[]; // Renamed from carousel
  socials: Socials;
}
```

### Step 4: Update Position Interface

```typescript
export interface Position {
  id: string;
  title: string;
  startDate: string; // Renamed from start
  endDate: string | null; // Renamed from end, now nullable
  description: string;
  responsibilities: string[] | null; // Now always present
  technologies: Technologies | null; // New nested object
  client: ClientReference | null; // New field for client engagements
}
```

### Step 5: Update WorkExperience Interface

Remove the `clients` array:

```typescript
export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[];
  // clients?: Client[];  // REMOVED
}
```

### Step 6: Remove Deprecated Client Interface

The old `Client` interface is no longer needed. Remove it entirely:

```typescript
// DELETE this interface
export interface Client {
  id: string;
  company: string;
  // ...
}
```

### Step 7: Update Exports

Ensure all new types are exported:

```typescript
export type {
  TestingConfig,
  Technologies,
  ClientReference,
  Education,
  Profile,
  Position,
  WorkExperience,
  // ... other existing exports
};
```

### Step 8: Verification

```bash
yarn typecheck
```

This will initially fail because other files depend on the old types. That's expected - TASK-181 to TASK-183 will fix those.

---

## Files to Modify

- `src/types/portfolio.ts`

---

## Acceptance Criteria

- [ ] `TestingConfig` interface created
- [ ] `Technologies` interface created
- [ ] `ClientReference` interface created
- [ ] `Education` interface updated with new field names
- [ ] `Profile` interface updated with `galleryImages`
- [ ] `Position` interface updated with new structure
- [ ] `WorkExperience` interface updated (clients removed)
- [ ] Old `Client` interface removed
- [ ] All new types exported
- [ ] JSDoc comments added to new interfaces

---

## Implementation Notes

- **Breaking change**: This is a breaking change that will cause TypeScript errors in dependent files. This is expected and will be resolved in subsequent tasks.
- **Nullable vs optional**: Use `string | null` for fields that are always present but may be null, use `?:` for fields that may be omitted entirely.
- **Import updates**: Files that import `Client` will need to be updated to use `ClientReference` or remove the import.

---

## Dependencies

- [TASK-173](./TASK-173-standardise-date-formats.md) to [TASK-178](./TASK-178-normalise-tech-stack-fields.md) - Fixture structure finalised

---

## Next Steps

- [TASK-180](./TASK-180-update-zod-schemas.md) - Update Zod Schemas for New Structure
