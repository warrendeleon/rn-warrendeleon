# TASK-301: Execute Migration

**ID**: TASK-301 | **Epic**: [EPIC-027](../epics/EPIC-027-data-migration.md) | **User Story**: [US-053](../stories/US-053-portfolio-data-migration.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Execute the portfolio data migration from GitHub JSON files to Supabase database. Follow a careful step-by-step process with validation at each stage. Perform dry-run first, validate data, execute live migration, and verify results.

---

## Acceptance Criteria

- [ ] Migration execution plan documented
- [ ] Pre-migration validation complete
- [ ] Dry-run migration executed successfully
- [ ] Live migration executed successfully
- [ ] Post-migration verification complete
- [ ] Migration results documented
- [ ] Rollback plan ready if needed
- [ ] All data migrated correctly
- [ ] No data loss or corruption
- [ ] Migration log saved

---

## Implementation Details

### Migration Execution Plan

```markdown
# Portfolio Data Migration Execution Plan

## Pre-Migration Checklist

- [ ] Supabase database tables created
- [ ] Database indexes created
- [ ] Row Level Security (RLS) policies configured
- [ ] Environment variables configured
- [ ] Source data files validated
- [ ] Backup of source data created
- [ ] Migration scripts tested in development
- [ ] User ID confirmed

## Migration Steps

### 1. Validate Source Data

bash

# Run data validation

yarn validate:source-data

# Review validation report

cat ./reports/validation-report.txt

# Fix any errors before proceeding

### 2. Dry-Run Migration

bash

# Export user ID

export USER_ID="your-user-id-here"

# Run dry-run migration

yarn migrate:portfolio:dry-run

# Review dry-run results

# Verify all data transformations are correct

### 3. Pre-Migration Backup

bash

# Create backup of source data

mkdir -p ./backups
cp -r ./data/portfolio ./backups/portfolio-backup-$(date +%Y%m%d-%H%M%S)

# Verify backup

ls -la ./backups/

### 4. Execute Live Migration

bash

# Run live migration

yarn migrate:portfolio

# Monitor output for any errors

# Save migration log

### 5. Post-Migration Verification

bash

# Run verification script

yarn verify:migration

# Check verification results

# All categories should show PASSED

### 6. Manual Verification

- [ ] Log into Supabase dashboard
- [ ] Check work_experience table
- [ ] Check education table
- [ ] Check projects table
- [ ] Check certifications table
- [ ] Verify record counts match source
- [ ] Spot-check a few records for accuracy

### 7. Application Testing

- [ ] Start mobile app
- [ ] Navigate to Portfolio section
- [ ] Verify Work Experience displays correctly
- [ ] Verify Education displays correctly
- [ ] Verify Projects displays correctly
- [ ] Verify Certifications displays correctly
- [ ] Test editing functionality
- [ ] Test delete functionality

## Post-Migration Tasks

- [ ] Document migration results
- [ ] Save migration log
- [ ] Update documentation
- [ ] Notify team of completion
- [ ] Monitor for any issues

## Rollback Plan

If issues are discovered:

bash

# Execute rollback (dry-run first)

yarn rollback:migration:dry-run

# If dry-run looks good, execute live rollback

yarn rollback:migration

# Re-run migration after fixing issues
```

---

### Migration Execution Script

```typescript
// scripts/execute-migration.ts

import { migratePortfolioData } from './migrate-portfolio-data';
import { validateWorkExperience, validateEducation, validateProject, validateCertification, generateValidationReport } from './validation/dataValidation';
import { verifyMigration } from './verify-migration';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Execute full migration with validation
 */
async function executeM igration(): Promise<void> {
  const userId = process.env.USER_ID;
  const dataDir = process.argv[2] || './data/portfolio';
  const dryRun = process.argv.includes('--dry-run');

  if (!userId) {
    console.error('❌ Error: USER_ID environment variable is required');
    process.exit(1);
  }

  console.log('========================================');
  console.log('Portfolio Data Migration Execution');
  console.log('========================================');
  console.log(`User ID: ${userId}`);
  console.log(`Data Directory: ${dataDir}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('========================================\n');

  try {
    // Step 1: Validate source data
    console.log('Step 1: Validating source data...');
    const validationResults = await validateSourceData(dataDir);

    const validationReport = generateValidationReport(validationResults);
    console.log(validationReport);

    // Save validation report
    await fs.writeFile(
      `./reports/validation-report-${new Date().toISOString()}.txt`,
      validationReport
    );

    const hasErrors = validationResults.some(r => !r.isValid);
    if (hasErrors && !dryRun) {
      console.error('\n❌ Source data validation failed. Fix errors before proceeding.');
      process.exit(1);
    }

    // Step 2: Execute migration
    console.log('\nStep 2: Executing migration...');
    const migrationResults = await migratePortfolioData({
      userId,
      dataDir,
      dryRun,
    });

    // Step 3: Verify migration (if not dry-run)
    if (!dryRun) {
      console.log('\nStep 3: Verifying migration...');
      const verificationResults = await verifyMigration({
        userId,
        dataDir,
        verbose: true,
      });

      const allPassed = verificationResults.every(r => r.passed);
      if (!allPassed) {
        console.error('\n❌ Migration verification failed.');
        console.log('\nYou may want to rollback using: yarn rollback:migration');
        process.exit(1);
      }

      console.log('\n✅ Migration completed and verified successfully!');
    } else {
      console.log('\n✅ Dry-run completed successfully!');
      console.log('Review the results and run without --dry-run to execute live migration.');
    }

  } catch (error) {
    console.error('\n❌ Migration execution failed:', error);
    process.exit(1);
  }
}

/**
 * Validate all source data files
 */
async function validateSourceData(dataDir: string): Promise<any[]> {
  const results: any[] = [];

  // Validate work experience
  const workExpPath = path.join(dataDir, 'work-experience.json');
  const workExpData = JSON.parse(await fs.readFile(workExpPath, 'utf-8'));
  workExpData.forEach((entry: any, index: number) => {
    results.push(validateWorkExperience(entry, index));
  });

  // Validate education
  const educationPath = path.join(dataDir, 'education.json');
  const educationData = JSON.parse(await fs.readFile(educationPath, 'utf-8'));
  educationData.forEach((entry: any, index: number) => {
    results.push(validateEducation(entry, index));
  });

  // Validate projects
  const projectsPath = path.join(dataDir, 'projects.json');
  const projectsData = JSON.parse(await fs.readFile(projectsPath, 'utf-8'));
  projectsData.forEach((entry: any, index: number) => {
    results.push(validateProject(entry, index));
  });

  // Validate certifications
  const certificationsPath = path.join(dataDir, 'certifications.json');
  const certificationsData = JSON.parse(await fs.readFile(certificationsPath, 'utf-8'));
  certificationsData.forEach((entry: any, index: number) => {
    results.push(validateCertification(entry, index));
  });

  return results;
}

// Execute
if (require.main === module) {
  executeMigration();
}
```

---

## Testing Requirements

This task is primarily about execution, but should include:

- [ ] Dry-run testing in development environment
- [ ] Verification of all scripts working correctly
- [ ] Testing rollback procedure
- [ ] Documentation review

---

## Dependencies

- Migration script (TASK-297)
- Data validation (TASK-298)
- Verification logic (TASK-299)
- Rollback script (TASK-300)
- Supabase database configured

---

## Definition of Done

- [ ] Migration execution plan documented
- [ ] Pre-migration validation complete
- [ ] Dry-run executed successfully
- [ ] Source data validated
- [ ] Live migration executed successfully
- [ ] Post-migration verification passed
- [ ] Application testing complete
- [ ] All data migrated correctly
- [ ] Migration log saved
- [ ] Results documented
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-053](../stories/US-053-portfolio-data-migration.md), [TASK-297](TASK-297-migration-script.md), [TASK-298](TASK-298-data-validation.md), [TASK-299](TASK-299-verification-logic.md), [TASK-300](TASK-300-rollback-script.md)
