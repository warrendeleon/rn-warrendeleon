# TASK-198: Supabase Storage API Client

**Task ID**: TASK-198
**Title**: Supabase Storage API Client (Profile Picture Upload)
**User Story**: [US-033](../stories/US-033-email-password-registration.md)
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2h | **Created**: 2025-11-21

---

## Objective

Build Supabase Storage client for uploading/deleting profile pictures to `profile-pictures` bucket with automatic retry and error handling.

## Implementation

`src/api/supabase/storage.client.ts`:

```typescript
import { supabase } from './client';
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';

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

## Acceptance Criteria

- [ ] Upload to profile-pictures bucket
- [ ] File naming: `{userId}/profile-{timestamp}.jpg`
- [ ] Returns public URL
- [ ] Delete old picture before uploading new
- [ ] Error handling with retry (3 attempts)
- [ ] 100% unit test coverage

**Estimated Time**: 2 hours | **Last Updated**: 2025-11-21
