# TASK-198: Supabase Storage API Client

**Task ID**: TASK-198
**Title**: Supabase Storage API Client (Moved to Post-Login)
**User Story**: [US-042](../stories/US-042-update-profile-picture.md) - Update Profile Picture (Post-Login)
**Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) - Security Settings
**Status**: 📋 To Do (Deferred to post-registration)
**Priority**: Medium (no longer blocks registration)
**Effort**: 2 hours
**Created**: 2025-11-21
**Updated**: 2025-11-24

---

## ⚠️ Status Update (2025-11-24)

**Decision**: Profile picture upload moved to **post-registration** (after email verification + login).

**Rationale**:

- ✅ Prevents bot spam (unverified accounts can't upload images)
- ✅ Reduces storage costs (no fake/abandoned account pictures)
- ✅ Better security (only verified users can upload)

**New Location**: This task is now part of **US-042: Update Profile Picture** (TASK-246 already exists for Supabase Storage upload).

**Impact**: TASK-199 (Registration Screen UI) no longer depends on this task.

---

## Objective

Build Supabase Storage client for uploading/deleting profile pictures to `profile-pictures` bucket with automatic retry and error handling.

## Implementation

`src/features/Auth/api/storage.ts`:

```typescript
import { supabase } from '@app/config/supabase';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

export class SupabaseStorageClient {
  async uploadProfilePicture(fileUri: string): Promise<string> {
    const userId = await SecureStore.get(SecureStoreKey.USER_ID);
    const fileName = `${userId}/profile-${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const { data } = await supabase.post(
      `/storage/v1/object/profile-pictures/${fileName}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/profile-pictures/${fileName}`;
  }

  async deleteProfilePicture(filePath: string): Promise<void> {
    await supabase.delete(`/storage/v1/object/profile-pictures/${filePath}`);
  }
}

export const supabaseStorageClient = new SupabaseStorageClient();
```

## File Structure

```
src/features/Auth/
└── api/
    ├── api.ts              # Auth API client (TASK-192)
    ├── storage.ts          # Storage API client (this task)
    ├── schemas.ts          # Zod schemas (TASK-194)
    └── __tests__/
        ├── api.rntl.ts
        ├── storage.rntl.ts
        └── schemas.rntl.ts
```

**Note**: Storage client co-located with Auth feature API following feature-first architecture (established in TASK-196).

## Acceptance Criteria

- [ ] Upload to profile-pictures bucket
- [ ] File naming: `{userId}/profile-{timestamp}.jpg`
- [ ] Returns public URL
- [ ] Delete old picture before uploading new
- [ ] Error handling with retry (3 attempts)
- [ ] 100% unit test coverage

**Estimated Time**: 2 hours | **Last Updated**: 2025-11-21
