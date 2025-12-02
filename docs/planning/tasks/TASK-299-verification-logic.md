# TASK-299: Verification Logic

**ID**: TASK-299 | **Epic**: [EPIC-027](../epics/EPIC-027-data-migration.md) | **User Story**: [US-053](../stories/US-053-portfolio-data-migration.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Implement verification logic to compare source data with migrated data in Supabase. Verify record counts, data integrity, field-by-field comparison, and generate full verification reports. Ensure all data was migrated accurately without loss or corruption.

---

## Acceptance Criteria

- [ ] Verification script created in `scripts/verify-migration.ts`
- [ ] Compare record counts between source and target
- [ ] Verify all required fields present
- [ ] Field-by-field data comparison
- [ ] Detect missing or extra records
- [ ] Verify data transformations correct
- [ ] Generate verification report
- [ ] Support verbose mode for detailed output
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Verification Script

```typescript
// scripts/verify-migration.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Verification configuration
 */
interface VerificationConfig {
  userId: string;
  dataDir: string;
  verbose: boolean;
}

/**
 * Verification result
 */
interface VerificationResult {
  category: string;
  sourceCount: number;
  targetCount: number;
  matched: number;
  missing: number;
  extra: number;
  mismatches: DataMismatch[];
  passed: boolean;
}

interface DataMismatch {
  id: string;
  field: string;
  sourceValue: any;
  targetValue: any;
}

/**
 * Main verification function
 */
export async function verifyMigration(config: VerificationConfig): Promise<VerificationResult[]> {
  console.log('========================================');
  console.log('Migration Verification');
  console.log('========================================');
  console.log(`User ID: ${config.userId}`);
  console.log(`Data Directory: ${config.dataDir}`);
  console.log(`Verbose: ${config.verbose}`);
  console.log('========================================\n');

  const results: VerificationResult[] = [];

  try {
    // 1. Verify work experience
    console.log('Verifying work experience...');
    const workExpResult = await verifyWorkExperience(config);
    results.push(workExpResult);

    // 2. Verify education
    console.log('\nVerifying education...');
    const educationResult = await verifyEducation(config);
    results.push(educationResult);

    // 3. Verify projects
    console.log('\nVerifying projects...');
    const projectsResult = await verifyProjects(config);
    results.push(projectsResult);

    // 4. Verify certifications
    console.log('\nVerifying certifications...');
    const certificationsResult = await verifyCertifications(config);
    results.push(certificationsResult);

    // Print summary
    printVerificationSummary(results);

    return results;
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error);
    throw error;
  }
}

/**
 * Verify work experience data
 */
async function verifyWorkExperience(config: VerificationConfig): Promise<VerificationResult> {
  const result: VerificationResult = {
    category: 'Work Experience',
    sourceCount: 0,
    targetCount: 0,
    matched: 0,
    missing: 0,
    extra: 0,
    mismatches: [],
    passed: false,
  };

  try {
    // Load source data
    const sourcePath = path.join(config.dataDir, 'work-experience.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    result.sourceCount = sourceData.length;

    // Fetch target data
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/work_experience`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: '*',
      },
    });
    const targetData = response.data;
    result.targetCount = targetData.length;

    // Compare counts
    if (result.sourceCount !== result.targetCount) {
      console.log(`⚠️  Count mismatch: Source=${result.sourceCount}, Target=${result.targetCount}`);
    }

    // Field-by-field comparison
    sourceData.forEach((source: any) => {
      const target = targetData.find(
        (t: any) =>
          t.company_name === source.company &&
          t.position_title === source.position &&
          t.start_date === source.startDate
      );

      if (!target) {
        result.missing++;
        if (config.verbose) {
          console.log(`❌ Missing: ${source.company} - ${source.position}`);
        }
        return;
      }

      // Compare fields
      const mismatches = compareWorkExperienceFields(source, target);
      if (mismatches.length > 0) {
        result.mismatches.push(...mismatches);
        if (config.verbose) {
          console.log(`⚠️  Mismatches for ${source.company}: ${mismatches.length}`);
        }
      } else {
        result.matched++;
      }
    });

    // Check for extra records
    result.extra = result.targetCount - result.sourceCount;

    // Determine if verification passed
    result.passed =
      result.sourceCount === result.targetCount &&
      result.missing === 0 &&
      result.mismatches.length === 0;

    if (result.passed) {
      console.log(`✅ Work experience verification passed`);
    } else {
      console.log(`❌ Work experience verification failed`);
    }

    return result;
  } catch (error) {
    throw new Error(
      `Work experience verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Compare work experience fields
 */
function compareWorkExperienceFields(source: any, target: any): DataMismatch[] {
  const mismatches: DataMismatch[] = [];

  const fieldMapping = {
    company: 'company_name',
    position: 'position_title',
    location: 'location',
    startDate: 'start_date',
    endDate: 'end_date',
    description: 'description',
  };

  Object.entries(fieldMapping).forEach(([sourceField, targetField]) => {
    if (source[sourceField] !== target[targetField]) {
      mismatches.push({
        id: `${source.company}-${source.position}`,
        field: sourceField,
        sourceValue: source[sourceField],
        targetValue: target[targetField],
      });
    }
  });

  // Compare arrays
  if (JSON.stringify(source.technologies) !== JSON.stringify(target.technologies)) {
    mismatches.push({
      id: `${source.company}-${source.position}`,
      field: 'technologies',
      sourceValue: source.technologies,
      targetValue: target.technologies,
    });
  }

  if (JSON.stringify(source.achievements) !== JSON.stringify(target.achievements)) {
    mismatches.push({
      id: `${source.company}-${source.position}`,
      field: 'achievements',
      sourceValue: source.achievements,
      targetValue: target.achievements,
    });
  }

  return mismatches;
}

/**
 * Verify education data
 */
async function verifyEducation(config: VerificationConfig): Promise<VerificationResult> {
  const result: VerificationResult = {
    category: 'Education',
    sourceCount: 0,
    targetCount: 0,
    matched: 0,
    missing: 0,
    extra: 0,
    mismatches: [],
    passed: false,
  };

  try {
    const sourcePath = path.join(config.dataDir, 'education.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    result.sourceCount = sourceData.length;

    const response = await axios.get(`${SUPABASE_URL}/rest/v1/education`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: '*',
      },
    });
    const targetData = response.data;
    result.targetCount = targetData.length;

    sourceData.forEach((source: any) => {
      const target = targetData.find(
        (t: any) => t.institution_name === source.institution && t.degree_type === source.degree
      );

      if (!target) {
        result.missing++;
      } else {
        result.matched++;
      }
    });

    result.extra = result.targetCount - result.sourceCount;
    result.passed = result.sourceCount === result.targetCount && result.missing === 0;

    if (result.passed) {
      console.log(`✅ Education verification passed`);
    } else {
      console.log(`❌ Education verification failed`);
    }

    return result;
  } catch (error) {
    throw new Error(
      `Education verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify projects data
 */
async function verifyProjects(config: VerificationConfig): Promise<VerificationResult> {
  const result: VerificationResult = {
    category: 'Projects',
    sourceCount: 0,
    targetCount: 0,
    matched: 0,
    missing: 0,
    extra: 0,
    mismatches: [],
    passed: false,
  };

  try {
    const sourcePath = path.join(config.dataDir, 'projects.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    result.sourceCount = sourceData.length;

    const response = await axios.get(`${SUPABASE_URL}/rest/v1/projects`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: '*',
      },
    });
    const targetData = response.data;
    result.targetCount = targetData.length;

    sourceData.forEach((source: any) => {
      const target = targetData.find((t: any) => t.title === source.title);

      if (!target) {
        result.missing++;
      } else {
        result.matched++;
      }
    });

    result.extra = result.targetCount - result.sourceCount;
    result.passed = result.sourceCount === result.targetCount && result.missing === 0;

    if (result.passed) {
      console.log(`✅ Projects verification passed`);
    } else {
      console.log(`❌ Projects verification failed`);
    }

    return result;
  } catch (error) {
    throw new Error(
      `Projects verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify certifications data
 */
async function verifyCertifications(config: VerificationConfig): Promise<VerificationResult> {
  const result: VerificationResult = {
    category: 'Certifications',
    sourceCount: 0,
    targetCount: 0,
    matched: 0,
    missing: 0,
    extra: 0,
    mismatches: [],
    passed: false,
  };

  try {
    const sourcePath = path.join(config.dataDir, 'certifications.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    result.sourceCount = sourceData.length;

    const response = await axios.get(`${SUPABASE_URL}/rest/v1/certifications`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: '*',
      },
    });
    const targetData = response.data;
    result.targetCount = targetData.length;

    sourceData.forEach((source: any) => {
      const target = targetData.find((t: any) => t.certification_title === source.title);

      if (!target) {
        result.missing++;
      } else {
        result.matched++;
      }
    });

    result.extra = result.targetCount - result.sourceCount;
    result.passed = result.sourceCount === result.targetCount && result.missing === 0;

    if (result.passed) {
      console.log(`✅ Certifications verification passed`);
    } else {
      console.log(`❌ Certifications verification failed`);
    }

    return result;
  } catch (error) {
    throw new Error(
      `Certifications verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Print verification summary
 */
function printVerificationSummary(results: VerificationResult[]): void {
  console.log('\n========================================');
  console.log('Verification Summary');
  console.log('========================================');

  results.forEach(result => {
    console.log(`\n${result.category}:`);
    console.log(`  Source Count: ${result.sourceCount}`);
    console.log(`  Target Count: ${result.targetCount}`);
    console.log(`  Matched: ${result.matched}`);
    console.log(`  Missing: ${result.missing}`);
    console.log(`  Extra: ${result.extra}`);
    console.log(`  Mismatches: ${result.mismatches.length}`);
    console.log(`  Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  });

  const allPassed = results.every(r => r.passed);
  console.log(`\nOverall: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('========================================\n');
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const config: VerificationConfig = {
    userId: process.env.USER_ID || '',
    dataDir: process.argv[2] || './data/portfolio',
    verbose: process.argv.includes('--verbose'),
  };

  if (!config.userId) {
    console.error('❌ Error: USER_ID environment variable is required');
    process.exit(1);
  }

  verifyMigration(config)
    .then(results => {
      const allPassed = results.every(r => r.passed);
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}
```

---

### Package.json Scripts

```json
{
  "scripts": {
    "verify:migration": "ts-node scripts/verify-migration.ts",
    "verify:migration:verbose": "ts-node scripts/verify-migration.ts --verbose"
  }
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// scripts/__tests__/verify-migration.test.ts

import { verifyMigration } from '../verify-migration';
import * as fs from 'fs/promises';
import axios from 'axios';

jest.mock('fs/promises');
jest.mock('axios');

describe('verifyMigration', () => {
  const mockConfig = {
    userId: 'user-123',
    dataDir: './test-data',
    verbose: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass verification when data matches', async () => {
    const mockSourceData = [
      {
        company: 'Test Corp',
        position: 'Developer',
        location: 'Remote',
        startDate: '2020-01-01',
        endDate: null,
        description: 'Test',
        technologies: ['React'],
        achievements: [],
      },
    ];

    const mockTargetData = [
      {
        company_name: 'Test Corp',
        position_title: 'Developer',
        location: 'Remote',
        start_date: '2020-01-01',
        end_date: null,
        description: 'Test',
        technologies: ['React'],
        achievements: [],
      },
    ];

    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockSourceData));
    (axios.get as jest.Mock).mockResolvedValue({ data: mockTargetData });

    const results = await verifyMigration(mockConfig);

    expect(results[0].passed).toBe(true);
    expect(results[0].matched).toBe(1);
    expect(results[0].missing).toBe(0);
  });

  it('should fail verification when record is missing', async () => {
    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify([{ company: 'Test Corp', position: 'Developer' }])
    );
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });

    const results = await verifyMigration(mockConfig);

    expect(results[0].passed).toBe(false);
    expect(results[0].missing).toBe(1);
  });
});
```

---

## Dependencies

- Node.js
- TypeScript
- ts-node
- axios
- Supabase

---

## Definition of Done

- [ ] Verification script implemented
- [ ] Record count comparison working
- [ ] Field-by-field comparison working
- [ ] Missing record detection working
- [ ] Extra record detection working
- [ ] Mismatch detection working
- [ ] Verification report generation working
- [ ] Verbose mode working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-053](../stories/US-053-portfolio-data-migration.md), [TASK-297](TASK-297-migration-script.md), [TASK-298](TASK-298-data-validation.md)
