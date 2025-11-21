# TASK-300: Rollback Script

**ID**: TASK-300 | **Epic**: [EPIC-027](../epics/EPIC-027-data-migration.md) | **User Story**: [US-053](../stories/US-053-portfolio-data-migration.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create a rollback script to safely undo the portfolio data migration if issues are discovered. Delete migrated records from Supabase, verify deletion, and restore system to pre-migration state. Include dry-run mode and comprehensive logging.

---

## Acceptance Criteria

- [ ] Rollback script created in `scripts/rollback-migration.ts`
- [ ] Delete work_experience records for user
- [ ] Delete education records for user
- [ ] Delete projects records for user
- [ ] Delete certifications records for user
- [ ] Verify deletion success
- [ ] Support dry-run mode
- [ ] Comprehensive logging
- [ ] Safety checks before deletion
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Rollback Script

```typescript
// scripts/rollback-migration.ts

import axios from 'axios';
import * as readline from 'readline';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Rollback configuration
 */
interface RollbackConfig {
  userId: string;
  dryRun: boolean;
  skipConfirmation: boolean;
}

/**
 * Rollback result
 */
interface RollbackResult {
  category: string;
  deleted: number;
  failed: number;
  errors: string[];
}

/**
 * Main rollback function
 */
export async function rollbackMigration(config: RollbackConfig): Promise<RollbackResult[]> {
  console.log('========================================');
  console.log('Migration Rollback');
  console.log('========================================');
  console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`User ID: ${config.userId}`);
  console.log('========================================\n');

  // Safety confirmation
  if (!config.dryRun && !config.skipConfirmation) {
    const confirmed = await confirmRollback();
    if (!confirmed) {
      console.log('Rollback cancelled by user');
      return [];
    }
  }

  const results: RollbackResult[] = [];

  try {
    // 1. Rollback work experience
    console.log('Rolling back work experience...');
    const workExpResult = await rollbackWorkExperience(config);
    results.push(workExpResult);

    // 2. Rollback education
    console.log('\nRolling back education...');
    const educationResult = await rollbackEducation(config);
    results.push(educationResult);

    // 3. Rollback projects
    console.log('\nRolling back projects...');
    const projectsResult = await rollbackProjects(config);
    results.push(projectsResult);

    // 4. Rollback certifications
    console.log('\nRolling back certifications...');
    const certificationsResult = await rollbackCertifications(config);
    results.push(certificationsResult);

    // Print summary
    printRollbackSummary(results);

    return results;
  } catch (error) {
    console.error('\n❌ Rollback failed with error:', error);
    throw error;
  }
}

/**
 * Confirm rollback with user
 */
async function confirmRollback(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    console.log('\n⚠️  WARNING: This will DELETE all migrated portfolio data!');
    console.log('This action cannot be undone.\n');

    rl.question('Type "ROLLBACK" to confirm: ', answer => {
      rl.close();
      resolve(answer.trim() === 'ROLLBACK');
    });
  });
}

/**
 * Rollback work experience data
 */
async function rollbackWorkExperience(config: RollbackConfig): Promise<RollbackResult> {
  const result: RollbackResult = {
    category: 'Work Experience',
    deleted: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get count of records to delete
    const countResponse = await axios.get(`${SUPABASE_URL}/rest/v1/work_experience`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'count=exact',
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: 'id',
      },
    });

    const count = parseInt(countResponse.headers['content-range']?.split('/')[1] || '0');
    console.log(`Found ${count} work experience records to delete`);

    if (count === 0) {
      console.log('No records to delete');
      return result;
    }

    if (!config.dryRun) {
      // Delete records
      await axios.delete(`${SUPABASE_URL}/rest/v1/work_experience`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        params: {
          user_id: `eq.${config.userId}`,
        },
      });

      result.deleted = count;
      console.log(`✅ Deleted ${count} work experience records`);
    } else {
      console.log(`[DRY RUN] Would delete ${count} work experience records`);
    }

    return result;
  } catch (error) {
    result.failed++;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMsg);
    console.error(`❌ Failed to rollback work experience: ${errorMsg}`);
    return result;
  }
}

/**
 * Rollback education data
 */
async function rollbackEducation(config: RollbackConfig): Promise<RollbackResult> {
  const result: RollbackResult = {
    category: 'Education',
    deleted: 0,
    failed: 0,
    errors: [],
  };

  try {
    const countResponse = await axios.get(`${SUPABASE_URL}/rest/v1/education`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'count=exact',
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: 'id',
      },
    });

    const count = parseInt(countResponse.headers['content-range']?.split('/')[1] || '0');
    console.log(`Found ${count} education records to delete`);

    if (count === 0) {
      return result;
    }

    if (!config.dryRun) {
      await axios.delete(`${SUPABASE_URL}/rest/v1/education`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        params: {
          user_id: `eq.${config.userId}`,
        },
      });

      result.deleted = count;
      console.log(`✅ Deleted ${count} education records`);
    } else {
      console.log(`[DRY RUN] Would delete ${count} education records`);
    }

    return result;
  } catch (error) {
    result.failed++;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMsg);
    console.error(`❌ Failed to rollback education: ${errorMsg}`);
    return result;
  }
}

/**
 * Rollback projects data
 */
async function rollbackProjects(config: RollbackConfig): Promise<RollbackResult> {
  const result: RollbackResult = {
    category: 'Projects',
    deleted: 0,
    failed: 0,
    errors: [],
  };

  try {
    const countResponse = await axios.get(`${SUPABASE_URL}/rest/v1/projects`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'count=exact',
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: 'id',
      },
    });

    const count = parseInt(countResponse.headers['content-range']?.split('/')[1] || '0');
    console.log(`Found ${count} project records to delete`);

    if (count === 0) {
      return result;
    }

    if (!config.dryRun) {
      await axios.delete(`${SUPABASE_URL}/rest/v1/projects`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        params: {
          user_id: `eq.${config.userId}`,
        },
      });

      result.deleted = count;
      console.log(`✅ Deleted ${count} project records`);
    } else {
      console.log(`[DRY RUN] Would delete ${count} project records`);
    }

    return result;
  } catch (error) {
    result.failed++;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMsg);
    console.error(`❌ Failed to rollback projects: ${errorMsg}`);
    return result;
  }
}

/**
 * Rollback certifications data
 */
async function rollbackCertifications(config: RollbackConfig): Promise<RollbackResult> {
  const result: RollbackResult = {
    category: 'Certifications',
    deleted: 0,
    failed: 0,
    errors: [],
  };

  try {
    const countResponse = await axios.get(`${SUPABASE_URL}/rest/v1/certifications`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'count=exact',
      },
      params: {
        user_id: `eq.${config.userId}`,
        select: 'id',
      },
    });

    const count = parseInt(countResponse.headers['content-range']?.split('/')[1] || '0');
    console.log(`Found ${count} certification records to delete`);

    if (count === 0) {
      return result;
    }

    if (!config.dryRun) {
      await axios.delete(`${SUPABASE_URL}/rest/v1/certifications`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        params: {
          user_id: `eq.${config.userId}`,
        },
      });

      result.deleted = count;
      console.log(`✅ Deleted ${count} certification records`);
    } else {
      console.log(`[DRY RUN] Would delete ${count} certification records`);
    }

    return result;
  } catch (error) {
    result.failed++;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMsg);
    console.error(`❌ Failed to rollback certifications: ${errorMsg}`);
    return result;
  }
}

/**
 * Print rollback summary
 */
function printRollbackSummary(results: RollbackResult[]): void {
  console.log('\n========================================');
  console.log('Rollback Summary');
  console.log('========================================');

  results.forEach(result => {
    console.log(`\n${result.category}:`);
    console.log(`  Deleted: ${result.deleted}`);
    console.log(`  Failed: ${result.failed}`);
    if (result.errors.length > 0) {
      console.log(`  Errors:`);
      result.errors.forEach(error => console.log(`    - ${error}`));
    }
  });

  const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  console.log(`\nTotal:`);
  console.log(`  Deleted: ${totalDeleted}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log('========================================\n');
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const config: RollbackConfig = {
    userId: process.env.USER_ID || '',
    dryRun: process.argv.includes('--dry-run'),
    skipConfirmation: process.argv.includes('--yes'),
  };

  if (!config.userId) {
    console.error('❌ Error: USER_ID environment variable is required');
    process.exit(1);
  }

  rollbackMigration(config)
    .then(() => {
      console.log('✅ Rollback completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    });
}
```

---

### Package.json Scripts

```json
{
  "scripts": {
    "rollback:migration": "ts-node scripts/rollback-migration.ts",
    "rollback:migration:dry-run": "ts-node scripts/rollback-migration.ts --dry-run",
    "rollback:migration:force": "ts-node scripts/rollback-migration.ts --yes"
  }
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// scripts/__tests__/rollback-migration.test.ts

import { rollbackMigration } from '../rollback-migration';
import axios from 'axios';

jest.mock('axios');

describe('rollbackMigration', () => {
  const mockConfig = {
    userId: 'user-123',
    dryRun: true,
    skipConfirmation: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should perform dry-run rollback without deleting data', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      headers: { 'content-range': '0-4/5' },
      data: [],
    });

    const results = await rollbackMigration(mockConfig);

    expect(axios.delete).not.toHaveBeenCalled();
  });

  it('should delete data when not in dry-run mode', async () => {
    const liveConfig = { ...mockConfig, dryRun: false };

    (axios.get as jest.Mock).mockResolvedValue({
      headers: { 'content-range': '0-4/5' },
      data: [],
    });
    (axios.delete as jest.Mock).mockResolvedValue({ data: {} });

    const results = await rollbackMigration(liveConfig);

    expect(axios.delete).toHaveBeenCalled();
  });
});
```

---

## Dependencies

- Node.js
- TypeScript
- ts-node
- axios
- readline
- Supabase

---

## Definition of Done

- [ ] Rollback script implemented
- [ ] Work experience deletion working
- [ ] Education deletion working
- [ ] Projects deletion working
- [ ] Certifications deletion working
- [ ] Dry-run mode working
- [ ] User confirmation working
- [ ] Logging comprehensive
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-053](../stories/US-053-portfolio-data-migration.md), [TASK-297](TASK-297-migration-script.md)
