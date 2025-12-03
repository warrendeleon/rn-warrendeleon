# TASK-198: Supabase Storage API Client

**Task ID**: TASK-198
**Title**: Supabase Storage API Client (Moved to Post-Login)
**User Story**: [US-042](../stories/US-042-update-profile-picture.md) - Update Profile Picture (Post-Login)
**Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) - Security Settings
**Status**: ✅ Done
**Priority**: Medium (no longer blocks registration)
**Effort**: 2 hours
**Created**: 2025-11-21
**Updated**: 2025-12-08

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

- [x] Upload to profile-pictures bucket
- [x] File naming: `{userId}/profile-{timestamp}.jpg`
- [x] Returns public URL
- [x] Old picture cleanup via database trigger + scheduled Edge Function
- [x] Error handling with retry (3 attempts, exponential backoff)
- [x] 100% unit test coverage
- [x] Token refresh on 401/403 JWT expiry
- [x] E2E mock support for testing

## Implementation Notes (2025-12-08)

### Architecture

The storage client follows the same pattern as `SupabaseAuthClient`:

- Axios instance with request/response interceptors
- Bearer token authentication
- Automatic token refresh on 401/403

### Old Picture Cleanup

Old profile pictures are cleaned up via backend automation:

1. Database trigger queues old file paths when `profile_picture` is updated
2. Monthly cron job (1st of month, 3 AM UTC) calls cleanup Edge Function
3. Edge Function processes queue and deletes files from storage

### Files

- `src/httpClients/SupabaseStorageClient.ts` - Main client
- `src/httpClients/__tests__/SupabaseStorageClient.rntl.ts` - Tests
- `supabase/functions/cleanup-storage/` - Edge Function
- `supabase/migrations/` - Database trigger + queue table

**Estimated Time**: 2 hours | **Last Updated**: 2025-12-08
