# TASK-157: Install and Configure Zod

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 0.5h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Install the Zod library into the project and set up the basic folder structure for schemas.

---

## Prerequisites

Before starting, make sure you have:

- [ ] Terminal/command line access
- [ ] The project cloned and dependencies installed (`yarn install` completed)
- [ ] Node.js installed (check with `node --version`)

---

## Step-by-Step Instructions

### Step 1: Open Terminal in Project Root

1. Open your terminal application
2. Navigate to the project folder:
   ```bash
   cd /Users/warrendeleon/Developer/warrendeleon
   ```
3. Verify you're in the right place by checking the folder:
   ```bash
   ls package.json
   ```
   **Expected output**: `package.json` (if you see this, you're in the right place)

---

### Step 2: Install Zod

Run this command to add Zod to the project:

```bash
yarn add zod
```

**What this does**: Downloads the Zod library and adds it to `package.json` under `dependencies`.

**Expected output**:

```
➤ YN0000: · Yarn 3.6.4
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0013: │ zod@npm:3.x.x can't be found in the cache...
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed
➤ YN0000: · Done in 2s 123ms
```

**If you see errors**: Make sure you're in the project root and have run `yarn install` before.

---

### Step 3: Verify Installation

Check that Zod was added to package.json:

```bash
yarn info zod --json | head -20
```

Or manually open `package.json` and look for `"zod"` in the dependencies section.

---

### Step 4: Create Schemas Directory

Create a new folder to hold all Zod schemas:

```bash
mkdir -p src/schemas
```

**What this does**: Creates a new folder at `src/schemas/` where all validation schemas will live.

---

### Step 5: Create Index File

Create the main export file for schemas:

```bash
touch src/schemas/index.ts
```

Now open this file and add the following content:

**File: `src/schemas/index.ts`**

```typescript
/**
 * Zod Schema Exports
 *
 * This file exports all Zod schemas used for runtime validation.
 * Schemas validate data from APIs, environment variables, and other sources.
 *
 * Usage:
 * import { ProfileSchema, EnvSchema } from '@app/schemas';
 *
 * const profile = ProfileSchema.parse(apiResponse);
 */

// Environment configuration schema
export { EnvSchema, type EnvConfig } from './env.schema';

// Portfolio data schemas (uncomment as they are created)
// export { ProfileSchema, type Profile } from './profile.schema';
// export { EducationSchema, type Education } from './education.schema';
// export { WorkExperienceSchema, type WorkExperience } from './workExperience.schema';
```

---

### Step 6: Add Path Alias

The `@app/schemas` import alias should already work because `tsconfig.json` has a wildcard pattern. Verify it exists:

```bash
grep -A2 '"@app/\*"' tsconfig.json
```

**Expected output**:

```json
"@app/*": ["src/*"]
```

If this exists, the `@app/schemas` alias will work automatically.

---

### Step 7: Test the Installation

Create a simple test file to verify Zod works:

```bash
cat > src/schemas/test-zod.ts << 'EOF'
import { z } from 'zod';

// Simple schema to test Zod works
const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// This should succeed
const validData = TestSchema.parse({ name: 'Test', age: 25 });
console.log('✅ Zod is working!', validData);

// Uncomment to test error handling:
// const invalidData = TestSchema.parse({ name: 'Test', age: 'not a number' });
EOF
```

Run the test:

```bash
npx ts-node src/schemas/test-zod.ts
```

**Expected output**:

```
✅ Zod is working! { name: 'Test', age: 25 }
```

**After verification, delete the test file**:

```bash
rm src/schemas/test-zod.ts
```

---

### Step 8: Verify TypeScript Integration

Run TypeScript check to ensure no errors:

```bash
yarn typecheck
```

**Expected output**: No errors related to Zod.

---

### Step 9: Commit Changes

Stage and commit your work:

```bash
git add package.json yarn.lock src/schemas/
git commit -m "📦 chore(deps): install zod for runtime validation

- Add zod@3.x to dependencies
- Create src/schemas/ directory structure
- Add index.ts with schema exports

Part of EPIC-018: Zod Schema Validation Integration"
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `yarn info zod` shows Zod is installed
- [ ] `src/schemas/` directory exists
- [ ] `src/schemas/index.ts` file exists with export structure
- [ ] `yarn typecheck` passes with no errors
- [ ] Changes are committed to git

---

## What Success Looks Like

When you're done:

1. **package.json** contains `"zod": "^3.x.x"` in dependencies
2. **src/schemas/** folder exists with `index.ts` inside
3. The import `import { z } from 'zod'` works in any TypeScript file
4. No TypeScript or ESLint errors

---

## Troubleshooting

### Error: "Cannot find module 'zod'"

**Cause**: Zod wasn't installed properly.
**Fix**: Run `yarn install` then try `yarn add zod` again.

### Error: "yarn: command not found"

**Cause**: Yarn isn't installed or not in PATH.
**Fix**: Install Yarn with `npm install -g yarn` or use `npx yarn add zod`.

### Error: TypeScript can't find '@app/schemas'

**Cause**: Path alias not configured.
**Fix**: Check `tsconfig.json` has `"@app/*": ["src/*"]` in `compilerOptions.paths`.

### Error: "Directory not found: src/schemas"

**Cause**: You're not in the project root.
**Fix**: Run `cd /Users/warrendeleon/Developer/warrendeleon` first.

---

## Next Steps

After completing this task, proceed to:

- [TASK-158](./TASK-158-create-env-schema.md) - Create Environment Config Schema

---

## Technical Reference

### Zod Version

This task installs the latest stable version of Zod (3.x). As of November 2024, this is version 3.22+.

### Why Zod Over Alternatives?

| Library | Bundle Size | TypeScript | Active | Why Not                 |
| ------- | ----------- | ---------- | ------ | ----------------------- |
| **Zod** | 12KB        | ⭐⭐⭐     | Yes    | ✅ Best choice          |
| Yup     | 15KB        | ⭐⭐       | Yes    | Weaker TS inference     |
| io-ts   | 8KB         | ⭐⭐⭐     | Slow   | Complex API             |
| Joi     | 140KB       | ⭐         | Yes    | Too large, Node-focused |

### Zod Bundle Impact

Zod uses tree-shaking, so only the functions you use are included in the final bundle. Expected impact:

- **Minified**: ~12KB
- **Gzipped**: ~4KB
