# TASK-329: Expand Common Password List

**Task ID**: TASK-329
**Title**: Expand Common Password List to Top 10,000
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ✅ Done
**Priority**: Medium
**Effort**: 1.5 hours
**Owner**: Warren de Leon
**Created**: 2025-11-24

---

## Context

Currently, the `notCommonPassword()` custom Yup method validates against only the top 100 most common passwords. This provides basic protection but is insufficient against sophisticated password cracking attacks.

**Security Risk**: Attackers use dictionaries of millions of passwords. The top 10,000 most common passwords account for approximately 91% of all passwords used globally. Expanding our list significantly improves security.

**Current Implementation**: `customRules.ts` contains a hardcoded array of 100 common passwords.

This task expands the list to the top 10,000 passwords using a curated, well-maintained password list.

---

## Objective

Expand the common password blacklist from top 100 to top 10,000:

1. Download authoritative password list (SecLists or HIBP)
2. Create JSON file with top 10,000 passwords
3. Update `notCommonPassword()` to load from file
4. Add performance optimization (lazy loading or hash lookup)
5. Update tests to cover new edge cases
6. Document password list source and update process

**Deliverable**: Common password validation protecting against top 10,000 passwords with minimal performance impact.

---

## Implementation Guide

### Download Password List

Use Daniel Miessler's SecLists (widely trusted, regularly updated):

```bash
# Clone SecLists repository (or download specific file)
curl -O https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-10000.txt

# Save to project
mkdir -p src/features/Auth/validation/data
mv 10-million-password-list-top-10000.txt src/features/Auth/validation/data/common-passwords-10000.txt
```

**Alternative**: Use Have I Been Pwned (HIBP) ordered password list (requires attribution).

### Convert to JSON

Create `src/features/Auth/validation/data/common-passwords-10000.json`:

```typescript
// scripts/generate-password-list.ts
import fs from 'fs';

const txtPath = './src/features/Auth/validation/data/common-passwords-10000.txt';
const jsonPath = './src/features/Auth/validation/data/common-passwords-10000.json';

const passwords = fs
  .readFileSync(txtPath, 'utf-8')
  .split('\n')
  .map(line => line.trim().toLowerCase())
  .filter(Boolean);

fs.writeFileSync(jsonPath, JSON.stringify(passwords, null, 2));
console.log(`✅ Generated ${passwords.length} passwords in JSON format`);
```

Run once during setup: `ts-node scripts/generate-password-list.ts`

### Update Custom Validation Rule

Modify `src/features/Auth/validation/customRules.ts`:

```typescript
import commonPasswords from './data/common-passwords-10000.json';

// Convert array to Set for O(1) lookup performance
const COMMON_PASSWORDS_SET = new Set(commonPasswords.map((p: string) => p.toLowerCase()));

yup.addMethod<yup.StringSchema>(
  yup.string,
  'notCommonPassword',
  function (message = 'This password is too common. Please choose a different one.') {
    return this.test('not-common-password', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      const isCommon = COMMON_PASSWORDS_SET.has(value.toLowerCase());

      if (isCommon) {
        return createError({ path, message });
      }

      return true;
    });
  }
);
```

**Performance**: Using `Set` for 10,000 passwords provides O(1) lookup vs O(n) array search. Negligible memory overhead (~200KB).

### Add to .gitignore (Text File Only)

Add to `.gitignore`:

```
# Password lists (keep JSON, ignore raw text to reduce repo size)
src/features/Auth/validation/data/*.txt
```

**Rationale**: JSON file is commit-friendly (formatted, diffable). Raw text file is regenerated from source as needed.

### Update Tests

Add test cases in `customRules.rntl.ts`:

```typescript
describe('notCommonPassword with expanded list', () => {
  it('should reject password from top 10', async () => {
    const data = { password: '123456' }; // #1 most common
    await expect(schema.validate(data)).rejects.toThrow(
      'This password is too common. Please choose a different one.'
    );
  });

  it('should reject password from top 1000', async () => {
    const data = { password: 'sunshine' }; // Rank ~200
    await expect(schema.validate(data)).rejects.toThrow(
      'This password is too common. Please choose a different one.'
    );
  });

  it('should reject password from top 10000', async () => {
    const data = { password: 'soccer' }; // Rank ~5000
    await expect(schema.validate(data)).rejects.toThrow(
      'This password is too common. Please choose a different one.'
    );
  });

  it('should accept uncommon strong password', async () => {
    const data = { password: 'Xq9#mK2$zR7!wP' }; // Not in top 10K
    await expect(schema.validate(data)).resolves.toMatchObject(data);
  });

  it('should be case insensitive', async () => {
    const data = { password: 'PASSWORD' }; // Lowercase "password" is #2
    await expect(schema.validate(data)).rejects.toThrow(
      'This password is too common. Please choose a different one.'
    );
  });
});
```

### Document Source & Updates

Add to `customRules.ts` header comment:

```typescript
/**
 * Custom Yup Validation Rules for Authentication Forms
 *
 * Common Password List:
 * - Source: SecLists by Daniel Miessler
 *   https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10-million-password-list-top-10000.txt
 * - Version: Top 10,000 passwords (covers ~91% of all passwords globally)
 * - Last Updated: 2025-11-24
 * - Update Process:
 *   1. Download latest list from SecLists
 *   2. Run: ts-node scripts/generate-password-list.ts
 *   3. Commit updated JSON file
 *   4. Run tests to verify
 */
```

---

## Files Created/Modified

```
src/features/Auth/validation/
├── customRules.ts                                    # Modified (use Set, load from JSON)
├── data/
│   ├── common-passwords-10000.txt                    # Created (git-ignored)
│   └── common-passwords-10000.json                   # Created (committed)
└── __tests__/
    └── customRules.rntl.ts                           # Modified (add expanded list tests)

scripts/
└── generate-password-list.ts                         # Created (conversion script)

.gitignore                                            # Modified (ignore .txt files)
```

---

## Tests

Run existing tests to ensure no regressions:

```bash
yarn test src/features/Auth/validation/__tests__/customRules.rntl.ts
```

All existing tests should pass. New tests validate expanded list coverage.

---

## Performance Considerations

**Memory Usage**:

- Array (100 passwords): ~2KB
- Set (10,000 passwords): ~200KB
- Impact: Negligible on modern devices

**Lookup Speed**:

- Array `.includes()`: O(n) - Up to 10,000 iterations
- Set `.has()`: O(1) - Single hash lookup
- Result: **10,000× faster** for worst-case lookups

**Bundle Size**:

- JSON file: ~120KB uncompressed
- Gzipped: ~30KB (included in app bundle)
- Impact: Minimal (0.03% of typical app size)

---

## Security Checklist

- [ ] **Password list from trusted source** (SecLists or HIBP)
- [ ] **Case-insensitive matching** (all passwords lowercased)
- [ ] **Set used for O(1) lookup** (performance)
- [ ] **JSON committed to repo** (version controlled)
- [ ] **Text file git-ignored** (reduces repo size)
- [ ] **Tests cover top, middle, bottom of list** (comprehensive)
- [ ] **Documentation includes source and update process** (maintainability)

---

## Alternative Approaches

### Alternative 1: Use Have I Been Pwned (HIBP) API

Call HIBP Pwned Passwords API in real-time.

**Pros**: Always up-to-date, 850M+ passwords
**Cons**: Network call (slower, can fail), privacy concerns (even with k-anonymity), requires internet

**Decision**: Offline list for reliability and privacy.

### Alternative 2: Hash-Based Lookup

Store SHA-256 hashes instead of plaintext passwords.

**Pros**: Slight security improvement (passwords not readable in bundle)
**Cons**: Adds hashing overhead, minimal benefit (attacker already has access to device if reading bundle)

**Decision**: Plaintext in bundle acceptable (device storage is encrypted at OS level).

---

**Estimated Time**: 1.5 hours

**Last Updated**: 2025-11-24
