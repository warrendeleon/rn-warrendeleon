# EPIC-027: Data Migration (GitHub → Supabase)

**ID**: EPIC-027 | **Title**: Migrate Portfolio Data from GitHub to Supabase
**Status**: 📋 To Do | **Priority**: Low | **Start Date**: TBD | **Target Date**: TBD
**Owner**: Warren de Leon | **Total Story Points**: 5 | **Total Effort**: 11.5h

---

## Epic Overview

Migrate existing portfolio data (work experience, education, skills, projects) from GitHub markdown files to Supabase PostgreSQL database. Provides centralized data management and real-time updates.

**Key Features**:

- One-time migration script
- Data validation and transformation
- Rollback capability
- Migration verification

---

## Business Value

### Why This Epic Matters

1. **Centralized Data**: All data in Supabase (no scattered GitHub files)
2. **Real-Time Updates**: Edit portfolio via admin dashboard
3. **API Access**: Query portfolio data via REST API
4. **Version Control**: Database migrations tracked in Supabase
5. **Scalability**: Database handles large datasets better than markdown files

### Success Metrics

| Metric                 | Target     | Why It Matters                 |
| ---------------------- | ---------- | ------------------------------ |
| Migration Success Rate | 100%       | All data migrated without loss |
| Data Accuracy          | 100%       | Migrated data matches source   |
| Migration Time         | <5 minutes | Fast, non-disruptive migration |
| Rollback Success       | 100%       | Can revert if issues occur     |

---

## User Stories

### Overview

| ID                                                 | Title                           | Priority | Story Points | Effort | Status   |
| -------------------------------------------------- | ------------------------------- | -------- | ------------ | ------ | -------- |
| [US-053](../stories/US-053-portfolio-migration.md) | Portfolio Data Migration Script | Low      | 5            | 11.5h  | 📋 To Do |

**Total**: 1 user story, 5 story points, 11.5 hours

---

## Technical Architecture

### Source Data (GitHub Markdown)

Current structure:

```
docs/portfolio/
├── work-experience.md
├── education.md
├── skills.md
└── projects.md
```

### Target Schema (Supabase PostgreSQL)

```sql
-- Work Experience
CREATE TABLE work_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  technologies TEXT[], -- Array of tech stack
  achievements TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Education
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  grade TEXT,
  achievements TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- Frontend, Backend, DevOps, etc.
  name TEXT NOT NULL,
  proficiency_level TEXT, -- Beginner, Intermediate, Advanced, Expert
  years_of_experience INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT, -- In Progress, Completed, Archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Migration Script

### Node.js Migration Script

```typescript
// scripts/migrate-portfolio-data.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface WorkExperience {
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
}

async function migrateWorkExperience() {
  console.log('📦 Migrating work experience...');

  const filePath = path.join(__dirname, '../docs/portfolio/work-experience.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);

  const workExperience: WorkExperience[] = data.experiences || [];

  const { data: inserted, error } = await supabase.from('work_experience').insert(workExperience);

  if (error) {
    console.error('❌ Error migrating work experience:', error);
    throw error;
  }

  console.log(`✅ Migrated ${workExperience.length} work experience entries`);
}

async function migrateEducation() {
  console.log('📦 Migrating education...');

  const filePath = path.join(__dirname, '../docs/portfolio/education.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);

  const education = data.education || [];

  const { data: inserted, error } = await supabase.from('education').insert(education);

  if (error) {
    console.error('❌ Error migrating education:', error);
    throw error;
  }

  console.log(`✅ Migrated ${education.length} education entries`);
}

async function migrateSkills() {
  console.log('📦 Migrating skills...');

  const filePath = path.join(__dirname, '../docs/portfolio/skills.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);

  const skills = data.skills || [];

  const { data: inserted, error } = await supabase.from('skills').insert(skills);

  if (error) {
    console.error('❌ Error migrating skills:', error);
    throw error;
  }

  console.log(`✅ Migrated ${skills.length} skill entries`);
}

async function migrateProjects() {
  console.log('📦 Migrating projects...');

  const filePath = path.join(__dirname, '../docs/portfolio/projects.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);

  const projects = data.projects || [];

  const { data: inserted, error } = await supabase.from('projects').insert(projects);

  if (error) {
    console.error('❌ Error migrating projects:', error);
    throw error;
  }

  console.log(`✅ Migrated ${projects.length} project entries`);
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');

  const { count: workExpCount } = await supabase
    .from('work_experience')
    .select('*', { count: 'exact', head: true });

  const { count: educationCount } = await supabase
    .from('education')
    .select('*', { count: 'exact', head: true });

  const { count: skillsCount } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true });

  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Work Experience: ${workExpCount} entries`);
  console.log(`   Education: ${educationCount} entries`);
  console.log(`   Skills: ${skillsCount} entries`);
  console.log(`   Projects: ${projectsCount} entries`);

  return {
    workExpCount,
    educationCount,
    skillsCount,
    projectsCount,
  };
}

async function rollback() {
  console.log('⏪ Rolling back migration...');

  await supabase.from('work_experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('education').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('✅ Rollback complete');
}

async function main() {
  try {
    console.log('🚀 Starting portfolio data migration...\n');

    // Run migrations
    await migrateWorkExperience();
    await migrateEducation();
    await migrateSkills();
    await migrateProjects();

    // Verify
    const summary = await verifyMigration();

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\nAttempting rollback...');
    await rollback();
    process.exit(1);
  }
}

main();
```

---

## Implementation Phases

### Phase 1: Portfolio Data Migration (11.5h)

**User Story**: [US-053](../stories/US-053-portfolio-migration.md)

**Tasks**:

1. Create Supabase database tables
2. Write migration script (Node.js)
3. Data validation and transformation
4. Migration verification logic
5. Rollback script
6. Execute migration
7. Verify data accuracy

**Deliverables**:

- Migration script
- Rollback script
- Verification logic
- Migration documentation

---

## Non-Functional Requirements

### Performance

- Migration completes in <5 minutes
- No downtime during migration

### Data Integrity

- 100% data accuracy
- No data loss
- Rollback capability

### Testing

- Dry-run migration on staging environment
- Verification of all migrated data
- Manual spot-checks

---

## Dependencies

### Upstream Dependencies

- Supabase project configured
- Database tables created

### Downstream Dependencies

- Portfolio API endpoints (if needed for app)

---

## Definition of Done

**Functional**:

- [ ] Migration script complete
- [ ] All data migrated successfully
- [ ] Verification passed (100% accuracy)
- [ ] Rollback tested

**Quality**:

- [ ] Migration tested on staging
- [ ] Documentation complete

**Data Integrity**:

- [ ] All records migrated
- [ ] No data loss
- [ ] Data types correct

---

**Last Updated**: 2025-11-21
**Status**: Ready for implementation
**Next Review**: Before migration execution
