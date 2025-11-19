# Zod Schemas

This directory contains Zod schemas for runtime data validation.

## Why Zod?

TypeScript only validates at compile time. Zod validates at **runtime**, catching errors when the app runs. This ensures data from APIs and external sources matches expected structures.

## Usage

### Validating Data

```typescript
import { ProfileSchema } from '@app/schemas';

// Parse throws on error
const profile = ProfileSchema.parse(data);

// SafeParse returns result object
const result = ProfileSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Getting TypeScript Types

```typescript
import { type Profile } from '@app/schemas';

// Profile type is inferred from ProfileSchema
const user: Profile = { ... };
```

## Available Schemas

| Schema                 | Description             | Usage               |
| ---------------------- | ----------------------- | ------------------- |
| `EnvSchema`            | Environment variables   | `src/config/env.ts` |
| `ProfileSchema`        | User profile data       | Profile API         |
| `EducationSchema`      | Education history array | Education API       |
| `EducationItemSchema`  | Single education entry  | Education API       |
| `WorkExperienceSchema` | Work experience array   | WorkExperience API  |
| `PositionSchema`       | Position within company | WorkExperience API  |
| `ClientSchema`         | Contract client details | WorkExperience API  |

## Adding New Schemas

1. Create `src/schemas/mydata.schema.ts`
2. Export from `src/schemas/index.ts`
3. Add tests in `src/schemas/__tests__/`

### Example Schema

```typescript
import { z } from 'zod';

export const MyDataSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  optionalField: z.string().optional(),
});

export type MyData = z.infer<typeof MyDataSchema>;
```

## Resources

- [Zod Documentation](https://zod.dev)
- [Zod GitHub](https://github.com/colinhacks/zod)
