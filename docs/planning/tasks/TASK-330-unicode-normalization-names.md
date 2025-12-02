# TASK-330: Unicode Normalization for Names

**Task ID**: TASK-330
**Title**: Add Unicode Normalization to Prevent Homograph Attacks
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: 📋 To Do
**Priority**: Medium
**Effort**: 1 hour
**Owner**: Warren de Leon
**Created**: 2025-11-24

---

## Context

Unicode allows characters from multiple scripts (Latin, Cyrillic, Greek) that look identical but have different code points. This enables **homograph attacks** where malicious users can impersonate others or bypass validation.

**Examples**:

- Cyrillic 'а' (U+0430) vs Latin 'a' (U+0061) - Visually identical
- Greek 'ο' (U+03BF) vs Latin 'o' (U+006F) - Visually identical
- User "John" vs "Јohn" (Cyrillic J) - Appear the same

**Security Risk**:

- User impersonation (create account that looks like existing user)
- Bypassing name validation regex (Cyrillic letters pass `/[a-zA-Z]/` in some implementations)
- Database collation issues (names stored differently but displayed identically)

**Current Validation**: Regex `/^[a-zA-Z\s'-]+$/` allows only Latin letters, but doesn't normalize before checking.

This task adds Unicode normalization to detect and block lookalike characters.

---

## Objective

Add Unicode normalization and homograph detection to name validation:

1. Install and configure Unicode normalization library
2. Add `noHomographs()` custom Yup method
3. Normalize names to NFC form before validation
4. Block mixed-script names (e.g., Latin + Cyrillic)
5. Update regex to detect non-Latin characters
6. Add full tests for homograph attempts
7. Document security rationale

**Deliverable**: Name validation that detects and blocks homograph attacks while supporting legitimate international names (hyphens, apostrophes, spaces).

---

## Implementation Guide

### Install Dependencies

```bash
# unorm for Unicode normalization (lightweight, mature)
yarn add unorm

# Types
yarn add -D @types/unorm
```

**Why unorm?**: Lightweight (8KB), supports all normalization forms (NFC, NFD, NFKC, NFKD), widely used.

### Add Homograph Detection

Create utility `src/features/Auth/validation/utils/unicodeUtils.ts`:

```typescript
import unorm from 'unorm';

/**
 * Detects if a string contains characters from multiple scripts (homograph attack)
 *
 * @param value - String to check
 * @returns true if string contains mixed scripts (Latin + Cyrillic, etc.)
 */
export function containsMixedScripts(value: string): boolean {
  if (!value) return false;

  const normalized = unorm.nfc(value); // Normalize to NFC form

  // Unicode ranges
  const hasLatin = /[a-zA-Z]/.test(normalized);
  const hasCyrillic = /[\u0400-\u04FF]/.test(normalized); // Cyrillic
  const hasGreek = /[\u0370-\u03FF]/.test(normalized); // Greek
  const hasArabic = /[\u0600-\u06FF]/.test(normalized); // Arabic

  // Count how many scripts are present
  const scriptCount = [hasLatin, hasCyrillic, hasGreek, hasArabic].filter(Boolean).length;

  return scriptCount > 1;
}

/**
 * Normalizes string to NFC form and checks for non-Latin characters
 *
 * @param value - String to normalize
 * @returns Normalized string
 */
export function normalizeAndValidate(value: string): { normalized: string; isValid: boolean } {
  if (!value) return { normalized: '', isValid: true };

  const normalized = unorm.nfc(value);

  // Allow only Latin letters, spaces, hyphens, apostrophes
  const isValid = /^[a-zA-Z\s'-]+$/.test(normalized);

  return { normalized, isValid };
}

/**
 * Detects common homograph characters
 *
 * @param value - String to check
 * @returns Array of detected lookalike characters
 */
export function detectHomographs(value: string): Array<{ char: string; position: number }> {
  if (!value) return [];

  const homographs: Array<{ char: string; position: number }> = [];

  // Common lookalikes (Cyrillic that look like Latin)
  const lookalikes: Record<string, string> = {
    а: 'a', // Cyrillic a
    е: 'e', // Cyrillic e
    о: 'o', // Cyrillic o
    р: 'p', // Cyrillic r
    с: 'c', // Cyrillic c
    у: 'y', // Cyrillic y
    х: 'x', // Cyrillic x
    А: 'A', // Cyrillic A
    В: 'B', // Cyrillic B
    Е: 'E', // Cyrillic E
    К: 'K', // Cyrillic K
    М: 'M', // Cyrillic M
    Н: 'H', // Cyrillic H
    О: 'O', // Cyrillic O
    Р: 'P', // Cyrillic P
    С: 'C', // Cyrillic C
    Т: 'T', // Cyrillic T
    Х: 'X', // Cyrillic X
  };

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (lookalikes[char]) {
      homographs.push({ char, position: i });
    }
  }

  return homographs;
}
```

### Add Custom Yup Method

Update `src/features/Auth/validation/customRules.ts`:

```typescript
import { containsMixedScripts, normalizeAndValidate } from './utils/unicodeUtils';

/**
 * Custom validation to prevent homograph attacks in names
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'noHomographs',
  function (message = 'Name contains invalid characters') {
    return this.test('no-homographs', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      // Check for mixed scripts (e.g., Latin + Cyrillic)
      if (containsMixedScripts(value)) {
        return createError({
          path,
          message: 'Name cannot contain mixed character sets',
        });
      }

      // Normalize and validate (only Latin letters allowed)
      const { isValid } = normalizeAndValidate(value);

      if (!isValid) {
        return createError({
          path,
          message,
        });
      }

      return true;
    });
  }
);

// TypeScript module augmentation
declare module 'yup' {
  interface StringSchema {
    strongPassword(message?: string): this;
    notCommonPassword(message?: string): this;
    noEmoji(message?: string): this;
    noDisposableEmail(message?: string): this;
    noHomographs(message?: string): this; // NEW
  }
}
```

### Update Registration Schema

Modify `src/features/Auth/validation/registrationSchema.ts`:

```typescript
export const registrationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .noHomographs('First name contains invalid characters') // NEW - Run before regex
    .matches(/^[a-zA-Z\s'-]+$/, 'First name cannot contain numbers or special characters')
    .noEmoji('First name cannot contain emojis')
    .trim(),

  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .noHomographs('Last name contains invalid characters') // NEW - Run before regex
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name cannot contain numbers or special characters')
    .noEmoji('Last name cannot contain emojis')
    .trim(),

  // ... rest of schema
});
```

**Validation Order**: `noHomographs()` → `matches()` → `noEmoji()` → `trim()`

---

## Files Created/Modified

```
src/features/Auth/validation/
├── customRules.ts                                    # Modified (add noHomographs method)
├── registrationSchema.ts                             # Modified (add noHomographs to names)
├── profileUpdateSchema.ts                            # Modified (add noHomographs to names)
├── utils/
│   └── unicodeUtils.ts                               # Created (normalization utilities)
└── __tests__/
    ├── customRules.rntl.ts                           # Modified (add homograph tests)
    ├── registrationSchema.rntl.ts                    # Modified (add homograph tests)
    └── utils/
        └── unicodeUtils.rntl.ts                      # Created (utility tests)
```

---

## Tests

Create `unicodeUtils.rntl.ts`:

```typescript
import {
  containsMixedScripts,
  normalizeAndValidate,
  detectHomographs,
} from '../utils/unicodeUtils';

describe('unicodeUtils', () => {
  describe('containsMixedScripts', () => {
    it('should return false for pure Latin names', () => {
      expect(containsMixedScripts('John')).toBe(false);
      expect(containsMixedScripts("O'Brien")).toBe(false);
      expect(containsMixedScripts('Mary-Jane')).toBe(false);
    });

    it('should return true for Latin + Cyrillic mix', () => {
      expect(containsMixedScripts('Јohn')).toBe(true); // Cyrillic J + Latin
    });

    it('should return true for Latin + Greek mix', () => {
      expect(containsMixedScripts('Jοhn')).toBe(true); // Greek ο (omicron)
    });

    it('should return false for pure Cyrillic names', () => {
      expect(containsMixedScripts('Иван')).toBe(false); // Ivan in Cyrillic
    });
  });

  describe('normalizeAndValidate', () => {
    it('should normalize and validate Latin names', () => {
      const result = normalizeAndValidate('John');
      expect(result.normalized).toBe('John');
      expect(result.isValid).toBe(true);
    });

    it('should reject names with Cyrillic characters', () => {
      const result = normalizeAndValidate('Јohn'); // Cyrillic J
      expect(result.isValid).toBe(false);
    });

    it('should allow hyphens and apostrophes', () => {
      const result1 = normalizeAndValidate("O'Brien");
      expect(result1.isValid).toBe(true);

      const result2 = normalizeAndValidate('Mary-Jane');
      expect(result2.isValid).toBe(true);
    });
  });

  describe('detectHomographs', () => {
    it('should detect Cyrillic "а" (looks like Latin "a")', () => {
      const homographs = detectHomographs('Mаry'); // Cyrillic а at position 1
      expect(homographs).toHaveLength(1);
      expect(homographs[0].char).toBe('а');
      expect(homographs[0].position).toBe(1);
    });

    it('should detect multiple homographs', () => {
      const homographs = detectHomographs('Јоhn'); // Cyrillic Ј and о
      expect(homographs.length).toBeGreaterThan(0);
    });

    it('should return empty array for pure Latin', () => {
      const homographs = detectHomographs('John');
      expect(homographs).toHaveLength(0);
    });
  });
});
```

Add to `registrationSchema.rntl.ts`:

```typescript
describe('firstName validation', () => {
  // ... existing tests

  it('should reject first name with Cyrillic characters', async () => {
    const data = { ...validData, firstName: 'Јohn' }; // Cyrillic J
    await expect(registrationSchema.validate(data)).rejects.toThrow(
      'First name contains invalid characters'
    );
  });

  it('should reject first name with Greek characters', async () => {
    const data = { ...validData, firstName: 'Jοhn' }; // Greek omicron
    await expect(registrationSchema.validate(data)).rejects.toThrow(
      'First name contains invalid characters'
    );
  });

  it('should reject mixed Latin and Cyrillic', async () => {
    const data = { ...validData, firstName: 'Mаry' }; // Cyrillic "а"
    await expect(registrationSchema.validate(data)).rejects.toThrow(
      'First name contains invalid characters'
    );
  });
});
```

---

## Security Checklist

- [ ] **Unicode normalization applied** (NFC form)
- [ ] **Mixed scripts detected** (Latin + Cyrillic/Greek/Arabic)
- [ ] **Homograph characters blocked** (lookalike characters)
- [ ] **Legitimate names allowed** (O'Brien, Mary-Jane, etc.)
- [ ] **Tests cover attack vectors** (Cyrillic, Greek, mixed scripts)
- [ ] **Error messages user-friendly** (don't reveal attack details)

---

## Alternative Approaches

### Alternative 1: Allow All Unicode (Internationalization)

Allow names in any script (Cyrillic, Arabic, Chinese, etc.).

**Pros**: True internationalization, no false positives
**Cons**: Complex validation, homograph attacks still possible, database collation issues

**Decision**: Restrict to Latin only (English-language app, reduces attack surface). Can revisit if international user base grows.

### Alternative 2: Visual Similarity Detection

Use machine learning or visual heuristics to detect lookalike characters.

**Pros**: More accurate, catches subtle homographs
**Cons**: Complex, computationally expensive, requires training data

**Decision**: Rule-based Unicode detection sufficient for MVP. ML can be added later if needed.

---

**Estimated Time**: 1 hour

**Last Updated**: 2025-11-24
