# TASK-184: Update Unit Tests for New Data Structure

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update all unit tests (RNTL and Jest) to work with the new fixture data structure. This includes updating mock data, test fixtures, assertions, and snapshot tests to reflect the renamed fields and restructured objects.

---

## Test Files to Update

### Schema Tests

- `src/schemas/__tests__/education.schema.test.ts`
- `src/schemas/__tests__/profile.schema.test.ts`
- `src/schemas/__tests__/workExperience.schema.test.ts`

### Redux Tests

- `src/features/Profile/store/__tests__/*.test.ts`
- `src/features/Education/store/__tests__/*.test.ts`
- `src/features/WorkExperience/store/__tests__/*.test.ts`

### API Tests

- `src/features/Profile/api/__tests__/*.test.ts`
- `src/features/Education/api/__tests__/*.test.ts`
- `src/features/WorkExperience/api/__tests__/*.test.ts`

### Component Tests

- `src/features/Profile/**/__tests__/*.test.tsx`
- `src/features/Education/**/__tests__/*.test.tsx`
- `src/features/WorkExperience/**/__tests__/*.test.tsx`

---

## Step-by-Step Instructions

### Step 1: Update Test Fixtures/Mock Data

Create updated mock data matching the new structure:

```typescript
// src/test-utils/fixtures/mockData.ts

export const mockEducation = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    institution: 'Udemy', // Not location
    title: 'CircleCI: The complete introduction',
    logo: 'https://example.com/udemy.svg',
    startDate: '2021-04', // Not start
    endDate: null,
    certificateUrl: 'https://example.com/cert.jpg', // Not certificate
  },
];

export const mockProfile = {
  profilePicture: 'https://example.com/photo.jpg',
  name: 'Test',
  lastName: 'User',
  // ...
  galleryImages: [
    // Not carousel
    'https://example.com/img1.jpg',
    'https://example.com/img2.jpg',
  ],
  socials: {
    /* ... */
  },
};

export const mockPosition = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Senior React Native Engineer',
  startDate: '2023-01', // Not start
  endDate: '2023-10', // Not end
  description: 'Test description',
  responsibilities: null,
  technologies: {
    languages: ['TypeScript'],
    frameworks: ['React Native', 'Redux'],
    testing: {
      unit: ['React Native Testing Library'],
      e2e: ['Detox'],
    },
    tools: ['WebStorm', 'Xcode', 'Git'],
    ci: ['CircleCI'],
    methodology: ['Scrum'],
  },
  client: null,
};

export const mockWorkExperience = [
  {
    id: '75313d55-2ef2-4a68-b183-f4b32e88b397',
    company: 'Test Company',
    logo: 'https://example.com/logo.svg',
    positions: [mockPosition],
  },
];
```

### Step 2: Update Schema Tests

**File**: `src/schemas/__tests__/education.schema.test.ts`

```typescript
import { EducationSchema } from '../education.schema';

describe('EducationSchema', () => {
  it('should validate correct education data', () => {
    const validData = [
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        institution: 'Udemy',
        title: 'Course Title',
        logo: 'https://example.com/logo.svg',
        startDate: '2021-04',
        endDate: null,
        certificateUrl: 'https://example.com/cert.jpg',
      },
    ];

    expect(() => EducationSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid date format', () => {
    const invalidData = [
      {
        id: 'uuid',
        institution: 'Udemy',
        title: 'Course',
        logo: 'https://example.com/logo.svg',
        startDate: 'April 2021', // Wrong format
        endDate: null,
        certificateUrl: null,
      },
    ];

    expect(() => EducationSchema.parse(invalidData)).toThrow();
  });

  it('should require id field', () => {
    const missingId = [
      {
        institution: 'Udemy',
        title: 'Course',
        logo: 'https://example.com/logo.svg',
        startDate: '2021-04',
        endDate: null,
        certificateUrl: null,
      },
    ];

    expect(() => EducationSchema.parse(missingId)).toThrow();
  });
});
```

### Step 3: Update Redux Selector Tests

**File**: `src/features/Education/store/__tests__/selectors.test.ts`

```typescript
describe('selectEducationById', () => {
  it('should select education by id', () => {
    const state = {
      education: {
        data: [
          { id: 'edu-1', institution: 'Udemy' /* ... */ },
          { id: 'edu-2', institution: 'Stucom' /* ... */ },
        ],
        loading: false,
        error: null,
      },
    };

    const result = selectEducationById('edu-1')(state);
    expect(result?.institution).toBe('Udemy');
  });
});
```

### Step 4: Update Component Tests

**File**: `src/features/Education/**/__tests__/EducationDataScreen.test.tsx`

```typescript
describe('EducationDataScreen', () => {
  it('should display education entries', () => {
    const mockData = [
      {
        id: 'uuid-1',
        institution: 'Udemy',  // Not location
        title: 'Test Course',
        logo: 'https://example.com/logo.svg',
        startDate: '2021-04',
        endDate: null,
        certificateUrl: null,
      },
    ];

    render(<EducationDataScreen />, {
      preloadedState: {
        education: { data: mockData, loading: false, error: null },
      },
    });

    expect(screen.getByText('Udemy')).toBeTruthy();
    expect(screen.getByText('Test Course')).toBeTruthy();
  });
});
```

### Step 5: Update Snapshot Tests

Regenerate snapshots after all changes:

```bash
yarn test --updateSnapshot
```

Review the snapshot diffs to ensure they reflect expected field name changes.

### Step 6: Update WorkExperience Tests for Technologies

```typescript
describe('WorkExperienceDetailsScreen', () => {
  it('should display technologies for developer roles', () => {
    const position = {
      id: 'pos-1',
      title: 'Senior Engineer',
      startDate: '2023-01',
      endDate: '2023-10',
      description: 'Test',
      responsibilities: null,
      technologies: {
        languages: ['TypeScript'],
        frameworks: ['React Native'],
        testing: { unit: ['RNTL'], e2e: ['Detox'] },
        tools: ['WebStorm'],
        ci: ['CircleCI'],
        methodology: ['Scrum'],
      },
      client: null,
    };

    render(<WorkExperienceDetailsScreen position={position} />);

    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('React Native')).toBeTruthy();
    expect(screen.getByText('Detox')).toBeTruthy();
  });

  it('should display responsibilities for manager roles', () => {
    const position = {
      id: 'pos-2',
      title: 'Engineering Manager',
      startDate: '2023-10',
      endDate: null,
      description: 'Test',
      responsibilities: ['People Leadership', 'Agile Delivery'],
      technologies: null,
      client: null,
    };

    render(<WorkExperienceDetailsScreen position={position} />);

    expect(screen.getByText('People Leadership')).toBeTruthy();
    expect(screen.getByText('Agile Delivery')).toBeTruthy();
  });
});
```

### Step 7: Run All Tests

```bash
yarn test
yarn test --coverage
```

Ensure coverage thresholds are still met.

---

## Files to Modify

All test files in:

- `src/schemas/__tests__/`
- `src/features/Profile/**/__tests__/`
- `src/features/Education/**/__tests__/`
- `src/features/WorkExperience/**/__tests__/`
- `src/test-utils/fixtures/` (mock data)

---

## Acceptance Criteria

- [ ] All mock data updated to new structure
- [ ] Schema tests validate new field names
- [ ] Redux tests use new selectors and field names
- [ ] Component tests updated for new data shape
- [ ] Snapshot tests regenerated and reviewed
- [ ] No test failures
- [ ] Coverage thresholds maintained (85%)

---

## Implementation Notes

- **Mock data consistency**: Use a single source of truth for mock data (e.g., `src/test-utils/fixtures/mockData.ts`) to avoid duplication.
- **Snapshot updates**: Review snapshot diffs carefully - they should only show field name changes, not structural changes in rendering.
- **Type imports**: Update test file imports to use new types.

---

## Dependencies

- [TASK-179](./TASK-179-update-typescript-types.md) to [TASK-183](./TASK-183-update-ui-components.md) - Code must be updated first

---

## Next Steps

- [TASK-185](./TASK-185-update-e2e-tests.md) - Update E2E Tests for New Data Structure
