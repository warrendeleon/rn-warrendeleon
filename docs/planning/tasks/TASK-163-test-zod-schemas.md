# TASK-163: Add Tests for Zod Schemas

**Status**: ✅ Done
**Priority**: Medium
**Effort**: 1h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Create unit tests for all Zod schemas to ensure they validate correctly and produce helpful error messages.

---

## Prerequisites

- [ ] TASK-159 through TASK-161 completed (all schemas exist)

---

## Step-by-Step Instructions

### Step 1: Create Schema Tests Directory

```bash
mkdir -p src/schemas/__tests__
```

---

### Step 2: Create Profile Schema Tests

**File: `src/schemas/__tests__/profile.schema.rntl.ts`**

```typescript
import { ProfileSchema } from '../profile.schema';

describe('ProfileSchema', () => {
  const validProfile = {
    profilePicture: 'https://example.com/photo.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    headline: 'Software Engineer',
    namePronunciation: 'WAR-en',
    namePronunciationAudioTrack: '',
    email: 'test@example.com',
    phone: '+1234567890',
    birthday: '1990-01-01',
    location: { city: 'Barcelona', country: 'Spain' },
    carousel: ['https://example.com/1.jpg'],
    socials: { linkedin: 'https://linkedin.com/in/test' },
  };

  it('validates correct profile data', () => {
    const result = ProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = ProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = ProfileSchema.safeParse({
      ...validProfile,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('email');
    }
  });

  it('rejects invalid profile picture URL', () => {
    const result = ProfileSchema.safeParse({
      ...validProfile,
      profilePicture: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('allows empty carousel array', () => {
    const result = ProfileSchema.safeParse({
      ...validProfile,
      carousel: [],
    });
    expect(result.success).toBe(true);
  });
});
```

---

### Step 3: Create Education Schema Tests

**File: `src/schemas/__tests__/education.schema.rntl.ts`**

```typescript
import { EducationSchema, EducationItemSchema } from '../education.schema';

describe('EducationSchema', () => {
  const validEducation = {
    id: 'edu-1',
    institution: 'University',
    logo: 'https://example.com/logo.png',
    degree: 'BSc Computer Science',
    location: 'Barcelona',
    start: '2010',
    end: '2014',
    certificateUrl: '',
  };

  it('validates single education item', () => {
    const result = EducationItemSchema.safeParse(validEducation);
    expect(result.success).toBe(true);
  });

  it('validates array of education items', () => {
    const result = EducationSchema.safeParse([validEducation, validEducation]);
    expect(result.success).toBe(true);
  });

  it('rejects missing institution', () => {
    const { institution, ...invalid } = validEducation;
    const result = EducationItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('allows optional certificateUrl', () => {
    const result = EducationItemSchema.safeParse({
      ...validEducation,
      certificateUrl: undefined,
    });
    expect(result.success).toBe(true);
  });
});
```

---

### Step 4: Create Work Experience Schema Tests

**File: `src/schemas/__tests__/workExperience.schema.rntl.ts`**

```typescript
import { WorkExperienceSchema, WorkExperienceItemSchema } from '../workExperience.schema';

describe('WorkExperienceSchema', () => {
  const validWorkExp = {
    id: 'work-1',
    company: 'Tech Corp',
    logo: 'https://example.com/logo.png',
    start: '2020',
    end: 'Present',
    type: 'Full-time',
    position: 'Senior Developer',
    programmingLanguages: ['TypeScript'],
    techStack: ['React Native'],
  };

  it('validates work experience with all required fields', () => {
    const result = WorkExperienceItemSchema.safeParse(validWorkExp);
    expect(result.success).toBe(true);
  });

  it('validates array of work experience', () => {
    const result = WorkExperienceSchema.safeParse([validWorkExp]);
    expect(result.success).toBe(true);
  });

  it('provides defaults for optional arrays', () => {
    const result = WorkExperienceItemSchema.safeParse(validWorkExp);
    if (result.success) {
      expect(result.data.devTools).toEqual([]);
      expect(result.data.ci).toEqual([]);
    }
  });

  it('validates nested clients array', () => {
    const withClients = {
      ...validWorkExp,
      clients: [
        {
          id: 'client-1',
          company: 'Client Corp',
          logo: 'https://example.com/client.png',
          start: '2020',
          end: '2021',
          type: 'Contract',
          position: 'Developer',
        },
      ],
    };
    const result = WorkExperienceItemSchema.safeParse(withClients);
    expect(result.success).toBe(true);
  });
});
```

---

### Step 5: Run Tests

```bash
yarn test src/schemas/__tests__/
```

**Expected**: All schema tests pass.

---

### Step 6: Commit

```bash
git add src/schemas/__tests__/
git commit -m "✅ test(schemas): add unit tests for Zod schemas

- Test ProfileSchema validation and error cases
- Test EducationSchema with single and array items
- Test WorkExperienceSchema with nested clients
- Verify default values and optional fields

Part of EPIC-018: Zod Schema Validation Integration
TASK-163"
```

---

## Verification Checklist

- [x] Profile schema tests pass
- [x] Education schema tests pass
- [x] Work Experience schema tests pass
- [x] Error messages are helpful

---

## Next Steps

- [TASK-164](./TASK-164-update-zod-documentation.md) - Update Documentation
