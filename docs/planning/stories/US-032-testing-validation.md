# US-032: Testing & Validation

**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)
**Status**: ✅ Done
**Effort**: 4.5 hours

---

## User Story

**As a** developer completing the data structure refactor
**I want** all tests updated and comprehensive validation of the new data structure
**So that** I can be confident the changes work correctly across all languages and use cases

---

## Background

After restructuring the fixture data (US-028, US-029), updating types (US-030), and integrating changes into the codebase (US-031), comprehensive testing is required to ensure:

- All 5 locale variants (en, es, ca, pl, tl) have identical structure
- Unit tests reflect the new data model
- E2E tests work with the new structure
- No regressions in existing functionality
- Data integrity is maintained across all languages

Without thorough testing:

- Locale variants might have inconsistent structures
- Hidden bugs might exist in selectors or components
- E2E tests might fail unexpectedly
- Regressions could be deployed to production

---

## Acceptance Criteria

- [ ] All unit tests updated for new structure
- [ ] All E2E tests updated for new structure
- [ ] Locale variant validation complete
- [ ] All 5 languages tested (en, es, ca, pl, tl)
- [ ] No structural differences between locales
- [ ] All tests passing
- [ ] Test coverage maintained at 85%+
- [ ] No regressions detected

---

## Technical Details

### Unit Test Updates

```typescript
// src/features/WorkExperience/store/__tests__/selectors.rntl.tsx

// OLD: Tests for nested clients structure
describe('selectWorkExperienceClients', () => {
  it('should return clients array', () => {
    const clients = selectWorkExperienceClients(state, 'sky');
    expect(clients).toHaveLength(2);
    expect(clients[0].name).toBe('Client 1');
  });
});

// NEW: Tests for flattened positions structure
describe('selectWorkExperiencePositions', () => {
  it('should return positions array', () => {
    const positions = selectWorkExperiencePositions(state, 'sky');
    expect(positions).toHaveLength(3);
    expect(positions[0].clientName).toBe('Client 1');
  });

  it('should handle ISO 8601 dates', () => {
    const position = selectPositionById(state, 'sky', 'position-1');
    expect(position.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should use normalised field names', () => {
    const position = selectPositionById(state, 'sky', 'position-1');
    expect(position.techStack).toBeDefined();
    expect(position.technologies).toBeUndefined(); // Old field name
  });
});
```

### E2E Test Updates

```gherkin
# e2e/features/WorkExperience.feature

# OLD: References nested clients
Scenario: View work experience client details
  When I tap on a work experience entry
  And I tap on a client
  Then I should see the client details

# NEW: References flattened positions
Scenario: View work experience position details
  When I tap on a work experience entry
  And I tap on a position
  Then I should see the position details
  And I should see the client name
  And I should see formatted dates in ISO 8601
  And I should see the technology stack
```

### Locale Validation Script

```typescript
// scripts/validate-locales.ts

import * as fs from 'fs';

const LOCALES = ['en', 'es', 'ca', 'pl', 'tl'];

interface ValidationResult {
  locale: string;
  valid: boolean;
  errors: string[];
}

function validateStructure(data: any, locale: string): string[] {
  const errors: string[] = [];

  // Check work experience structure
  data.workExperience?.forEach((workExp: any, index: number) => {
    if (!workExp.id) {
      errors.push(`[${locale}] workExperience[${index}]: Missing id`);
    }

    if (!workExp.positions) {
      errors.push(`[${locale}] workExperience[${index}]: Missing positions array`);
    }

    if (workExp.clients) {
      errors.push(`[${locale}] workExperience[${index}]: Old 'clients' structure found`);
    }

    // Check date formats
    if (workExp.startDate && !workExp.startDate.match(/^\d{4}-\d{2}-\d{2}T/)) {
      errors.push(`[${locale}] workExperience[${index}]: startDate not ISO 8601`);
    }

    // Check field names
    if (workExp.technologies && !workExp.techStack) {
      errors.push(`[${locale}] workExperience[${index}]: Old 'technologies' field found`);
    }

    // Validate positions
    workExp.positions?.forEach((position: any, posIndex: number) => {
      if (!position.id) {
        errors.push(`[${locale}] position[${posIndex}]: Missing id`);
      }

      if (!position.clientName) {
        errors.push(`[${locale}] position[${posIndex}]: Missing clientName`);
      }

      if (!position.startDate?.match(/^\d{4}-\d{2}-\d{2}T/)) {
        errors.push(`[${locale}] position[${posIndex}]: startDate not ISO 8601`);
      }
    });
  });

  return errors;
}

async function validateAllLocales(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  for (const locale of LOCALES) {
    const filePath = `src/data/${locale}/portfolio.json`;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const errors = validateStructure(data, locale);

    results.push({
      locale,
      valid: errors.length === 0,
      errors,
    });
  }

  return results;
}

// Run validation
validateAllLocales().then(results => {
  const allValid = results.every(r => r.valid);

  results.forEach(result => {
    if (result.valid) {
      console.log(`✅ ${result.locale}: Valid`);
    } else {
      console.log(`❌ ${result.locale}: ${result.errors.length} errors`);
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
  });

  if (!allValid) {
    process.exit(1);
  }

  console.log('\n✅ All locale variants validated successfully!');
});
```

---

## Related Tasks

- [TASK-184](../tasks/TASK-184-update-unit-tests.md): Update Unit Tests for New Data Structure (2h)
- [TASK-185](../tasks/TASK-185-update-e2e-tests.md): Update E2E Tests for New Data Structure (1.5h)
- [TASK-186](../tasks/TASK-186-validate-locale-variants.md): Validate All Locale Variants (1h)

---

## Definition of Done

- [ ] All unit tests updated
- [ ] All E2E tests updated
- [ ] Locale validation script created
- [ ] All 5 locales validated
- [ ] No structural inconsistencies found
- [ ] All tests passing (100%)
- [ ] Test coverage ≥ 85%
- [ ] No regressions detected
- [ ] Validation script added to CI/CD

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md), [US-031](US-031-codebase-integration.md)
