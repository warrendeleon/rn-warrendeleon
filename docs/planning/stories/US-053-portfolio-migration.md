# US-053: Portfolio Data Migration Script

**ID**: US-053 | **Epic**: [EPIC-027](../epics/EPIC-027-data-migration.md) | **Title**: Migrate Portfolio Data from GitHub to Supabase
**Status**: 📋 To Do | **Priority**: Low | **Story Points**: 5 | **Effort**: 11.5h

---

## User Story

**As a** developer
**I want to** migrate existing portfolio data from GitHub markdown files to Supabase
**So that** I can manage portfolio content via database instead of static files

---

## Acceptance Criteria

### Functional Requirements

1. **Migration Script**
   - [ ] Node.js script reads markdown files from `docs/portfolio/`
   - [ ] Parses frontmatter metadata (gray-matter)
   - [ ] Validates data structure
   - [ ] Inserts data into Supabase tables

2. **Data Migration**
   - [ ] Migrate work experience (company, role, dates, tech stack, achievements)
   - [ ] Migrate education (institution, degree, dates, grade)
   - [ ] Migrate skills (category, name, proficiency, years)
   - [ ] Migrate projects (title, description, tech stack, URLs, dates)

3. **Verification**
   - [ ] Script verifies all data migrated successfully
   - [ ] Shows migration summary (counts per table)

4. **Rollback**
   - [ ] Script includes rollback function
   - [ ] Can delete all migrated data if needed

### Non-Functional Requirements

1. **Performance**
   - [ ] Migration completes in <5 minutes

2. **Testing**
   - [ ] Dry-run mode (preview without inserting)
   - [ ] Verification of all migrated data

---

## Technical Implementation

### Migration Script

```typescript
// scripts/migrate-portfolio-data.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function migrateWorkExperience() {
  console.log('📦 Migrating work experience...');

  const filePath = path.join(__dirname, '../docs/portfolio/work-experience.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);

  const workExperience = data.experiences || [];

  const { data: inserted, error } = await supabase.from('work_experience').insert(workExperience);

  if (error) {
    console.error('❌ Error:', error);
    throw error;
  }

  console.log(`✅ Migrated ${workExperience.length} entries`);
}

async function main() {
  try {
    console.log('🚀 Starting migration...\\n');

    await migrateWorkExperience();
    // ... other migrations

    console.log('\\n✅ Migration complete!');
  } catch (error) {
    console.error('\\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
```

---

## Tasks Breakdown

| Task ID  | Description          | Effort |
| -------- | -------------------- | ------ |
| TASK-297 | Migration Script     | 4h     |
| TASK-298 | Data Validation      | 2h     |
| TASK-299 | Verification Logic   | 2h     |
| TASK-300 | Rollback Script      | 1.5h   |
| TASK-301 | Execute Migration    | 1h     |
| TASK-302 | Verify Data Accuracy | 1h     |

**Total**: 6 tasks, 11.5 hours

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 6 tasks complete
- [ ] All data migrated successfully

**Quality**:

- [ ] 100% data accuracy
- [ ] Rollback tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-027](../epics/EPIC-027-data-migration.md)
