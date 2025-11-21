# TASK-297: Portfolio Data Migration Script

**ID**: TASK-297 | **Epic**: [EPIC-027](../epics/EPIC-027-data-migration.md) | **User Story**: [US-053](../stories/US-053-portfolio-data-migration.md)
**Status**: 📋 To Do | **Effort**: 4h

---

## Task Description

Create a comprehensive migration script to transfer portfolio data from the existing GitHub-based JSON storage to Supabase database. Migrate work experience, education, projects, and certifications data. Handle data transformation, maintain relationships, and ensure data integrity during migration.

---

## Acceptance Criteria

- [ ] Migration script created in `scripts/migrate-portfolio-data.ts`
- [ ] Migrate work_experience data from JSON to Supabase
- [ ] Migrate education data from JSON to Supabase
- [ ] Migrate projects data from JSON to Supabase
- [ ] Migrate certifications data from JSON to Supabase
- [ ] Handle data transformation (dates, IDs, relationships)
- [ ] Maintain referential integrity
- [ ] Support dry-run mode for testing
- [ ] Comprehensive error handling and logging
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Migration Script

```typescript
// scripts/migrate-portfolio-data.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Source data schemas (from JSON files)
 */
const SourceWorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string(),
  technologies: z.array(z.string()),
  achievements: z.array(z.string()),
});

const SourceEducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  gpa: z.string().nullable(),
  achievements: z.array(z.string()),
});

const SourceProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string().nullable(),
  url: z.string().nullable(),
  repositoryUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

const SourceCertificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().nullable(),
  credentialId: z.string().nullable(),
  credentialUrl: z.string().nullable(),
});

type SourceWorkExperience = z.infer<typeof SourceWorkExperienceSchema>;
type SourceEducation = z.infer<typeof SourceEducationSchema>;
type SourceProject = z.infer<typeof SourceProjectSchema>;
type SourceCertification = z.infer<typeof SourceCertificationSchema>;

/**
 * Target data schemas (for Supabase)
 */
interface TargetWorkExperience {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
  display_order: number;
}

interface TargetEducation {
  id: string;
  user_id: string;
  institution_name: string;
  degree_type: string;
  field_of_study: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: string | null;
  achievements: string[];
  display_order: number;
}

interface TargetProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  technologies: string[];
  start_date: string;
  end_date: string | null;
  is_ongoing: boolean;
  project_url: string | null;
  repository_url: string | null;
  image_url: string | null;
  display_order: number;
}

interface TargetCertification {
  id: string;
  user_id: string;
  certification_title: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  display_order: number;
}

/**
 * Migration configuration
 */
interface MigrationConfig {
  dryRun: boolean;
  userId: string;
  dataDir: string;
}

/**
 * Migration results tracking
 */
interface MigrationResults {
  workExperience: { success: number; failed: number; errors: string[] };
  education: { success: number; failed: number; errors: string[] };
  projects: { success: number; failed: number; errors: string[] };
  certifications: { success: number; failed: number; errors: string[] };
}

/**
 * Main migration function
 */
export async function migratePortfolioData(config: MigrationConfig): Promise<MigrationResults> {
  console.log('========================================');
  console.log('Portfolio Data Migration');
  console.log('========================================');
  console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`User ID: ${config.userId}`);
  console.log(`Data Directory: ${config.dataDir}`);
  console.log('========================================\n');

  const results: MigrationResults = {
    workExperience: { success: 0, failed: 0, errors: [] },
    education: { success: 0, failed: 0, errors: [] },
    projects: { success: 0, failed: 0, errors: [] },
    certifications: { success: 0, failed: 0, errors: [] },
  };

  try {
    // 1. Migrate work experience
    console.log('Migrating work experience...');
    await migrateWorkExperience(config, results.workExperience);

    // 2. Migrate education
    console.log('\nMigrating education...');
    await migrateEducation(config, results.education);

    // 3. Migrate projects
    console.log('\nMigrating projects...');
    await migrateProjects(config, results.projects);

    // 4. Migrate certifications
    console.log('\nMigrating certifications...');
    await migrateCertifications(config, results.certifications);

    // Print summary
    printMigrationSummary(results);

    return results;
  } catch (error) {
    console.error('\n❌ Migration failed with error:', error);
    throw error;
  }
}

/**
 * Migrate work experience data
 */
async function migrateWorkExperience(
  config: MigrationConfig,
  results: { success: number; failed: number; errors: string[] }
): Promise<void> {
  try {
    // Read source data
    const sourcePath = path.join(config.dataDir, 'work-experience.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    const workExperiences = z.array(SourceWorkExperienceSchema).parse(sourceData);

    console.log(`Found ${workExperiences.length} work experience entries`);

    // Transform and migrate each entry
    for (let i = 0; i < workExperiences.length; i++) {
      const source = workExperiences[i];

      try {
        const target: TargetWorkExperience = {
          id: uuidv4(),
          user_id: config.userId,
          company_name: source.company,
          position_title: source.position,
          location: source.location,
          start_date: source.startDate,
          end_date: source.endDate,
          is_current: source.endDate === null,
          description: source.description,
          technologies: source.technologies,
          achievements: source.achievements,
          display_order: i + 1,
        };

        if (!config.dryRun) {
          await insertWorkExperience(target);
        }

        results.success++;
        console.log(`✅ ${source.company} - ${source.position}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to migrate ${source.company}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        results.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  } catch (error) {
    throw new Error(
      `Work experience migration failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Migrate education data
 */
async function migrateEducation(
  config: MigrationConfig,
  results: { success: number; failed: number; errors: string[] }
): Promise<void> {
  try {
    const sourcePath = path.join(config.dataDir, 'education.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    const educationEntries = z.array(SourceEducationSchema).parse(sourceData);

    console.log(`Found ${educationEntries.length} education entries`);

    for (let i = 0; i < educationEntries.length; i++) {
      const source = educationEntries[i];

      try {
        const target: TargetEducation = {
          id: uuidv4(),
          user_id: config.userId,
          institution_name: source.institution,
          degree_type: source.degree,
          field_of_study: source.field,
          location: source.location,
          start_date: source.startDate,
          end_date: source.endDate,
          is_current: source.endDate === null,
          gpa: source.gpa,
          achievements: source.achievements,
          display_order: i + 1,
        };

        if (!config.dryRun) {
          await insertEducation(target);
        }

        results.success++;
        console.log(`✅ ${source.institution} - ${source.degree}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to migrate ${source.institution}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        results.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  } catch (error) {
    throw new Error(
      `Education migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Migrate projects data
 */
async function migrateProjects(
  config: MigrationConfig,
  results: { success: number; failed: number; errors: string[] }
): Promise<void> {
  try {
    const sourcePath = path.join(config.dataDir, 'projects.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    const projects = z.array(SourceProjectSchema).parse(sourceData);

    console.log(`Found ${projects.length} project entries`);

    for (let i = 0; i < projects.length; i++) {
      const source = projects[i];

      try {
        const target: TargetProject = {
          id: uuidv4(),
          user_id: config.userId,
          title: source.title,
          description: source.description,
          technologies: source.technologies,
          start_date: source.startDate,
          end_date: source.endDate,
          is_ongoing: source.endDate === null,
          project_url: source.url,
          repository_url: source.repositoryUrl,
          image_url: source.imageUrl,
          display_order: i + 1,
        };

        if (!config.dryRun) {
          await insertProject(target);
        }

        results.success++;
        console.log(`✅ ${source.title}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to migrate ${source.title}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        results.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  } catch (error) {
    throw new Error(
      `Projects migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Migrate certifications data
 */
async function migrateCertifications(
  config: MigrationConfig,
  results: { success: number; failed: number; errors: string[] }
): Promise<void> {
  try {
    const sourcePath = path.join(config.dataDir, 'certifications.json');
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
    const certifications = z.array(SourceCertificationSchema).parse(sourceData);

    console.log(`Found ${certifications.length} certification entries`);

    for (let i = 0; i < certifications.length; i++) {
      const source = certifications[i];

      try {
        const target: TargetCertification = {
          id: uuidv4(),
          user_id: config.userId,
          certification_title: source.title,
          issuing_organization: source.issuer,
          issue_date: source.issueDate,
          expiry_date: source.expiryDate,
          credential_id: source.credentialId,
          credential_url: source.credentialUrl,
          display_order: i + 1,
        };

        if (!config.dryRun) {
          await insertCertification(target);
        }

        results.success++;
        console.log(`✅ ${source.title}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to migrate ${source.title}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        results.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  } catch (error) {
    throw new Error(
      `Certifications migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Insert work experience into Supabase
 */
async function insertWorkExperience(data: TargetWorkExperience): Promise<void> {
  await axios.post(`${SUPABASE_URL}/rest/v1/work_experience`, data, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  });
}

/**
 * Insert education into Supabase
 */
async function insertEducation(data: TargetEducation): Promise<void> {
  await axios.post(`${SUPABASE_URL}/rest/v1/education`, data, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  });
}

/**
 * Insert project into Supabase
 */
async function insertProject(data: TargetProject): Promise<void> {
  await axios.post(`${SUPABASE_URL}/rest/v1/projects`, data, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  });
}

/**
 * Insert certification into Supabase
 */
async function insertCertification(data: TargetCertification): Promise<void> {
  await axios.post(`${SUPABASE_URL}/rest/v1/certifications`, data, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  });
}

/**
 * Print migration summary
 */
function printMigrationSummary(results: MigrationResults): void {
  console.log('\n========================================');
  console.log('Migration Summary');
  console.log('========================================');

  const categories = [
    { name: 'Work Experience', data: results.workExperience },
    { name: 'Education', data: results.education },
    { name: 'Projects', data: results.projects },
    { name: 'Certifications', data: results.certifications },
  ];

  categories.forEach(({ name, data }) => {
    console.log(`\n${name}:`);
    console.log(`  ✅ Success: ${data.success}`);
    console.log(`  ❌ Failed: ${data.failed}`);
    if (data.errors.length > 0) {
      console.log(`  Errors:`);
      data.errors.forEach(error => console.log(`    - ${error}`));
    }
  });

  const totalSuccess =
    results.workExperience.success +
    results.education.success +
    results.projects.success +
    results.certifications.success;

  const totalFailed =
    results.workExperience.failed +
    results.education.failed +
    results.projects.failed +
    results.certifications.failed;

  console.log(`\nTotal:`);
  console.log(`  ✅ Success: ${totalSuccess}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  console.log('========================================\n');
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const config: MigrationConfig = {
    dryRun: process.argv.includes('--dry-run'),
    userId: process.env.USER_ID || '',
    dataDir: process.argv[2] || './data/portfolio',
  };

  if (!config.userId) {
    console.error('❌ Error: USER_ID environment variable is required');
    process.exit(1);
  }

  migratePortfolioData(config)
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
```

---

### Package.json Scripts

```json
{
  "scripts": {
    "migrate:portfolio": "ts-node scripts/migrate-portfolio-data.ts",
    "migrate:portfolio:dry-run": "ts-node scripts/migrate-portfolio-data.ts --dry-run"
  }
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// scripts/__tests__/migrate-portfolio-data.test.ts

import { migratePortfolioData } from '../migrate-portfolio-data';
import * as fs from 'fs/promises';
import axios from 'axios';

jest.mock('fs/promises');
jest.mock('axios');

describe('migratePortfolioData', () => {
  const mockConfig = {
    dryRun: true,
    userId: 'user-123',
    dataDir: './test-data',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should migrate all portfolio data successfully in dry-run mode', async () => {
    (fs.readFile as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('work-experience')) {
        return Promise.resolve(
          JSON.stringify([
            {
              id: '1',
              company: 'Test Corp',
              position: 'Developer',
              location: 'Remote',
              startDate: '2020-01-01',
              endDate: null,
              description: 'Test',
              technologies: ['React'],
              achievements: ['Built app'],
            },
          ])
        );
      }
      return Promise.resolve(JSON.stringify([]));
    });

    const results = await migratePortfolioData(mockConfig);

    expect(results.workExperience.success).toBe(1);
    expect(results.workExperience.failed).toBe(0);
  });

  it('should insert data into Supabase when not in dry-run mode', async () => {
    const liveConfig = { ...mockConfig, dryRun: false };

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify([
        {
          id: '1',
          company: 'Test Corp',
          position: 'Developer',
          location: 'Remote',
          startDate: '2020-01-01',
          endDate: null,
          description: 'Test',
          technologies: ['React'],
          achievements: ['Built app'],
        },
      ])
    );

    (axios.post as jest.Mock).mockResolvedValue({ data: {} });

    await migratePortfolioData(liveConfig);

    expect(axios.post).toHaveBeenCalled();
  });
});
```

---

## Dependencies

- Node.js
- TypeScript
- ts-node
- axios
- zod
- uuid
- Supabase (service role key)

---

## Definition of Done

- [ ] Migration script implemented
- [ ] Work experience migration working
- [ ] Education migration working
- [ ] Projects migration working
- [ ] Certifications migration working
- [ ] Data transformation correct
- [ ] Dry-run mode working
- [ ] Error handling comprehensive
- [ ] Logging clear and helpful
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-053](../stories/US-053-portfolio-data-migration.md), [EPIC-027](../epics/EPIC-027-data-migration.md)
