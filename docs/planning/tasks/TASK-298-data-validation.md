# TASK-298: Data Validation

**ID**: TASK-298 | **Epic**: [EPIC-027](../epics/EPIC-027-data-migration.md) | **User Story**: [US-053](../stories/US-053-portfolio-data-migration.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Implement comprehensive data validation for portfolio data before and after migration. Validate source data format and integrity, check required fields, validate data types and constraints, detect duplicates, and ensure data quality standards are met.

---

## Acceptance Criteria

- [ ] Source data validation implemented
- [ ] Target data validation implemented
- [ ] Required fields validation
- [ ] Data type validation (dates, strings, arrays)
- [ ] Data constraints validation (non-empty, max length)
- [ ] Duplicate detection
- [ ] Referential integrity checks
- [ ] Validation report generation
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Data Validation Service

```typescript
// scripts/validation/dataValidation.ts

import { z } from 'zod';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'error';
  entity: string;
  field: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  type: 'warning';
  entity: string;
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation rules
 */
const ValidationRules = {
  // Work Experience
  workExperience: {
    company: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
    position: z.string().min(1, 'Position is required').max(200, 'Position too long'),
    location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .nullable(),
    description: z.string().min(10, 'Description too short').max(5000, 'Description too long'),
    technologies: z
      .array(z.string())
      .min(1, 'At least one technology required')
      .max(50, 'Too many technologies'),
    achievements: z.array(z.string()).max(20, 'Too many achievements'),
  },

  // Education
  education: {
    institution: z.string().min(1, 'Institution is required').max(200, 'Institution name too long'),
    degree: z.string().min(1, 'Degree is required').max(200, 'Degree too long'),
    field: z.string().min(1, 'Field of study is required').max(200, 'Field too long'),
    location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .nullable(),
    gpa: z.string().max(10, 'GPA too long').nullable().optional(),
    achievements: z.array(z.string()).max(20, 'Too many achievements'),
  },

  // Projects
  project: {
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().min(10, 'Description too short').max(5000, 'Description too long'),
    technologies: z
      .array(z.string())
      .min(1, 'At least one technology required')
      .max(50, 'Too many technologies'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .nullable(),
    url: z.string().url('Invalid URL').nullable().optional(),
    repositoryUrl: z.string().url('Invalid repository URL').nullable().optional(),
  },

  // Certifications
  certification: {
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    issuer: z.string().min(1, 'Issuer is required').max(200, 'Issuer too long'),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .nullable()
      .optional(),
    credentialUrl: z.string().url('Invalid credential URL').nullable().optional(),
  },
};

/**
 * Validate work experience entry
 */
export function validateWorkExperience(data: any, index: number): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const entity = `Work Experience #${index + 1}`;

  // Validate required fields
  Object.entries(ValidationRules.workExperience).forEach(([field, schema]) => {
    try {
      schema.parse(data[field]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          result.isValid = false;
          result.errors.push({
            type: 'error',
            entity,
            field,
            message: err.message,
            value: data[field],
          });
        });
      }
    }
  });

  // Validate date range
  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      result.isValid = false;
      result.errors.push({
        type: 'error',
        entity,
        field: 'dates',
        message: 'End date must be after start date',
        value: { startDate: data.startDate, endDate: data.endDate },
      });
    }
  }

  // Check for suspiciously long tenure
  if (data.startDate) {
    const tenure = calculateTenure(data.startDate, data.endDate);
    if (tenure > 15) {
      result.warnings.push({
        type: 'warning',
        entity,
        field: 'tenure',
        message: `Unusually long tenure (${tenure} years)`,
        value: tenure,
      });
    }
  }

  return result;
}

/**
 * Validate education entry
 */
export function validateEducation(data: any, index: number): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const entity = `Education #${index + 1}`;

  // Validate required fields
  Object.entries(ValidationRules.education).forEach(([field, schema]) => {
    try {
      schema.parse(data[field]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          result.isValid = false;
          result.errors.push({
            type: 'error',
            entity,
            field,
            message: err.message,
            value: data[field],
          });
        });
      }
    }
  });

  // Validate date range
  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      result.isValid = false;
      result.errors.push({
        type: 'error',
        entity,
        field: 'dates',
        message: 'End date must be after start date',
      });
    }
  }

  return result;
}

/**
 * Validate project entry
 */
export function validateProject(data: any, index: number): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const entity = `Project #${index + 1}`;

  // Validate required fields
  Object.entries(ValidationRules.project).forEach(([field, schema]) => {
    try {
      schema.parse(data[field]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          result.isValid = false;
          result.errors.push({
            type: 'error',
            entity,
            field,
            message: err.message,
            value: data[field],
          });
        });
      }
    }
  });

  // Validate date range
  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      result.isValid = false;
      result.errors.push({
        type: 'error',
        entity,
        field: 'dates',
        message: 'End date must be after start date',
      });
    }
  }

  return result;
}

/**
 * Validate certification entry
 */
export function validateCertification(data: any, index: number): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const entity = `Certification #${index + 1}`;

  // Validate required fields
  Object.entries(ValidationRules.certification).forEach(([field, schema]) => {
    try {
      schema.parse(data[field]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          result.isValid = false;
          result.errors.push({
            type: 'error',
            entity,
            field,
            message: err.message,
            value: data[field],
          });
        });
      }
    }
  });

  // Validate expiry date
  if (data.expiryDate) {
    const expiryDate = new Date(data.expiryDate);
    const issueDate = new Date(data.issueDate);

    if (expiryDate < issueDate) {
      result.isValid = false;
      result.errors.push({
        type: 'error',
        entity,
        field: 'dates',
        message: 'Expiry date must be after issue date',
      });
    }

    // Warn if certification is expired
    if (expiryDate < new Date()) {
      result.warnings.push({
        type: 'warning',
        entity,
        field: 'expiryDate',
        message: 'Certification is expired',
        value: data.expiryDate,
      });
    }
  }

  return result;
}

/**
 * Detect duplicates in work experience
 */
export function detectWorkExperienceDuplicates(data: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const seen = new Map<string, number>();

  data.forEach((entry, index) => {
    const key = `${entry.company}-${entry.position}-${entry.startDate}`;

    if (seen.has(key)) {
      result.warnings.push({
        type: 'warning',
        entity: `Work Experience #${index + 1}`,
        field: 'duplicate',
        message: `Possible duplicate of entry #${seen.get(key)! + 1}`,
        value: key,
      });
    } else {
      seen.set(key, index);
    }
  });

  return result;
}

/**
 * Calculate tenure in years
 */
function calculateTenure(startDate: string, endDate: string | null): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  return Math.round(years * 10) / 10;
}

/**
 * Generate validation report
 */
export function generateValidationReport(results: ValidationResult[]): string {
  let report = '========================================\n';
  report += 'Validation Report\n';
  report += '========================================\n\n';

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  report += `Total Errors: ${totalErrors}\n`;
  report += `Total Warnings: ${totalWarnings}\n\n`;

  if (totalErrors > 0) {
    report += 'Errors:\n';
    results.forEach(result => {
      result.errors.forEach(error => {
        report += `  ❌ ${error.entity} - ${error.field}: ${error.message}\n`;
        if (error.value !== undefined) {
          report += `     Value: ${JSON.stringify(error.value)}\n`;
        }
      });
    });
    report += '\n';
  }

  if (totalWarnings > 0) {
    report += 'Warnings:\n';
    results.forEach(result => {
      result.warnings.forEach(warning => {
        report += `  ⚠️  ${warning.entity} - ${warning.field}: ${warning.message}\n`;
        if (warning.value !== undefined) {
          report += `     Value: ${JSON.stringify(warning.value)}\n`;
        }
      });
    });
    report += '\n';
  }

  report += '========================================\n';

  return report;
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// scripts/validation/__tests__/dataValidation.test.ts

import {
  validateWorkExperience,
  validateEducation,
  validateProject,
  validateCertification,
  detectWorkExperienceDuplicates,
  generateValidationReport,
} from '../dataValidation';

describe('Data Validation', () => {
  describe('validateWorkExperience', () => {
    it('should pass validation for valid data', () => {
      const data = {
        company: 'Test Corp',
        position: 'Developer',
        location: 'Remote',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        description: 'Developed amazing software applications',
        technologies: ['React', 'TypeScript'],
        achievements: ['Built app'],
      };

      const result = validateWorkExperience(data, 0);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing company', () => {
      const data = {
        company: '',
        position: 'Developer',
        location: 'Remote',
        startDate: '2020-01-01',
        endDate: null,
        description: 'Test description',
        technologies: ['React'],
        achievements: [],
      };

      const result = validateWorkExperience(data, 0);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'company',
          message: expect.stringContaining('required'),
        })
      );
    });

    it('should fail validation for end date before start date', () => {
      const data = {
        company: 'Test Corp',
        position: 'Developer',
        location: 'Remote',
        startDate: '2023-01-01',
        endDate: '2020-01-01',
        description: 'Test description',
        technologies: ['React'],
        achievements: [],
      };

      const result = validateWorkExperience(data, 0);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'dates',
          message: expect.stringContaining('after start date'),
        })
      );
    });

    it('should warn for unusually long tenure', () => {
      const data = {
        company: 'Test Corp',
        position: 'Developer',
        location: 'Remote',
        startDate: '2000-01-01',
        endDate: '2020-01-01',
        description: 'Test description',
        technologies: ['React'],
        achievements: [],
      };

      const result = validateWorkExperience(data, 0);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'tenure',
          message: expect.stringContaining('Unusually long'),
        })
      );
    });
  });

  describe('detectWorkExperienceDuplicates', () => {
    it('should detect duplicate entries', () => {
      const data = [
        {
          company: 'Test Corp',
          position: 'Developer',
          startDate: '2020-01-01',
        },
        {
          company: 'Test Corp',
          position: 'Developer',
          startDate: '2020-01-01',
        },
      ];

      const result = detectWorkExperienceDuplicates(data);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should not detect duplicates for unique entries', () => {
      const data = [
        {
          company: 'Test Corp',
          position: 'Developer',
          startDate: '2020-01-01',
        },
        {
          company: 'Other Corp',
          position: 'Developer',
          startDate: '2021-01-01',
        },
      ];

      const result = detectWorkExperienceDuplicates(data);

      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate report with errors and warnings', () => {
      const results = [
        {
          isValid: false,
          errors: [
            {
              type: 'error' as const,
              entity: 'Work Experience #1',
              field: 'company',
              message: 'Company is required',
            },
          ],
          warnings: [
            {
              type: 'warning' as const,
              entity: 'Work Experience #1',
              field: 'tenure',
              message: 'Long tenure',
            },
          ],
        },
      ];

      const report = generateValidationReport(results);

      expect(report).toContain('Total Errors: 1');
      expect(report).toContain('Total Warnings: 1');
      expect(report).toContain('Company is required');
      expect(report).toContain('Long tenure');
    });
  });
});
```

---

## Dependencies

- Zod (schema validation)
- TypeScript

---

## Definition of Done

- [ ] Source data validation implemented
- [ ] Target data validation implemented
- [ ] All validation rules working
- [ ] Date validation working
- [ ] Duplicate detection working
- [ ] Validation report generation working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-053](../stories/US-053-portfolio-data-migration.md), [TASK-297](TASK-297-migration-script.md)
