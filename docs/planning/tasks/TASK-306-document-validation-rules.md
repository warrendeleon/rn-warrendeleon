# TASK-306: Document Validation Rules

**ID**: TASK-306 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-054](../stories/US-054-validation-schema-library.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create comprehensive documentation for all validation rules, schemas, and best practices. Document usage examples, common patterns, error messages, and troubleshooting. Ensure developers can easily understand and use the validation library.

---

## Acceptance Criteria

- [ ] Validation documentation created in `docs/validation/`
- [ ] Overview and architecture documented
- [ ] All validation schemas documented with examples
- [ ] Common usage patterns documented
- [ ] Error message reference created
- [ ] Troubleshooting guide included
- [ ] Migration guide from old validation approaches
- [ ] TypeScript types documented
- [ ] Markdown formatting with proper syntax highlighting

---

## Implementation Details

### Validation Overview Documentation

```markdown
<!-- docs/validation/README.md -->

# Form Validation Guide

## Overview

This project uses **Yup** for form validation. All validation logic is centralized in reusable schemas to ensure consistency across the application.

## Architecture
```

src/validation/
├── schemas/
│ ├── commonSchemas.ts # Shared field-level schemas
│ ├── authSchemas.ts # Authentication schemas
│ ├── profileSchemas.ts # Profile schemas
│ ├── formSchemas.ts # Composite form schemas
│ └── **tests**/ # Comprehensive unit tests
└── README.md # This file

````

## Quick Start

### 1. Using Existing Schemas

```typescript
import { emailSchema, passwordSchema } from '@/validation/schemas/commonSchemas';
import { signInSchema } from '@/validation/schemas/authSchemas';

// Validate a single field
try {
  await emailSchema.validate('test@example.com');
  console.log('Email is valid');
} catch (error) {
  console.error(error.message);
}

// Validate a complete form
try {
  await signInSchema.validate({
    email: 'test@example.com',
    password: 'Password123!',
  });
  console.log('Form is valid');
} catch (error) {
  console.error(error.message);
}
````

### 2. Using with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInSchema } from '@/validation/schemas/authSchemas';

function SignInScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    // Data is guaranteed to be valid here
    console.log('Valid data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 3. Creating Custom Schemas

```typescript
import * as Yup from 'yup';
import { emailSchema, requiredStringSchema } from '@/validation/schemas/commonSchemas';

// Compose existing schemas
export const customFormSchema = Yup.object({
  email: emailSchema,
  companyName: requiredStringSchema('Company name').max(100),
  // Add custom fields with custom validation
  customField: Yup.string()
    .required('Custom field is required')
    .test('custom-rule', 'Custom validation failed', value => {
      // Custom validation logic
      return value !== 'forbidden';
    }),
});
```

## Common Validation Schemas

### Email

```typescript
import { emailSchema } from '@/validation/schemas/commonSchemas';

// Validates:
// - Required
// - Valid email format
// - Lowercase transformation
// - Max 255 characters
// - Trim whitespace

await emailSchema.validate('test@example.com'); // ✅
await emailSchema.validate('UPPER@EXAMPLE.COM'); // ✅ (lowercased to 'upper@example.com')
await emailSchema.validate('invalid'); // ❌ "Please enter a valid email address"
```

### Password

```typescript
import { passwordSchema } from '@/validation/schemas/commonSchemas';

// Validates:
// - Required
// - Min 8 characters
// - Max 128 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character (@$!%*?&)

await passwordSchema.validate('Password123!'); // ✅
await passwordSchema.validate('weak'); // ❌ "Password must be at least 8 characters"
await passwordSchema.validate('NoNumbers!'); // ❌ "Password must contain at least one number"
```

### PIN

```typescript
import { pinSchema } from '@/validation/schemas/commonSchemas';

// Validates:
// - Required
// - Exactly 6 digits
// - No sequential digits (123456, 654321)
// - No repeated digits (111111)

await pinSchema.validate('123789'); // ✅
await pinSchema.validate('123456'); // ❌ "PIN cannot be sequential"
await pinSchema.validate('111111'); // ❌ "PIN cannot be all the same digit"
```

### Phone Number

```typescript
import { phoneNumberSchema } from '@/validation/schemas/commonSchemas';

// Validates:
// - Required
// - International format with + prefix
// - 1-15 digits after country code

await phoneNumberSchema.validate('+1234567890'); // ✅
await phoneNumberSchema.validate('1234567890'); // ❌ "Please enter a valid international phone number"
```

### Date of Birth

```typescript
import { dateOfBirthSchema } from '@/validation/schemas/commonSchemas';

// Validates:
// - Required
// - Not in the future
// - User must be at least 18 years old

await dateOfBirthSchema.validate(new Date('1990-01-01')); // ✅
await dateOfBirthSchema.validate(new Date('2010-01-01')); // ❌ "You must be at least 18 years old"
```

## Form Schemas

### Sign Up

```typescript
import { signUpSchema } from '@/validation/schemas/authSchemas';

// Fields:
// - firstName (1-50 chars, letters/spaces/hyphens/apostrophes)
// - lastName (1-50 chars, letters/spaces/hyphens/apostrophes)
// - email (valid email)
// - password (strong password)
// - confirmPassword (must match password)
// - dateOfBirth (18+ years old)
// - phoneNumber (international format)

const formData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  dateOfBirth: new Date('1990-01-01'),
  phoneNumber: '+1234567890',
};

await signUpSchema.validate(formData); // ✅
```

### Work Experience

```typescript
import { workExperienceFormSchema } from '@/validation/schemas/formSchemas';

// Fields:
// - companyName (required, max 100 chars)
// - positionTitle (required, max 100 chars)
// - location (required, max 100 chars)
// - startDate (required, not in future)
// - endDate (conditional: required if not current)
// - isCurrent (boolean)
// - description (50-2000 chars)
// - technologies (array, 1-20 items)
// - achievements (array, 1-10 items)

const workExpData = {
  companyName: 'Tech Corp',
  positionTitle: 'Senior Developer',
  location: 'Remote',
  startDate: new Date('2020-01-01'),
  endDate: null,
  isCurrent: true,
  description: 'Working on large-scale React Native applications...',
  technologies: ['React Native', 'TypeScript', 'Redux'],
  achievements: ['Increased app performance by 40%'],
};

await workExperienceFormSchema.validate(workExpData); // ✅
```

## Conditional Validation

### Example: Profile Picture

```typescript
import { completeProfileUpdateFormSchema } from '@/validation/schemas/formSchemas';

// Profile picture fields are conditionally required:
// - If profilePictureUri is provided, then:
//   - profilePictureMimeType is required (JPEG or PNG)
//   - profilePictureFileSize is required (max 10MB)
// - If profilePictureUri is null/empty, then:
//   - profilePictureMimeType and profilePictureFileSize are nullable

// ✅ Without profile picture
await completeProfileUpdateFormSchema.validate({
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  dateOfBirth: new Date('1990-01-01'),
  profilePictureUri: null,
  profilePictureMimeType: null,
  profilePictureFileSize: null,
});

// ✅ With profile picture
await completeProfileUpdateFormSchema.validate({
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  dateOfBirth: new Date('1990-01-01'),
  profilePictureUri: 'file:///path/to/image.jpg',
  profilePictureMimeType: 'image/jpeg',
  profilePictureFileSize: 5000000,
});

// ❌ Incomplete profile picture
await completeProfileUpdateFormSchema.validate({
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  dateOfBirth: new Date('1990-01-01'),
  profilePictureUri: 'file:///path/to/image.jpg',
  profilePictureMimeType: null, // ❌ Missing MIME type
  profilePictureFileSize: null, // ❌ Missing file size
});
```

### Example: Current vs Past Position

```typescript
import { workExperienceFormSchema } from '@/validation/schemas/formSchemas';

// endDate is conditionally required:
// - If isCurrent = false, endDate is required
// - If isCurrent = true, endDate is nullable

// ✅ Current position
await workExperienceFormSchema.validate({
  companyName: 'Tech Corp',
  positionTitle: 'Developer',
  location: 'Remote',
  startDate: new Date('2020-01-01'),
  endDate: null, // ✅ Null is allowed for current positions
  isCurrent: true,
  description: 'Working on...',
  technologies: ['React'],
  achievements: ['Achievement'],
});

// ✅ Past position
await workExperienceFormSchema.validate({
  companyName: 'Tech Corp',
  positionTitle: 'Developer',
  location: 'Remote',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2023-12-31'), // ✅ Required for past positions
  isCurrent: false,
  description: 'Worked on...',
  technologies: ['React'],
  achievements: ['Achievement'],
});

// ❌ Past position without end date
await workExperienceFormSchema.validate({
  companyName: 'Tech Corp',
  positionTitle: 'Developer',
  location: 'Remote',
  startDate: new Date('2020-01-01'),
  endDate: null, // ❌ Required for past positions
  isCurrent: false,
  description: 'Worked on...',
  technologies: ['React'],
  achievements: ['Achievement'],
});
```

## Error Messages Reference

### Common Errors

| Schema           | Error Message                                   | Cause                       |
| ---------------- | ----------------------------------------------- | --------------------------- |
| `emailSchema`    | Email is required                               | Empty/null/undefined        |
| `emailSchema`    | Please enter a valid email address              | Invalid format              |
| `emailSchema`    | Email must be less than 255 characters          | Exceeds max length          |
| `passwordSchema` | Password is required                            | Empty/null/undefined        |
| `passwordSchema` | Password must be at least 8 characters          | Too short                   |
| `passwordSchema` | Password must contain at least one uppercase... | Missing required character  |
| `pinSchema`      | PIN is required                                 | Empty/null/undefined        |
| `pinSchema`      | PIN must be exactly 6 digits                    | Wrong length or non-numeric |
| `pinSchema`      | PIN cannot be sequential                        | Sequential (123456, 654321) |
| `pinSchema`      | PIN cannot be all the same digit                | Repeated (111111)           |

### Form-Specific Errors

| Schema          | Error Message                                  | Cause                      |
| --------------- | ---------------------------------------------- | -------------------------- |
| Sign Up         | Passwords must match                           | confirmPassword ≠ password |
| Sign Up         | You must be at least 18 years old              | Under 18                   |
| Profile Update  | Only JPEG and PNG images are allowed           | Invalid MIME type          |
| Profile Update  | Image size must be less than 10MB              | File too large             |
| Password Change | New password must be different from current... | Same password              |
| PIN Change      | New PIN must be different from current PIN     | Same PIN                   |

## Best Practices

### 1. Always Use Existing Schemas

✅ **Good**:

```typescript
import { emailSchema } from '@/validation/schemas/commonSchemas';

const schema = Yup.object({
  email: emailSchema,
});
```

❌ **Bad**:

```typescript
// Don't duplicate validation logic
const schema = Yup.object({
  email: Yup.string().required().email(),
});
```

### 2. Compose Schemas for Complex Forms

✅ **Good**:

```typescript
import { emailSchema, passwordSchema } from '@/validation/schemas/commonSchemas';

const customFormSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
  customField: Yup.string().required(),
});
```

### 3. Use Conditional Validation Wisely

✅ **Good**:

```typescript
const schema = Yup.object({
  hasAddress: Yup.boolean().required(),
  address: Yup.string().when('hasAddress', {
    is: true,
    then: schema => schema.required('Address is required'),
    otherwise: schema => schema.nullable(),
  }),
});
```

### 4. Provide Clear Error Messages

✅ **Good**:

```typescript
Yup.string().required('Email is required').email('Please enter a valid email address');
```

❌ **Bad**:

```typescript
Yup.string().required().email();
// Uses default generic error messages
```

### 5. Test Custom Validation Rules

✅ **Good**:

```typescript
// Always write unit tests for custom validation
const schema = Yup.string().test('custom-rule', 'Custom validation failed', value => {
  // Custom logic
  return value !== 'forbidden';
});

// In __tests__/customSchema.test.ts
it('should reject forbidden value', async () => {
  await expect(schema.validate('forbidden')).rejects.toThrow();
});
```

## Troubleshooting

### Issue: "Passwords must match" error even when they match

**Solution**: Ensure you're using `Yup.ref()` correctly:

```typescript
confirmPassword: Yup.string()
  .required('Please confirm your password')
  .oneOf([Yup.ref('password')], 'Passwords must match');
```

### Issue: Conditional validation not working

**Solution**: Use the `when()` method with the correct field reference:

```typescript
endDate: Yup.date()
  .nullable()
  .when('isCurrent', {
    is: false, // When isCurrent is false
    then: schema => schema.required('End date is required'),
    otherwise: schema => schema.nullable(),
  });
```

### Issue: Async validation not waiting

**Solution**: Always use `await` with `validate()`:

```typescript
// ✅ Correct
await schema.validate(data);

// ❌ Incorrect
schema.validate(data); // Promise not awaited
```

### Issue: Type errors with InferType

**Solution**: Use `Yup.InferType` to get TypeScript types from schemas:

```typescript
import * as Yup from 'yup';

const schema = Yup.object({
  name: Yup.string().required(),
  age: Yup.number().required(),
});

type FormData = Yup.InferType<typeof schema>;
// FormData = { name: string; age: number }
```

## Migration Guide

### From Manual Validation

**Before**:

```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

if (!validateEmail(formData.email)) {
  setError('Invalid email');
}
```

**After**:

```typescript
import { emailSchema } from '@/validation/schemas/commonSchemas';

try {
  await emailSchema.validate(formData.email);
} catch (error) {
  setError(error.message);
}
```

### From Inline Yup Schemas

**Before**:

```typescript
const schema = Yup.object({
  email: Yup.string().required('Email is required').email('Invalid email'),
  password: Yup.string().required('Password is required').min(8),
});
```

**After**:

```typescript
import { emailSchema, passwordSchema } from '@/validation/schemas/commonSchemas';

const schema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
});
```

## Resources

- [Yup Documentation](https://github.com/jquense/yup)
- [React Hook Form + Yup](https://react-hook-form.com/get-started#SchemaValidation)
- [Common Schemas Source](../src/validation/schemas/commonSchemas.ts)
- [Form Schemas Source](../src/validation/schemas/formSchemas.ts)

---

**Last Updated**: 2025-11-21

```

---

## Testing Requirements

This is a documentation task. No unit tests required, but documentation should be:

- [ ] Reviewed for accuracy
- [ ] Verified examples work correctly
- [ ] Tested with actual validation schemas
- [ ] Proofread for grammar and clarity

---

## Dependencies

- All validation schemas
- Markdown rendering support

---

## Definition of Done

- [ ] Validation overview documentation created
- [ ] All schemas documented with examples
- [ ] Usage patterns documented
- [ ] Error message reference complete
- [ ] Best practices section complete
- [ ] Troubleshooting guide complete
- [ ] Migration guide complete
- [ ] TypeScript types documented
- [ ] All examples tested and verified
- [ ] Documentation reviewed
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-054](../stories/US-054-validation-schema-library.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-303](TASK-303-shared-validation-schemas.md), [TASK-304](TASK-304-composite-form-schemas.md)
```
